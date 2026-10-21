import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articles, getArticle, hrefFor } from "@/lib/docs/articles";
import Article from "@/components/docs/Article";

export function generateStaticParams() {
  return articles
    .filter((a) => a.slug !== "docs")
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: `${article.title} | FlowLens Docs`,
    description: article.lead,
    alternates: { canonical: hrefFor(slug) },
  };
}

export default async function DocsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || article.slug === "docs") notFound();
  return <Article article={article} />;
}
