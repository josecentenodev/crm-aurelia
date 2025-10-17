"use client"
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AgentSettingsForm from "@/app/(saas)/saas/agentes/_components/AgentSettingsForm";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label, Input } from "@/components/ui";
import React from "react";

export default function EditAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agenteId = params.agenteId as string;
  const clientId = params.id as string;

  const { data: agente, isLoading, error } = api.superadmin.getAgenteById.useQuery({ id: agenteId }, { enabled: !!agenteId });
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    isActive: false,
    customFields: {} as Record<string, any>,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setear el estado del formulario cuando agente esté disponible
  React.useEffect(() => {
    if (agente) {
      setForm({
        name: agente.name ?? "",
        isActive: agente.isActive ?? false,
        customFields: (typeof agente.customFields === "object" && agente.customFields !== null) ? agente.customFields as Record<string, any> : {},
      });
    }
  }, [agente]);

  // Obtener el template del agente
  const { data: template, isLoading: loadingTemplate } = api.superadmin.getTemplateById.useQuery({ id: agente?.templateId ?? "" }, { enabled: !!agente?.templateId });

  const updateMutation = api.superadmin.updateAgente.useMutation({
    onSuccess: () => {
      toast({ title: "Agente actualizado", description: "Los cambios fueron guardados correctamente." });
      router.back();
    },
    onError: (err) => {
      toast({ title: "Error al actualizar", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading || loadingTemplate) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (error || !agente || !template) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-2">Agente no encontrado</h2>
          <Button onClick={() => router.back()}>Volver</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Editar Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={e => {
              e.preventDefault();
              setIsSubmitting(true);
              updateMutation.mutate({
                id: agenteId,
                name: form.name,
                isActive: form.isActive,
                customFields: form.customFields,
                templateId: agente.templateId,
                clientId: agente.clientId,
              }, { onSettled: () => setIsSubmitting(false) });
            }}
            className="space-y-6"
          >
            <div>
              <Label>Nombre del agente</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
                id="isActive"
              />
              <Label htmlFor="isActive">Activo</Label>
            </div>
            <AgentSettingsForm
              template={template}
              values={form.customFields as Record<string, any>}
              setValues={updater => setForm(f => ({ ...f, customFields: updater(f.customFields) }))}
            />
            <div className="flex gap-2 mt-6">
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 
