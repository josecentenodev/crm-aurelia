"use client"

import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  /**
   * Callback opcional para reportar errores a servicios externos (Sentry, etc.)
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary específico para ClientProvider
 * 
 * Nota: Error Boundaries DEBEN ser Class Components porque React no tiene hooks
 * para capturar errores en el render lifecycle. No existe useErrorBoundary().
 * 
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */
export class ClientProviderErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Actualizar state para mostrar la UI de fallback
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log del error
    console.error('❌ ClientProvider Error:', error, errorInfo)
    
    // Guardar errorInfo completo en el state
    this.setState({ errorInfo })

    // Reportar a servicio externo si existe
    this.props.onError?.(error, errorInfo)

    // TODO: Integrar con Sentry o similar en producción
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
  }

  handleReset = () => {
    // Simplemente recargar la página (el setState es innecesario)
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
            <div className="mb-4 flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
              Error de Contexto
            </h1>
            
            <p className="mb-6 text-center text-gray-600">
              Ha ocurrido un error al cargar el contexto del cliente. Por favor, recarga la página.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 max-h-64 overflow-y-auto rounded-md bg-gray-100 p-4">
                <p className="mb-2 text-xs font-semibold text-gray-700">Error Details:</p>
                <pre className="mb-2 overflow-x-auto text-xs text-red-600">
                  {this.state.error.message}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <p className="mb-1 mt-3 text-xs font-semibold text-gray-700">Component Stack:</p>
                    <pre className="overflow-x-auto text-xs text-gray-600">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg"
            >
              <RefreshCw className="h-5 w-5" />
              Recargar Página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

