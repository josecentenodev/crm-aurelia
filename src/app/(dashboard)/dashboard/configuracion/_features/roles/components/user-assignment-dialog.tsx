"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserCheck, UserX } from "lucide-react"

interface UserAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: any | null
  allUsers: any[]
  roleUsers: any[]
  onAssignUser: (userId: string) => void
  onRemoveUser: (userId: string) => void
  isAssigningUser?: boolean
  isRemovingUser?: boolean
}

/**
 * User Assignment Dialog Component
 *
 * Dialog for assigning/removing users to/from a role
 * - Shows available users to assign
 * - Shows users currently assigned to the role
 * - Actions to assign and remove users
 */
export function UserAssignmentDialog({
  open,
  onOpenChange,
  role,
  allUsers,
  roleUsers,
  onAssignUser,
  onRemoveUser,
  isAssigningUser = false,
  isRemovingUser = false
}: UserAssignmentDialogProps) {
  // Filter users who don't have this role
  const availableUsers = allUsers.filter(
    (user) => !roleUsers.some((ru) => ru.userId === user.id)
  )

  // Filter users who have this role
  const assignedUsers = allUsers.filter((user) =>
    roleUsers.some((ru) => ru.userId === user.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Gestionar Usuarios del Rol: {role?.name}</DialogTitle>
          <DialogDescription>
            Asigna o remueve usuarios de este rol
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Available users section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Usuarios Disponibles
              </h4>
              {availableUsers.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Todos los usuarios ya tienen este rol
                </p>
              ) : (
                <div className="space-y-2">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => onAssignUser(user.id)}
                        disabled={isAssigningUser}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Asignar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Assigned users section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">
                Usuarios con este Rol
              </h4>
              {assignedUsers.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay usuarios con este rol
                </p>
              ) : (
                <div className="space-y-2">
                  {assignedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <Badge variant="secondary" className="mt-1">
                          Tiene este rol
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemoveUser(user.id)}
                        disabled={isRemovingUser}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
