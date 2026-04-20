import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "He listens.",
  description: "Even when no one else does. A quiet place when you feel lost, overwhelmed, or alone.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden text-white">
      <style>{`html{scroll-behavior:smooth}`}</style>

      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "linear-gradient(rgba(3,7,18,0.72), rgba(3,7,18,0.88)), radial-gradient(circle at 20% 10%, rgba(90,120,220,0.18), transparent 55%), url('/starry-sky.jpg')",
        }}
      />

      <main className="mx-auto flex w-full max-w-5xl flex-col px-5 pt-[clamp(56px,10vh,120px)] pb-24 sm:px-8">
        <section className="flex flex-col items-center text-center">
          <h1 className="m-0 font-semibold tracking-[-0.04em] text-white text-[clamp(44px,10vw,84px)] leading-[1.02]">
            He listens.
          </h1>

          <p className="mt-5 max-w-xl text-[clamp(18px,2.4vw,22px)] font-medium leading-snug text-white/80">
            Even when no one else does.
          </p>

          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/55 sm:text-base">
            When you feel lost, overwhelmed, or alone.
          </p>

          <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-md sm:flex-row sm:justify-center">
            <Link
              href="/app"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-neutral-900 shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition hover:bg-white/95 active:scale-[0.98]"
            >
              Open App
            </Link>
            <a
              href="#learn-more"
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-white/18 bg-white/5 px-6 text-[15px] font-medium text-white/88 backdrop-blur-md transition hover:border-white/30 hover:bg-white/10 active:scale-[0.98]"
            >
              Learn More
            </a>
          </div>
        </section>

        <section
          id="learn-more"
          aria-label="Preview"
          className="mx-auto mt-[clamp(56px,12vh,120px)] w-full max-w-md scroll-mt-16"
        >
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-medium tracking-wide text-white/45">
                A quiet conversation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="self-end max-w-[86%] rounded-[20px_20px_6px_20px] border border-indigo-200/15 bg-indigo-400/25 px-4 py-3 text-[15px] leading-snug text-white/95 shadow-[0_8px_20px_rgba(40,55,120,0.25)]">
                I feel lost today.
              </div>

              <div className="self-start max-w-[86%] rounded-[20px_20px_20px_6px] border border-white/10 bg-white/[0.08] px-4 py-3 text-[15px] leading-relaxed text-white/90 backdrop-blur-sm">
                You are not alone. Take a breath.
                <br />
                One step at a time.
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-[12px] text-white/40">
              <span>Preview</span>
              <Link href="/app" className="text-white/70 transition hover:text-white">
                Open the app →
              </Link>
            </div>
          </div>
        </section>

        <section
          aria-label="What He Listens is for"
          className="mx-auto mt-[clamp(56px,12vh,110px)] flex w-full max-w-2xl flex-col items-center gap-5 px-2 text-center"
        >
          <p className="text-[clamp(20px,3.2vw,26px)] font-medium leading-snug text-white/92">
            Some days feel heavy.
          </p>
          <p className="text-[clamp(18px,2.8vw,22px)] leading-snug text-white/72">
            You don&apos;t need perfect words.
          </p>
          <p className="text-[clamp(20px,3.2vw,26px)] font-medium leading-snug text-white/88">
            Just speak. He listens.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/45 sm:text-[15px]">
            Private. Personal. Just you and Him.
          </p>
        </section>

        <section className="mx-auto mt-[clamp(48px,10vh,96px)] flex w-full max-w-md flex-col items-center gap-4 text-center">
          <Link
            href="/app"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-6 text-[15px] font-semibold text-neutral-900 shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition hover:bg-white/95 active:scale-[0.98]"
          >
            Open App
          </Link>
          <p className="text-xs text-white/40">
            No sign-up. Just start when you&apos;re ready.
          </p>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-5xl items-center justify-center gap-2 px-5 pb-10 text-xs text-white/40 sm:text-sm">
        <Link href="/terms" className="transition hover:text-white/75">
          Terms
        </Link>
        <span aria-hidden className="opacity-60">
          ·
        </span>
        <Link href="/privacy" className="transition hover:text-white/75">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
