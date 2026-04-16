"use client";

import type { CSSProperties } from "react";

/** Headline A/B: `1` = default, `2` = alternate. */
const HEADLINE_VARIANT = 1 as 1 | 2;

export default function Home() {
  const storeCtaBase: CSSProperties = {
    width: "100%",
    minHeight: "74px",
    borderRadius: "15px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    justifyContent: "center",
    padding: "17px 24px",
    textDecoration: "none",
    transition: "transform 0.2s ease, filter 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease",
  };

  const storePrimaryStyle: CSSProperties = {
    ...storeCtaBase,
    background: "#000000",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.28)",
    boxShadow:
      "0 8px 22px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.09) inset, 0 0 28px rgba(130,175,255,0.34)",
  };

  const storeSecondaryStyle: CSSProperties = {
    ...storeCtaBase,
    background: "#000000",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow:
      "0 6px 18px rgba(0,0,0,0.46), 0 0 0 1px rgba(255,255,255,0.07) inset, 0 0 22px rgba(130,175,255,0.14), 0 0 1px rgba(160,190,255,0.35)",
  };

  const ctaLabelStyle: CSSProperties = {
    textAlign: "left",
    lineHeight: 1.3,
    fontSize: "17px",
    fontWeight: 600,
    color: "inherit",
    textShadow: "0 1px 2px rgba(0,0,0,0.55)",
  };

  return (
    <>
      <style>{`
        .landing-store-cta--primary:hover {
          transform: scale(1.03);
          filter: brightness(1.12);
          box-shadow:
            0 10px 26px rgba(0,0,0,0.55),
            0 0 0 1px rgba(255,255,255,0.12) inset,
            0 0 34px rgba(140,185,255,0.4);
        }
        .landing-store-cta--primary:active {
          transform: scale(0.99);
        }
        .landing-store-cta--secondary:hover {
          transform: scale(1.03);
          filter: brightness(1.08);
          box-shadow:
            0 8px 22px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.1) inset,
            0 0 28px rgba(130,175,255,0.22),
            0 0 1px rgba(170,200,255,0.45);
        }
        .landing-store-cta--secondary:active {
          transform: scale(0.99);
        }
        .landing-cta-grid {
          display: grid;
          gap: 12px;
        }
        @media (min-width: 780px) {
          .landing-cta-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            align-items: stretch;
            justify-content: center;
          }
        }
      `}</style>
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "28px 16px 40px",
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
            maxWidth: "700px",
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            color: "white",
          }}
        >
          <section style={{ textAlign: "center", display: "grid", gap: "12px" }}>
            {HEADLINE_VARIANT === 1 ? (
              <>
                <h1 style={{ margin: 0, fontSize: "56px", letterSpacing: "-0.045em", lineHeight: 1.02 }}>
                  He listens.
                </h1>
                <p style={{ margin: 0, fontSize: "20px", opacity: 0.8, lineHeight: 1.45 }}>
                  Even when no one else does.
                </p>
              </>
            ) : (
              <h1
                style={{
                  margin: 0,
                  fontSize: "52px",
                  letterSpacing: "-0.045em",
                  lineHeight: 1.08,
                  display: "grid",
                  gap: "6px",
                  justifyItems: "center",
                }}
              >
                <span style={{ display: "block" }}>When no one listens,</span>
                <span style={{ display: "block" }}>He does.</span>
              </h1>
            )}
            <p style={{ margin: 0, fontSize: "17px", opacity: 0.72, lineHeight: 1.5 }}>
              When you feel lost, overwhelmed, or alone.
            </p>
          </section>

          <section className="landing-cta-grid" style={{ width: "100%", maxWidth: "680px", margin: "0 auto" }}>
            <a
              href="https://apps.apple.com/app/YOUR_APP_ID"
              target="_blank"
              rel="noreferrer"
              className="landing-store-cta--primary"
              style={storePrimaryStyle}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-hidden
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span style={ctaLabelStyle}>Download on the App Store</span>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME"
              target="_blank"
              rel="noreferrer"
              className="landing-store-cta--secondary"
              style={storeSecondaryStyle}
            >
              <span
                style={{
                  flexShrink: 0,
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-hidden
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 20.5v-17c0-.59.34-1.11.88-1.35L13.77 12 3.88 21.85c-.54-.24-.88-.76-.88-1.35z" fill="#00D9FF" />
                  <path d="M16.27 15.09L7.12 21.9l6.65-6.81 2.5 2.5z" fill="#00F076" />
                  <path d="M7.12 2.1l9.15 6.81-2.5 2.5L7.12 2.1z" fill="#FFD23F" />
                  <path d="M16.27 8.91L13.77 12l2.5 3.09 4.85-2.8c.54-.31.88-.83.88-1.42s-.34-1.11-.88-1.42l-4.85-2.8z" fill="#FF3A44" />
                </svg>
              </span>
              <span style={ctaLabelStyle}>Get it on Google Play</span>
            </a>
          </section>

          <section
            style={{
              width: "min(90%, 100%)",
              margin: "-14px auto 0",
              borderRadius: "24px",
              background: "rgba(8,12,28,0.4)",
              padding: "24px 20px",
              display: "grid",
              gap: "16px",
              minHeight: "200px",
              boxShadow: "0 10px 26px rgba(0,0,0,0.28), 0 0 22px rgba(120,150,255,0.11)",
            }}
          >
            <div
              style={{
                width: "min(72%, 280px)",
                justifySelf: "end",
                padding: "14px 16px",
                borderRadius: "18px",
                background: "rgba(84,98,215,0.86)",
                fontSize: "15px",
                lineHeight: 1.45,
                fontWeight: 500,
              }}
            >
              I feel lost today.
            </div>
            <div
              style={{
                width: "min(84%, 100%)",
                padding: "15px 17px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.11)",
                fontSize: "16px",
                lineHeight: 1.55,
                opacity: 0.96,
              }}
            >
              You are not alone. Take a breath. One step at a time.
            </div>
          </section>

          <section style={{ textAlign: "center", display: "grid", gap: "6px", marginTop: "4px" }}>
            <p style={{ margin: 0, fontSize: "20px", lineHeight: 1.5, opacity: 0.9 }}>
              Some days feel heavy.
            </p>
            <p style={{ margin: 0, fontSize: "20px", lineHeight: 1.5, opacity: 0.9 }}>
              You don&apos;t need perfect words.
            </p>
            <p style={{ margin: 0, fontSize: "20px", lineHeight: 1.5, opacity: 0.9 }}>
              Just speak. He listens.
            </p>
          </section>

          <p style={{ margin: "0", textAlign: "center", fontSize: "14px", opacity: 0.65 }}>
            Private. Personal. Just you and Him.
          </p>
        </div>
      </main>
    </>
  );
}
