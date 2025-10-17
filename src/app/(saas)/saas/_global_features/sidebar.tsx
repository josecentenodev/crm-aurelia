"use client"

import { Button } from "@/components/ui"
import { ChevronLeft, ChevronRight, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils/client-utils"
import { navigation } from "@/lib/constants/navigation"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { UserButton } from "@/components/ui/userButton"
import { ClientSelector } from "./client-selector/ClientSelector"
import { CurrentClientInfo } from "./client-selector/CurrentClientInfo"
import { useClientContext } from "@/providers/ClientProvider"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAureliaUser } = useClientContext()
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", isCollapsed ? "64px" : "256px")
  }, [isCollapsed])

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-white shadow-lg transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <header className={cn("relative flex items-center justify-center border-b border-gray-200", isCollapsed ? "h-10" : "h-24")}>
        {!isCollapsed ? (
          <Image src="/images/aurelia-logo.png" alt="Aurelia" width={120} height={40} className="object-contain" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600">
            <span className="text-xl font-bold text-white">A</span>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-100"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </header>

      {/* Client Selection */}
      {isAureliaUser ? (
        <div className="border-b border-gray-200">
          <ClientSelector />
        </div>
      ) : (
        <CurrentClientInfo />
      )}

      {/* Main Navigation */}
      <nav className="mt-8 flex-1 overflow-y-auto px-2">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === "/saas/agentes" && pathname.startsWith("/saas/agentes"))
            
            return (
              <li key={item.name}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "group relative w-full justify-start transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isCollapsed && "justify-center px-2",
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                  {isCollapsed && (
                    <span className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                      {item.name}
                    </span>
                  )}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer Actions */}
      <footer className="mt-auto p-4">
        <div className="flex flex-col gap-2">
          {isAureliaUser && (
            <Button
              variant={pathname.startsWith("/dashboard") ? "default" : "ghost"}
              onClick={() => router.push("/dashboard")}
              className={cn(
                "group relative w-full justify-start transition-all duration-200",
                pathname.startsWith("/dashboard") ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                isCollapsed && "justify-center px-2"
              )}
              aria-label="Dashboard Superadmin"
            >
              <BarChart3 className={cn("h-5 w-5 flex-shrink-0 text-purple-600", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span className="truncate">Superadmin</span>}
              {isCollapsed && (
                <span className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  Superadmin
                </span>
              )}
            </Button>
          )}
          <Button
            variant={pathname === "/saas/configuracion" ? "default" : "ghost"}
            onClick={() => router.push("/saas/configuracion")}
            className={cn(
              "group relative w-full justify-start transition-all duration-200",
              pathname === "/saas/configuracion" ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              isCollapsed && "justify-center px-2"
            )}
            aria-label="Configuración"
          >
            <Settings className={cn("h-5 w-5 flex-shrink-0 text-pink-500", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span className="truncate">Configuración</span>}
            {isCollapsed && (
              <span className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                Configuración
              </span>
            )}
          </Button>
          {/* User menu dropdown should be the last item at the very bottom */}
          <UserButton isCollapsed={isCollapsed} />
        </div>
      </footer>
    </aside>
  )
}
