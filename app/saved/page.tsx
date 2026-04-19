"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedMessage = {
  line: string;
  comfort: string;
  verse: string;
  ref: string;
  timestamp: number;
  // Back-compat / optional fields if present.
  message?: string;
  prayer?: string;
};

export default function SavedPage() {
  const [items, setItems] = useState<SavedMessage[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareItem, setShareItem] = useState<SavedMessage | null>(null);
  const [copied, setCopied] = useState(false);
  const [sheetTouchStartY, setSheetTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedMessages");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setItems(
          parsed.filter(
            (it): it is SavedMessage =>
              typeof it?.line === "string" &&
              typeof it?.comfort === "string" &&
              typeof it?.verse === "string" &&
              typeof it?.ref === "string" &&
              typeof it?.timestamp === "number"
          )
        );
      }
    } catch {
      setItems([]);
    }
  }, []);

  function handleDelete(indexToRemove: number) {
    setItems((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      try {
        localStorage.setItem("savedMessages", JSON.stringify(next));
      } catch {
        // Ignore storage write failures and still update UI state.
      }
      return next;
    });
  }

  function openShare(item: SavedMessage) {
    setCopied(false);
    setShareItem(item);
    setShareOpen(true);
  }

  function closeShare() {
    setShareOpen(false);
    setCopied(false);
    setSheetTouchStartY(null);
  }

  function buildShareUrl(item: SavedMessage) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    return `${baseUrl}/share?line=${encodeURIComponent(item.line)}&comfort=${encodeURIComponent(
      item.comfort
    )}&verse=${encodeURIComponent(item.verse)}&ref=${encodeURIComponent(item.ref)}`;
  }

  function shareTo(platform: "whatsapp" | "telegram" | "x" | "facebook" | "reddit" | "sms", item: SavedMessage) {
    const shareUrl = buildShareUrl(item);
    const encodedLine = encodeURIComponent(item.line);
    const encodedShareUrl = encodeURIComponent(shareUrl);
    const encodedLineAndUrl = encodeURIComponent(`${item.line}\n\n${shareUrl}`);
    const urls = {
      whatsapp: `https://wa.me/?text=${encodedLineAndUrl}`,
      telegram: `https://t.me/share/url?url=${encodedShareUrl}&text=${encodedLine}`,
      x: `https://twitter.com/intent/tweet?text=${encodedLine}&url=${encodedShareUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedShareUrl}&title=${encodedLine}`,
      sms: `sms:?&body=${encodedLineAndUrl}`,
    };
    window.open(urls[platform], "_blank", "noopener,noreferrer");
    closeShare();
  }

  async function copyLink(item: SavedMessage) {
    const shareUrl = buildShareUrl(item);
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  function handleSheetTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    setSheetTouchStartY(e.changedTouches[0]?.clientY ?? null);
  }

  function handleSheetTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (sheetTouchStartY == null) return;
    const endY = e.changedTouches[0]?.clientY ?? sheetTouchStartY;
    if (endY - sheetTouchStartY > 60) closeShare();
    setSheetTouchStartY(null);
  }

  return (
    <>
      <style>{`
        .share-sheet-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(5, 10, 22, 0.5);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          justify-content: center;
          align-items: flex-end;
          z-index: 50;
        }
        .share-sheet {
          width: 100%;
          max-width: 420px;
          margin: 0 10px 20px;
          border-radius: 28px 28px 0 0;
          padding: 14px 16px 18px;
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
        }
        .share-sheet-action:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
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
      `}</style>
      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          padding: "12px 14px 30px",
          backgroundImage:
            "radial-gradient(circle at center, rgba(255, 255, 255, 0.04), rgba(0, 0, 0, 0.9)), linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.92)), url('/starry-night-milky-way.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            display: "grid",
            gap: "6px",
            alignSelf: "flex-start",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Link href="/" style={{ color: "#fff", textDecoration: "none", opacity: 0.82, fontSize: "14px" }}>
              ← Back
            </Link>
          </div>

          <header style={{ display: "grid", gap: "2px", textAlign: "left" }}>
            <h1 style={{ margin: 0, fontSize: "34px", letterSpacing: "-0.03em" }}>Saved moments</h1>
            <p style={{ margin: 0, opacity: 0.78, fontSize: "16px" }}>
              Words you wanted to keep. Share the ones that speak to you.
            </p>
          </header>

          {items.length === 0 ? (
            <section
              style={{
                borderRadius: "22px",
                padding: "18px 16px",
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0)), linear-gradient(rgba(15,25,50,0.55), rgba(10,20,40,0.65))",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 2px 20px rgba(0,0,0,0.06), 0 0 36px rgba(100,120,180,0.07)",
                display: "grid",
                gap: "6px",
              }}
            >
              <p style={{ margin: 0, fontSize: "16px", opacity: 0.92 }}>No saved moments yet.</p>
              <p style={{ margin: 0, fontSize: "14px", opacity: 0.7 }}>
                When something speaks to you, save it here.
              </p>
            </section>
          ) : (
            <section style={{ display: "grid", gap: "16px", marginTop: "0" }}>
              {items.map((item, idx) => {
                const shareHref = `/share?line=${encodeURIComponent(item.line)}&comfort=${encodeURIComponent(
                  item.comfort
                )}&verse=${encodeURIComponent(item.verse)}&ref=${encodeURIComponent(item.ref)}`;
                const dt = new Date(item.timestamp);
                return (
                  <article
                    key={`${item.ref}-${item.timestamp}-${idx}`}
                    className="saved-card"
                    style={{
                      borderRadius: "22px",
                      padding: "16px 16px 12px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backgroundImage:
                        "linear-gradient(rgba(10, 20, 40, 0.85), rgba(5, 10, 25, 0.95)), url('/starry-night-milky-way.png')",
                      backgroundSize: "cover, cover",
                      backgroundPosition: "center, center",
                      backgroundRepeat: "no-repeat, no-repeat",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      boxShadow:
                        "0 0 40px rgba(80, 120, 255, 0.08), inset 0 0 40px rgba(255, 255, 255, 0.02)",
                      display: "grid",
                      gap: "7px",
                    }}
                  >
                    <div className="saved-card__meta">{dt.toLocaleString()}</div>
                    <button
                      type="button"
                      className="saved-card-delete"
                      onClick={() => handleDelete(idx)}
                      aria-label="Delete saved moment"
                    >
                      🗑
                    </button>

                    <div style={{ display: "grid", gap: "6px" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "20px",
                          lineHeight: 1.38,
                          whiteSpace: "pre-wrap",
                          color: "#fff",
                        }}
                      >
                        {item.line}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          color: "rgba(255, 255, 255, 0.78)",
                          fontStyle: "italic",
                          lineHeight: 1.48,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        "{item.comfort}"
                      </p>
                      <div
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.1)",
                          paddingTop: "6px",
                          marginTop: "2px",
                          display: "grid",
                          gap: "4px",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "13px",
                            color: "rgba(210, 218, 235, 0.9)",
                            lineHeight: 1.52,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {item.verse}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "11px",
                            color: "rgba(180, 190, 210, 0.75)",
                            lineHeight: 1.35,
                          }}
                        >
                          {item.ref}
                        </p>
                      </div>
                    </div>

                    <div className="saved-card__actions">
                      <Link href={shareHref} className="saved-card__action">
                        View →
                      </Link>
                      <button type="button" className="saved-card__action" onClick={() => openShare(item)}>
                        Share
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
      {shareOpen && shareItem && (
        <div className="share-sheet-backdrop" onClick={closeShare}>
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
              <button className="share-sheet-action" onClick={() => shareTo("whatsapp", shareItem)}>
                WhatsApp
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("telegram", shareItem)}>
                Telegram
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("x", shareItem)}>
                X
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("facebook", shareItem)}>
                Facebook
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("reddit", shareItem)}>
                Reddit
              </button>
              <button className="share-sheet-action" onClick={() => shareTo("sms", shareItem)}>
                SMS
              </button>
            </div>
            <button
              className="share-sheet-action"
              style={{ width: "100%", marginTop: "10px" }}
              onClick={() => copyLink(shareItem)}
            >
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
