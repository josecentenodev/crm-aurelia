"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, User, Users, Zap, Archive } from "lucide-react";
import {
  ConversationsHeader,
  ConversationsSearch,
  ConversationsFilters,
  ConversationsList,
} from "./components";
import type {
  ChatsSidebarProps,
  ChatConversationsByInstance,
} from "../../_types/conversations.types";
import type { CategoryFilter } from "./components/conversations-filters";
import { useChatsFiltersStore } from "../../_store/chats-filters-store";
import { useClientContext } from "@/providers/ClientProvider";
import { api } from "@/trpc/react";
import {
  useRealtimeConversations,
  useConversationsFiltering,
} from "../../_hooks";
import { invalidateAllConversationData } from "../../_utils/trpc-invalidations";

export function ChatsSidebar({}: ChatsSidebarProps) {
  const router = useRouter();
  const { clientId } = useClientContext();

  // Store de filtros
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    getTrpcFilters,
  } = useChatsFiltersStore();

  const filters = getTrpcFilters();

  // Fetching de datos
  const utils = api.useUtils();
  const { data: rawConversationsData = [], isPending } =
    api.conversaciones.list.useQuery(
      { clientId: clientId!, filters },
      {
        enabled: !!clientId,
        refetchOnWindowFocus: false,
        staleTime: 30 * 1000,
      },
    );

  // Adaptar datos de tRPC a tipos de UI (type-safe)
  const conversationsData =
    rawConversationsData as unknown as ChatConversationsByInstance[];

  // Callback estable para invalidación (SOLO depende de utils y clientId)
  // Los filtros se aplican en el query, no necesitamos invalidar específicamente por filtro
  const handleInvalidate = useCallback(() => {
    if (!clientId) return;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatsSidebar] 🔄 Invalidando conversaciones por evento Realtime')
    }
    
    invalidateAllConversationData(utils, clientId)
  }, [utils, clientId]);

  // Hook de Realtime (gestión aislada)
  useRealtimeConversations({
    clientId,
    enabled: !!clientId && !isPending,
    onInvalidate: handleInvalidate,
  });

  // Hook de filtrado y conteo (lógica de negocio aislada)
  const { filteredGroups, categoryCounts } = useConversationsFiltering({
    conversationsData,
    selectedCategory,
  });

  // Definición de categorías con conteos
  const categories: CategoryFilter[] = [
    {
      id: "all",
      label: "Todas",
      icon: MessageSquare,
      count: categoryCounts.all,
    },
    {
      id: "unassigned",
      label: "Sin asignar",
      icon: User,
      count: categoryCounts.unassigned,
    },
    {
      id: "mine",
      label: "Mis conversaciones",
      icon: Users,
      count: categoryCounts.mine,
    },
    { id: "new", label: "Nuevas", icon: Zap, count: categoryCounts.new },
    {
      id: "archived",
      label: "Archivadas",
      icon: Archive,
      count: categoryCounts.archived,
    },
  ];

  // Handlers
  const handleCreateNew = useCallback(() => {
    router.push("/saas/conversaciones/nueva");
  }, [router]);

  return (
    <div className="flex h-full w-96 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <ConversationsHeader onCreateNew={handleCreateNew} />
        <ConversationsSearch value={searchTerm} onChange={setSearchTerm} />
      </div>

      {/* Categories */}
      <div className="border-b border-gray-200 p-4">
        <ConversationsFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Conversations List - Grouped by Instance */}
      <div className="flex-1 overflow-y-auto p-4">
        <ConversationsList groups={filteredGroups} isLoading={isPending} />
      </div>
    </div>
  );
}
