import { NextResponse } from "next/server"
import { type EvolutionWebhookPayload } from "@/services/evolution-api-types"
import { WebhookProcessor } from "@/lib/webhook/evolution/webhook-processor"
import { WebhookValidator } from "@/lib/webhook/evolution/webhook-validator"
import { logger } from "@/lib/utils/server-logger"

export async function POST(
  req: Request,
  { params }: { params: { clientId: string; instanceName: string } }
) {
  const startTime = Date.now()
  
  try {
    const { clientId, instanceName } = params
    
    // ============================================
    // VALIDACIONES RÁPIDAS (SIN DB)
    // ============================================
    
    const webhookValidation = await WebhookValidator.validateWebhook(req, clientId, instanceName)
    if (!webhookValidation.isValid) {
      logger.webhookError(`Webhook inválido: ${webhookValidation.errorType}`, new Error(webhookValidation.errorMessage ?? 'Error desconocido'), {
        clientId,
        instanceName,
        errorType: webhookValidation.errorType,
        url: req.url
      })
      
      return NextResponse.json({
        ok: false,
        error: webhookValidation.errorMessage,
        errorType: webhookValidation.errorType,
        messageType: webhookValidation.errorType
      }, { status: 400 })
    }

    // ============================================
    // VALIDACIÓN DE ACCESO CON CACHE
    // ============================================
    
    const accessValidation = await WebhookValidator.validateClientInstanceAccess(clientId, instanceName)
    if (!accessValidation.isValid) {
      logger.webhookError(`Acceso denegado: ${accessValidation.errorType}`, new Error(accessValidation.errorMessage ?? 'Error desconocido'), {
        clientId,
        instanceName,
        errorType: accessValidation.errorType
      })
      
      return NextResponse.json({
        ok: false,
        error: accessValidation.errorMessage,
        errorType: accessValidation.errorType,
        messageType: accessValidation.errorType
      }, { status: 403 })
    }
    
    // ============================================
    // PROCESAMIENTO RÁPIDO DEL PAYLOAD
    // ============================================
    
    let body: EvolutionWebhookPayload
    try {
      body = await req.json() as EvolutionWebhookPayload
    } catch {
      return NextResponse.json({
        ok: false,
        error: "Payload JSON inválido",
        errorType: "invalid_json"
      }, { status: 400 })
    }
    
    const payloadValidation = WebhookValidator.validatePayload(body)
    if (!payloadValidation.isValid) {
      logger.webhookError(`Payload inválido: ${payloadValidation.errorType}`, new Error(payloadValidation.errorMessage ?? 'Error desconocido'), {
        clientId,
        instanceName,
        errorType: payloadValidation.errorType,
        hasEvent: !!body.event,
        hasData: !!body.data,
        event: body.event
      })
      
      return NextResponse.json({
        ok: false,
        error: payloadValidation.errorMessage,
        errorType: payloadValidation.errorType,
        messageType: payloadValidation.errorType
      }, { status: 400 })
    }

    // Validación básica del payload - la validación detallada se hace en MessageProcessor
    const remoteJid = body.data.key?.remoteJid

    logger.webhook("RECEIVED", `Webhook recibido para cliente ${clientId}, instancia ${instanceName}`, body, {
      clientId,
      instanceName,
      method: "POST",
      userAgent: req.headers.get("user-agent"),
      contentType: req.headers.get("content-type"),
      contentLength: req.headers.get("content-length"),
      timestamp: new Date().toISOString(),
      remoteJid: remoteJid,
      event: body.event
    })

    const webhookProcessor = new WebhookProcessor()
    const result = await webhookProcessor.processWebhook(body, clientId, instanceName)

    const processingTime = Date.now() - startTime

    logger.webhook("PROCESSED", `Webhook procesado en ${processingTime}ms`, result, {
      clientId,
      instanceName,
      event: body.event,
      success: result.success,
      processingTimeMs: processingTime,
      messageType: result.messageType,
      remoteJid: remoteJid
    })

    return NextResponse.json({
      ok: true,
      processed: result.success,
      event: body.event,
      messageType: result.messageType,
      processingTimeMs: processingTime,
      data: result.data!
    })
  } catch (error) {
    const processingTime = Date.now() - startTime
    const errorInstance = error as Error
    
    // Clasificar el tipo de error para mejor debugging
    let errorType = "unknown_error"
    let statusCode = 500
    let userMessage = "Error interno del servidor"
    
    if (errorInstance.name === "ValidationError" || errorInstance.message.includes("validation")) {
      errorType = "validation_error"
      statusCode = 400
      userMessage = "Error de validación en el payload"
    } else if (errorInstance.name === "DatabaseError" || errorInstance.message.includes("database")) {
      errorType = "database_error"
      statusCode = 500
      userMessage = "Error interno del servidor"
    } else if (errorInstance.name === "NetworkError" || errorInstance.message.includes("network")) {
      errorType = "network_error"
      statusCode = 502
      userMessage = "Error de conexión de red"
    } else if (errorInstance.message.includes("duplicate") || errorInstance.message.includes("idempotency")) {
      errorType = "duplicate_error"
      statusCode = 409
      userMessage = "Mensaje duplicado detectado"
    }
    
    logger.webhookError(`Error procesando webhook (${errorType})`, errorInstance, {
      clientId: params?.clientId ?? "unknown",
      instanceName: params?.instanceName ?? "unknown",
      processingTimeMs: processingTime,
      errorType,
      errorMessage: errorInstance.message,
      errorStack: errorInstance.stack
    })

    return NextResponse.json({
      ok: false,
      error: userMessage,
      errorType,
      messageType: errorType,
      processingTimeMs: processingTime,
      // Solo incluir detalles técnicos en desarrollo
      ...(process.env.NODE_ENV === 'development' && {
        technicalDetails: errorInstance.message
      })
    }, { status: statusCode })
  }
}
