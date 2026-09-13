"use client";

import { useState } from "react";

export default function CallTA() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  async function joinWaitlist() {
    if (!email) return;

    setLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Thanks for joining waitlist! Stay Tuned.");
        setEmail("");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 sm:py-24 md:py-32" id="cta">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] md:rounded-[40px] border border-border-light bg-surface-2 p-8 sm:p-12 md:p-16">
          <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-brand-orange/15 blur-3xl" />

          <div className="relative z-10 text-center">
            <h2 className="mt-8 text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary">
              Stop guessing.
              <br />
              Start understanding.
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base text-text-muted">
              Every minute spent debugging is a minute your automation
              isn&apos;t working. Join FlowLens and be among the
              first to debug AI workflows.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-4 max-w-md sm:max-w-none mx-auto">
              {/* <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full sm:w-80 rounded-xl border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted outline-none transition focus:border-brand-orange"
              /> */}

              <a href="/login">
                <button
                
                disabled={loading}
                className="w-full sm:w-auto rounded-xl bg-brand-orange px-8 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? "Redirecting..." : "Get Started"}
              </button>
              </a>
            </div>

            {message && (
              <p className="mt-6 text-sm font-medium text-status-success">{message}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}