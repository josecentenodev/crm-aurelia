"use client";
import { type RouterOutputs } from '@/trpc/react';

type Session = RouterOutputs['playground']['listPlaygroundSessions']['sessions'][number];

interface PlaygroundSidebarProps {
  sessions: Session[];
  selectedSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  creating: boolean;
}

export default function PlaygroundSidebar({ sessions, selectedSessionId, onSelectSession, onNewSession, creating }: PlaygroundSidebarProps) {
  return (
    <aside className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col min-h-0">
      <div className="h-16 p-4 border-b border-gray-200 flex items-center justify-between bg-white flex-shrink-0">
        <span className="font-semibold text-gray-900">Historial</span>
        <button 
          onClick={onNewSession} 
          disabled={creating} 
          className="text-violet-600 font-medium text-sm hover:text-violet-700 disabled:opacity-50"
        >
          {creating ? "Creando..." : "Nueva"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {
          sessions.length === 0 ? (
            <div className="p-4 text-gray-400 text-sm text-center">No hay sesiones previas</div>
          )
          : (
            sessions.map((session, idx) => {
                const isActive = session.id === selectedSessionId;
                return (
                  <button
                    key={session.id}
                    className={
                      isActive ? "w-full text-left p-3 rounded-lg mb-1 transition-colors bg-violet-100 font-semibold border-l-4 border-violet-500"
                      : "w-full text-left p-3 rounded-lg mb-1 transition-colors hover:bg-gray-100"
                    }
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="mb-1">
                      <p className="text-sm">Sesión {sessions.length - idx}</p>
                      <p className="text-xs text-gray-500">
                        {session.createdAt.toLocaleDateString("es-AR")}, {session.createdAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </button>
                );
              })
            )
        }
      </div>
    </aside>
  );
} 
