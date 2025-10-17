"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, Building2, User, Mail, MapPin, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrialRegistrationSchema, type TrialRegistration } from "@/domain/Clientes"
import { api } from "@/trpc/react"
import Header from "../home/_components/Header"

type CreationState = 'idle' | 'creating' | 'success' | 'error'

export default function TrialRegistrationPage() {
  const router = useRouter()
  const [creationState, setCreationState] = useState<CreationState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [integrationError, setIntegrationError] = useState<string | null>(null)

  const registerTrial = api.login.registerTrial.useMutation({
    onSuccess: (result) => {
      if (result.integrationStatus === 'success') {
        setCreationState('success')
        // Redirigir al login después de mostrar éxito
        setTimeout(() => {
          router.push("/login?message=Cuenta creada exitosamente. Inicia sesión para comenzar.")
        }, 3000)
      } else if (result.integrationStatus === 'error') {
        setCreationState('error')
        setIntegrationError(result.integrationError)
      } else {
        // Cliente creado pero sin integración (Evolution API no disponible)
        setCreationState('success')
        setTimeout(() => {
          router.push("/login?message=Cuenta creada exitosamente. Inicia sesión para comenzar.")
        }, 3000)
      }
    },
    onError: (error) => {
      setCreationState('error')
      setError(error.message)
    }
  })

  const form = useForm<TrialRegistration>({
    resolver: zodResolver(TrialRegistrationSchema),
    defaultValues: {
      clientName: "",
      clientDescription: "",
      clientEmail: "",
      clientAddress: "",
      clientCity: "",
      clientCountry: "",
      userName: "",
      userEmail: "",
      userPassword: ""
    }
  })

  const onSubmit = (data: TrialRegistration) => {
    setError(null)
    setIntegrationError(null)
    setCreationState('creating')
    registerTrial.mutate(data)
  }

  if (creationState === 'success') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl font-bold text-green-700">¡Cuenta Creada Exitosamente!</CardTitle>
              <CardDescription>
                Tu cuenta de prueba gratuita ha sido creada. Te redirigiremos al login en unos segundos.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-2 text-sm text-gray-600">
                <p>✅ Cliente creado</p>
                <p>✅ Usuario admin configurado</p>
                <p>✅ Contenedor Whatsapp desplegado</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-anantason">
              Comienza tu Prueba Gratuita
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-geomanist">
              Crea tu cuenta y comienza a automatizar tus ventas con Aurelia en minutos
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  Información de tu Empresa
                </CardTitle>
                <CardDescription>
                  Completa los datos de tu empresa para crear tu cuenta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Datos del Cliente */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="clientName">Nombre de la Empresa *</Label>
                      <Input
                        id="clientName"
                        {...form.register("clientName")}
                        placeholder="Ej: Mi Empresa S.A."
                        className="mt-1"
                      />
                      {form.formState.errors.clientName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.clientName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="clientDescription">Descripción de la Empresa</Label>
                      <Textarea
                        id="clientDescription"
                        {...form.register("clientDescription")}
                        placeholder="Describe brevemente tu empresa y sus servicios..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientEmail">Email de la Empresa</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        {...form.register("clientEmail")}
                        placeholder="contacto@miempresa.com"
                        className="mt-1"
                      />
                      {form.formState.errors.clientEmail && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.clientEmail.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientCity">Ciudad</Label>
                        <Input
                          id="clientCity"
                          {...form.register("clientCity")}
                          placeholder="Ciudad"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientCountry">País</Label>
                        <Input
                          id="clientCountry"
                          {...form.register("clientCountry")}
                          placeholder="País"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clientAddress">Dirección</Label>
                      <Input
                        id="clientAddress"
                        {...form.register("clientAddress")}
                        placeholder="Dirección completa"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Separador */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      Tu Cuenta de Administrador
                    </h3>
                  </div>

                  {/* Datos del Usuario */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userName">Tu Nombre Completo *</Label>
                      <Input
                        id="userName"
                        {...form.register("userName")}
                        placeholder="Juan Pérez"
                        className="mt-1"
                      />
                      {form.formState.errors.userName && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.userName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="userEmail">Tu Email *</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        {...form.register("userEmail")}
                        placeholder="juan@miempresa.com"
                        className="mt-1"
                      />
                      {form.formState.errors.userEmail && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.userEmail.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="userPassword">Contraseña *</Label>
                      <Input
                        id="userPassword"
                        type="password"
                        {...form.register("userPassword")}
                        placeholder="Mínimo 6 caracteres"
                        className="mt-1"
                      />
                      {form.formState.errors.userPassword && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.userPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Errores */}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {integrationError && (
                    <Alert>
                      <AlertDescription>
                        ⚠️ Cuenta creada pero hubo un problema con : {integrationError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Botón de envío */}
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6 font-geomanist"
                    disabled={creationState === 'creating'}
                  >
                    {creationState === 'creating' ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando tu cuenta...
                      </>
                    ) : (
                      <>
                        Crear Cuenta Gratuita
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Información lateral */}
            <div className="space-y-6">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
                <CardHeader>
                  <CardTitle className="text-purple-700">¿Qué incluye tu prueba gratuita?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Contenedor Whatsapp</p>
                      <p className="text-sm text-gray-600">WhatsApp Business API listo para usar</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Acceso Admin Completo</p>
                      <p className="text-sm text-gray-600">Gestiona usuarios, agentes y configuraciones</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">CRM Integrado</p>
                      <p className="text-sm text-gray-600">Pipeline de ventas y gestión de contactos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Soporte Especializado</p>
                      <p className="text-sm text-gray-600">Ayuda durante todo el proceso de implementación</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700">¿Qué sucede después?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-semibold">Configuración Automática</p>
                      <p className="text-sm text-gray-600">Creamos tu cuenta e integración con Whatsapp</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-semibold">Acceso Inmediato</p>
                      <p className="text-sm text-gray-600">Inicia sesión y comienza a configurar tus agentes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-semibold">Implementación Guiada</p>
                      <p className="text-sm text-gray-600">Nuestro equipo te ayuda a configurar WhatsApp</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
