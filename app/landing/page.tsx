import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "He listens.",
  description: "A quiet place for your thoughts.",
};

const IOS_STORE_URL = process.env.NEXT_PUBLIC_IOS_APP_URL ?? "https://apps.apple.com/";
const ANDROID_STORE_URL = process.env.NEXT_PUBLIC_ANDROID_APP_URL ?? "https://play.google.com/store/apps";

export default function LandingPage() {
  return (
    <div className="landing">
      <main className="landing__main">
        <div className="landing__grid">
          <header className="landing__hero">
            <h1 className="landing__title">He listens.</h1>
            <p className="landing__subtitle">A quiet place for your thoughts.</p>
            <div className="landing__stores">
              <a className="landing__store" href={IOS_STORE_URL} rel="noopener noreferrer" target="_blank">
                App Store
              </a>
              <a className="landing__store" href={ANDROID_STORE_URL} rel="noopener noreferrer" target="_blank">
                Google Play
              </a>
            </div>
          </header>

          <div className="landing__visual" aria-hidden>
            <div className="landing__phones">
              <div className="landing__phone landing__phone--left">
                <div className="landing__phone-frame">
                  <div className="landing__phone-notch" />
                  <div className="landing__phone-screen">
                    <div className="landing__mock-dots" />
                    <p className="landing__mock-title">He listens.</p>
                    <div className="landing__mock-bubble">You are not alone.</div>
                  </div>
                </div>
              </div>
              <div className="landing__phone landing__phone--right">
                <div className="landing__phone-frame">
                  <div className="landing__phone-notch" />
                  <div className="landing__phone-screen landing__phone-screen--alt">
                    <div className="landing__mock-dots" />
                    <div className="landing__mock-bubble landing__mock-bubble--user">Today was hard.</div>
                    <div className="landing__mock-bubble">I&apos;m listening.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="landing__footer">
        <Link className="landing__foot-link" href="/terms">
          Terms
        </Link>
        <span className="landing__foot-sep" aria-hidden>
          ·
        </span>
        <Link className="landing__foot-link" href="/privacy">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
