"use client"

import { Button, Avatar } from "@/components/ui"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { ChevronDown } from "lucide-react"

export function UserButton({ isCollapsed }: { isCollapsed?: boolean }) {
  const { data: sessionData } = useSession()
  const user = sessionData?.user
  const email = user?.email ?? ""
  const name = user?.name ?? email?.split("@")[0] ?? "U"
  const initials = name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2)
  const router = useRouter()

  function handleProfile() {
    router.push("/saas/perfil")
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/login", redirect: true })
  }

  function handleNotifications() {
    router.push("/saas/notificaciones")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={
            "group relative w-full justify-start transition-all duration-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 " +
            (isCollapsed ? "justify-center px-2" : "pl-3 pr-2 py-2 min-h-[52px] h-[52px]") // más grande si no está colapsado
          }
          aria-label="Cuenta de usuario"
        >
          <Avatar className={`${isCollapsed ? "h-6 w-6" : "h-8 w-8"} shadow-sm mr-0 ${isCollapsed ? "" : "mr-3"}`}>
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700 ${isCollapsed ? "text-sm" : "text-base"}`}>
                {initials}
              </span>
            )}
          </Avatar>
          {isCollapsed ? (
            <span className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              {email || "Mi cuenta"}
            </span>
          ) : (
            <>
              <span className="flex flex-col min-w-0">
                <span className="font-semibold text-gray-900 text-[15px] leading-tight truncate max-w-[160px]">
                  {name}
                </span>
                <span className="text-xs font-normal text-gray-500 truncate max-w-[160px]">{email}</span>
              </span>
              <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[210px] p-2 rounded-xl shadow-xl border border-gray-100"
        style={{ boxShadow: "0 8px 32px 0 rgba(32,32,59,.16)" }}
      >
        <div className="flex flex-col items-center gap-1 px-1 pt-1 pb-2 border-b border-gray-100 mb-2">
          <Avatar className="h-12 w-12 mb-1 shadow-sm">
            {user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={name} className="h-full w-full rounded-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-700">
                {initials}
              </span>
            )}
          </Avatar>
          <span className="font-semibold text-[15px] text-gray-900">{name}</span>
          <span className="text-xs text-gray-400">{email}</span>
        </div>
        <DropdownMenuItem
          className="rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all mb-1"
          onClick={handleProfile}
        >
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-all mb-1"
          onClick={handleNotifications}
        >
          Notificaciones
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-lg font-medium text-red-500 hover:bg-red-50 transition-all"
          onClick={handleLogout}
        >
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}