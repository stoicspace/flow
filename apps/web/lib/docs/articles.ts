export type Block =
  | { type: "p"; text: string }
  | { type: "callout"; title: string; text: string }
  | { type: "flow" }
  | {
      type: "tabs";
      configs: { id: string; label: string; text: string }[];
    }
  | { type: "steps"; items: { text: string }[] }
  | { type: "cards"; items: { title: string; text: string }[] };

export interface Section {
  id: string;
  title: string;
  tocLabel?: string;
  blocks: Block[];
}

export interface Article {
  slug: string;
  sidebar: string;
  title: string;
  group: "GET STARTED" | "YOUR DATA & AI" | "INTEGRATIONS";
  lead: string;
  intro?: Block[];
  sections: Section[];
}

export const GROUP_ORDER = ["GET STARTED", "YOUR DATA & AI", "INTEGRATIONS"] as const;

export const GROUP_TITLE: Record<Article["group"], string> = {
  "GET STARTED": "Get started",
  "YOUR DATA & AI": "Your data & AI",
  INTEGRATIONS: "Integrations",
};

export function hrefFor(slug: string) {
  return slug === "docs" ? "/docs" : `/docs/${slug}`;
}

export const articles: Article[] = [
  {
    slug: "docs",
    sidebar: "Introduction",
    title: "Introduction",
    group: "GET STARTED",
    lead: "FlowLens is AI-powered version history for n8n, Zapier, and Make. It snapshots every change and run, explains what changed in plain language, and proposes fixes you review before anything touches your live workflow.",
    sections: [
      {
        id: "what-flowlens-does",
        title: "What FlowLens does",
        blocks: [
          {
            type: "p",
            text: "Every time a workflow changes or runs, FlowLens takes a timestamped snapshot. When something breaks, you compare against the last known-good version and get three things: a diff of what moved, a plain-language explanation of what it means, and a proposed fix you can accept or ignore.",
          },
          {
            type: "p",
            text: "You bring your own AI key: your key, your usage, your cost. Model usage is billed by your provider, and nothing routes through a shared FlowLens-operated AI service unless you choose it to.",
          },
        ],
      },
      {
        id: "start-here",
        title: "Start here",
        blocks: [
          {
            type: "steps",
            items: [
              { text: "**Import a workflow**: connect your platform and pick a workflow to snapshot." },
              { text: "**Read your first diff**: see exactly what changed between two versions." },
              { text: "**Bring your own AI key**: point FlowLens at the provider you already use." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "import-a-workflow",
    sidebar: "Import a workflow",
    title: "Import a workflow",
    group: "GET STARTED",
    lead: "FlowLens starts by importing a workflow and taking its first snapshot. The import is read-only: nothing changes on your platform until you say so.",
    sections: [
      {
        id: "ways-to-import",
        title: "Ways to import",
        blocks: [
          {
            type: "steps",
            items: [
              { text: "**Direct connect**: link a cloud n8n, Zapier, or Make account and pick a workflow." },
              { text: "**Paste JSON import**: export a workflow as JSON and drop it in." },
              { text: "**Automatic sync**: a self-hosted instance can push snapshots as workflows change." },
            ],
          },
        ],
      },
      {
        id: "what-gets-captured",
        title: "What gets captured",
        blocks: [
          {
            type: "p",
            text: "FlowLens records node names, connections, and parameters: the shape of the workflow itself. Credentials are never included, and no code from your platform is executed.",
          },
          {
            type: "p",
            text: "The first import becomes snapshot v1. Every change and run after that adds another point to the history you can diff against.",
          },
        ],
      },
    ],
  },
  {
    slug: "read-your-first-diff",
    sidebar: "Read your first diff",
    title: "Read your first diff",
    group: "GET STARTED",
    lead: "A diff answers one question: what changed since the last time this workflow worked? It is the core view FlowLens opens when a workflow breaks.",
    sections: [
      {
        id: "the-diff-view",
        title: "The diff view",
        blocks: [
          {
            type: "p",
            text: "The diff compares the current snapshot with the last known-good one. Added nodes, removed nodes, changed parameters, and rewired connections are listed structurally, not as raw JSON.",
          },
          {
            type: "p",
            text: "Underneath the structural list, FlowLens writes a plain-language explanation: what the change does functionally, and what it puts at risk, such as missing error handling or a removed retry.",
          },
        ],
      },
      {
        id: "reading-the-markers",
        title: "Reading the markers",
        blocks: [
          {
            type: "cards",
            items: [
              { title: "Added nodes", text: "New nodes or steps that did not exist in the last good version." },
              { title: "Removed or changed", text: "Deleted nodes and parameters whose values moved between versions." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "n8n",
    sidebar: "n8n",
    title: "Connect n8n",
    group: "INTEGRATIONS",
    lead: "FlowLens works with n8n cloud and self-hosted instances the same way. The connection is read-only: it pulls your workflows so every change and run can be snapshotted.",
    sections: [
      {
        id: "connect",
        title: "Connect",
        blocks: [
          {
            type: "steps",
            items: [
              { text: "**Add your instance**: paste the URL of your n8n cloud or self-hosted instance." },
              { text: "**Authenticate**: [SET_UP_CONNECTION]." },
              { text: "**Pick a workflow**: FlowLens imports it and takes the first snapshot." },
            ],
          },
        ],
      },
      {
        id: "what-flowlens-reads",
        title: "What FlowLens reads",
        blocks: [
          {
            type: "p",
            text: "FlowLens reads workflow definitions and execution metadata needed for diffs and explanations. Credentials stay in n8n: FlowLens never stores the secret values it encounters.",
          },
        ],
      },
      {
        id: "self-hosted-n8n",
        title: "Self-hosted n8n",
        blocks: [
          {
            type: "p",
            text: "Self-hosted n8n connects the same way, cloud or not. If your instance is not reachable from the internet, see [Self-hosting & BYOK](/docs/self-hosting) to run FlowLens inside your own network.",
          },
        ],
      },
    ],
  },
  {
    slug: "self-hosting",
    sidebar: "Self-hosting & BYOK",
    title: "Self-hosting & bring your own key",
    group: "YOUR DATA & AI",
    lead: "FlowLens doesn't require you to route your workflow data through a shared AI service you don't control. This guide covers pointing FlowLens at your own provider, or keeping everything on your own infrastructure.",
    intro: [
      {
        type: "callout",
        title: "Design placeholder:",
        text: "setting names and commands below are bracketed placeholders. Swap in the real configuration before publishing.",
      },
    ],
    sections: [
      {
        id: "why-it-works-this-way",
        title: "Why it works this way",
        blocks: [
          {
            type: "p",
            text: "Workflow JSON often contains the shape of your actual business logic: which systems talk to which, what triggers what. That's not something every team wants living in someone else's analytics pipeline by default.",
          },
          { type: "flow" },
        ],
      },
      {
        id: "choose-a-provider",
        title: "1. Choose a provider",
        tocLabel: "Choose a provider",
        blocks: [
          { type: "p", text: "Point FlowLens at any of these. Pick one to see its example configuration." },
          {
            type: "tabs",
            configs: [
              {
                id: "openai",
                label: "OpenAI",
                text: "provider: openai   api_key: [YOUR_OPENAI_KEY]   model: [MODEL_NAME]",
              },
              {
                id: "anthropic",
                label: "Anthropic",
                text: "provider: anthropic   api_key: [YOUR_ANTHROPIC_KEY]   model: [MODEL_NAME]",
              },
              {
                id: "openai-compatible",
                label: "OpenAI-compatible",
                text: "provider: openai-compatible   base_url: [YOUR_ENDPOINT]   api_key: [YOUR_KEY]   model: [MODEL_NAME]",
              },
              {
                id: "self-hosted-model",
                label: "Self-hosted model",
                text: "provider: self-hosted   base_url: [LOCAL_ENDPOINT]   api_key: [OPTIONAL_KEY]   model: [LOCAL_MODEL]",
              },
            ],
          },
        ],
      },
      {
        id: "self-host",
        title: "2. Run FlowLens on your infrastructure",
        tocLabel: "Self-host",
        blocks: [
          {
            type: "p",
            text: "If you'd rather not send workflow data to a third-party model provider at all, the self-hosted path exists for exactly that reason. Pair it with a self-hosted model and nothing leaves your network.",
          },
          {
            type: "steps",
            items: [
              { text: "**Deploy**: [DEPLOY COMMAND]" },
              { text: "**Set your model endpoint** to your own OpenAI- or Anthropic-compatible URL." },
              { text: "**Connect your platform**: cloud or self-hosted n8n connects the same way. [n8n setup →](/docs/n8n)" },
            ],
          },
        ],
      },
      {
        id: "never-on-its-own",
        title: "What FlowLens never does on its own",
        tocLabel: "Never on its own",
        blocks: [
          {
            type: "cards",
            items: [
              { title: "Apply a fix", text: "Suggestions are proposals. You review the diff before anything touches the live workflow." },
              { title: "Require a shared AI service", text: "Your key, your usage, your cost, or a model you host yourself." },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "supported-providers",
    sidebar: "Supported providers",
    title: "Supported providers",
    group: "YOUR DATA & AI",
    lead: "FlowLens talks to models through any OpenAI-compatible or Anthropic-compatible endpoint, including providers you host yourself. The provider choice is yours, per team.",
    sections: [
      {
        id: "cloud-providers",
        title: "Cloud providers",
        blocks: [
          {
            type: "p",
            text: "OpenAI and Anthropic work out of the box: paste an API key, pick a model, and FlowLens uses it for summaries, diffs, reviews, and proposed fixes.",
          },
        ],
      },
      {
        id: "compatible-endpoints",
        title: "OpenAI-compatible endpoints",
        blocks: [
          {
            type: "p",
            text: "Any OpenAI-compatible base URL works: hosted gateways, proxies, or local runtimes. Set the endpoint, key, and model name, and FlowLens sends requests there instead of a first-party API.",
          },
        ],
      },
      {
        id: "self-hosted-models",
        title: "Self-hosted models",
        blocks: [
          {
            type: "p",
            text: "Pair FlowLens with a model running on your own hardware and nothing leaves your network. See [Self-hosting & BYOK](/docs/self-hosting) for the full path.",
          },
        ],
      },
      {
        id: "what-we-never-require",
        title: "What we never require",
        blocks: [
          {
            type: "p",
            text: "Nothing requires a shared, FlowLens-operated AI service. Your workflow data goes to the provider you configured, and your provider bills you directly.",
          },
        ],
      },
    ],
  },
  {
    slug: "zapier",
    sidebar: "Zapier",
    title: "Connect Zapier",
    group: "INTEGRATIONS",
    lead: "FlowLens connects to Zapier through its webhook and polling interfaces. Once connected, every change and run of a tracked Zap is snapshotted for diffing.",
    sections: [
      {
        id: "connect",
        title: "Connect",
        blocks: [
          {
            type: "steps",
            items: [
              { text: "**Add your Zapier workspace** in FlowLens." },
              { text: "**Authorize**: [SET_UP_CONNECTION]." },
              { text: "**Track a Zap**: FlowLens imports it and starts recording history." },
            ],
          },
        ],
      },
      {
        id: "how-sync-works",
        title: "How sync works",
        blocks: [
          {
            type: "p",
            text: "Zapier is push-based: FlowLens receives updates when your Zaps change or run, so history stays current without a polling job.",
          },
        ],
      },
    ],
  },
  {
    slug: "make",
    sidebar: "Make",
    title: "Connect Make",
    group: "INTEGRATIONS",
    lead: "FlowLens connects to Make scenarios the same way it connects to n8n: read-only access, first snapshot on import, history from every change and run after that.",
    sections: [
      {
        id: "connect",
        title: "Connect",
        blocks: [
          {
            type: "steps",
            items: [
              { text: "**Add your Make workspace** in FlowLens." },
              { text: "**Authorize**: [SET_UP_CONNECTION]." },
              { text: "**Pick a scenario**: the import becomes snapshot v1." },
            ],
          },
        ],
      },
      {
        id: "what-gets-snapshotted",
        title: "What gets snapshotted",
        blocks: [
          {
            type: "p",
            text: "Scenario structure, module configuration, and run outcomes are recorded for diffs. Credentials are stripped before anything is stored.",
          },
        ],
      },
    ],
  },
];

export const readingOrder = [
  "docs",
  "import-a-workflow",
  "read-your-first-diff",
  "n8n",
  "self-hosting",
  "supported-providers",
  "zapier",
  "make",
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

export function pagerFor(slug: string): { prev?: Article; next?: Article } {
  const i = readingOrder.indexOf(slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? getArticle(readingOrder[i - 1]) : undefined,
    next: i < readingOrder.length - 1 ? getArticle(readingOrder[i + 1]) : undefined,
  };
}

function blockText(b: Block): string {
  switch (b.type) {
    case "p":
      return b.text;
    case "callout":
      return `${b.title} ${b.text}`;
    case "steps":
      return b.items.map((i) => i.text).join(" ");
    case "cards":
      return b.items.map((i) => `${i.title} ${i.text}`).join(" ");
    case "tabs":
      return b.configs.map((c) => `${c.label} ${c.text}`).join(" ");
    case "flow":
      return "Data flow with your own key Your platform n8n Zapier Make FlowLens History and diffs Your provider Your key your cost";
  }
}

export interface SearchDoc {
  slug: string;
  href: string;
  title: string;
  sidebar: string;
  group: string;
  breadcrumb: string;
  headings: string[];
  text: string;
}

export const searchIndex: SearchDoc[] = articles.map((a) => ({
  slug: a.slug,
  href: hrefFor(a.slug),
  title: a.title,
  sidebar: a.sidebar,
  group: a.group,
  breadcrumb: [
    "Docs",
    ...(a.slug === "docs" ? [] : [GROUP_TITLE[a.group]]),
    a.title,
  ].join(" › "),
  headings: a.sections.map((s) => s.title),
  text: [
    a.lead,
    ...(a.intro ?? []).map(blockText),
    ...a.sections.map((s) => `${s.title} ${s.blocks.map(blockText).join(" ")}`),
  ].join(" "),
}));
