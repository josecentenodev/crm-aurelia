"use client"

import { Button } from "@/components"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { navigation } from "@/lib/constants/navigation"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"


export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Actualizar CSS variable cuando cambia el estado
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", isCollapsed ? "64px" : "256px")
  }, [isCollapsed])

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  const handleConfiguracion = () => {
    router.push("/saas/configuracion")
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 relative">
        <div className="flex items-center justify-center">
          {!isCollapsed ? (
            <Image src="/images/aurelia-logo.png" alt="Aurelia" width={120} height={40} className="object-contain" />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-aurelia-primary to-aurelia-secondary rounded-lg flex items-center justify-center">
              <span className="text-fuchsia-700 font-bold text-xl">A</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border shadow-md hover:bg-gray-50 hover:cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-2">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || (item.href === "/saas/asistentes" && pathname.startsWith("/saas/asistentes"))
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={cn(
                    "w-full flex items-center px-3 py-3 text-sm font-medium rounded-2xl transition-all duration-200 group relative text-left",
                    isActive
                      ? "bg-gradient-to-r from-aurelia-primary to-aurelia-secondary text-fuchsia-700 shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}

                  {/* Tooltip para modo colapsado */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer - Configuración */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleConfiguracion}
          className={cn(
            "w-full bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 hover:from-purple-100 hover:to-pink-100 transition-all duration-200 group",
            pathname === "/saas/configuracion" && "ring-2 ring-aurelia-primary",
          )}
        >
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-aurelia-primary to-aurelia-secondary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">AU</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">Aurelia Team</p>
                <p className="text-xs text-gray-500">Plan Pro</p>
              </div>
              <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Settings className="w-5 h-5 text-aurelia-primary" />
              {/* Tooltip para modo colapsado */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Configuración
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
