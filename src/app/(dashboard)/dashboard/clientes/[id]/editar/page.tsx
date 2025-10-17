"use client"
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/trpc/react";
import { UpdateClientSchema, type UpdateClient } from "@/domain/Clientes";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const { data: client, isLoading, error: queryError } = api.superadmin.getClientById.useQuery({ id: clientId }, { enabled: !!clientId });
  const { toast } = useToast();
  const { data: statuses = [] } = api.superadmin.getClientStatuses.useQuery();
  const { data: plans = [] } = api.superadmin.getClientPlans.useQuery();
  const updateClient = api.superadmin.updateClient.useMutation({
    onSuccess: () => {
      toast({ title: "Cliente actualizado", description: "Los cambios fueron guardados correctamente." });
      router.back();
    },
    onError: (error) => {
      setFormError(error.message);
    }
  });
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<UpdateClient>({
    resolver: zodResolver(UpdateClientSchema),
    defaultValues: {
      name: client?.name ?? "",
      description: client?.description ?? "",
      email: client?.email ?? "",
      address: client?.address ?? "",
      city: client?.city ?? "",
      cp: client?.cp ?? "",
      country: client?.country ?? "",
      statusId: client?.statusId,
      planId: client?.planId,
    }
  });

  const onSubmit = (data: UpdateClient) => {
    setFormError(null);
    updateClient.mutate({ id: clientId, ...data });
  };

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (queryError || !client) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">Cliente no encontrado</h2>
          <Button onClick={() => router.back()}>Volver</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Editar Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Cliente *</Label>
                  <Input id="name" {...form.register("name")} placeholder="Nombre de la empresa" />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register("email")} placeholder="contacto@empresa.com" />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea id="description" {...form.register("description")} placeholder="Descripción del cliente" rows={3} />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="statusId">Estado *</Label>
                  <Select value={form.watch("statusId")} onValueChange={value => form.setValue("statusId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.id} value={status.id}>{status.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.statusId && (
                    <p className="text-sm text-red-500">{form.formState.errors.statusId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planId">Plan *</Label>
                  <Select value={form.watch("planId")} onValueChange={value => form.setValue("planId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.planId && (
                    <p className="text-sm text-red-500">{form.formState.errors.planId.message}</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Dirección (Opcional)</h3>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" {...form.register("address")} placeholder="Dirección completa" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input id="city" {...form.register("city")} placeholder="Ciudad" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cp">Código Postal</Label>
                  <Input id="cp" {...form.register("cp")} placeholder="CP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" {...form.register("country")} placeholder="País" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={updateClient.isPending}>{updateClient.isPending ? "Guardando..." : "Guardar cambios"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 