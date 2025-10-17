import { z } from "zod";

export const PLAYGROUND = {
  status: ["ACTIVE", "PAUSED", "FINISHED", "ARCHIVED"] as const,
  role: ["USER", "ASSISTANT", "SYSTEM"] as const,
  senderType: ["USER", "AGENT"] as const,
}

export const PlaygroundSchema = {
  Session: z.object({
    id: z.string().uuid(),
    agentId: z.string().uuid(),
    clientId: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.enum(PLAYGROUND.status),
    lastMessageAt: z.date().optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    aiConversationId: z.string().optional(),
  }),
  Message: z.object({
    id: z.string().uuid(),
    sessionId: z.string().uuid(),
    content: z.string(),
    role: z.enum(PLAYGROUND.role),
    senderId: z.string().optional(),
    senderName: z.string().optional(),
    senderType: z.enum(PLAYGROUND.senderType).optional(),
    metadata: z.record(z.string(), z.string()).optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    rating: z.number().optional(),
    feedback: z.string().optional()
  })
};


export declare namespace Playground {
  export type Session = z.infer<typeof PlaygroundSchema.Session>
  export type Message = z.infer<typeof PlaygroundSchema.Message>
}
