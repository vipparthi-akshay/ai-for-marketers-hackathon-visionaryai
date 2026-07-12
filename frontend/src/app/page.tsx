import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg" />
            <span className="text-xl font-bold">MarketPilot AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            AI-Powered Marketing Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            The Autonomous
            <br />
            <span className="gradient-text">AI Marketing Team</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Enter your business once. AI automatically builds your entire marketing operation
            — content, SEO, ads, campaigns, analytics, and more.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-lg"
            >
              Start Free
            </Link>
            <Link
              href="/login"
              className="border border-border px-8 py-3 rounded-lg font-medium hover:bg-muted transition-colors text-lg"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-center mb-16">10 AI Modules. One Platform.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod) => (
              <div
                key={mod.title}
                className="p-6 rounded-xl border border-border/50 bg-card card-hover"
              >
                <div className="text-3xl mb-4">{mod.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{mod.title}</h3>
                <p className="text-sm text-muted-foreground">{mod.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-24">
          <div className="glass rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of businesses using AI to automate their marketing.
              Start in under 3 minutes.
            </p>
            <Link
              href="/register"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity text-lg inline-block"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          MarketPilot AI — Built for HackIndia 2026
        </div>
      </footer>
    </div>
  );
}

const modules = [
  { icon: "🧠", title: "Business Analyzer", description: "AI-powered SWOT analysis, growth recommendations, and marketing strategy." },
  { icon: "👥", title: "Persona Generator", description: "Auto-generate detailed customer personas with demographics and behaviors." },
  { icon: "✍️", title: "Content Engine", description: "Generate blogs, social posts, emails, ads, and 15+ content types." },
  { icon: "📊", title: "Campaign Builder", description: "Complete campaign strategies with timelines, KPIs, and content calendars." },
  { icon: "⚙️", title: "Marketing Automation", description: "Visual workflow builder with email sequences and lead nurturing." },
  { icon: "📢", title: "Ads Optimization", description: "Google, Meta, and LinkedIn ads with CTR prediction and A/B testing." },
  { icon: "🔍", title: "SEO Engine", description: "Keyword research, meta tags, audits, and competitor SEO analysis." },
  { icon: "🏢", title: "Competitor Intelligence", description: "Analyze competitors and identify marketing gaps and opportunities." },
  { icon: "📈", title: "Analytics Dashboard", description: "ROI predictions, growth graphs, conversion funnels, and insights." },
  { icon: "🎯", title: "Personalization Engine", description: "Dynamic content, personalized emails, and segment-specific messaging." },
];
