"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Separator } from "@/components/ui"
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { signIn } from "next-auth/react"

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginError {
  code: string;
  message: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  })
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleInputChange = (field: keyof LoginFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage(null)
    }
  }

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setErrorMessage("Por favor completa todos los campos")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    try {
      const loginResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (loginResult?.error) {
        const error: LoginError = {
          code: loginResult.error,
          message: loginResult.error === "CredentialsSignin" 
            ? "Credenciales inválidas" 
            : "Error al iniciar sesión"
        }
        setErrorMessage(error.message)
        return
      }

      if (loginResult?.ok) {
        // Successful login - redirect to dashboard
        await router.push("/saas")
      }
    } catch (error) {
      setErrorMessage("Error inesperado. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <div className="mb-8">
          <Link
            href="/home"
            className="flex items-center text-gray-600 hover:text-purple-600 transition-colors font-geomanist"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
        
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-lg">
              <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            </div>
          )}
          
          <div className={loading ? "pointer-events-none blur-sm select-none" : ""}>
            <Card>
              <CardHeader className="text-center pb-8">
                <div className="flex justify-center mb-6">
                  <Image src="/images/aurelia-logo.png" alt="Aurelia Logo" width={120} height={40} />
                </div>
                <CardTitle className="text-2xl font-bold font-anantason">Iniciar Sesión</CardTitle>
                <CardDescription className="font-geomanist">
                  Accedé a tu cuenta de Aurelia para gestionar tus agentes IA
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errorMessage}</p>
                  </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-geomanist">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@empresa.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-geomanist">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="pl-10 pr-10"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>

                <Separator />

                <div className="text-center">
                  <p className="text-sm text-gray-600 font-geomanist">
                    ¿No tienes una cuenta?{" "}
                    <Link 
                      href="/register" 
                      className="text-violet-600 hover:text-violet-700 font-semibold"
                    >
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
