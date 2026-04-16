"use client";

import { useConversation } from "@/hooks/useConversation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  getHasUsedFullExperience,
  isProUser,
  PAYWALL_COPY,
  previewPrayer,
  previewVerse,
  setHasUsedFullExperience,
  setProSubscriber,
} from "@/lib/freemium";

type ReflectResponse = {
  reply: string;
  insight: string;
  verse_text: string;
  verse_ref: string;
  prayer: string;
  short_comfort?: string;
};

function LockIcon() {
  return (
    <span className="locked-feature__icon" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const [resultData, setResultData] = useState<ReflectResponse | null>(null);

  const [isPro, setIsPro] = useState(false);
  const [spiritualUnlocked, setSpiritualUnlocked] = useState(true);
  const [sessionReflectCount, setSessionReflectCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [shareCopiedFlash, setShareCopiedFlash] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const paywallDismissedRef = useRef(false);
  const { addUserMessage, addAssistantMessage, getHistory } = useConversation();

  useEffect(() => {
    setIsPro(isProUser());
  }, []);

  useEffect(() => {
    if (!showPaywall) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showPaywall]);

  useEffect(() => {
    if (
      !showResult ||
      spiritualUnlocked ||
      sessionReflectCount !== 2 ||
      isPro
    ) {
      return;
    }
    const id = window.setTimeout(() => {
      if (!paywallDismissedRef.current) setShowPaywall(true);
    }, 2800);
    return () => window.clearTimeout(id);
  }, [showResult, spiritualUnlocked, sessionReflectCount, isPro]);

  function openPaywall() {
    setShowPaywall(true);
  }

  async function handleTalk() {
    if (!input.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          input,
          history: getHistory(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      const pro = isProUser();
      const hadFullBefore = getHasUsedFullExperience();
      const unlocked = pro || !hadFullBefore;

      setSessionReflectCount((c) => c + 1);
      setResultData(data);
      setSpiritualUnlocked(unlocked);

      if (!pro && !hadFullBefore) {
        setHasUsedFullExperience();
      }

      setShowResult(true);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server.");
    }

    setLoading(false);
  }

  function handleTalkAgain() {
    setShowResult(false);
    setError("");
  }

  function dismissPaywall() {
    paywallDismissedRef.current = true;
    setShowPaywall(false);
  }

  function handleSubscribe() {
    setProSubscriber();
    setIsPro(true);
    setSpiritualUnlocked(true);
    setShowPaywall(false);
  }


  const handleSave = () => {
    if (!resultData?.verse_text || !resultData?.verse_ref) return;

    try {
      const raw = localStorage.getItem("savedVerses");
      const parsed = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(parsed) ? parsed : [];

      next.unshift({
        text: resultData.verse_text,
        reference: resultData.verse_ref,
        createdAt: Date.now(),
      });

      localStorage.setItem("savedVerses", JSON.stringify(next));
    } catch (err) {
      console.error("Failed to save verse", err);
    }

    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1200);
  };

  const locked = showResult && !spiritualUnlocked;
  const shareData = buildShareData();

  function buildShareData() {
    if (!resultData) return null;

    const rawLine = (resultData.reply || "").trim();
    const shortLine = rawLine.length > 140 ? `${rawLine.slice(0, 137)}...` : rawLine;
    const comfortLine = resultData.short_comfort || "You are not alone.";
    const verseRef = (resultData.verse_ref || "").trim();
    const shareUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://helistens.app";
    const finalUrl = `${shareUrl}/share?line=${encodeURIComponent(shortLine)}&comfort=${encodeURIComponent(comfortLine)}&ref=${encodeURIComponent(verseRef)}`;
    const shareText = verseRef
      ? `${shortLine}

"${comfortLine}"

— ${verseRef}

helistens.app`
      : `${shortLine}

"${comfortLine}"

helistens.app`;

    return { shortLine, finalUrl, shareText };
  }

  function openShareWindow(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
    

  return (
    <main className="main">
      {!showResult ? (
        <>
          <h1>He listens.</h1>
          <p className="sub">Even when no one else does.</p>

          <textarea
            placeholder="Say what’s on your heart..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            type="button"
            className="primary-button"
            onClick={handleTalk}
            disabled={loading}
          >
            {loading ? "Thinking..." : "Talk"}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </>
      ) : (
        <>
          <span
            className={`saved-indicator${savedFlash ? " saved-indicator--visible" : ""}`}
            role="status"
            aria-live="polite"
          >
            Saved
          </span>
          <div className="bubble">{input}</div>

          <div className="card main-reply">
            <p>{resultData?.reply}</p>
          </div>

          <div className="card">
            <h3>💛 What this means</h3>
            <p>{resultData?.insight}</p>
          </div>

          {locked && sessionReflectCount === 2 ? (
            <p className="lock-nudge" role="status">
              I&apos;d like to guide you with a verse and a prayer again,
              <br />
              but that&apos;s part of full support.
            </p>
          ) : null}

          {locked ? (
            <>
              <button
                type="button"
                className="card card--locked"
                onClick={openPaywall}
              >
                <span className="locked-feature__row">
                  <h3 className="locked-feature__title">📖 A verse for you</h3>
                  <LockIcon />
                </span>
                <p className="locked-feature__preview locked-feature__preview--verse">
                  &quot;{previewVerse(resultData?.verse_text ?? "")}&quot;
                </p>
                <span className="locked-feature__cta">Unlock full verse</span>
              </button>

              <button
                type="button"
                className="card card--locked"
                onClick={openPaywall}
              >
                <span className="locked-feature__row">
                  <h3 className="locked-feature__title">🙏 A simple prayer</h3>
                  <LockIcon />
                </span>
                <p className="locked-feature__preview">
                  {previewPrayer(resultData?.prayer ?? "")}
                </p>
                <span className="locked-feature__cta">Unlock full prayer</span>
              </button>
            </>
          ) : (
            <>
              <div className="card">
                <div className="verse-card-head">
                  <h3>📖 A verse for you</h3>
                  <button
                    type="button"
                    className={`verse-bookmark${savedFlash ? " verse-bookmark--active" : ""}`}
                    onClick={handleSave}
                  >
                    🔖
                  </button>
                </div>
                <p className="verse-text">
                  &quot;{resultData?.verse_text}&quot;
                </p>
                <span className="verse-ref">{resultData?.verse_ref}</span>
              </div>
              <div className="card">
                <h3>🙏 A simple prayer</h3>
                <p>{resultData?.prayer}</p>
              </div>
            </>
          )}

          <Link href="/saved" className="view-saved-link">
            View saved
          </Link>

          <div className="bottom">
            <button type="button" onClick={handleTalkAgain}>
              Talk again
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
            >
              {shareCopiedFlash ? "Link copied" : "Share"}
            </button>
          </div>
        </>
      )}

      {showShareModal && shareData ? (
        <div
          onClick={() => setShowShareModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 10, 25, 0.55)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: "460px",
              borderRadius: "28px 28px 0 0",
              padding: "14px 18px 22px",
              backgroundImage:
                "linear-gradient(to top, rgba(20,30,60,0.66), rgba(20,30,60,0.48)), linear-gradient(rgba(8,12,24,0.32), rgba(8,12,24,0.32)), url('/starry-sky.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.09)",
              boxShadow:
                "0 -10px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)",
              display: "grid",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "5px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.22)",
                margin: "0 auto 14px",
              }}
            />
            <div style={{ fontSize: "16px", fontWeight: 500, opacity: 0.9, marginBottom: "14px" }}>
              Share this moment
            </div>
            {(() => {
              const text = shareData.shareText;
              const url = shareData.finalUrl;
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
              const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
              const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
              const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(shareData.shortLine)}`;
              const smsUrl = `sms:?body=${encodeURIComponent(text + " " + url)}`;
              const buttonStyle = {
                fontSize: "15px",
                fontWeight: 500,
                padding: "13px 12px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "white",
                opacity: 0.92,
                cursor: "pointer",
                transition: "background 0.2s ease",
              } as const;

              return (
                <>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    <button type="button" style={buttonStyle} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")} onClick={() => openShareWindow(whatsappUrl)}>WhatsApp</button>
                    <button type="button" style={buttonStyle} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")} onClick={() => openShareWindow(telegramUrl)}>Telegram</button>
                    <button type="button" style={buttonStyle} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")} onClick={() => openShareWindow(twitterUrl)}>X</button>
                    <button type="button" style={buttonStyle} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")} onClick={() => openShareWindow(facebookUrl)}>Facebook</button>
                    <button type="button" style={buttonStyle} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")} onClick={() => openShareWindow(redditUrl)}>Reddit</button>
                    <button type="button" style={buttonStyle} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.10)")} onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")} onClick={() => openShareWindow(smsUrl)}>SMS</button>
                  </div>
                  <button
                    type="button"
                    style={{
                      ...buttonStyle,
                      width: "100%",
                      background: "rgba(255,255,255,0.1)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(shareData.finalUrl);
                        setShareCopiedFlash(true);
                        window.setTimeout(() => setShareCopiedFlash(false), 1100);
                      } catch (err) {
                        console.error("Failed to copy share link", err);
                      }
                      setShowShareModal(false);
                    }}
                  >
                    Copy Link
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}

      <div
        className={`paywall-backdrop${showPaywall ? " paywall-backdrop--visible" : ""}`}
        role="presentation"
        aria-hidden={!showPaywall}
        onClick={(e) => {
          if (e.target === e.currentTarget) dismissPaywall();
        }}
      >
        <div
          className="paywall-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="paywall-title"
          aria-describedby="paywall-subtitle"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="paywall-title" className="paywall-panel__title">
            {PAYWALL_COPY.title}
          </h2>
          <p id="paywall-subtitle" className="paywall-panel__subtitle">
            {PAYWALL_COPY.subtitle}
          </p>
          <button
            type="button"
            className="paywall-panel__cta"
            onClick={handleSubscribe}
          >
            {PAYWALL_COPY.cta}
          </button>
          <button
            type="button"
            className="paywall-panel__secondary"
            onClick={dismissPaywall}
          >
            {PAYWALL_COPY.dismiss}
          </button>
        </div>
      </div>
    </main>
  );
}
