import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms — He listens.",
  description: "Terms of use for He listens.",
};

export default function TermsPage() {
  return (
    <div className="legal-page">
      <Link className="legal-page__back" href="/landing">
        ← Back
      </Link>
      <article className="legal-page__article">
        <h1>Terms</h1>
        <p>
          He listens is offered as-is for personal reflection and comfort. By using the app, you agree to use it
          respectfully and lawfully. We may update these terms; continued use means you accept the current version.
        </p>
        <p>For questions, contact the team behind He listens through your app store listing or support channel.</p>
      </article>
    </div>
  );
}
