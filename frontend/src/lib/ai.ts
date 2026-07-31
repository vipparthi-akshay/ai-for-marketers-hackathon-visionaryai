import { countWords, readingTimeMinutes, mulberry32, pick, hashString, wordCountToRange } from "./utils";

export type Tone = "professional" | "friendly" | "bold" | "witty" | "inspirational";
export type Format = "blog" | "social" | "ad" | "email" | "seo";

export type ContentInput = {
  product: string;
  audience: string;
  goal: string;
  tone: Tone;
  format: Format;
};

export type GeneratedContent = {
  title: string;
  body: string;
  keywords: string[];
  seoScore: number;
  qualityScore: number;
  suggestions: string[];
  readingMinutes: number;
  wordCount: number;
};

const TONES: Record<Tone, { opener: string; cta: string; signoff: string; headlines: string[] }> = {
  professional: {
    opener: "In today's competitive landscape",
    cta: "Schedule a call with our team",
    signoff: "— The results speak for themselves",
    headlines: ["Outpace the competition", "Built for measurable growth", "The professional's advantage"],
  },
  friendly: {
    opener: "We think you'll love this",
    cta: "Give it a try today",
    signoff: "— with care, from our team",
    headlines: ["Made with you in mind", "A little help goes a long way", "You've got this — we've got you"],
  },
  bold: {
    opener: "Stop wasting time",
    cta: "Take action now",
    signoff: "— no fluff, just results",
    headlines: ["This changes everything", "Get results or get out", "No more excuses"],
  },
  witty: {
    opener: "Be honest — you clicked this for a reason",
    cta: "Let's make it happen",
    signoff: "— yes, we're this good",
    headlines: ["Your competitors are already here", "The smartest click you'll make", "Fancy meeting you here"],
  },
  inspirational: {
    opener: "Imagine what's possible",
    cta: "Start your journey today",
    signoff: "— together, we grow",
    headlines: ["Dream it. Build it. Scale it.", "The future belongs to the bold", "Turn ambition into outcome"],
  },
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function headlinePool(t: Tone, product: string): string[] {
  return TONES[t].headlines.map((h) => `${h}: ${product}`);
}

function openerFor(t: Tone, product: string): string {
  return `${TONES[t].opener}, ${product} is built for marketers who move first.`;
}

function buildBlog(input: ContentInput, rng: () => number): string {
  const { product, audience, goal, tone } = input;
  const t = TONES[tone];
  const hls = headlinePool(tone, product);
  const title = pick(rng, hls);
  const problem = pick(
    rng,
    [
      `Attention is scarce, and generic messages get ignored. If you're responsible for reaching ${audience}, you already know the challenge: more channels, tighter budgets, and higher expectations than ever.`,
      `Most marketing teams juggle a dozen tools and still miss the moments that matter. For ${audience}, the cost of a slow, scattered approach is measured in lost pipeline and wasted spend.`,
      `The bar keeps rising. ${audience} expect relevance, speed, and polish — and teams that can't deliver fall quietly behind.`,
    ]
  );
  const solution = pick(
    rng,
    [
      `${goal}. That's exactly what ${product} helps you achieve — a focused system that turns effort into measurable progress.`,
      `${goal} stops being a stretch goal when the right system does the heavy lifting. ${product} turns fragmented workflows into one reliable motion.`,
      `${product} was built around one question: how do we help ${audience} ${goal.toLowerCase()} without the busywork?`,
    ]
  );
  const points = [
    `${capitalize(product)} removes the guesswork from ${goal.toLowerCase()}, so every action is tied to a measurable outcome.`,
    `Teams using ${product} cut manual effort dramatically and ship campaigns in hours instead of days.`,
    `Built-in analytics surface what's working, so you scale winners and kill losers fast.`,
    `${audience} respond to the right message at the right time — personalization is built in, not bolted on.`,
  ].slice(0, 3 + Math.floor(rng() * 2));

  const steps = [
    `Define your goal: ${goal.toLowerCase()}.`,
    `Let ${product} generate the assets and map the workflow.`,
    `Launch, measure, and let AI recommend the next optimization.`,
    `Scale what works and compound your results.`,
  ].slice(0, 3 + Math.floor(rng() * 2));

  return [
    `## The Problem`,
    problem,
    `## How ${capitalize(product)} Solves It`,
    solution,
    `**Why teams switch:**`,
    points.map((p) => `- ${p}`).join("\n"),
    `## Getting Started in Minutes`,
    steps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
    `## The Bottom Line`,
    `The winners in this space don't do more — they do what matters. ${product} gives ${audience} a clear path from first touch to lasting value. Ready to see it? ${t.cta}.`,
    `${t.signoff}`,
  ].join("\n\n");
}

function buildSocial(input: ContentInput, rng: () => number): string {
  const { product, audience, goal, tone } = input;
  const t = TONES[tone];
  const posts = [
    `${t.opener} — ${product} is here.\n\nBuilt for ${audience}. Made to help you ${goal.toLowerCase()}.\n\n🔗 Link in bio\n#Marketing #Growth #AI`,
    `Big news for ${audience}: ${product} just made ${goal.toLowerCase()} dramatically easier.\n\nSee how it works →\n\n#AItools #MarketingTips #${capitalize(product.replace(/\s/g, ""))}`,
    `Your competitors are already using AI to ${goal.toLowerCase()}. Are you?\n\n${product} levels the playing field for ${audience}.\n\n🚀 Try it free today\n#MarketingAutomation #BusinessGrowth`,
  ];
  return pick(rng, posts);
}

function buildAd(input: ContentInput, rng: () => number): string {
  const { product, audience, goal, tone } = input;
  const t = TONES[tone];
  const hls = headlinePool(tone, product);
  const headline = pick(rng, hls);
  const secondary = pick(rng, [
    `${goal} — without the busywork`,
    `Trusted by ${audience}`,
    `No complex setups, no wasted spend`,
  ]);
  return [
    `Headline: ${headline}`,
    `Secondary headline: ${secondary}`,
    ``,
    `Primary text:`,
    `${product} helps ${audience} ${goal.toLowerCase()} — without the busywork. No complex setups, no wasted spend. Just a system that works while you sleep.`,
    ``,
    `CTA: ${t.cta}`,
  ].join("\n");
}

function buildEmail(input: ContentInput, rng: () => number): string {
  const { product, audience, goal, tone } = input;
  const t = TONES[tone];
  const subject = `${t.opener.replace(/,\s*$/, "")} — ${product}`;
  return [
    `Subject: ${subject}`,
    `Preview: How ${product} helps ${audience} ${goal.toLowerCase()}`,
    ``,
    `Hi there,`,
    ``,
    `If you're part of ${audience}, this email is for you. We built ${product} to help teams like yours ${goal.toLowerCase()}, and early users are already seeing the difference.`,
    ``,
    `Here's how it works in three steps:`,
    `1. Connect your goals.`,
    `2. Let ${product} do the heavy lifting.`,
    `3. Measure the impact and scale what works.`,
    ``,
    `${capitalize(t.cta)} today.`,
    ``,
    `${t.signoff}`,
  ].join("\n");
}

function buildSeo(input: ContentInput, rng: () => number): string {
  const { product, audience, goal, tone } = input;
  const t = TONES[tone];
  const headline = pick(rng, headlinePool(tone, product));
  return [
    `Meta title: ${headline} (under 60 chars)`,
    ``,
    `Meta description:`,
    `Discover how ${product} helps ${audience} ${goal.toLowerCase()}. A practical, AI-powered approach to results — get started in minutes.`,
    ``,
    `URL slug: /${product.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}-for-${audience.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`,
    ``,
    `H1 suggestion: ${headline}`,
    ``,
    `Keywords: ${product}, ${audience}, ${goal.toLowerCase()}, marketing automation, AI marketing, growth marketing`,
    ``,
    `Alt text suggestions:`,
    `- Screenshot of ${product} dashboard showing campaign results`,
    `- Team workflow diagram powered by ${product}`,
  ].join("\n");
}

export function generateContent(input: ContentInput): GeneratedContent {
  const rng = mulberry32(hashString(`${input.product}|${input.audience}|${input.goal}|${input.tone}|${input.format}|${Date.now()}`));
  const { product, audience, goal } = input;

  let title: string;
  let body: string;

  switch (input.format) {
    case "blog":
      title = pick(rng, headlinePool(input.tone, product));
      body = buildBlog(input, rng);
      break;
    case "social":
      title = "Social Post";
      body = buildSocial(input, rng);
      break;
    case "ad":
      title = "Ad Copy — " + pick(rng, headlinePool(input.tone, product));
      body = buildAd(input, rng);
      break;
    case "email":
      title = "Email Campaign";
      body = buildEmail(input, rng);
      break;
    case "seo":
      title = "SEO Meta + Content Brief";
      body = buildSeo(input, rng);
      break;
  }

  const keywords = [
    product,
    audience,
    goal.toLowerCase(),
    "marketing automation",
    pick(rng, ["AI marketing", "growth marketing", "digital strategy", "campaign optimization"]),
  ].filter((k) => k.length > 2);

  return {
    title,
    body,
    keywords,
    seoScore: computeSeoScore(title, body, keywords, input.format),
    qualityScore: computeQualityScore(title, body, input.format),
    suggestions: computeSuggestions(title, body, keywords, input.format),
    readingMinutes: readingTimeMinutes(countWords(`${title}\n${body}`)),
    wordCount: countWords(`${title}\n${body}`),
  };
}

export function computeSeoScore(title: string, body: string, keywords: string[], format: Format): number {
  let score = 0;
  const all = `${title}\n\n${body}`.toLowerCase();

  if (title.length >= 40 && title.length <= 70) score += 20;
  else if (title.length > 0) score += 10;

  const words = countWords(`${title}\n${body}`);
  const target = format === "blog" ? 400 : format === "email" ? 200 : 100;
  if (words >= target) score += 20;
  else score += Math.max(0, Math.round((words / target) * 20));

  let kwHits = 0;
  for (const kw of keywords.slice(0, 3)) {
    if (all.includes(kw.toLowerCase())) kwHits++;
  }
  score += kwHits * 10;

  const headings = (body.match(/^#{1,3}\s/gm) || []).length;
  if (headings >= 2) score += 15;
  else if (headings === 1) score += 8;

  if (/\*\*[^*]{4,}\*\*/.test(body)) score += 5;
  if (/(^|\n)- /.test(body)) score += 5;
  if (/(^|\n)\d+\. /.test(body)) score += 5;

  const callToAction = /(cta:|try |sign up|start |get started|schedule|book|request)/i.test(all);
  if (callToAction) score += 10;

  return Math.min(100, score);
}

export function computeQualityScore(title: string, body: string, format: Format): number {
  let score = 60;
  const words = countWords(`${title}\n${body}`);
  const range = wordCountToRange(words);

  if (range === "long") score += 15;
  else if (range === "medium") score += 10;
  else score += 3;

  const sentences = body.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const avgSentenceLen = sentences > 0 ? words / sentences : 0;
  if (avgSentenceLen >= 8 && avgSentenceLen <= 22) score += 10;
  else score += 4;

  if (/(^|\n)#{2,3} /m.test(body)) score += 5;
  if (/(\*\*|^- |^\d+\. )/m.test(body)) score += 5;

  const longWords = (body.match(/\b\w{10,}\b/g) || []).length;
  if (longWords <= 8) score += 5;

  if (format !== "blog") score = Math.min(score + 5, 100);

  return Math.min(100, Math.max(40, score));
}

export function computeSuggestions(title: string, body: string, keywords: string[], format: Format): string[] {
  const suggestions: string[] = [];
  const words = countWords(`${title}\n${body}`);

  if (format === "blog" && words < 400) suggestions.push("Expand the post past 400 words — longer, structured content tends to rank better.");
  if (title.length > 70) suggestions.push("Shorten the title to under 70 characters to avoid truncation in search results.");
  if (title.length < 35) suggestions.push("Make the title more descriptive — 40–70 characters performs best for SEO.");
  if (!/(^|\n)#{2,3} /m.test(body)) suggestions.push("Add subheadings to break up the copy and improve readability.");
  if (!/[\w-]+\s*:\s*/.test(body)) suggestions.push("Add a clear call to action so readers know exactly what to do next.");
  if (keywords.length >= 3) suggestions.push(`Ensure the primary keyword "${keywords[1]}" appears in the first paragraph.`);
  if (!/(\*\*|^- |^\d+\. )/m.test(body)) suggestions.push("Use short paragraphs, bullet points, and bold text to keep scannability high.");
  suggestions.push("Split-test the CTA copy — a simple wording change can lift conversion by double digits.");
  if (suggestions.length < 3) suggestions.push("Add a social proof element (testimonial or stat) near the call to action.");
  return suggestions.slice(0, 5);
}

export type EditOp = "improve" | "rewrite" | "summarize" | "expand" | "regenerate";

export function applyEdit(body: string, op: EditOp, seed: string): string {
  const rng = mulberry32(hashString(seed + op));
  const paragraphs = body.split(/\n\n+/).filter((p) => p.trim().length > 0);

  switch (op) {
    case "improve": {
      const target = pick(rng, paragraphs.filter((p) => p.trim().length > 40)) ?? paragraphs[0];
      const improved = target
        .replace(/\bvery\b/gi, pick(rng, ["highly", "genuinely", "remarkably"]))
        .replace(/\breally\b/gi, pick(rng, ["truly", "demonstrably"]))
        .replace(/\bgood\b/gi, pick(rng, ["strong", "compelling", "effective"]))
        .replace(/\bgreat\b/gi, pick(rng, ["outstanding", "exceptional"]));
      return improved !== target ? improved : target + ` ${capitalize(pick(rng, ["That clarity compounds across every touchpoint.", "Small refinements create outsized results.", "Consistency is the real competitive edge."]))}`;
    }
    case "rewrite":
      return paragraphs
        .map((p, i) => {
          if (i === 0 || p.trim().length < 30) return p;
          return `${capitalize(pick(rng, ["What makes this worth your time:", "Here is the short version:", "The practical takeaway:"]))} ${p.replace(/^[A-Za-z][^:]{0,40}:\s*/, "")}`;
        })
        .join("\n\n");
    case "summarize": {
      const main = paragraphs.find((p) => p.trim().length > 60) ?? paragraphs[0];
      const words = main.split(/\s+/);
      const summary = words.length > 45 ? words.slice(0, 45).join(" ") + "…" : main;
      return [`**In short:** ${summary}`, "", `The key insight: focus your effort on ${pick(rng, ["the highest-leverage channel", "the offer your best segment responds to", "consistency over intensity"])} and let the data guide the rest.`].join("");
    }
    case "expand": {
      const extra = [
        `Consider the practical details: how ${pick(rng, ["timing", "segmentation", "the offer itself"])} shifts the outcome. In practice, teams see the biggest lift when they remove friction at ${pick(rng, ["the first click", "the signup form", "the final checkout step"])}.`,
        `That's the pattern we observe across hundreds of campaigns: the ones that win are the ones that keep the message focused and the next step obvious.`,
      ];
      return `${body}\n\n${pick(rng, extra)}`;
    }
    case "regenerate":
      return paragraphs.length > 1
        ? [paragraphs[0], capitalize(pick(rng, [
            "A different angle worth testing: flip the framing from problem to opportunity and see how the message lands.",
            "Another approach: lead with the outcome, then back it up with the mechanism, then close with the call to action.",
            "Try leading with social proof before the promise — credibility up front converts skeptics.",
          ])), ...paragraphs.slice(1)].join("\n\n")
        : body;
  }
}

export function applyToneChange(body: string, tone: Tone, product: string): string {
  const t = TONES[tone];
  return `${t.opener} — ${product}.\n\n${body.replace(/^[^\n]{0,120}\n{0,1}/, "")}`.trim();
}

/* ---------- Ads prediction ---------- */
export function predictRoas(budget: number, historicalRoas: number): number {
  const drift = Math.max(0.75, Math.min(1.6, 0.92 + budget / 20000));
  return historicalRoas * drift;
}

export function predictCtr(baseCtr: number): number {
  return baseCtr * (0.95 + Math.min(0.2, baseCtr / 40));
}

export function projectRevenue(days: number, monthlyRevenue: number, growthPct: number): number[] {
  const out: number[] = [];
  for (let i = 1; i <= days; i++) {
    const factor = Math.pow(1 + growthPct / 100, i / 30);
    out.push(Math.round(monthlyRevenue * factor * (i / 30)));
  }
  return out;
}

/* ---------- Personalization ---------- */
export type Variant = {
  headline: string;
  body: string;
  cta: string;
  confidence: number;
  predictedCtr: number;
  predictedConv: number;
};

export function generateVariant(segmentName: string, rule: string, product: string, goal: string, rng: () => number): Variant {
  const conf = 72 + Math.round(rng() * 24);
  const ctr = +(2.5 + rng() * 5).toFixed(1);
  const conv = +(3 + rng() * 9).toFixed(1);
  const headline = pick(
    rng,
    [
      `${product}, tailored to ${rule.toLowerCase()}`,
      `Built for ${segmentName}: ${goal.toLowerCase()}`,
      `This one's for ${segmentName.toLowerCase()}`,
      `${goal} has never been this personal`,
    ]
  );
  const body = pick(
    rng,
    [
      `Hi there — you're part of ${segmentName}, so this offer is shaped around what ${rule.toLowerCase()} actually care about.`,
      `We studied what works for ${rule.toLowerCase()}, and built this experience around you. No generic copy — just what matters.`,
      `Most messages get ignored. This one was designed for ${segmentName} — because ${rule.toLowerCase()} deserves a real fit.`,
    ]
  );
  const cta = pick(rng, [`Get ${goal.toLowerCase()}`, "Claim my offer", "See my results", "Start now"]);
  return { headline, body, cta, confidence: conf, predictedCtr: ctr, predictedConv: conv };
}
