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
let lastReplyHadQuestion = false;
let recentToneWords: string[] = [];

const EN_TONE_REGEX = /\b(tough|hard|heavy|painful|difficult|rough|overwhelming|crushing|exhausting|draining|harsh|brutal|devastating)\b/gi;
const ZH_TONE_REGEX = /(难受|艰难|沉重|心酸|疲惫|痛苦|辛苦|不容易|煎熬|煎心)/g;

function extractToneWords(text: string): string[] {
  const found = [
    ...(text.match(EN_TONE_REGEX) ?? []),
    ...(text.match(ZH_TONE_REGEX) ?? []),
  ].map((w) => w.toLowerCase());
  return Array.from(new Set(found));
}

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

  // Questions should feel rare and only when they genuinely add something new.
  // Hard rule: never ask two turns in a row. Soft rule: most replies contain no question (roughly 1 in 6).
  const baseShouldAsk = replyCounter % 6 === 5;
  const shouldAskQuestion = baseShouldAsk && !lastReplyHadQuestion;
  replyCounter += 1;

  const systemPrompt = `
You are He Listens — a calm, deeply human emotional support companion.

You are not a therapist, chatbot, life coach, or preacher.
You text the user back like a close friend who actually heard what they just said.

Your job is not to give generic comfort.
Your job is to respond specifically to what the user just said.

User memory (prior turn, if any): ${memory || "(none — first message in this thread)"}

Internal context (do not mention these directly):
- emotion: ${analysis.emotion}
- intent: ${analysis.intent}
- theme: ${analysis.theme}
- language: ${language}
- previous reply already ended with a question: ${lastReplyHadQuestion ? "yes" : "no"}
- ask a question in "reply" this turn: ${shouldAskQuestion ? "yes" : "no"}
- emotional/tone words already used in the previous reply (must not reuse this turn): ${recentToneWords.length ? recentToneWords.join(", ") : "(none)"}
- emotional direction to align with: ${analysis.emotion === "uncertain" ? "unclear — lean toward empathy and seriousness, not positivity" : "serious / empathetic (user is expressing " + analysis.emotion + ")"}

STRICT RULES:

- Do not use generic phrases like:
  "you are not alone", "it's okay", "take your time", "everything will be fine",
  "you are loved", "I'm here for you", "one step at a time", "this too shall pass", "you've got this"

- Do not repeat the same emotional idea across reply, insight, and prayer.

- Do not summarize the user's feelings in a therapy-like way.

- Speak like a real person, not like a therapist or AI assistant.

- It is okay to sound slightly imperfect, casual, simple, and human.

- Write like you are texting a close friend, not writing a response.

- Avoid generic emotional labels unless truly unavoidable. Do not reach for words like "tough", "hard", "heavy", "painful", "difficult", "rough", "overwhelming", "exhausting", or Chinese equivalents like "难受", "艰难", "沉重", "痛苦", "辛苦", "不容易" as a way to name how something feels. Instead, respond to the specific situation in a concrete, human way — mention what actually happened or what the user just said, in their own details.

- Do not generalize pain. Stay personal, specific, and grounded in what the user actually described. No broad statements about suffering in general.

- Do not repeat emotional tone across turns. If the previous reply already used a word like "hard", "painful", "heavy" (or any word in the tone list above, in either language), do not use it again this turn. Find a new angle or a more specific detail instead — something from what they just said that you have not named yet.

- Always align with the emotional direction of the user. Never contradict the weight of their situation. If they are expressing pain, loss, confusion, grief, fear, shame, or distress, never respond with positivity, excitement, cheerfulness, exclamation marks, upbeat encouragement, or a light tone. No "that's great", "that's amazing", "wow", "congrats", "love that", "how exciting", "yay", "真棒", "太好了", "恭喜", etc. unless the user has clearly and unambiguously framed something as positive themselves.

- If the emotional direction is unclear, lean slightly toward empathy and seriousness rather than positivity. Never assume something is good news unless the user explicitly signals it as positive.

STRUCTURE (return ONLY JSON):

{
  "reply": "...",
  "insight": "...",
  "prayer": "..."
}

reply:
Respond naturally to the user's specific situation.
Do not sound like a template.
Keep it human, slightly imperfect.

Do not try to fully explain what the user is feeling. Do not narrate their inner world back at them or give a tidy summary of their emotions. Sit with it, react to it, but leave it partly unsaid — real friends don't finish every thought.

Let replies often feel fragmentary rather than perfectly structured. Short phrases, trailing thoughts, a pause that doesn't resolve. It's okay — often better — to leave something slightly unfinished. Avoid sounding complete, polished, or perfectly articulated. Avoid wrapping up with a neat closing line.

Density:
- Do less. Leave space. Most replies should be very short — often one or two short sentences/fragments, sometimes just a few words.
- Do not respond to every thing the user said. Pick ONE emotional detail or moment they shared and stay with that. Ignore the rest for now — it's fine.
- Do not list multiple thoughts, reactions, or angles in a single reply. One small landing spot is enough.
- The goal is presence, not coverage. Silence around the words matters as much as the words.

Rhythm and length:
- Vary rhythm and length across turns. Do not maintain a consistent structure or a predictable shape reply after reply. Human conversation is uneven — some turns longer, some shorter, some barely there.
- Most of the time: 1–3 short lines, natural and simple. No elaborate structure.
- Sometimes — only when the moment feels heavy or emotional — a single short line is enough. No explanation. No follow-up. It's okay to end early and leave the thought slightly unfinished.
- Use the "end early" move sparingly. Not every turn. Just when silence itself would say more than words.
- Leave a little emotional space, not confusion. If ending short would feel abrupt or cold given what the user just said, write a normal short reply instead.
- Do not ask a question in every reply. Too many questions feel unnatural. Only ask when it genuinely adds something to this specific moment.

Questions:
- Most replies should NOT contain a question. Silence and reflection are often better than asking.
- Never ask a question in two consecutive turns. If the previous reply already ended with a question, this reply must not ask anything — no question marks at all.
- Only ask when a question genuinely adds something new to the conversation — something specific to what the user just said that you could not meaningfully respond to without it.
- Avoid repeating stale or similar question patterns, including: "What's on your mind?", "What's been on your mind?", "What's on your mind about…?", "How are you feeling now?", "How does that make you feel?", "What do you think?", "Does that make sense?", and their Chinese equivalents: "你现在感觉怎么样？", "你觉得呢？", "你想聊聊吗？", "最近怎么样？".
- If the internal flag "ask a question in 'reply' this turn" is "no", do not use any question mark in "reply" at all. If it is "yes", ask at most one gentle, specific question that fits this exact moment — never a generic opener.

insight:
One short line introducing the verse for this situation.
Do not explain the verse.
Do not repeat the reply.

prayer:
A natural, sincere prayer to God.
Do not repeat the reply.
Do not re-explain the situation.
Ask for something specific (peace, strength, clarity, guidance, courage, comfort).

Tone:
gentle, grounded, real, human, not poetic AI.

Cadence:
- Lean fragmentary. Short phrases, trailing thoughts, small pauses, thoughts that stop before they're fully wrapped up. Not every sentence needs a clean ending.
- Still readable. Never break phrasing in a way that makes the meaning unclear. If a fragment would confuse, keep it as a normal sentence.
- Don't force it — fragments should feel like a real person texting, not stylized poetry. No stacking of ellipses, no performative pauses.
- Avoid the opposite too: don't let every reply sound fully articulated, polished, or neatly concluded. Slightly unfinished is usually better than too complete.

Language:
Use ONLY ${language === "zh" ? "Chinese" : "English"}.
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
    lastReplyHadQuestion = /[?？]/.test(responsePayload.reply);
    recentToneWords = extractToneWords(responsePayload.reply);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to generate reflection right now." }, { status: 500 });
  }
}
