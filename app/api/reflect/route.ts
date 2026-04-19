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
  prayer: string;
};

type Theme = "comfort" | "peace" | "guidance" | "strength";
type SupportedLanguage = "en" | "zh";

type VerseEntry = {
  text: string;
  ref: string;
};

type Analysis = {
  emotion: string;
  intent: string;
  theme: Theme;
};

const VERSES_BY_THEME: Record<SupportedLanguage, Record<Theme, VerseEntry[]>> = {
  en: {
    comfort: [
      {
        text: "The Lord is near to the brokenhearted and saves the crushed in spirit.",
        ref: "Psalm 34:18",
      },
      {
        text: "Blessed are those who mourn, for they shall be comforted.",
        ref: "Matthew 5:4",
      },
      {
        text: "As a mother comforts her child, so will I comfort you.",
        ref: "Isaiah 66:13",
      },
    ],
    peace: [
      {
        text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.",
        ref: "John 14:27",
      },
      {
        text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
        ref: "Philippians 4:6",
      },
      {
        text: "Cast all your anxiety on him because he cares for you.",
        ref: "1 Peter 5:7",
      },
    ],
    guidance: [
      {
        text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.",
        ref: "Proverbs 3:5-6",
      },
      {
        text: "Your word is a lamp to my feet and a light to my path.",
        ref: "Psalm 119:105",
      },
      {
        text: "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.",
        ref: "Psalm 32:8",
      },
    ],
    strength: [
      {
        text: "God is our refuge and strength, an ever-present help in trouble.",
        ref: "Psalm 46:1",
      },
      {
        text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.",
        ref: "Joshua 1:9",
      },
      {
        text: "I can do all this through him who gives me strength.",
        ref: "Philippians 4:13",
      },
    ],
  },
  zh: {
    comfort: [
      {
        text: "耶和华靠近伤心的人，拯救灵性痛悔的人。",
        ref: "诗篇 34:18",
      },
      {
        text: "哀恸的人有福了，因为他们必得安慰。",
        ref: "马太福音 5:4",
      },
      {
        text: "母亲怎样安慰儿子，我就照样安慰你们。",
        ref: "以赛亚书 66:13",
      },
    ],
    peace: [
      {
        text: "我留下平安给你们；我将我的平安赐给你们。我所赐的，不像世人所赐的。你们心里不要忧愁，也不要胆怯。",
        ref: "约翰福音 14:27",
      },
      {
        text: "应当一无挂虑，只要凡事借着祷告、祈求，和感谢，将你们所要的告诉神。",
        ref: "腓立比书 4:6",
      },
      {
        text: "你们要将一切的忧虑卸给神，因为他顾念你们。",
        ref: "彼得前书 5:7",
      },
    ],
    guidance: [
      {
        text: "你要专心仰赖耶和华，不可倚靠自己的聪明；在你一切所行的事上都要认定他，他必指引你的路。",
        ref: "箴言 3:5-6",
      },
      {
        text: "你的话是我脚前的灯，是我路上的光。",
        ref: "诗篇 119:105",
      },
      {
        text: "我要教导你，指示你当行的路；我要定睛在你身上劝戒你。",
        ref: "诗篇 32:8",
      },
    ],
    strength: [
      {
        text: "神是我们的避难所，是我们的力量，是我们在患难中随时的帮助。",
        ref: "诗篇 46:1",
      },
      {
        text: "你当刚强壮胆，不要惧怕，也不要惊惶，因为你无论往哪里去，耶和华你的神必与你同在。",
        ref: "约书亚记 1:9",
      },
      {
        text: "我靠着那加给我力量的，凡事都能做。",
        ref: "腓立比书 4:13",
      },
    ],
  },
};

let memory = "";
const recentVerseByTheme: Partial<Record<`${SupportedLanguage}-${Theme}`, number>> = {};
let replyCounter = 0;

function detectEmotion(text: string): string {
  const t = text.toLowerCase();
  if (/(anxious|anxiety|worry|worried|panic|restless)/.test(t)) return "anxious";
  if (/(afraid|fear|fearful|scared|terrified)/.test(t)) return "afraid";
  if (/(sad|down|hurt|heartbroken|grief|grieving)/.test(t)) return "sad";
  if (/(tired|exhausted|drained)/.test(t)) return "tired";
  if (/(lonely|alone|isolated)/.test(t)) return "lonely";
  if (/(stress|stressed|overwhelmed)/.test(t)) return "overwhelmed";
  if (/(lost|confused)/.test(t)) return "lost";
  return "uncertain";
}

function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (/(what should i do|direction|next step|decide|decision)/.test(t)) return "seeking direction";
  if (/(please pray|pray for me|prayer)/.test(t)) return "asking for prayer";
  if (/(why|understand|make sense|meaning)/.test(t)) return "seeking understanding";
  if (/(help me calm|calm down|settle|peace|rest)/.test(t)) return "seeking calm";
  return "seeking support";
}

function mapTheme(emotion: string): Theme {
  if (emotion === "lonely") return "comfort";
  if (emotion === "anxious" || emotion === "overwhelmed") return "peace";
  if (emotion === "lost") return "guidance";
  if (emotion === "afraid") return "strength";
  if (emotion === "sad" || emotion === "tired") return "comfort";
  return "peace";
}

function detectLanguage(text: string): SupportedLanguage {
  return /[㐀-鿿]/.test(text) ? "zh" : "en";
}

function analyzeMessage(text: string): Analysis {
  const emotion = detectEmotion(text);
  const intent = detectIntent(text);
  const theme = mapTheme(emotion);
  return { emotion, intent, theme };
}

function getVerseForTheme(theme: Theme, language: SupportedLanguage): VerseEntry {
  const verses = VERSES_BY_THEME[language][theme];
  const key = `${language}-${theme}` as const;
  const previousIndex = recentVerseByTheme[key] ?? -1;
  const nextIndex = (previousIndex + 1) % verses.length;
  recentVerseByTheme[key] = nextIndex;
  return verses[nextIndex];
}

function normalizePrayer(prayer: string): string {
  const lines = prayer
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (lines.length >= 2) return lines.join("\n");

  const sentenceLines = prayer
    .split(/[.!?。！？]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  return sentenceLines.join("\n");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const input = body?.input;

  if (typeof input !== "string" || !input.trim()) {
    return NextResponse.json({ error: "Please enter something on your heart." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY." }, { status: 500 });
  }

  const cleanedInput = input.trim();
  const language = detectLanguage(cleanedInput);
  const analysis = analyzeMessage(cleanedInput);
  const selectedVerse = getVerseForTheme(analysis.theme, language);
  const shouldAskQuestion = replyCounter % 5 === 4;
  replyCounter += 1;

  const systemPrompt = `
You are a caring, calm listener.

User memory:
${memory || ""}

Latest user message analysis:
- emotion: ${analysis.emotion}
- intent: ${analysis.intent}
- bible theme to use: ${analysis.theme}
- user language: ${language}
- include a question this turn: ${shouldAskQuestion ? "yes" : "no"}

Instructions:
- The FIRST sentence of the response MUST reference the previous user message if memory exists
- This is REQUIRED, not optional
- Keep that memory sentence short, human, and non-repetitive
- If memory exists, reference it naturally using the user's previous words
- Avoid analysis phrases like "It sounds like..." or "What I hear is..."

Speak like a real person gently responding to someone in pain.
Do NOT write like an article.
Do NOT use headings or titles.
Do NOT sound like a therapist, preacher, or self-help writer.
Keep the tone calm, warm, and slightly imperfect (human).
Use ONLY ${language === "zh" ? "Chinese" : "English"} for reply, insight, and prayer.

Return ONLY valid JSON in this exact format:

{
  "reply": "...",
  "insight": "...",
  "prayer": "..."
}

Rules:
- each sentence should be short: about 8 to 12 words
- one idea per sentence
- reply must be 1 to 2 short sentences maximum
- questions should be occasional only (about 20% of replies)
- if "include a question this turn" is "yes", end with one gentle question
- if "include a question this turn" is "no", do not ask a question
- response mix target:
  - 70% empathy/presence
  - 20% gentle reflection
  - 10% question
- avoid repetition
- avoid sounding preachy or interrogating
- prayer should be 2 to 4 short lines
- prayer should be personal and gentle
- do not include bible references inside prayer
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
            content: `User feeling/problem: ${cleanedInput}`,
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
      return NextResponse.json({ error: "Invalid response format from OpenAI." }, { status: 502 });
    }

    const parsed = JSON.parse(content) as Partial<ReflectionJSON>;

    const fallbackReply = shouldAskQuestion
      ? language === "zh"
        ? "听起来真的很不容易。现在最难受的是哪一部分？"
        : "That sounds really hard. What feels heaviest right now?"
      : language === "zh"
        ? "听起来真的很不容易。我在这里陪着你。"
        : "That sounds really hard. I’m here with you.";

    const responsePayload = {
      reply: parsed.reply?.trim() || fallbackReply,
      insight:
        parsed.insight?.trim() ||
        (language === "zh" ? "谢谢你愿意说出来。" : "Thank you for sharing this so honestly."),
      verse_text: selectedVerse.text,
      verse_ref: selectedVerse.ref,
      prayer: normalizePrayer(
        parsed.prayer?.trim() ||
          (language === "zh"
            ? "神啊，求你此刻贴近我。\n请赐我平安和力量。\n带我走好眼前这一步。"
            : "God, please stay close to me.\nGive me peace and strength for this moment.\nHelp me take one small step forward.")
      ),
    };

    memory = `User said: ${cleanedInput}`;

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to generate reflection right now." }, { status: 500 });
  }
}
