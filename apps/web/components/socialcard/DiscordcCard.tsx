"use client";

import { MessageSquare, Mail, ExternalLink } from "lucide-react";

const DISCORD_INVITE = "https://discord.gg/f2B6hamNMX";
const EMAIL = "spacestoic7@gmail.com"; 
const SUBJECT = "FlowLens Feedback";
const BODY = `Hi FlowLens Team,

I'd like to share the following feedback:

`;

export default function DiscordFeedbackCard() {
  return (
    <section
      id="feedback"
      className="mb-10 max-w-3xl mx-auto rounded-2xl border border-border bg-surface overflow-hidden"
    >
      {/* Header */}
      <div className="px-8 sm:px-16 py-16 text-center border-b border-border">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-orange/10 border border-brand-orange/20">
          <MessageSquare className="h-7 w-7 text-brand-orange" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">
          We'd love your feedback
        </h2>

        <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg text-text-muted">
          Found a bug, have an idea, or want to help shape FlowLens? We'd love
          to hear from you.
        </p>

        {/* Contact Options */}
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 py-3 font-medium text-white transition hover:brightness-110"
          >
            <MessageSquare size={18} />
            Join Discord
            <ExternalLink size={16} />
          </a>

          <a
            href={`mailto:${EMAIL}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(BODY)}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-6 py-3 font-medium text-text-primary transition hover:bg-surface-3"
          >
            <Mail size={18} />
            Email
          </a>
        </div>

        <p className="mt-6 text-sm text-text-muted">
          We usually respond within 1 to 48 hours.
        </p>
      </div>
    </section>
  );
}