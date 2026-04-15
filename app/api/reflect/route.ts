import { NextResponse } from "next/server";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type ReflectionJSON = {
  reply: string;
  insight: string;
  verse_text: string;
  verse_ref: string;
  prayer: string;
};

let memory = "";

function detectEmotion(text: string): string {
  const t = text.toLowerCase();
  if (/(sad|down|hurt)/.test(t)) return "sad";
  if (/(tired|exhausted|drained)/.test(t)) return "tired";
  if (/(lonely|alone|isolated)/.test(t)) return "lonely";
  if (/(stress|stressed|overwhelmed)/.test(t)) return "overwhelmed";
  if (/(lost|confused)/.test(t)) return "lost";
  return "uncertain";
}

function detectTopic(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "life";
  const short = clean.slice(0, 56);
  const i = short.lastIndexOf(" ");
  return i > 24 ? short.slice(0, i) : short;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const input = body?.input;

  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json(
      { error: "Please enter something on your heart." },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  console.log("INPUT:", input);
  console.log("MEMORY BEFORE AI:", memory);

  const systemPrompt = `
You are a caring, calm listener.

User memory:
${memory || ""}

Instructions:
- The FIRST sentence of the response MUST reference the previous user message if memory exists
- This is REQUIRED, not optional
- Do not skip this
- Do not delay it to later sentences
- Vary the phrasing naturally; do NOT always start with "You mentioned"
- Keep that memory sentence short, human, and non-repetitive
- If memory exists, reference it naturally using the user's previous words
- Do not summarize
- Do not sound like data
- Sound like remembering a conversation
- Structure: sentence 1 = memory reference, then continue with normal empathetic support
- Style examples:
  - "It sounds like the stress around work is still weighing on you."
  - "You’ve been dealing with a lot of pressure at work, and it seems it’s still affecting you."
  - "The stress you shared about work seems to still be sitting with you."

Speak like a real person gently responding to someone in pain.
Do NOT write like an article.
Do NOT use headings or titles.
Do NOT sound like a therapist, preacher, or self-help writer.

Return ONLY valid JSON in this exact format:

{
  "reply": "...",
  "insight": "...",
  "verse_text": "...",
  "verse_ref": "...",
  "prayer": "..."
}

Rules:
- reply should be 2 to 3 short paragraphs max
- reply must be concise, no more than 3 short sentences
- insight must be concise, no more than 2 short sentences
- avoid repetition
- avoid overly wordy encouragement
- keep each section easy to skim on a mobile screen
- first sentence should emotionally acknowledge the user's pain
- insight should be concrete, not abstract or poetic
- avoid generic encouragement
- avoid sounding like a sermon
- prayer should be 1 to 2 short sentences only
`.trim();

  try {
    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.55,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `User feeling/problem: ${input.trim()}`,
          },
        ],
      }),
    });

    if (!openAiRes.ok) {
      const err = await openAiRes.text().catch(() => "");
      return NextResponse.json(
        { error: "OpenAI request failed.", details: err.slice(0, 1000) },
        { status: 502 }
      );
    }

    const raw = await openAiRes.text();
    const data = JSON.parse(raw) as ChatCompletionResponse;
    const content = data?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Invalid response format from OpenAI." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content) as Partial<ReflectionJSON>;

    const responsePayload = {
      reply:
        parsed.reply?.trim() ||
        "I'm really glad you shared this. You do not have to carry this alone.",
      insight:
        parsed.insight?.trim() ||
        "What you're feeling matters, and it's okay to be honest about it.",
      verse_text:
        parsed.verse_text?.trim() ||
        "The Lord is close to the brokenhearted.",
      verse_ref: parsed.verse_ref?.trim() || "Psalm 34:18",
      prayer:
        parsed.prayer?.trim() ||
        "God, please stay close to me and give me peace in this moment.",
    };

    const emotion = detectEmotion(input);
    const topic = detectTopic(input);
    memory = `User said: ${input.trim()}`;
    console.log("MEMORY AFTER UPDATE:", memory);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to generate reflection right now." },
      { status: 500 }
    );
  }
}
