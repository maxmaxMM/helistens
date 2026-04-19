"use client";

import { useState } from "react";

type ShareCtaProps = {
  line: string;
  comfort: string;
  verse: string;
  verseRef: string;
};

export default function ShareCta({ line, comfort, verse, verseRef }: ShareCtaProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  function close() {
    setOpen(false);
    setCopied(false);
    setTouchStartY(null);
  }

  function buildShareUrl() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    return `${baseUrl}/share?line=${encodeURIComponent(line)}&comfort=${encodeURIComponent(
      comfort
    )}&verse=${encodeURIComponent(verse)}&ref=${encodeURIComponent(verseRef)}`;
  }

  function shareTo(platform: "whatsapp" | "telegram" | "x" | "facebook" | "reddit" | "sms") {
    const shareUrl = buildShareUrl();
    const encodedLine = encodeURIComponent(line);
    const encodedShareUrl = encodeURIComponent(shareUrl);
    const encodedLineAndUrl = encodeURIComponent(`${line}\n\n${shareUrl}`);
    const urls = {
      whatsapp: `https://wa.me/?text=${encodedLineAndUrl}`,
      telegram: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedLine}`,
      x: `https://twitter.com/intent/tweet?text=${encodedLine}&url=${encodedShareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedShareUrl}&title=${encodedLine}`,
      sms: `sms:?&body=${encodedLineAndUrl}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
    close();
  }

  async function copyLink() {
    const shareUrl = buildShareUrl();
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    setTouchStartY(e.changedTouches[0]?.clientY ?? null);
  }

  function onTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (touchStartY == null) return;
    const endY = e.changedTouches[0]?.clientY ?? touchStartY;
    if (endY - touchStartY > 60) close();
    setTouchStartY(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          width: "100%",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
          padding: "12px 14px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Share this →
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 10, 22, 0.5)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            zIndex: 50,
          }}
          onClick={close}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              margin: "0 10px 20px",
              borderRadius: "28px 28px 0 0",
              padding: "14px 16px 18px",
              border: "1px solid rgba(255,255,255,0.16)",
              backgroundImage:
                "linear-gradient(rgba(5,10,24,0.68), rgba(5,10,24,0.86)), radial-gradient(circle at top right, rgba(95,120,255,0.18), transparent 60%), url('/starry-sky.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 -18px 40px rgba(0,0,0,0.36), 0 0 34px rgba(110,145,255,0.12)",
              animation: "share-sheet-up 220ms ease-out",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <style>{`
              @keyframes share-sheet-up {
                from { transform: translateY(28px); opacity: 0.4; }
                to { transform: translateY(0); opacity: 1; }
              }
            `}</style>
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
              {[
                ["WhatsApp", "whatsapp"],
                ["Telegram", "telegram"],
                ["X", "x"],
                ["Facebook", "facebook"],
                ["Reddit", "reddit"],
                ["SMS", "sms"],
              ].map(([label, key]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => shareTo(key as any)}
                  style={{
                    borderRadius: "14px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(12,20,44,0.42)",
                    color: "#fff",
                    padding: "12px 12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={copyLink}
              style={{
                width: "100%",
                marginTop: "10px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(12,20,44,0.42)",
                color: "#fff",
                padding: "12px 12px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

