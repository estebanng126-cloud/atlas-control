const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";

export class AiCompletionError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "AiCompletionError";
    this.statusCode = statusCode;
  }
}

type OpenAIChatResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

function normalizeBaseUrl(base: string): string {
  return base.replace(/\/+$/, "");
}

function chatCompletionsUrl(baseUrl: string): string {
  return `${normalizeBaseUrl(baseUrl)}/chat/completions`;
}

async function postChatCompletion(
  url: string,
  headers: Record<string, string>,
  model: string,
  userText: string,
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: userText }],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new AiCompletionError(
      "The assistant could not generate a reply. Please try again.",
      502,
    );
  }

  const data = (await response.json()) as OpenAIChatResponse;
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new AiCompletionError(
      "The assistant returned an empty reply. Please try again.",
      502,
    );
  }

  return text;
}

/**
 * Single-turn text completion (no streaming, no tools).
 *
 * When `LOCAL_AI_BASE_URL` is set (e.g. LM Studio at `http://127.0.0.1:1234/v1`),
 * requests go there with `LOCAL_AI_MODEL`. Optional `LOCAL_AI_API_KEY` sends
 * `Authorization: Bearer …` if the local server requires a token.
 *
 * Otherwise uses OpenAI (`OPENAI_API_KEY`, optional `OPENAI_MODEL`).
 */
export async function completeSimpleUserMessage(userText: string): Promise<string> {
  const localBase = process.env.LOCAL_AI_BASE_URL?.trim();
  const localModel = process.env.LOCAL_AI_MODEL?.trim();
  const localToken = process.env.LOCAL_AI_API_KEY?.trim();

  if (localBase) {
    if (!localModel) {
      throw new AiCompletionError(
        "The assistant is not configured on the server (LOCAL_AI_MODEL is missing).",
        503,
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (localToken) {
      headers.Authorization = `Bearer ${localToken}`;
    }

    return postChatCompletion(chatCompletionsUrl(localBase), headers, localModel, userText);
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiCompletionError(
      "The assistant is not configured on the server. Please try again later.",
      503,
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  return postChatCompletion(OPENAI_CHAT_URL, {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  }, model, userText);
}
