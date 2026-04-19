import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — He listens.",
  description: "Privacy information for He listens.",
};

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <Link className="legal-page__back" href="/landing">
        ← Back
      </Link>
      <article className="legal-page__article">
        <h1>Privacy</h1>
        <p>
          He listens is designed to feel private. We treat what you share in the app with care and aim to collect only
          what is needed to run the service reliably.
        </p>
        <p>
          Details depend on your platform (iOS or Android) and app version. Check in-app notices and your device
          settings for the most accurate picture of data used on your device.
        </p>
        <p>For privacy requests, use the contact option provided with the app listing.</p>
      </article>
    </div>
  );
}
