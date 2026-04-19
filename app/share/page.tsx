import ShareCta from "./ShareCta";
import type { Metadata } from "next";

/** Query keys from the share URL — read via the page `searchParams` prop (server), not `useSearchParams`. */
type SharePageSearchParams = {
  line?: string | string[];
  comfort?: string | string[];
  verse?: string | string[];
  ref?: string | string[];
};

type SharePageProps = {
  searchParams: Promise<SharePageSearchParams>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function pickParam(value: string | string[] | undefined, fallback: string): string {
  const raw = firstParam(value);
  if (typeof raw !== "string") return fallback;
  if (raw.length === 0) return fallback;
  return raw;
}

export async function generateMetadata({ searchParams }: SharePageProps): Promise<Metadata> {
  const params = await searchParams;

  const comfort = pickParam(params.comfort, "You are not alone.");
  const title = "He listens.";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.helistens.app";
  const pageUrl = new URL("/share", siteUrl);
  const line = pickParam(params.line, "");
  const verse = pickParam(params.verse, "");
  const ref = pickParam(params.ref, "");

  if (line) pageUrl.searchParams.set("line", line);
  if (comfort) pageUrl.searchParams.set("comfort", comfort);
  if (verse) pageUrl.searchParams.set("verse", verse);
  if (ref) pageUrl.searchParams.set("ref", ref);

  const ogImage = new URL("/share-preview.png", siteUrl).toString();

  return {
    title,
    description: comfort,
    alternates: {
      canonical: pageUrl.toString(),
    },
    openGraph: {
      title,
      description: comfort,
      url: pageUrl.toString(),
      siteName: "He listens.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "He listens." }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: comfort,
      images: [ogImage],
    },
  };
}

function SharePageView({
  line,
  comfort,
  verse,
  ref,
}: {
  line: string;
  comfort: string;
  verse: string;
  ref: string;
}) {
  return (
    <main
      className="share-page-sky"
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "22px 14px",
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.65)), url('/starry-night-milky-way.png')",
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundAttachment: "fixed",
        boxShadow: "inset 0 0 200px rgba(0, 0, 0, 0.6)",
      }}
    >
      <article
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "28px",
          padding: "26px 22px 22px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(10, 20, 40, 0.78)",
          boxShadow:
            "0 40px 120px rgba(0, 0, 0, 0.8), 0 0 120px rgba(120, 160, 255, 0.12)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#fff",
          display: "grid",
          gap: "18px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "36px", lineHeight: 1.05, letterSpacing: "-0.03em" }}>He listens.</h1>

        <p
          style={{
            margin: 0,
            fontSize: "25px",
            lineHeight: 1.34,
            whiteSpace: "pre-wrap",
            letterSpacing: "-0.01em",
          }}
        >
          {line}
        </p>

        <p
          style={{
            margin: 0,
            fontSize: "17px",
            lineHeight: 1.45,
            opacity: 0.86,
            fontStyle: "italic",
            whiteSpace: "pre-wrap",
          }}
        >
          "{comfort}"
        </p>

        <section
          style={{
            marginTop: "2px",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            display: "grid",
            gap: "8px",
          }}
        >
          <p style={{ margin: 0, fontSize: "15px", lineHeight: 1.6, opacity: 0.92, whiteSpace: "pre-wrap" }}>{verse}</p>
          <p style={{ margin: 0, fontSize: "14px", opacity: 0.72 }}>{ref}</p>
        </section>

        <div style={{ marginTop: "2px" }}>
          <ShareCta line={line} comfort={comfort} verse={verse} verseRef={ref} />
        </div>

        <footer
          style={{
            marginTop: "6px",
            paddingTop: "12px",
            borderTop: "1px solid rgba(255,255,255,0.11)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "13px", opacity: 0.64 }}>helistens.app</span>
          <a href="/" style={{ color: "#fff", opacity: 0.82, textDecoration: "none", fontSize: "14px", fontWeight: 500 }}>
            Try He listens →
          </a>
        </footer>
      </article>
    </main>
  );
}

export default async function SharePage({ searchParams }: SharePageProps) {
  const sp = await searchParams;

  const line = pickParam(sp.line, "I felt really low today.");
  const comfort = pickParam(sp.comfort, "You are not alone.");
  const verse = pickParam(
    sp.verse,
    "The Lord is close to the brokenhearted and saves those who are crushed in spirit."
  );
  const ref = pickParam(sp.ref, "Psalm 34:18");

  return <SharePageView line={line} comfort={comfort} verse={verse} ref={ref} />;
}
