import type { NextRequest } from "next/server";

import { z } from "zod";
import { NextResponse } from "next/server";

import { evolutionAPIService } from "@/services/evolution-api-service";
import { getSupabaseClient } from "@/lib/supabase";
import { logger } from "@/lib/utils/server-logger";



const supabase = getSupabaseClient();

const RequestSchema = z.object({
  conversationId: z.string().uuid(),
  messages: z.array(z.string()),
  messageIds: z.array(z.string()),
  requestId: z.string().uuid().optional()
});

type RequestSchema = z.infer<typeof RequestSchema>

type ConversationSelect = {
  id: string,
  clientId: string,
  contact: {
    phone: string,
  },
  evolutionInstance: {
    id: string,
    status: string,
    instanceName: string
  }
};

export async function POST(req: NextRequest) {
  let data: RequestSchema | undefined = undefined;
  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      console.error("INVALID_REQUEST_BODY_ERROR", parsed.error);
      return NextResponse.json(
        {
          error: "INVALID_REQUEST_BODY_ERROR",
          details: parsed.error
        },
        { status: 400 }
      );
    }
    data = parsed.data;
    const {
      data: conversation,
      error: conversationError
    } = await supabase.from("Conversation").select(
      "id,"
      + "clientId,"
      + "contact:Contact(phone),"
      + "evolutionInstance:EvolutionApiInstance(id, instanceName, status)"
    ).eq(
      "id", data.conversationId
    ).single() as { data: ConversationSelect | null, error: any };

    if (conversationError || !conversation) {
      console.error("NOT_FOUND_ERROR", `Conversation ${data.conversationId} not found`);
      return NextResponse.json(
        {
          error: "NOT_FOUND_ERROR",
          details: `Conversation ${data.conversationId} not found`
        },
        { status: 500 }
      );
    }

    const contact = conversation.contact;
    const instance = conversation.evolutionInstance;

    if (!instance) {
      console.error("NOT_FOUND_ERROR", `EvolutionInstance not found`);
      return NextResponse.json(
        { error: "NOT_FOUND_ERROR", details: "EvolutionInstance not found" },
        { status: 500 }
      );
    }

    if (!contact) {
      console.error("NOT_FOUND_ERROR", `Contact not found`);
      return NextResponse.json(
        { error: "NOT_FOUND_ERROR", details: "Contact not found" },
        { status: 500 }
      );
    }

    if (instance.status !== "CONNECTED") {
      console.error("BAD_REQUEST", `EvolutionInstance ${instance.id} not connected`);
      return NextResponse.json(
        {
          error: "BAD_REQUEST",
          details: `EvolutionInstance ${instance.id} not connected`
        },
        { status: 500 }
      );
    }

    const result = await evolutionAPIService.sendTextMessages({
      instanceName: instance.instanceName,
      number: contact.phone,
      messages: data.messages,
      messageIds: data.messageIds,
      clientId: conversation.clientId
    });

    if (!result.success || result.data === undefined) {
      let details = "Can not send messages to whatsapp instance";
      if (typeof result.error === "string") {
        details = result.error;
      }
      return NextResponse.json(
        {
          error: "EVOLUTION_SEND_MESSAGES_ERROR",
          details
        },
        { status: 500 }
      );
    }

    logger.info("EVOLUTION_SEND_MESSAGES_SUCCESS", {
      result
    });
    const transactions = [];
    for (const dbMessage of result.data)  {
      transactions.push(
        supabase.from("Message").update(
          {whatsappId: dbMessage.whatsappId}
        ).eq("id", dbMessage.id)
      );
    }
    if (transactions.length > 0) {
      const transactionsRes = await Promise.all(transactions);
      let failed = false;
      let i = 0;
      for (let transaction of transactionsRes)  {
        if (transaction?.error != null) {
          console.error(`Transaction ${i} faild`, transaction.error);
          failed = true;
        }
        i += 1;
      }
      if (failed) {
        return NextResponse.json(
          {
            error: "NOT_UPDATE_ERROR",
            details: "Messages can not update"
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: result.success },
      { status: 200 }
    );

  } catch (err) {
    const _error = err as Error;
    let requestId = "unknown";
    if (data !== undefined && data.requestId !== undefined) {
      requestId = data.requestId;
    }
    return NextResponse.json(
      { error: _error.message, requestId },
      { status: 500 }
    );
  }
};
