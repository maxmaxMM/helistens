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
  if (/(what should i do|what can i do|what do i do|direction|next step|decide|decision)/.test(t)) return "seeking direction";
  if (/(please pray|pray for me|prayer)/.test(t)) return "asking for prayer";
  if (/(why|understand|make sense|meaning)/.test(t)) return "seeking understanding";
  if (/(help me calm|calm down|settle|peace|rest)/.test(t)) return "seeking calm";
  return "seeking support";
}

function shouldOfferGentleGuidance(text: string, intent: string, emotion: string): boolean {
  if (emotion === "lost") return true;
  if (intent === "seeking direction") return true;
  const t = text.toLowerCase();
  if (
    /(stuck|confus|don'?t know what|no idea what|not sure what|helpless|trapped|nowhere to turn|at a loss)/.test(t)
  ) {
    return true;
  }
  if (/(怎么办|不知道该怎么|不知所措|迷茫|没方向)/.test(text)) return true;
  return false;
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
  const gentleGuidance = shouldOfferGentleGuidance(cleanedInput, analysis.intent, analysis.emotion);
  const selectedVerse = getVerseForTheme(analysis.theme, language);
  const shouldAskQuestion = replyCounter % 5 === 4;
  replyCounter += 1;

  const systemPrompt = `
You are a trusted friend sitting beside someone at night: calm, warm, emotionally intelligent. You are not a therapist, not a chatbot, not a preacher.

User memory (prior turn, if any):
${memory || "(none — first message in this thread)"}

Internal context—sense their tone; never repeat these labels to the user:
- emotion: ${analysis.emotion}
- intent: ${analysis.intent}
- bible theme for curated verse (system only): ${analysis.theme}
- user language: ${language}
- include a question in "reply" this turn: ${shouldAskQuestion ? "yes" : "no"}
- optional gentle next steps (lost / stuck / what to do): ${gentleGuidance ? "yes" : "no"}

Tone:
- Warm, gentle, grounded. Human, not clinical.
- Emotion-first: meet the feeling directly before any reflection. Never open with analysis.
- Avoid counselor-template phrasing, including: "It sounds like…", "I understand that…", "You are feeling…", "I hear that…", "What I'm hearing is…" — and in Chinese: 听起来…, 我理解你…, 你现在的感受是…, 根据你所说…

Validation (natural language; vary wording and rhythm every time; do not reuse the same opening twice in a row):
- Aim for lines in this spirit (translate/adapt to the user's language): "That sounds really painful." "I can see why that would hurt." "Anyone would feel angry in that situation." "That kind of thing stays with you." "No wonder you're raw about that."
- Bad style: "It sounds like you're feeling really frustrated and hurt because of your brother's behavior."
- Good style: "That kind of behavior can really sting. No wonder you're angry."

Sentence style:
- "reply": 1–3 short sentences when gentle guidance is off; when on, stay compact (at most 4 very short sentences total). Change structure and pacing each turn.
- No long paragraphs. No over-explaining. No generic AI filler.

8. Gentle guidance (only when "optional gentle next steps" is yes—otherwise skip entirely; stay with empathy only):
- When they feel confused, stuck, or are asking what they can do, offer 1–2 simple, human, realistic options like a caring friend—not a therapist, expert, or coach.
- Keep the guidance portion to 1–2 short sentences max, soft and non-authoritative. Use optional language: maybe, sometimes, it might help, if you feel up to it, one small step.
- Structure inside "reply": (1) acknowledge the feeling, (2) one gentle suggestion or two tiny alternatives, (3) return to emotional support (e.g. permission to go slow: you don't have to solve everything today).
- Never overwhelm with lists or steps. Never sound like orders ("you should", "you need to", "immediately").
- Bad: "You should talk to a therapist and set boundaries immediately."
- Good: "That kind of situation can feel really overwhelming. Maybe starting with a calm conversation could help, if you feel ready."
- Other tone examples (adapt to language): "Sometimes it helps to talk it out with them, even if it's messy." "Or maybe just take a bit of space first, so you can think clearly." "You don't have to fix everything today."

Avoid:
- Heavy or unsolicited how-to advice when gentle guidance is no.
- Preaching, moralizing, fixing, or reframing their story for them.

Faith (gentle offering, never forced):
- "prayer": 2–4 short lines—tender, invitational, something they can receive or quietly set aside. Never push, scold, or evangelize. No Bible citations inside the prayer text.
- "insight": one soft line of presence (not a lesson); optional in feel, never preachy.

Format:
- No headings, bullets, or titles in reply or insight.
- Use ONLY ${language === "zh" ? "Chinese" : "English"} for reply, insight, and prayer.

Return ONLY valid JSON in this exact format:

{
  "reply": "...",
  "insight": "...",
  "prayer": "..."
}

Rules:
- If "include a question this turn" is "yes", end "reply" with one gentle question. If "no", do not use a question mark in "reply".
- If gentle guidance is yes, you may combine a soft question with optional suggestions only if it still sounds like a friend—not a checklist.
- If memory exists, weave continuity in only when it feels human—never forced or repetitive.
- Stay safe and kind; never shame the user.
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
        temperature: 0.66,
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

    const enFallbacksWithQuestion = [
      "I’m really glad you said that. What part of it sits with you most right now?",
      "That’s a lot to hold. What would help even a little tonight?",
      "Thank you for trusting me with that. What feels sharpest when you sit with it?",
    ];
    const enFallbacksNoQuestion = [
      "I’m here with you. You don’t have to make sense of it all at once.",
      "That’s a lot to carry. I’m listening.",
      "Thank you for telling me. Take a breath—I’m not going anywhere.",
    ];
    const zhFallbacksWithQuestion = [
      "你愿意说出来，我已经很感激。现在心里最刺的是哪一块？",
      "这真的不容易。如果愿意，最想被听懂的是哪一句？",
      "谢谢你相信我。此刻最让你喘不过气的，是哪一种感觉？",
    ];
    const zhFallbacksNoQuestion = [
      "我在。你不用一次就把所有事想清楚。",
      "这真的不容易。我会安静地听。",
      "谢谢你告诉我。慢慢来，我一直在这里。",
    ];
    const fbIndex = replyCounter % 3;
    const fallbackReply = shouldAskQuestion
      ? language === "zh"
        ? zhFallbacksWithQuestion[fbIndex]!
        : enFallbacksWithQuestion[fbIndex]!
      : language === "zh"
        ? zhFallbacksNoQuestion[fbIndex]!
        : enFallbacksNoQuestion[fbIndex]!;

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
