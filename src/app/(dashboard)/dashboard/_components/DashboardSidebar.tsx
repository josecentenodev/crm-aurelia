"use client"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils/client-utils"
import { 
  Building2, 
  Users, 
  Bot, 
  FileText, 
  Settings, 
  BarChart3,
  LogOut,
  Palette,
  Monitor,
  Puzzle,
  Server
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Clientes", href: "/dashboard/clientes", icon: Building2 },
  { name: "Usuarios", href: "/dashboard/usuarios", icon: Users },
  { name: "Integraciones", href: "/dashboard/integraciones", icon: Puzzle },
  { name: "Templates", href: "/dashboard/templates", icon: Palette },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
]

export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: "/login",
      redirect: true 
    })
  }

  const handleSaasNavigation = () => {
    router.push("/saas")
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-violet-600 via-purple-700 to-violet-800 border-r border-violet-500/30 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-violet-400/30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Aurelia</h1>
        </div>
        <p className="text-sm text-violet-100 mt-1">Superadmin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-200",
                isActive 
                  ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/20" 
                  : "text-violet-100 hover:bg-white/10 hover:text-white"
              )}
              onClick={() => router.push(item.href)}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-violet-400/30 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-violet-100 hover:bg-white/10 hover:text-white transition-all duration-200"
          onClick={handleSaasNavigation}
        >
          <Monitor className="w-5 h-5 mr-3" />
          Ir al SaaS
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-violet-100 hover:bg-white/10 hover:text-white transition-all duration-200"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
} 