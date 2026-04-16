import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = {
  width: 1080,
  height: 1080,
};

function sanitize(value: string | null, fallback: string, maxLen: number) {
  if (!value) return fallback;
  const compact = value.replace(/\s+/g, " ").trim();
  if (!compact) return fallback;
  return compact.length > maxLen ? `${compact.slice(0, maxLen - 3)}...` : compact;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bgUrl = new URL("/starry-night-milky-way.png", req.url).toString();
  const line = sanitize(
    searchParams.get("line"),
    "Even in heavy moments, you are not alone tonight.",
    180
  );
  const verseRef = sanitize(searchParams.get("ref"), "Psalm 34:18", 80);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "84px",
          color: "white",
          backgroundImage: `linear-gradient(rgba(3,8,22,0.5), rgba(1,3,10,0.8)), url(${bgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          fontFamily: "ui-sans-serif, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "42px",
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              textShadow: "0 0 28px rgba(147,197,253,0.15)",
            }}
          >
            He listens.
          </div>
          <div
            style={{
              fontSize: 50,
              lineHeight: 1.35,
              maxWidth: "92%",
              color: "rgba(255,255,255,0.94)",
            }}
          >
            {line}
          </div>
          <div
            style={{
              fontSize: 34,
              letterSpacing: "0.02em",
              color: "rgba(220,232,255,0.84)",
            }}
          >
            {verseRef}
          </div>
        </div>

        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.08em",
            textTransform: "lowercase",
            color: "rgba(255,255,255,0.72)",
          }}
        >
          helistens.app
        </div>
      </div>
    ),
    {
      width: SIZE.width,
      height: SIZE.height,
    }
  );
}
