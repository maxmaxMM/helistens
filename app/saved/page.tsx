"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SavedVerse = {
  text: string;
  reference: string;
  createdAt: number;
};

export default function SavedPage() {
  const [items, setItems] = useState<SavedVerse[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedVerses");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setItems(
          parsed.filter(
            (it): it is SavedVerse =>
              typeof it?.text === "string" &&
              typeof it?.reference === "string" &&
              typeof it?.createdAt === "number"
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
        localStorage.setItem("savedVerses", JSON.stringify(next));
      } catch {
        // Ignore storage write failures and still update UI state.
      }
      return next;
    });
  }

  return (
    <main className="main">
      <Link href="/" className="saved-link" aria-label="Back to chat">
        ← Back
      </Link>

      <h1>Saved</h1>
      <p className="sub">Verses you kept close.</p>

      {items.length === 0 ? (
        <p className="saved-empty">No saved verses yet</p>
      ) : (
        items.map((item, idx) => (
          <div className="card saved-card" key={`${item.reference}-${item.createdAt}-${idx}`}>
            <button
              type="button"
              className="saved-card-delete"
              onClick={() => handleDelete(idx)}
              aria-label={`Delete saved verse ${idx + 1}`}
            >
              ✕
            </button>
            <p className="verse-text">"{item.text}"</p>
            <span className="verse-ref">— {item.reference}</span>
          </div>
        ))
      )}
    </main>
  );
}
