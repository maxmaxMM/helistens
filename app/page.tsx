"use client";

import { TouchEvent, useMemo, useState } from "react";
import Link from "next/link";

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
};

type ReflectResponse = {
  reply: string;
  verse_text: string;
  verse_ref: string;
  prayer: string;
};

const DEFAULT_VERSE = {
  verse_text: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.",
  verse_ref: "Psalm 34:18",
};

const DEFAULT_PRAYER =
  "God, please hold me close in this moment, calm my heart, and guide me with Your peace. Amen.";

type ShareLanguage = "zh" | "en";

function containsChinese(text: string): boolean {
  return /[\u3400-\u9fff]/.test(text);
}

function detectShareLanguage(line: string): ShareLanguage {
  return containsChinese(line) ? "zh" : "en";
}

function makeSafeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "ai",
      text: "I'm here with you. Share what's on your heart, and we'll walk through it together.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const loading = isSending;
  const [lastReflection, setLastReflection] = useState<ReflectResponse | null>(null);
  const [latestDevotional, setLatestDevotional] = useState<string | null>(null);
  const [latestReply, setLatestReply] = useState<string | null>(null);
  const [latestVerse, setLatestVerse] = useState<string | null>(null);
  const [latestPrayer, setLatestPrayer] = useState<string | null>(null);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [sheetTouchStartY, setSheetTouchStartY] = useState<number | null>(null);

  const lastUserMessage = useMemo(
    () =>
      [...messages]
        .reverse()
        .find((message) => message.role === "user")?.text ?? "I feel overwhelmed and need comfort.",
    [messages]
  );

  async function getReflection(seedInput: string): Promise<ReflectResponse | null> {
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: seedInput }),
      });

      if (!res.ok) return null;
      const data = (await res.json()) as Partial<ReflectResponse>;
      if (!data.reply && !data.verse_text && !data.prayer) return null;

      return {
        reply: data.reply?.trim() || "Thank you for sharing. I'm listening.",
        verse_text: data.verse_text?.trim() || DEFAULT_VERSE.verse_text,
        verse_ref: data.verse_ref?.trim() || DEFAULT_VERSE.verse_ref,
        prayer: data.prayer?.trim() || DEFAULT_PRAYER,
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async function handleVerse() {
    if (loading) return;
    setIsSending(true);

    const reflection = lastReflection ?? (await getReflection(lastUserMessage));
    const verseText = reflection?.verse_text || DEFAULT_VERSE.verse_text;
    const verseRef = reflection?.verse_ref || DEFAULT_VERSE.verse_ref;

    if (reflection) setLastReflection(reflection);
    const verseMessage = `📖 "${verseText}"\n— ${verseRef}`;
    setLatestVerse(verseMessage);
    setMessages((prev) => [
      ...prev,
      {
        id: makeSafeId(),
        role: "ai",
        text: verseMessage,
      },
    ]);
    setLatestDevotional(verseMessage);
    setIsSending(false);
  }

  async function handlePrayer() {
    if (loading) return;
    setIsSending(true);

    const reflection = lastReflection ?? (await getReflection(lastUserMessage));
    const prayerText = reflection?.prayer || DEFAULT_PRAYER;

    if (reflection) setLastReflection(reflection);
    const prayerMessage = `🙏 ${prayerText}`;
    setLatestPrayer(prayerMessage);
    setMessages((prev) => [
      ...prev,
      {
        id: makeSafeId(),
        role: "ai",
        text: prayerMessage,
      },
    ]);
    setLatestDevotional(prayerMessage);
    setIsSending(false);
  }

  async function handleSave() {
    const { line, comfort, verse, ref } = getSharePayload();
    const payload = {
      line,
      comfort,
      verse,
      ref,
      message: latestReply ?? "",
      prayer: latestPrayer ?? "",
      timestamp: Date.now(),
    };
    console.log("handleSave clicked", payload);
    if (!payload.line && !payload.verse && !payload.prayer) return;
    const existing = JSON.parse(localStorage.getItem("savedMessages") || "[]") as Array<{
      line: string;
      comfort: string;
      ref: string;
      message: string;
      verse: string;
      prayer: string;
      timestamp: number;
    }>;
    const isDuplicate = existing.some(
      (entry) => entry.line === payload.line && entry.verse === payload.verse && entry.ref === payload.ref
    );
    if (!isDuplicate) {
      localStorage.setItem("savedMessages", JSON.stringify([payload, ...existing]));
    }
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2500);
  }

  function openShareSheet() {
    console.log("share clicked");
    if (!lastUserMessage && !latestReply && !latestVerse && !latestPrayer && !latestDevotional) return;
    setCopied(false);
    setIsShareSheetOpen(true);
  }

  function closeShareSheet() {
    setIsShareSheetOpen(false);
    setCopied(false);
    setSheetTouchStartY(null);
  }

  function getSharePayload() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const line = lastUserMessage || "I felt really low today.";
    const language = detectShareLanguage(line);

    const localizedComfortFallback =
      language === "zh" ? "辛苦的感觉让你感到不明白。希望你能找到内心的平静。" : "It's okay to feel this way. You are not alone.";
    const localizedVerseFallback =
      language === "zh"
        ? "你们要将一切的忧虑卸给神，因为他顾念你们。"
        : "Cast all your anxiety on him because he cares for you.";
    const localizedRefFallback = language === "zh" ? "彼得前书 5:7" : "1 Peter 5:7";

    const comfortCandidate = latestReply || "";
    const verseCandidate = lastReflection?.verse_text || "";
    const refCandidate = lastReflection?.verse_ref || "";

    const comfort =
      comfortCandidate && containsChinese(comfortCandidate) === (language === "zh")
        ? comfortCandidate
        : localizedComfortFallback;
    const verse =
      verseCandidate && containsChinese(verseCandidate) === (language === "zh")
        ? verseCandidate
        : localizedVerseFallback;
    const ref =
      refCandidate && containsChinese(refCandidate) === (language === "zh")
        ? refCandidate
        : localizedRefFallback;

    const shareUrl = `${baseUrl}/share?line=${encodeURIComponent(line)}&comfort=${encodeURIComponent(
      comfort
    )}&verse=${encodeURIComponent(verse)}&ref=${encodeURIComponent(ref)}`;

    console.log("shareUrl:", shareUrl);
    console.log({ line, comfort, verse, ref });

    return { line, comfort, verse, ref, shareUrl };
  }

  function shareTo(platform: "whatsapp" | "telegram" | "x" | "facebook" | "reddit" | "sms") {
    const { line, comfort, verse, ref } = getSharePayload();
    const shareUrl = `${window.location.origin}/share?line=${encodeURIComponent(line)}&comfort=${encodeURIComponent(
      comfort
    )}&verse=${encodeURIComponent(verse)}&ref=${encodeURIComponent(ref)}`;

    console.log(`${platform} clicked`, shareUrl);

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
    } else if (platform === "telegram") {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else if (platform === "x") {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else if (platform === "facebook") {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else if (platform === "reddit") {
      window.open(
        `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}`,
        "_blank",
        "noopener,noreferrer"
      );
    } else if (platform === "sms") {
      window.location.href = `sms:?body=${encodeURIComponent(shareUrl)}`;
    }
    closeShareSheet();
  }

  async function handleCopyLink() {
    const { line, comfort, verse, ref } = getSharePayload();
    const shareUrl = `${window.location.origin}/share?line=${encodeURIComponent(line)}&comfort=${encodeURIComponent(
      comfort
    )}&verse=${encodeURIComponent(verse)}&ref=${encodeURIComponent(ref)}`;
    console.log("Copy Link URL:", shareUrl);
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function handleSheetTouchStart(e: TouchEvent<HTMLDivElement>) {
    setSheetTouchStartY(e.changedTouches[0]?.clientY ?? null);
  }

  function handleSheetTouchEnd(e: TouchEvent<HTMLDivElement>) {
    if (sheetTouchStartY == null) return;
    const endY = e.changedTouches[0]?.clientY ?? sheetTouchStartY;
    if (endY - sheetTouchStartY > 60) {
      closeShareSheet();
    }
    setSheetTouchStartY(null);
  }

  return (
    <>
      <style>{`
        .chat-action {
          appearance: none;
          margin: 0;
          border-radius: 999px;
          padding: 10px 6px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(255, 255, 255, 0.86);
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 2px 12px rgba(0, 0, 0, 0.22);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          cursor: pointer;
          transition:
            transform 0.18s ease,
            background 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease,
            color 0.22s ease,
            opacity 0.18s ease;
        }
        .chat-action:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.11);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.14),
            0 4px 16px rgba(0, 0, 0, 0.28);
        }
        .chat-action:active:not(:disabled) {
          transform: scale(0.97);
          background: rgba(255, 255, 255, 0.09);
        }
        .chat-action:disabled {
          opacity: 0.42;
          cursor: not-allowed;
        }

        .send-btn {
          height: 48px;
          padding: 0 18px;
          border-radius: 14px;
          font-weight: 600;
          flex-shrink: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .send-btn:disabled {
          background: #333;
          color: rgba(255, 255, 255, 0.48);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: none;
          animation: none;
          cursor: not-allowed;
        }
        .send-btn--ready {
          color: rgba(22, 24, 32, 0.9);
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.42);
          box-shadow: 0 0 0 rgba(255, 255, 255, 0.15);
          animation: breathe 3.2s ease-in-out infinite;
        }
        .send-btn--ready:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.97);
        }
        .send-btn--ready:active:not(:disabled) {
          transform: scale(0.98);
        }
        @keyframes breathe {
          0% {
            box-shadow: 0 0 0 rgba(255, 255, 255, 0.15);
          }
          50% {
            box-shadow: 0 0 12px rgba(255, 255, 255, 0.35);
          }
          100% {
            box-shadow: 0 0 0 rgba(255, 255, 255, 0.15);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .send-btn--ready {
            animation: none;
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.22);
          }
        }
        .share-sheet-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(5, 10, 22, 0.5);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          justify-content: center;
          align-items: flex-end;
          padding: 16px 0 28px;
          z-index: 120;
        }
        .share-sheet {
          width: calc(100% - 32px);
          max-width: 420px;
          margin: 0;
          border-radius: 28px 28px 0 0;
          padding: 14px 16px 20px;
          border: 1px solid rgba(255,255,255,0.16);
          background-image:
            linear-gradient(rgba(5,10,24,0.68), rgba(5,10,24,0.86)),
            radial-gradient(circle at top right, rgba(95,120,255,0.18), transparent 60%),
            url('/starry-sky.jpg');
          background-size: cover;
          background-position: center;
          box-shadow: 0 -18px 40px rgba(0,0,0,0.36), 0 0 34px rgba(110,145,255,0.12);
          transform: translateY(0);
          animation: share-sheet-up 220ms ease-out;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .share-sheet-action {
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(12,20,44,0.42);
          color: #fff;
          padding: 12px 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.18s ease, transform 0.18s ease;
          text-align: center;
          pointer-events: auto;
        }
        .share-sheet-action:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }
        @media (min-width: 960px) {
          .share-sheet-backdrop {
            padding-bottom: 140px;
          }
        }
        @keyframes share-sheet-up {
          from {
            transform: translateY(28px);
            opacity: 0.4;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .saved-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 80;
          padding: 9px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(8,14,32,0.68);
          color: #fff;
          font-size: 13px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.26);
          animation: saved-toast-fade 2.5s ease forwards;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .saved-toast a {
          color: #fff;
          text-decoration: none;
          opacity: 0.88;
          font-weight: 600;
        }
        .saved-toast a:hover {
          opacity: 1;
          text-decoration: underline;
        }
        @keyframes saved-toast-fade {
          0% {
            opacity: 0;
            transform: translateY(-4px);
          }
          14% {
            opacity: 1;
            transform: translateY(0);
          }
          78% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-2px);
          }
        }
      `}</style>
      {showSavedToast && (
        <div className="saved-toast">
          <span>Saved ✓</span>
          <Link href="/saved">View saved →</Link>
        </div>
      )}
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          padding: "14px 16px 170px",
          backgroundImage:
            "linear-gradient(rgba(5,10,25,0.58), rgba(5,10,25,0.78)), radial-gradient(circle at center, rgba(60,100,200,0.14), transparent 62%), url('/starry-sky.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "760px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            color: "white",
          }}
        >
          <section
            style={{
              textAlign: "center",
              display: "grid",
              gap: "10px",
              paddingTop: "0",
              maxWidth: "520px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(28px, 7vw, 40px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.12,
                fontWeight: 600,
              }}
            >
              You don&apos;t have to carry this alone.
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: "15px",
                lineHeight: 1.45,
                fontWeight: 400,
                opacity: 0.66,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              You can say it here. No need to make it sound okay.
            </p>
          </section>

          <section
            style={{
              display: "grid",
              gap: "12px",
              padding: "0",
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  maxWidth: "86%",
                  justifySelf: message.role === "user" ? "end" : "start",
                  borderRadius: "20px",
                  padding: "12px 16px",
                  background:
                    message.role === "user"
                      ? "rgba(120,160,255,0.3)"
                      : "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  fontSize: "16px",
                }}
              >
                {message.text}
              </div>
            ))}
            {loading && (
              <div
                style={{
                  maxWidth: "86%",
                  justifySelf: "start",
                  borderRadius: "20px",
                  padding: "12px 16px",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  opacity: 0.82,
                }}
              >
                Listening...
              </div>
            )}
          </section>
        </div>
      </main>
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
          zIndex: 70,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "760px",
            margin: "0 auto",
            borderRadius: "22px",
            border: "1px solid rgba(255,255,255,0.16)",
            background: "linear-gradient(160deg, rgba(8,14,32,0.76), rgba(8,14,32,0.9))",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            boxShadow: "0 -10px 28px rgba(0,0,0,0.28)",
            padding: "12px",
            display: "grid",
            gap: "10px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
            <button type="button" className="chat-action" onClick={handleVerse} disabled={loading}>
              Verse
            </button>
            <button type="button" className="chat-action" onClick={handlePrayer} disabled={loading}>
              Prayer
            </button>
            <button type="button" className="chat-action" onClick={openShareSheet}>
              Share
            </button>
            <button type="button" className="chat-action" onClick={handleSave}>
              Save
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              value={input}
              onChange={(e) => {
                console.log("CHANGE FIRED", e.target.value);
                setInput(e.target.value);
              }}
              placeholder="Type what's on your heart..."
              style={{
                flex: 1,
                minWidth: 0,
                padding: "14px 16px",
                borderRadius: "14px",
                background: "rgba(7,12,24,0.8)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                fontSize: "16px",
                outline: "none",
              }}
            />

            <button
              type="button"
              className={`send-btn${input.trim() ? " send-btn--ready" : ""}`}
              onClick={async () => {
                if (!input.trim() || loading) return;

                const sentText = input.trim();
                console.log("SEND CLICK", sentText);

                setMessages((prev) => [
                  ...prev,
                  {
                    id: makeSafeId(),
                    role: "user",
                    text: sentText,
                  },
                ]);

                setInput("");
                setIsSending(true);

                try {
                  const reflection = await getReflection(sentText);
                  const replyText = reflection?.reply || "Thank you for sharing. I'm listening.";

                  if (reflection) setLastReflection(reflection);
                  setLatestReply(replyText);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: makeSafeId(),
                      role: "ai",
                      text: replyText,
                    },
                  ]);
                } finally {
                  setIsSending(false);
                }
              }}
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      </div>

    
      {isShareSheetOpen && (
        <div className="share-sheet-backdrop" onClick={closeShareSheet}>
          <div
            className="share-sheet"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleSheetTouchStart}
            onTouchEnd={handleSheetTouchEnd}
          >
            <div
              style={{
                width: "40px",
                height: "5px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.36)",
                margin: "0 auto 14px",
              }}
            />
            <h3 style={{ margin: "0 0 12px", color: "#fff", fontSize: "22px", fontWeight: 600, textAlign: "left" }}>
              Share this moment
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button className="share-sheet-action" onClick={() => shareTo("whatsapp")}>
                WhatsApp
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("telegram")}>
                Telegram
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("x")}>
                X
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("facebook")}>
                Facebook
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("reddit")}>
                Reddit
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("sms")}>
                SMS
              </button>
            </div>
            <button className="share-sheet-action" style={{ width: "100%", marginTop: "10px" }} onClick={handleCopyLink}>
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
