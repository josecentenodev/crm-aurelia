import type { OpenAI as TOpenAI } from "openai";
import type { NextRequest } from "next/server";

import OpenAI from "openai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { ALLOWED_ORIGINS, INTERNAL_API_KEY } from "@/lib/api";

import { getSupabaseClient } from "@/lib/supabase";
import { Encryptor } from "@/lib/encryptor/edge";
import { logger } from "@/lib/utils/server-logger";



//TODO Streaming tiene un limite de 300s
export const runtime = "edge";

// no caching
export const dynamic = "force-dynamic";


//TODO Revisar cross-origin
/*
const STREAM_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "Access-Control-Allow-Origin": "*", // Adjust based on your CORS policy
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Cache-control, Content-Type, Authorization",
};
*/

const RequestSchema = z.object({
  aiApiKey: z.string(),
  aiModel: z.string(),
  aiTemperature: z.number().optional(),
  aiTopP: z.number().optional(),
  aiMaxOutputTokens: z.number().optional(),
  aiConversationId: z.string(),
  aiMetadata: z.any().optional(),
  aiPrompt: z.string().optional(),
  agentId: z.string(),
  agentName: z.string(),
  from: z.enum(["conversation", "playground"]),
  conversationId: z.string().uuid().optional(),
  playgroundSessionId: z.string().uuid().optional(),
  message: z.string().min(1),
  requestId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.aiError(`Unauthorized origin: ${origin}`);
    return new NextResponse("Unauthorized", {status: 401});
  }
  const token = authHeader.slice(7);
  if (token !== INTERNAL_API_KEY) {
    logger.aiError(`Unauthorized origin: ${origin}`);
    return new NextResponse("Unauthorized", {status: 401});
  }

  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    logger.aiError(`Forbidden origin: ${origin}`);
    return new NextResponse("Forbidden", {status: 403});
  }

  if (req.method === "OPTIONS") {
    const PREFLIGHT_HEADERS = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Content-Type": "application/json",
      "X-Content-Type-Options": "nosniff"
    };
    return new Response(null, {status: 204, headers: PREFLIGHT_HEADERS});
  }

  let data: z.infer<typeof RequestSchema>;
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      logger.aiError("Invalid request body", parsed.error);
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error
        },
        {status: 400}
      );
    }
    data = parsed.data;
    if (data.from === "playground" && !data.playgroundSessionId) {
      logger.aiError("Bad request: 'playgroundSessionId' must be set for 'playground'");
      return NextResponse.json(
        { error: "Bad request: 'playgroundSessionId' must be set for 'playground'" },
        { status: 400 }
      );
    } else if (data.from === "conversation" && !data.conversationId) {
      logger.aiError("Bad request: 'conversationId' must be set for 'conversation'");
      return NextResponse.json(
        { error: "Bad request: 'conversationId' must be set for 'conversation'" },
        { status: 400 }
      );
    }

    console.info({data});
    let apiKey: string;
    try {
      apiKey = await Encryptor.decrypt(data.aiApiKey);
    } catch (error) {
      logger.aiError("Decryption failed", error as Error);
      return NextResponse.json(
        {error: "Invalid ecryoted data"},
        {status: 400}
      );
    }

    const openai = new OpenAI({apiKey});

    let openAIRequest: TOpenAI.Responses.ResponseCreateParams = {
      model: data.aiModel || "gpt-4o-mini",
      conversation: data.aiConversationId,
      input: data.message,
      store: false,
      stream: true
    };

    if (data.aiTemperature !== undefined) {
      openAIRequest.temperature = data.aiTemperature;
    }
    if (data.aiTopP !== undefined) {
      openAIRequest.top_p = data.aiTopP;
    }
    if (data.aiMaxOutputTokens !== undefined) {
      openAIRequest.max_output_tokens = data.aiMaxOutputTokens;
    }
    console.info({openAIRequest});

    //TODO podemos tracker los tokens usados
    const stream = await openai.responses.create(openAIRequest);
    let response: TOpenAI.Responses.Response | undefined = undefined;
    for await (let chunk of stream) {
      if (chunk.type === "response.completed") {
        response = chunk.response
        break;
      }
    }
    console.info({response})

    if (response === undefined) {
      logger.aiError("No valid response or text from OpenAI");
      return NextResponse.json(
        {error: "No valid response or text for AI"},
        {status: 500}
      );
    }

    const supabase = getSupabaseClient();

    let transactions: any;
    let dbMessages = [];
    let newDate = "";
    let messages = [
      {
        type: "message",
        role: "user",
        content: [{type: "input_text", text: data.message}]
      },
    ];
    if (data.from === "playground") {
      const output = response.output;
      for (const out of output) {
        if (out.type === "message") {
          let content = out.content;
          for (const cont of content) {
            if (cont.type === "output_text") {
              console.info("OPENAI", {text: cont.text});
              newDate = new Date().toISOString();
              dbMessages.push({
                id: Encryptor.generateUUID(),
                sessionId: data.playgroundSessionId as string,
                content: cont.text,
                role: "SYSTEM",
                senderId: data.agentId,
                senderName: data.agentName,
                senderType: "AGENT",
                updatedAt: newDate,
                createdAt: newDate,
              });
              messages.push({
                type: "message",
                role: "assistant",
                content: [{type: "output_text", text: cont.text}]
              })
            }
          }
        }
      }
      if (dbMessages.length > 0) {
        transactions = [
          supabase.from("PlaygroundMessage").insert(dbMessages),
          supabase.from("PlaygroundSession").update(
            {lastMessageAt: newDate}
          ).eq("id", data.playgroundSessionId as string)
        ]
      }
    } else if (data.from === "conversation") {
      const messageTexts: Array<string> = [];
      const messageIds: Array<string> = [];
      const output = response.output;
      for (let out of output) {
        if (out.type === "message") {
          let content = out.content;
          for (let cont of content) {
            if (cont.type === "output_text") {
              //TODO REVISAR 
              newDate = new Date().toISOString();
              const id = Encryptor.generateUUID();
              messageIds.push(id);
              messageTexts.push(cont.text);
              dbMessages.push({
                id,
                conversationId: data.conversationId as string,
                content: cont.text,
                role: "SYSTEM",
                senderType: "AGENT",
                senderId: data.agentId,
                senderName: data.agentName,
                messageType: "TEXT",
                updatedAt: newDate,
                createdAt: newDate,
              });
              messages.push({
                type: "message",
                role: "assistant",
                content: [{type: "output_text", text: cont.text}]
              })
            }
          }
        }
      }
      if (dbMessages.length > 0) {
        transactions = [
          supabase.from("Message").insert(dbMessages),
          supabase.from("Conversation").update(
            {lastMessageAt: newDate}
          ).eq("id", data.conversationId as string)
        ];
        //TODO CORS AND AUTH
        const url = new URL("/api/ai/send", req.url);
        const requestId = crypto.randomUUID();
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
         },
          body: JSON.stringify({
            conversationId: data.conversationId,
            messages: messageTexts,
            messageIds: messageIds,
            requestId,
          })
        });
      }
    }
    if (Array.isArray(transactions) && transactions.length > 0) {
      await openai.conversations.items.create(
        data.aiConversationId,
        {items: messages}
      );
      const transactionsRes = await Promise.all(transactions);
      let i = 0;
      let failed = false;
      for (let transaction of transactionsRes) {
        if (transaction?.error != null) {
          logger.aiError(`Transaction ${i} faild`, transaction.error);
          failed = true;
        } else {
          console.info(`Transaction ${i} succeded`, transaction.status);
        }
        i += 1;
      }
      if (failed) {
        return NextResponse.json(
          {error: "Some database operations failed", requestId: data.requestId},
          {status: 500}
        );
      }
    }
    return NextResponse.json(
      {requestId: data.requestId, status: "processed"},
      {status: 200}
    );

/*
    return new NextResponse(
      new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            const encoder = new TextEncoder();
            for await (const chunk of stream) {
              let eventData = "";
              if (chunk.type === "response.created") {
                eventData = `{"type":"response.created"}`;
              } else if (chunk.type === "response.in_progress") {
                eventData = `{"type":"response.in_progress"}`;
              } else if (chunk.type === "response.completed") {
                eventData = `{"type":"response.completed"}`;
              } else if (chunk.type === "response.failed") {
                eventData = `{"type":"response.Failed"}`;
              } else if (chunk.type === "response.incomplete") {
                eventData = `{"type":"response.incomplete"}`;
              } else if (chunk.type === "response.output_item.added") {
                eventData = `{"type":"item.added"}`;
              } else if (chunk.type === "response.output_item.done") {
                eventData = `{"type":"item.done"}`;
              } else if (chunk.type === "response.content_part.added") {
                eventData = `{"type":"part.added"}`;
              } else if (chunk.type === "response.content_part.done") {
                eventData = `{"type":"part.done","text":${JSON.stringify(chunk.part.text)}}`;
              } else if (chunk.type === "response.output_text.delta") {
                eventData = `{"type":"text.delta","value":${JSON.stringify(chunk.delta)}}`;
              } else if (chunk.type === "response.output_text.done") {
                eventData = `{"type":"text.done","text":${JSON.stringify(chunk.text)}}`;
              } else if (chunk.type === "response.refusal.delta") {
                eventData = `{"type":"refusal.delta","value":${JSON.stringify(chunk.delta)}}`;
              } else if (chunk.type === "response.refusal.done") {
                eventData = `{"type":"refusal.done","value":""}`;
              } else if (chunk.type === "response.function_call_arguments.delta") {
                eventData = `{"type":"function_call.delta"}`;
              }
              if (eventData !== "") {
                controller.enqueue(encoder.encode(eventData));
              }
            }
            controller.close();

          } catch (error) {
            controller.error(error);
          }
        }
      }),
      {headers: STREAM_HEADERS}
    );
*/

  } catch (error) {
    let _error = error as Error;

    logger.aiError(_error.message);
    return NextResponse.json(
      {error: _error.message, requestId: data?.requestId || "unknown"},
      {status: 500}
    );
  }
}
