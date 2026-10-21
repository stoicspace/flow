import { ArrowRight, AlertCircle } from "lucide-react";
import type { Article, Block, Section } from "@/lib/docs/articles";
import { GROUP_TITLE, pagerFor } from "@/lib/docs/articles";
import renderText from "@/lib/docs/renderText";
import ProviderTabs from "./ProviderTabs";
import TableOfContents from "./TableOfContents";
import Pager from "./Pager";

function FlowDiagram() {
  const nodes = [
    { label: "Your platform", value: "n8n · Zapier · Make", coral: false },
    { label: "FlowLens", value: "History + diffs", coral: true },
    { label: "Your provider", value: "Your key, your cost", coral: false },
  ];
  return (
    <div className="overflow-hidden rounded-2xl border border-island-border bg-island p-6">
      <p className="text-[12px] text-island-dim">Data flow with your own key</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
        {nodes.map((n, i) => (
          <div key={n.label} className="flex items-center gap-3 sm:gap-4">
            <div
              className={`min-w-[150px] rounded-xl border px-4 py-3 ${
                n.coral
                  ? "border-accent/40 bg-island-soft"
                  : "border-island-border bg-island"
              }`}
            >
              <p
                className={`text-[12px] ${n.coral ? "text-island-accent" : "text-island-dim"}`}
              >
                {n.label}
              </p>
              <p className="mt-0.5 text-[15px] font-bold text-island-text">
                {n.value}
              </p>
            </div>
            {i < nodes.length - 1 && (
              <ArrowRight size={16} className="shrink-0 text-island-dim" />
            )}
          </div>
        ))}
      </div>
      <p className="mt-5 text-[13px] text-island-muted">
        Nothing requires a shared, FlowLens-operated AI service.
      </p>
    </div>
  );
}

function StepRow({ text }: { text: string }) {
  const parts = renderText(text);
  // First node is usually the bolded lead; keep the numbered circle separate.
  const n = StepRow.n++;
  return (
    <div className="flex items-start gap-3.5 rounded-xl bg-surface-2 px-5 py-4">
      <span className="mt-0.5 grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-btn-primary-bg text-[12px] font-semibold text-btn-primary-text">
        {n}
      </span>
      <p className="text-[15px] leading-[23px] text-text-secondary">{parts}</p>
    </div>
  );
}
StepRow.n = 1;
function Steps({ items }: { items: { text: string }[] }) {
  StepRow.n = 1;
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <StepRow key={i} text={it.text} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="mt-3 text-[16px] leading-[26px] text-text-secondary">
          {renderText(block.text)}
        </p>
      );
    case "callout":
      return (
        <div className="flex items-start gap-3 rounded-xl border border-border-warm bg-warn-bg px-5 py-4">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-warn-text" />
          <p className="text-[14px] leading-[21px] text-warn-text">
            <strong className="font-bold">{block.title}</strong> {block.text}
          </p>
        </div>
      );
    case "flow":
      return <FlowDiagram />;
    case "tabs":
      return <ProviderTabs configs={block.configs} />;
    case "steps":
      return <Steps items={block.items} />;
    case "cards":
      return (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {block.items.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-surface p-5">
              <p className="text-[15px] font-bold text-text-primary">{c.title}</p>
              <p className="mt-1.5 text-[14px] leading-[21px] text-text-muted">
                {renderText(c.text)}
              </p>
            </div>
          ))}
        </div>
      );
  }
}

function SectionView({ section }: { section: Section }) {
  return (
    <section id={section.id} className="scroll-mt-28">
      <h2 className="font-heading mt-12 text-[24px] font-bold text-text-primary md:text-[26px]">
        {section.title}
      </h2>
      {section.blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </section>
  );
}

export default function Article({ article }: { article: Article }) {
  const { prev } = pagerFor(article.slug);
  const breadcrumb = [
    { label: "Docs", href: "/docs" },
    ...(article.slug === "docs"
      ? []
      : [
          { label: GROUP_TITLE[article.group], href: undefined as string | undefined },
        ]),
    { label: article.title, href: undefined as string | undefined },
  ];
  const toc = article.sections.map((s) => ({
    id: s.id,
    label: s.tocLabel ?? s.title,
  }));

  return (
    <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1fr)_200px] xl:gap-10">
      <article className="min-w-0">
        <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-text-muted">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden="true">›</span>}
              {b.href ? (
                <a href={b.href} className="transition-colors hover:text-text-primary">
                  {b.label}
                </a>
              ) : (
                <span className="font-medium text-text-primary">{b.label}</span>
              )}
            </span>
          ))}
        </nav>

        <h1 className="font-heading mt-4 text-[34px] font-bold leading-[1.12] tracking-tight text-text-primary sm:text-[40px] md:text-[44px]">
          {article.title}
        </h1>
        <p className="mt-4 text-[17px] leading-[26px] text-text-secondary">
          {article.lead}
        </p>

        {article.intro && (
          <div className="mt-6 space-y-4">
            {article.intro.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </div>
        )}

        {article.sections.map((s) => (
          <SectionView key={s.id} section={s} />
        ))}

        <Pager prev={prev} />
      </article>

      <TableOfContents items={toc} />
    </div>
  );
}
