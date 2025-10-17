"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function PerfilPage() {
  const { toast } = useToast();
  const { data: user, isLoading, refetch } = api.usuarios.getProfile.useQuery();
  const updateProfile = api.usuarios.updateProfile.useMutation();
  const changePassword = api.usuarios.changePassword.useMutation();

  // Form state para perfil
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  // Form state para password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  // Feedback
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Inicializar campos cuando llega el usuario
  React.useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setImage(user.image ?? "");
    }
  }, [user]);

  if (isLoading) {
    return <div className="p-8">Cargando perfil...</div>;
  }
  if (!user) {
    return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>No se pudo cargar el perfil.</AlertDescription></Alert>;
  }

  const handleProfileSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSuccess("");
    setProfileError("");
    try {
      await updateProfile.mutateAsync({ name, image });
      setProfileSuccess("Perfil actualizado correctamente.");
      toast({ title: "Perfil actualizado" });
      void refetch();
    } catch (err) {
      const error = err as { message?: string };
      setProfileError(error?.message ?? "Error al actualizar el perfil");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordSuccess("");
    setPasswordError("");
    if (newPassword !== repeatPassword) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordSuccess("Contraseña cambiada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setRepeatPassword("");
      toast({ title: "Contraseña actualizada" });
    } catch (err) {
      const error = err as { message?: string };
      setPasswordError(error?.message ?? "Error al cambiar la contraseña");
    }
  };

  // Loader para botones
  const Loader = () => (
    <span className="inline-block w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin align-middle mr-2" />
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Perfil de usuario</h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 text-xl">
              {image?.trim() !== "" ? (
                <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="font-semibold text-white bg-violet-600 w-full h-full flex items-center justify-center rounded-full">
                  {name
                    .split(" ")
                    .map((n) => n[0]?.toUpperCase())
                    .join("")
                    .slice(0, 2)}
                </span>
              )}
            </Avatar>
            <div>
              <Label htmlFor="image">URL de imagen</Label>
              <Input id="image" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email ?? "-"} readOnly disabled />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Rol</Label>
              <Input value={user.type} readOnly disabled />
            </div>
            <div>
              <Label>Estado</Label>
              <Input value={user.active ? "Activo" : "Inactivo"} readOnly disabled />
            </div>
          </div>
          {user.client?.name && (
            <div>
              <Label>Cliente</Label>
              <Input value={user.client.name} readOnly disabled />
            </div>
          )}
          <div>
            <Label>Fecha de creación</Label>
            <Input value={user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"} readOnly disabled />
          </div>
          {profileSuccess && <Alert variant="default"><AlertTitle>Éxito</AlertTitle><AlertDescription>{profileSuccess}</AlertDescription></Alert>}
          {profileError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{profileError}</AlertDescription></Alert>}
          <Button type="submit">
            {updateProfile.isPending && <Loader />}Guardar cambios
          </Button>
        </form>
      </Card>
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Contraseña actual</Label>
            <Input id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <Label htmlFor="repeatPassword">Repetir nueva contraseña</Label>
            <Input id="repeatPassword" type="password" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} required minLength={6} />
          </div>
          {passwordSuccess && <Alert variant="default"><AlertTitle>Éxito</AlertTitle><AlertDescription>{passwordSuccess}</AlertDescription></Alert>}
          {passwordError && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{passwordError}</AlertDescription></Alert>}
          <Button type="submit">
            {changePassword.isPending && <Loader />}Cambiar contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
}
