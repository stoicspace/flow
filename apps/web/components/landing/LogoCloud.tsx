const companies: string[] = [
  "Google",
  "Microsoft",
  "OpenAI",
  "AWS",
  "GitHub",
  "Stripe",
  "Vercel",
  "Cloudflare",
];

export default function LogoCloud() {
  return (
    <section className="py-16 sm:py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center uppercase tracking-[3px] sm:tracking-[6px] text-gray-500 text-xs sm:text-sm mb-8 sm:mb-12">
          Trusted by modern teams
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-8">
          {companies.map((company) => (
            <div
              key={company}
              className="rounded-2xl border border-white/5 bg-white/[0.03] py-4 sm:py-6 px-2 text-center text-text-muted transition duration-300 hover:border-brand/40 hover:bg-brand-orange/10 hover:text-text-primary  "
            >
              <span className="font-semibold tracking-wide text-sm sm:text-base">{company}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}