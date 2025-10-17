import type { AgentPromptInfo } from "@/domain/Agentes";
import type { OpenAI as TOpenAI } from "openai";
import type { AI } from "@/domain/Ai";


import OpenAI from "openai";
import { BASE_URL, INTERNAL_API_KEY } from "@/lib/api";

const FETCH_HEADERS = {
  "Origin": BASE_URL,
  "Authorization": "Bearer " + INTERNAL_API_KEY,
  "Content-Type": "application/json",
};

const MESSAGE_PATH = "/api/ai/message";

export const Ai = {
  async fetch(body: AI.Request) {
    return await fetch(
      BASE_URL+MESSAGE_PATH,
      {
        method: "POST",
        headers: FETCH_HEADERS,
        body: JSON.stringify(body)
      }
    );
  },

  async createConversationId(apiKey: string, aiPrompt: string, aiMetadata?: Record<string, string>) {
    const openai = new OpenAI({apiKey});
    const openAIConversation: TOpenAI.Conversations.ConversationCreateParams = {
      items: [{role: "system", content: aiPrompt, type: "message"}]
    };
    if (aiMetadata !== undefined) {
      openAIConversation.metadata = aiMetadata;
    }
    try {
      let AIConversation = await openai.conversations.create(openAIConversation);
      if (AIConversation?.id !== undefined) {
        return AIConversation.id;
      } else {
        throw new Error("OPENAI ERROR: Can not create a conversation");
      }
    } catch (error) {
      throw error;
    }
  },

  createPromptFromAgent<T extends AgentPromptInfo>(data: T): string {
    let prompt = `Sos un agente y tu nombre es ${data.name}.\n`;
    if(data.description) {
      prompt += `${data.description}\n\n`;
    }
    const fields = data.customFields
    if (fields !== undefined) {
      const keys = Reflect.ownKeys(fields);
      for (let key of keys) {
        if (typeof key !== "string") {
          key = String(key);
        }
        prompt += `# ${key}\n${fields[key]}\n\n`;
      }
    }
    return prompt;
  }
};

export default Ai;
