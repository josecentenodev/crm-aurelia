"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Bot, User } from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { ChatHeader } from "./components/chat-header";
import { MessageList } from "./components/message-list";
import { Composer } from "./components/composer";
import { AIActiveBanner } from "./components/ai-active-banner";
import { AiToggleDialog } from "./components/ai-toggle-dialog";
import { ConnectionAlert } from "./components/connection-alert";
import { useMessages } from "../../_hooks/messages";
import { useConversations } from "@/hooks/use-conversations";
import dynamic from "next/dynamic";
import * as React from "react";
import type { ChatPanelProps } from "../../_types/conversations.types";
import type { ConversationWithDetails } from "@/domain/Conversaciones";
import type { TemporaryMessage } from "@/domain/Conversaciones";
import type { MessageRole, MessageSenderType } from "@/domain/Conversaciones";
import { Skeleton } from "@/components/ui/skeleton";

const FilePreview = dynamic(
  () => import("./components/file-preview").then((mod) => ({ default: mod.FilePreview })),
  { ssr: false, loading: () => <div className="p-4 text-gray-400">Cargando preview...</div> }
);

export function ChatPanel({
  conversationId,
  onClose,
  showCloseButton = false,
}: ChatPanelProps) {
  const { markConversationAsRead } = useConversations();
  const { toast } = useToast();

  // Fetch de detalle por id
  // NOTA: React Query maneja cache automáticamente. Si esta conversación
  // ya fue fetched por conversaciones.list, se reutiliza el cache
  const { data: conversation, isPending: isPendingConversation } =
    api.conversaciones.byId.useQuery(
      { id: conversationId! },
      { enabled: !!conversationId },
    );

  // Detectar transiciones de conversación
  const prevConversationIdRef = useRef(conversation?.id);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const currentId = conversation?.id;
    const prevId = prevConversationIdRef.current;

    if (currentId !== prevId) {
      // Conversación cambió - mostrar skeleton
      setIsTransitioning(true);

      // Limpiar skeleton después de un breve delay
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevConversationIdRef.current = currentId;
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(false);
    }
  }, [conversation?.id]);

  // Estado del chat
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    type: "image" | "document";
  } | null>(null);
  const [showAiToggleDialog, setShowAiToggleDialog] = useState(false);

  // Usar el estado de IA desde la base de datos como valor inicial
  const [iaActiva, setIaActiva] = useState(conversation?.isAiActive ?? false);

  // Mutación para toggle de IA
  const toggleAiMutation = api.conversaciones.toggleAiActive.useMutation({
    onSuccess: (updatedConversation) => {
      setIaActiva(updatedConversation.isAiActive);
      toast({
        title: updatedConversation.isAiActive
          ? "IA Activada"
          : "IA Desactivada",
        description: updatedConversation.isAiActive
          ? "La IA ahora manejará esta conversación automáticamente"
          : "La conversación ahora se manejará manualmente",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutaciones tRPC para enviar mensajes
  const sendTextMutation = api.messages.sendText.useMutation({
    onSuccess: (result) => {
      if (result?.success) {
        toast({
          title: "Mensaje enviado",
          description: "Se envió vía WhatsApp",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendImageMutation = api.messages.sendImage.useMutation({
    onSuccess: (result) => {
      if (result?.success) {
        toast({
          title: "Imagen enviada",
          description: "Se envió vía WhatsApp",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendDocumentMutation = api.messages.sendDocument.useMutation({
    onSuccess: (result) => {
      if (result?.success) {
        toast({
          title: "Documento enviado",
          description: "Se envió vía WhatsApp",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Hook simplificado para mensajes
  const {
    messages: mensajes,
    connectionError,
    reconnect,
    addTemporaryMessage,
    updateTemporaryMessage,
  } = useMessages({
    conversationId: conversation?.id ?? "",
    clientId: conversation?.clientId ?? "",
    enabled: !!conversation?.id && !!conversation?.clientId,
  });

  // Sincronizar estado de IA cuando cambie la conversación
  useEffect(() => {
    if (conversation) {
      setIaActiva(conversation.isAiActive ?? false);
    }
  }, [conversation]);

  // Función para manejar el toggle de IA
  const handleToggleAi = useCallback(() => {
    setShowAiToggleDialog(true);
  }, []);

  // Función para confirmar el toggle de IA
  const handleConfirmToggleAi = useCallback(
    async (newState: boolean) => {
      if (!conversation) return;

      try {
        await toggleAiMutation.mutateAsync({
          conversationId: conversation.id,
          isActive: newState,
        });
        setShowAiToggleDialog(false);
      } catch (error) {
        console.error("Error toggling AI:", error);
      }
    },
    [conversation, toggleAiMutation],
  );

  // Manejar selección de archivos
  const handleFileSelect = useCallback(
    (file: File, type: "image" | "document") => {
      setSelectedFile({ file, type });
    },
    [],
  );

  // Manejar envío de archivos
  const handleFileUpload = useCallback(
    async (file: File, type: "image" | "document") => {
      if (!conversation) return;

      const instanceId = conversation.evolutionInstance?.id;
      const to = conversation.contact?.phone;

      if (!instanceId || !to) {
        toast({
          title: "No se puede enviar",
          description: !instanceId
            ? "La conversación no tiene instancia asociada"
            : "El contacto no tiene teléfono",
          variant: "destructive",
        });
        return;
      }

      try {
        // Subir archivo a Supabase Storage
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", conversation.clientId);
        formData.append("messageType", type);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = (await uploadResponse.json()) as { error?: string };
          throw new Error(errorData?.error ?? "Error subiendo archivo");
        }

        const uploadData = (await uploadResponse.json()) as {
          success?: boolean;
          publicUrl?: string;
        };

        if (!uploadData?.success || !uploadData?.publicUrl) {
          throw new Error("Error en la respuesta del servidor");
        }

        // Enviar mensaje con archivo adjunto
        if (type === "image") {
          await sendImageMutation.mutateAsync({
            instanceId,
            to,
            imageUrl: uploadData.publicUrl,
            clientId: conversation.clientId,
          });
        } else {
          await sendDocumentMutation.mutateAsync({
            instanceId,
            to,
            documentUrl: uploadData.publicUrl,
            filename: file.name,
            clientId: conversation.clientId,
          });
        }

        // Limpiar formulario
        setSelectedFile(null);

        // Marcar como leída
        void markConversationAsRead(conversation.id);
      } catch (error) {
        const errorMessage =
          (error as Error)?.message ?? "No se pudo enviar el archivo";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [
      conversation,
      sendImageMutation,
      sendDocumentMutation,
      toast,
      markConversationAsRead,
    ],
  );

  // Manejar envío de mensajes de texto (DB-first + optimista por id)
  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!conversation || !message.trim() || iaActiva) return;

      const instanceId = conversation.evolutionInstance?.id;
      const to = conversation.contact?.phone;

      if (!instanceId || !to) {
        toast({
          title: "No se puede enviar",
          description: !instanceId
            ? "La conversación no tiene instancia asociada"
            : "El contacto no tiene teléfono",
          variant: "destructive",
        });
        return;
      }

      let tempId: string | null = null;
      try {
        // Optimista inmediato con id temporal
        // Generar UUID estable si está disponible en runtime
        tempId =
          (globalThis.crypto?.randomUUID?.() as string | undefined) ??
          `temp-${Date.now()}`;
        const tempMsg: TemporaryMessage = {
          id: tempId,
          conversationId: conversation.id,
          content: message.trim(),
          role: "USER" as MessageRole,
          senderType: "USER" as MessageSenderType,
          messageType: "TEXT",
          messageStatus: "PENDING",
          createdAt: new Date(),
          updatedAt: new Date(),
          isTemporary: true,
          metadata: { isTemporary: true },
        };
        addTemporaryMessage(tempMsg);

        const result = await sendTextMutation.mutateAsync({
          instanceId,
          to,
          message: message.trim(),
          clientId: conversation.clientId,
          conversationId: conversation.id,
          messageId: tempId,
        });

        if (result?.success) {
          // Ya usamos el id definitivo (tempId) en DB; solo actualizamos estado del optimista
          if (tempId) updateTemporaryMessage(tempId, { messageStatus: "SENT" });
          void markConversationAsRead(conversation.id);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage =
          (error as Error)?.message ?? "No se pudo enviar el mensaje";
        // Marcar optimista como error si existe
        try {
          if (tempId)
            updateTemporaryMessage(tempId, { messageStatus: "FAILED" });
        } catch (error) {
          console.error("Error updating temporary message:", error);
        }
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [
      conversation,
      iaActiva,
      sendTextMutation,
      toast,
      markConversationAsRead,
      addTemporaryMessage,
      updateTemporaryMessage,
    ],
  );
  if (!conversationId) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium">Selecciona una conversación</p>
          <p className="mt-1 text-sm text-gray-500">
            Elige una conversación de la lista para ver los mensajes
          </p>
        </div>
      </div>
    );
  }

  // Estados de carga y vacío (incluir transiciones)
  if (isPendingConversation || isTransitioning) {
    return (
      <div className="flex h-full flex-col">
        <Card className="flex h-full flex-col rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 p-4">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <Skeleton className="h-16 w-64 rounded-2xl" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          <div className="border-t border-gray-100 p-4">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </Card>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200">
            <User className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium">Selecciona una conversación</p>
          <p className="mt-1 text-sm text-gray-500">
            Elige una conversación de la lista para ver los mensajes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChatHeader
        conversacion={conversation}
        iaActiva={iaActiva}
        onToggleIa={handleToggleAi}
        onClose={onClose}
        showCloseButton={showCloseButton}
        onMarkRead={() =>
          conversation && markConversationAsRead(conversation.id)
        }
        unreadCount={conversation.unreadCount}
      />

      {/* Chat */}
      <div className="flex min-h-0 flex-1 flex-col">
        <Card className="flex h-full flex-col rounded-2xl border-0 bg-white shadow-sm">
          <CardHeader className="flex-shrink-0 border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                {iaActiva ? (
                  <Bot className="h-5 w-5 text-green-500" />
                ) : (
                  <User className="h-5 w-5 text-blue-500" />
                )}
                <span>Chat {iaActiva ? "Automático" : "Manual"}</span>
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="min-h-0 flex-1 p-0">
            {/* Alerta de error de conexión Realtime */}
            {connectionError && (
              <div className="p-4 pb-0">
                <ConnectionAlert error={connectionError} onRetry={reconnect} />
              </div>
            )}
            <MessageList
              messages={mensajes}
              isTyping={false}
              isAiTyping={false}
              typingStartTime={null}
            />
          </CardContent>

          {/* Preview de archivo seleccionado */}
          {selectedFile && !iaActiva && (
            <div className="px-4 pb-2">
              <FilePreview
                file={selectedFile.file}
                type={selectedFile.type}
                onRemove={() => setSelectedFile(null)}
                onUpload={handleFileUpload}
                clientId={conversation.clientId}
              />
            </div>
          )}

          {/* Mostrar banner de IA cuando está activa, sino mostrar composer */}
          {iaActiva ? (
            <div className="p-4">
              <AIActiveBanner isActive={iaActiva} />
            </div>
          ) : (
            <Composer
              disabled={iaActiva}
              onSend={handleSendMessage}
              onFileSelect={handleFileSelect}
            />
          )}
        </Card>
      </div>

      {/* Diálogo de confirmación para toggle de IA */}
      <AiToggleDialog
        isOpen={showAiToggleDialog}
        onClose={() => setShowAiToggleDialog(false)}
        conversation={conversation as unknown as ConversationWithDetails}
        currentAiState={iaActiva}
        onConfirm={handleConfirmToggleAi}
        isLoading={toggleAiMutation.isPending}
      />
    </div>
  );
}
