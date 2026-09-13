/**
 * Merge this into your existing tailwind.config.{ts,js} under theme.extend.colors.
 * Replaces the ad-hoc emerald-300 / green-400 / lime-700 / raw hex mix that was
 * scattered across every component with a single named palette.
 *
 * Usage after merging: bg-brand, text-brand, border-brand/40, bg-surface, etc.
 */
export const brandColors = {
  brand: {
    DEFAULT: "#6EE7B7", // was emerald-300
    dark: "#4D7C0F", // was lime-700, used in gradients
  },
  success: "#4ADE80", // was green-400
  danger: "#F87171", // was red-400
  surface: {
    DEFAULT: "#161222", // card background, was bg-[#161222]
    alt: "#1B162D", // was bg-[#1b162d] / #1c1730
    deep: "#100D1C", // was bg-[#100D1C], UseCases section bg
  },
};

// tailwind.config.ts
// export default {
//   theme: {
//     extend: {
//       colors: brandColors,
//     },
//   },
// };
