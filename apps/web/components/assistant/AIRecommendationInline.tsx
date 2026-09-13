// ─────────────────────────────────────────────────────────────
// src/components/assistant/AIRecommendationInline.tsx
// Inline recommendation box that appears inside an AI message
// ─────────────────────────────────────────────────────────────

export default function AIRecommendationInline({ text }: { text: string }) {
  return (
    <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-lg px-4 py-3 mt-3">
      <p className="text-xs font-semibold text-brand-orange mb-1">⚐ AI Recommendation</p>
      <p className="text-xs text-text-muted leading-relaxed">{text}</p>
    </div>
  );
}


