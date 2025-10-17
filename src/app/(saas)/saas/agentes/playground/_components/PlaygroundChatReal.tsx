"use client";
import { useRef, useState, useEffect } from "react";
import { Button, Input, Avatar, Badge } from "@/components/ui";
import { Send, Bot, User, Loader2, Wifi, WifiOff } from "lucide-react";

import DateFormat from "@/components/utils/dateFormat";

// Permitir role como string o MessageRole, y createdAt como Date
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt?: Date;
}


interface DateTimeProps {
  date: Date
}

function DateTime({date}: DateTimeProps) {
  return (
    <div className="flex justify-center sticky top-0">
      <span className="text-xs rounded-xl text-gray-400 bg-violet-100 px-2 py-1">
        {DateFormat.parseDateTime(date)}
      </span>
    </div>
  );
}

interface PlaygroundChatRealProps {
  messages: ChatMessage[];
  aiWaiting: boolean;
  loadingMessages: boolean;
  onSendMessage?: (content: string) => void;
  agentName: string;
  agentAvatar?: string;
  error?: string | null;
  realtimeConnected?: boolean;
}
export default function PlaygroundChatReal({
  messages,
  aiWaiting,
  loadingMessages,
  onSendMessage,
  agentName,
  agentAvatar,
  realtimeConnected
}: PlaygroundChatRealProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!inputValue.trim() || !onSendMessage) return;
    onSendMessage(inputValue);
    setInputValue("");
  };
  useEffect(() => {
    if (messagesEndRef.current) {
      const DOMParentElement = messagesEndRef.current.parentElement;
      if (DOMParentElement !== null) {
        const offsetTop = messagesEndRef.current.offsetTop;
        const offsetParent = DOMParentElement.offsetTop;
        DOMParentElement.scrollTo(0, offsetTop - offsetParent - 30);
      }
    }
  }, [messages.length]);

  const Messages = [];
  if (messages.length > 0) {
    let i = 0;
    let tempDate = new Date(messages[0]?.createdAt!);
    tempDate.setHours(0,0,0,0);
    Messages.push(<DateTime date={tempDate}/>);

    let date = tempDate.setDate(tempDate.getDate() + 1);

    for (let msg of messages) {
      if (msg.createdAt !== undefined
        && date < msg.createdAt.valueOf()
      ) {
        Messages.push(<DateTime date={tempDate}/>);
        tempDate.setFullYear(msg.createdAt.getFullYear());
        tempDate.setMonth(msg.createdAt.getMonth());
        date = tempDate.setDate(msg.createdAt.getDate() + 1);
      }
      Messages.push(
        <div
          key={msg.id}
          className={
            msg.role === "USER" ? "flex justify-end"
            : "flex justify-start"
          }
          ref={i === messages.length-1 ? messagesEndRef : undefined}
        >
          <div className={
            msg.role === "USER" ? "flex max-w-[80%] flex-row-reverse"
            : "flex max-w-[80%]"
          }>
            <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center">
              {
                msg.role === "USER" ? (
                  <Avatar className="bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </Avatar>
                )
                : msg.role === "SYSTEM" ? (
                  <Avatar className="bg-violet-100 flex items-center justify-center">
                    {
                      agentAvatar ? <img src={agentAvatar} alt={agentName}/>
                      : <Bot className="h-5 w-5 text-violet-700" />
                    }
                  </Avatar>
                )
                : null
              }
            </div>
            <div className={
              msg.role === "USER" ? "mx-2 px-4 py-2 rounded-xl bg-violet-600 text-white"
              : msg.role === "SYSTEM" ? "mx-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-800"
              : "mx-2 px-4 py-2 rounded-xl bg-yellow-50 text-yellow-800"
            }>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.createdAt && (
                <div className="text-xs text-gray-400 mt-1">
                  {msg.createdAt.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )
      i += 1;
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 min-h-0">
      {/* Header */}
      <div className="h-16 p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white">
        <div className="flex items-center space-x-3">
          <Avatar className="bg-violet-100 flex items-center justify-center">
            {
              agentAvatar ? <img src={agentAvatar} alt={agentName} />
              : <Bot className="h-5 w-5 text-violet-700" />
            }
          </Avatar>
          <div>
            <h3 className="font-medium text-gray-900">{agentName}</h3>
            <p className="px-0.5 py-0.5 text-xs font-semibold text-violet-700">Modo Prueba</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Indicador de conexión realtime */}
          <div className="flex items-center gap-1">
            {
              realtimeConnected ? <Wifi className="h-4 w-4 text-green-500" />
              : <WifiOff className="h-4 w-4 text-gray-400" />
            }
            <span className={
              realtimeConnected ? "text-xs text-green-600"
              : "text-xs text-gray-500"
            }>
              {realtimeConnected ? 'Tiempo real' : 'Sin conexión'}
            </span>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
        style={{
          scrollbarColor: "var(--color-violet-600) var(--color-white)",
          scrollBehavior: "smooth"
        }}
      >
        {Messages}
      </div>

      {/* Input */}
      {realtimeConnected && (
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={aiWaiting}
            />
            <Button
              onClick={handleSend} 
              disabled={!inputValue.trim() || aiWaiting}
              className="rounded-xl"
            >
              {
                aiWaiting ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 
