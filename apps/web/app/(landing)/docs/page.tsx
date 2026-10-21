import type { Metadata } from "next";
import { getArticle } from "@/lib/docs/articles";
import Article from "@/components/docs/Article";

export const metadata: Metadata = {
  title: "Docs | FlowLens",
  description:
    "How FlowLens works: import a workflow, read your first diff, and connect your automation platform.",
};

export default function DocsHome() {
  const article = getArticle("docs")!;
  return <Article article={article} />;
}
