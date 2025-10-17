"use client"

import { useClientContext } from '@/providers/ClientProvider'
import { api } from '@/trpc/react'
import { ChatsFiltersDialog } from "./components/chats-page-filters-dialog"
import { DateFilterSelect } from "./components/date-filter-select"
import { NotificationsButton } from "./components/notifications-button"

export function ChatsPageHeader() {
  const { clientId } = useClientContext()
  
  const { data: instances = [] } = api.conversaciones.getClientInstances.useQuery(
    { clientId: clientId! },
    { enabled: !!clientId, staleTime: 5 * 60 * 1000 }
  )

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4" />

        <div className="flex items-center space-x-4">
          <DateFilterSelect />
          <ChatsFiltersDialog instances={instances} />
          <NotificationsButton />
        </div>
      </div>
    </div>
  )
}
