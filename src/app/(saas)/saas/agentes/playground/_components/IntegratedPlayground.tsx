"use client";

import type { Agent } from '@/domain/Agentes';
import type { RouterOutputs } from "@/trpc/react";
import type { RealtimeChannel } from '@supabase/supabase-js'

import { getSupabaseClient } from "@/lib/supabase";
import { api } from '@/trpc/react';

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import PlaygroundSidebar from "./PlaygroundSidebar";
import PlaygroundChatReal from "./PlaygroundChatReal";
import AgentConfigurationPanel from "../../_components/AgentConfigurationPanel";

type Message = RouterOutputs['playground']['getPlaygroundMessages'][number];

type ChannelState = (
  "UNSUBSCRIBE"
  | "SUBSCRIBE"
  | "PROCESSING"
  | "TIMEDOUT"
  | "ERROR"
);

const MINUTE = 60000;
const CACHED_CHANNELS_MAX_LENGTH = 5;
const CachedChannels = {
  UNSUBSCRIBE_WAIT_TIME: MINUTE * 2,
  MAX_LENGTH: CACHED_CHANNELS_MAX_LENGTH,
  len: 0,
  id: Array(CACHED_CHANNELS_MAX_LENGTH) as string[],
  channel: Array(CACHED_CHANNELS_MAX_LENGTH) as RealtimeChannel[],
  timeout: Array(CACHED_CHANNELS_MAX_LENGTH) as (number|undefined)[],
  lastCall: Array(CACHED_CHANNELS_MAX_LENGTH) as number[],

  push(id: string, channel: RealtimeChannel): undefined {
    let idx = -1;
    if (CachedChannels.len === CachedChannels.MAX_LENGTH) {
      let temp = CachedChannels.lastCall[0] as number;
      let y = 0;
      for (let i = 1; i < CachedChannels.len; i += 1) {
        let time = CachedChannels.lastCall[i] as number;
        if (time < temp) {
          temp = time;
          y = i;
        }
      }
      let prevChannel = CachedChannels.channel[y] as RealtimeChannel;
      if (CachedChannels.timeout[y] !== undefined) {
        clearTimeout(CachedChannels.timeout[y]);
      }
      if (prevChannel.state === "joined") {
        const supabase = getSupabaseClient();
        void supabase.removeChannel(prevChannel);
      }
      idx = y;
    } else {
      idx = CachedChannels.len;
      CachedChannels.len += 1;
    }

    CachedChannels.id[idx] = id;
    CachedChannels.timeout[idx] = undefined;
    CachedChannels.channel[idx] = channel;
    CachedChannels.lastCall[idx] = Date.now();
  },
  remove(idx: number): boolean {
    if (CachedChannels.len === 0
      || (idx < 0 || CachedChannels.len <= idx)
    ) {
      return false;
    }
    if (CachedChannels.timeout[idx]) {
      clearTimeout(CachedChannels.timeout[idx]);
      CachedChannels.timeout[idx] = undefined;
    }
    if (idx !== CachedChannels.len - 1) {
      const last = CachedChannels.len - 1;
      CachedChannels.id[idx] = CachedChannels.id[last] as string;
      CachedChannels.channel[idx] = CachedChannels.channel[last] as RealtimeChannel;
      CachedChannels.timeout[idx] = CachedChannels.timeout[last];
      CachedChannels.lastCall[idx] = CachedChannels.lastCall[last] as number;

      CachedChannels.id[last] = "";
      CachedChannels.timeout[last] = undefined;
      CachedChannels.lastCall[last] = 0;
    }
    CachedChannels.len -= 1;
    return true;
  },
  removeById(id: string): boolean {
    let channelId = "";
    for (let i = 0; i < CachedChannels.len; i += 1) {
      channelId = CachedChannels.id[i] as string;
      if (id === channelId) {
        if (CachedChannels.timeout[i]) {
          clearTimeout(CachedChannels.timeout[i]);
          CachedChannels.timeout[i] = undefined;
        }
        if (i !== CachedChannels.len - 1) {
          const last = CachedChannels.len - 1;
          CachedChannels.id[i] = CachedChannels.id[last] as string;
          CachedChannels.channel[i] = CachedChannels.channel[last] as RealtimeChannel;
          CachedChannels.timeout[i] = CachedChannels.timeout[last];
          CachedChannels.lastCall[i] = CachedChannels.lastCall[last] as number;

          CachedChannels.id[last] = "";
          CachedChannels.timeout[last] = undefined;
          CachedChannels.lastCall[last] = 0;
        }
        CachedChannels.len -= 1;
        return true;
      }
    }
    return false;
  },
  callChannelByIndex(i: number): RealtimeChannel | undefined {
    if (i < 0 || CachedChannels.len <= i) {
      return;
    }
    CachedChannels.lastCall[i] = Date.now();
    if (CachedChannels.timeout[i] !== undefined) {
      clearTimeout(CachedChannels.timeout[i]);
      CachedChannels.timeout[i] = undefined;
    }
    return CachedChannels.channel[i];
  },
  searchById(id: string): number {
    let channelId = "";
    for (let i = 0; i < CachedChannels.len; i += 1) {
      channelId = CachedChannels.id[i] as string;
      if (id === channelId) {
        return i;
      }
    }
    return -1;
  },
  logState() {
    console.info("CachedChannel State", {
      len: CachedChannels.len,
      channel: [...CachedChannels.channel],
      id: [...CachedChannels.id],
      timeout: [...CachedChannels.timeout],
      lastCall: [...CachedChannels.lastCall]
    })
  }
};

function subscribe(
  sessionId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setChannelState: React.Dispatch<React.SetStateAction<ChannelState>>,
  setChannelSubscribed: React.Dispatch<React.SetStateAction<boolean>>,
  setIsWaitingAI: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  lastUserMessageId: React.RefObject<string>,
  retryCount: number = 0,
  maxRetries: number = 3
): RealtimeChannel {
  const id = `PlaygroundSession_${sessionId}`;
  const idx = CachedChannels.searchById(id);
  if (idx !== -1) {
    let channel = CachedChannels.callChannelByIndex(idx);
    if (channel && channel.state === "joined") {
      setChannelState("SUBSCRIBE");
      setChannelSubscribed(true);
      setError(null);
      return channel;
    } else {
      //MUST BE UNRECHABLE
      if (channel) {
        const supabase = getSupabaseClient();
        void supabase.removeChannel(channel);
      }
      CachedChannels.remove(idx);
      console.error("Subscribe ERROR: Channel not found on cache");
    }
  }
  const supabase = getSupabaseClient();
  const channel = supabase.channel(id).on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "PlaygroundMessage",
      filter: `sessionId=eq.${sessionId}`
    },
    function (payload) {
      if (!payload.new) {
        return;
      }

      if (payload.new.role === "USER") {
        if (lastUserMessageId.current === payload.new.id) {
          return;
        }
        setIsWaitingAI(true);
        const newMessage: Message = {
          id: payload.new.id,
          content: payload.new.content,
          role: payload.new.role,
          senderName: payload.new.senderName ?? null,
          senderType: payload.new.senderType,
          createdAt: new Date(payload.new.createdAt+"Z"),
          rating: payload.new.rating ?? null,
          feedback: payload.new.feedback ?? null
        };

        setMessages((prev) => {
          let messages = [...prev];
          let aiTyping: undefined | Message = undefined;
          if (messages.length > 0
            && messages[messages.length - 1]?.id === "ai-typing"
          ) {
            aiTyping = messages[messages.length - 1]!;
            messages.length -= 1;
          } else {
            aiTyping = {
              id: 'ai-typing',
              content: `escribiendo...`,
              role: "SYSTEM" as const,
              senderName: null,
              senderType: null,
              createdAt: new Date(),
              rating: null,
              feedback: null
            };
          } 
          /*
          let sorted = false;
          for (let i = messages.length - 1; i > -1; i -= 1) {
            let message = messages[i]!;
            if (message.createdAt.valueOf() > newMessage.createdAt.valueOf()) {
              messages.copyWithin(i+1, i);
              sorted = true;
              messages[i] = newMessage;
              break;
            }
          }
          if (!sorted) {
            messages.push(newMessage);
          }
          */
          messages.push(newMessage);
          return messages;
        });
      } if (payload.new.role === "SYSTEM") {
        const newMessage: Message = {
          id: payload.new.id,
          content: payload.new.content,
          role: payload.new.role,
          senderName: payload.new.senderName ?? null,
          senderType: payload.new.senderType,
          createdAt: new Date(payload.new.createdAt+"Z"),
          rating: payload.new.rating ?? null,
          feedback: payload.new.feedback ?? null
        };
        setMessages((prev) => {
          const messages = [...prev];
          if (messages.length > 0
            && messages[messages.length - 1]?.id === "ai-typing"
          ) {
            messages.length -= 1;
          }
          /*
          let sorted = false;
          for (let i = messages.length - 1; i > -1; i -= 1) {
            let message = messages[i]!;
            if (message.createdAt.valueOf() > newMessage.createdAt.valueOf()) {
              messages.copyWithin(i+1, i);
              sorted = true;
              messages[i] = newMessage;
              break;
            }
          }
          if (!sorted) {
            messages.push(newMessage);
          }
          */
          messages.push(newMessage);
          return messages;
        });
        setIsWaitingAI(false);
      }
    }
  )
  channel.subscribe(function (status) {
    if (status === "SUBSCRIBED") {
      setChannelState("SUBSCRIBE");
      setChannelSubscribed(true);
      setError(null);
    } else if (status === "TIMED_OUT") {
      console.error("[IntegratedPlayground] Error channel status:", status);

      setChannelState("TIMEDOUT");
      setChannelSubscribed(false);
      CachedChannels.removeById(id);
      void supabase.removeChannel(channel);

    } else if (status === "CHANNEL_ERROR") {
      setChannelState("ERROR");
      console.error("[IntegratedPlayground] Error channel status:", status);
      setError("[IntegratedPlayground] Error channel status: " + status);
      setChannelSubscribed(false);
      CachedChannels.removeById(id);
      void supabase.removeChannel(channel);
    }
  });

  CachedChannels.push(id, channel);
  return channel;
}

function unsubscribe_timeout(id: string, unsubscribeCall: number) {
    const i = CachedChannels.searchById(id);
    if (i == -1) {
      return;
    }
    CachedChannels.timeout[i] = undefined;
    const channel = CachedChannels.channel[i] as RealtimeChannel;
    const lastCall = CachedChannels.lastCall[i] as number;
    if (lastCall < unsubscribeCall) {
      if (channel.state === "joined") {
        const supabase = getSupabaseClient();
        void supabase.removeChannel(channel)
      }
      CachedChannels.remove(i);
    }
}

function unsubscribe(id: string, channel: RealtimeChannel) {
  const supabase = getSupabaseClient();
  const i = CachedChannels.searchById(id);
  if (i === -1) {
    void supabase.removeChannel(channel);
    return;
  }
  if (CachedChannels.timeout[i] !== undefined) {
    clearTimeout(CachedChannels.timeout[i]);
  }
  CachedChannels.timeout[i] = setTimeout(
    unsubscribe_timeout,
    CachedChannels.UNSUBSCRIBE_WAIT_TIME,
    id,
    Date.now()
  ) as unknown as number;
  }


interface IntegratedPlaygroundProps {
  selectedAgent: Agent | null;
}

export default function IntegratedPlayground({ selectedAgent }: IntegratedPlaygroundProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingAI, setIsWaitingAI] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [channelState, setChannelState] = useState<ChannelState>("UNSUBSCRIBE");
  const [channelSubscribed, setChannelSubscribed] = useState<boolean>(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const activeSessionRef = useRef<string>("");
  const lastUserMessageId = useRef<string>("");

  //Fetchs
  const {
    data: sessionsData,
    refetch: refetchSessions,
  } = api.playground.listPlaygroundSessions.useQuery(
    { agentId: selectedAgent?.id ?? "" },
    {
      enabled: !!selectedAgent?.id,
      refetchOnWindowFocus: false
    }
  );
  const {
    data: messagesData = [],
    isLoading: isLoadingMsgs,
    refetch: refetchMessages
  } = api.playground.getPlaygroundMessages.useQuery(
    { sessionId: selectedSessionId! },
    {
      enabled: !!selectedSessionId,
      staleTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: true
    }
  );

  const sessions = useMemo(
    () => {
      if (Array.isArray(sessionsData?.sessions)) {
        return sessionsData.sessions;
      } else {
        return [];
      }
    },
    [sessionsData?.sessions]
  );

  // Crear nueva sesión
  const { mutate: createSession, isPending: isCreating } = api.playground.startPlaygroundSession.useMutation({
    onSuccess: async (res) => {
      await refetchSessions();
      setSelectedSessionId(res.sessionId);
      setMessages([]);
      setIsWaitingAI(false);
    },
    onError: async (err) => {
      console.error("[IntegratedPlaygound] Error creating session", err);
      setError(`[IntegratedPlaygound] Error creating session: ${err}`);
    }
  });

  // Enviar mensaje
  const {
    mutate: sendMessage,
    isPending: isSending
  } = api.playground.askPlayground.useMutation({
    onSuccess: () => {
      setMessages((prev) => {
        return [
          ...prev,
          {
            id: 'ai-typing',
            content: `${selectedAgent?.name} está escribiendo...`,
            role: "SYSTEM" as const,
            senderName: null,
            senderType: null,
            createdAt: new Date(),
            rating: null,
            feedback: null
          }
        ];
      })
    },
    onError: async (err) => {
      console.error("[IntegratedPlayground] Error sending message:", err);
      setError(`[IntegratedPlayground] Error sending message: ${err}`);
      setMessages(messagesData);
      setIsWaitingAI(false);
    }
  });

  // Handler para enviar mensaje
  const handleSendMessage = useCallback((content: string) => {
    if (!selectedSessionId || !selectedAgent) {
      console.error("[IntegratedPlaygroun] No session selected or invalid Agent")
      setError("[IntegratedPlaygroun] No session selected or invalid Agent")
      return
    };
    // Crear mensaje optimista del usuario
    const id = crypto.randomUUID();
    lastUserMessageId.current = id;
    const userMsg: Message = {
      id,
      role: "USER",
      content,
      createdAt: new Date(),
      senderName: null,
      senderType: null,
      rating: null,
      feedback: null
    };
    setMessages(prev => [...prev, userMsg]);
    setIsWaitingAI(true);

    // Enviar mensaje al backend
    sendMessage({
      sessionId: selectedSessionId,
      message: {id, content}
    });
  },[selectedAgent, selectedSessionId, sendMessage]);

  // Resetear estado cuando cambia el agente seleccionado
  useEffect(() => {
    setSelectedSessionId(null);
    setIsWaitingAI(false);
    setError(null);
    setMessages([]);
  }, [selectedAgent?.id]);

  // Cuando cambia la sesión seleccionada, limpiar mensajes de tiempo real
  useEffect(() => {
    let timeout: number | undefined = undefined;
    try {
      if (channelRef.current && channelRef.current.state === "joined") {
        unsubscribe(channelRef.current.subTopic, channelRef.current);
        channelRef.current = null;
      }
      if (!selectedSessionId) {
        activeSessionRef.current = "";
        return;
      }
      refetchMessages();
      setMessages([]);
      setIsWaitingAI(false);
      setChannelState("PROCESSING");
      setError(null);

      timeout = setTimeout(function () {
        if (activeSessionRef.current === selectedSessionId) {
          channelRef.current = subscribe(
            selectedSessionId,
            setMessages,
            setChannelState,
            setChannelSubscribed,
            setIsWaitingAI,
            setError,
            lastUserMessageId
          );
        }
      }, 500) as unknown as number;

      activeSessionRef.current = selectedSessionId;

    } catch (err) {
      setChannelState("ERROR");
      setChannelSubscribed(false);
      console.error(`[IntegratedPlayground] Error on selectedSessionId useEffect: `, err);
      setError(`[IntegratedPlayground] Error created channel: ${err}`);
    }

    return () => {
      clearTimeout(timeout);
      activeSessionRef.current = "";
      if (channelRef.current?.state === "joined") {
        setChannelSubscribed(false);
        setError(null)
        unsubscribe(channelRef.current.subTopic, channelRef.current);
        setChannelState("UNSUBSCRIBE");
        channelRef.current = null;
      }
    };
  }, [selectedSessionId, refetchMessages]);

  useEffect(() => {
    if (messagesData.length > 0) {
      setMessages(messagesData);
    }
  }, [messagesData])

  // Seleccionar la última sesión automáticamente cuando cambian las sesiones
  useEffect(() => {
    if (sessions.length > 0 && !selectedSessionId) {
      setSelectedSessionId(sessions[0]?.id ?? null);
    }
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    console.info({channelState});
  }, [channelState])

  if (!selectedAgent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Selecciona un agente</h3>
          <p className="text-gray-500 text-base leading-relaxed">
            Elige un agente de la lista para comenzar a probar en el playground y ver cómo responde a tus mensajes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white rounded-2xl overflow-hidden min-h-0">
      <PlaygroundSidebar
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        onSelectSession={setSelectedSessionId}
        onNewSession={() => createSession({ agentId: selectedAgent.id })}
        creating={isCreating}
      />
      <PlaygroundChatReal
        messages={messages}
        onSendMessage={handleSendMessage}
        aiWaiting={isWaitingAI}
        loadingMessages={isLoadingMsgs}
        agentName={selectedAgent.name}
        agentAvatar={undefined}
        realtimeConnected={channelSubscribed}
      />
    </div>
  );
}
