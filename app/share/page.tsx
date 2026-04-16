"use client";

export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";

function readParam(value: string | null, fallback: string): string {
  return (value ?? fallback).trim() || fallback;
}

export default function SharePage() {
  const searchParams = useSearchParams();
  const line = readParam(searchParams.get("line"), "You are not alone.");
  const comfort = readParam(searchParams.get("comfort"), "Take a breath. You are held.");
  const verseRef = readParam(searchParams.get("ref"), "Psalm 34:18");

  const handleStart = () => {
    const ua = navigator.userAgent || navigator.vendor || (window as { opera?: string }).opera;
    const uaString = String(ua ?? "");

    const isIOS =
      /iPhone|iPad|iPod/i.test(uaString) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const isAndroid = /Android/i.test(uaString);

    if (isIOS) {
      window.location.href = "https://apps.apple.com/app/YOUR_APP_ID";
    } else if (isAndroid) {
      window.location.href = "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME";
    } else {
      window.location.href = "/";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "28px 24px",
          borderRadius: "28px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          color: "rgba(255,255,255,0.96)"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            fontWeight: "600",
            letterSpacing: "-0.3px",
            opacity: 0.95
          }}
        >
          He listens.
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "500",
            lineHeight: "1.5",
            marginTop: "4px"
          }}
        >
          {line}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "16px",
            opacity: 0.65,
            lineHeight: "1.6",
            fontStyle: "italic"
          }}
        >
          "{comfort}"
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "14px",
            opacity: 0.5,
            marginTop: "4px"
          }}
        >
          — {verseRef}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "13px",
            opacity: 0.4,
            marginTop: "10px"
          }}
        >
          helistens.app
        </p>

        <a
          href="/"
          className="share-page-cta"
          onClick={handleStart}
          style={{
            fontSize: "14px",
            marginTop: "6px",
            opacity: 0.9,
            cursor: "pointer",
            color: "rgba(255,255,255,0.9)",
            textDecoration: "none",
            alignSelf: "flex-start"
          }}
        >
          Try He listens →
        </a>
      </div>
      <style>{`
        .share-page-cta {
          transition: opacity 0.2s ease;
        }

        .share-page-cta:hover {
          opacity: 1 !important;
        }
      `}</style>
    </main>
  );
}
