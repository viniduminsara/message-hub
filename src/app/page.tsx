import Link from "next/link"
import { auth } from "@/auth"
import { AuthButton } from "@/components/auth-button"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <span className="text-primary-foreground font-bold text-xs">MH</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">MessageHub</span>
          </Link>
          <nav className="flex items-center gap-3">
            {session?.user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="default" size="sm" className="h-8 text-xs">
                    Dashboard
                  </Button>
                </Link>
                <AuthButton />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm" className="h-8 text-xs shadow-lg shadow-primary/20">
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="pt-14">
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
            <div className="absolute top-1/3 right-1/4 size-[300px] rounded-full bg-primary/3 blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 md:pt-32 md:pb-28">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-muted/50 text-xs text-muted-foreground mb-8">
                <span className="size-1.5 rounded-full bg-primary animate-pulse-glow" />
                Developer-first form management
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.05]">
                One inbox for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-300">
                  every contact form
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
                Aggregate submissions from all your forms into a single dashboard.
                Create an endpoint, point your forms at it, and never miss a message.
              </p>
              {!session?.user && (
                <div className="mt-10 flex items-center gap-4">
                  <Link href="/register">
                    <Button
                      variant="default"
                      size="lg"
                      className="h-11 px-7 text-sm font-medium shadow-xl shadow-primary/25"
                    >
                      Start collecting messages
                      <svg className="ml-2 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="h-11 px-7 text-sm font-medium">
                      Sign in
                    </Button>
                  </Link>
                </div>
              )}
              <div className="mt-16 w-full max-w-2xl">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-blue-500/20 to-cyan-300/30 rounded-xl blur opacity-50 group-hover:opacity-75 transition duration-500" />
                  <div className="relative bg-[#0d0d0d] border border-border/50 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/50 bg-muted/30">
                      <span className="size-2.5 rounded-full bg-red-500/80" />
                      <span className="size-2.5 rounded-full bg-yellow-500/80" />
                      <span className="size-2.5 rounded-full bg-green-500/80" />
                      <span className="ml-2 text-[11px] text-muted-foreground font-mono">POST /api/forms/abc123def456/submit</span>
                    </div>
                    <pre className="p-4 overflow-x-auto text-sm text-left">
                      <code className="font-mono text-[13px] leading-relaxed">
                        <span className="text-purple-400">fetch</span>(<span className="text-amber-300/90">&quot;https://messagehub.viniduminsara.dev/forms/abc123def456/submit&quot;</span>, {"{"}
                        <br />
                        &nbsp;&nbsp;<span className="text-purple-400">method</span>: <span className="text-green-400/90">&quot;POST&quot;</span>,
                        <br />
                        &nbsp;&nbsp;<span className="text-purple-400">headers</span>: {"{"} <span className="text-purple-400">Content-Type</span>: <span className="text-green-400/90">&quot;application/json&quot;</span> {"}"},
                        <br />
                        &nbsp;&nbsp;<span className="text-purple-400">body</span>: <span className="text-purple-400">JSON</span>.<span className="text-blue-400">stringify</span>({"{"}
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300/80">name</span>: <span className="text-green-400/90">&quot;Jane Doe&quot;</span>,
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300/80">email</span>: <span className="text-green-400/90">&quot;jane@example.com&quot;</span>,
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300/80">subject</span>: <span className="text-green-400/90">&quot;Partnership inquiry&quot;</span>,
                        <br />
                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-300/80">message</span>: <span className="text-green-400/90">&quot;Hi, I&apos;d love to discuss...&quot;</span>,
                        <br />
                        &nbsp;&nbsp;{"}"})
                        <br />
                        {"}"});
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <section className="border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                ["Zero config", "Create once, use anywhere"],
                ["Real-time", "Messages in seconds"],
                ["Unlimited forms", "No cap on endpoints"],
                ["Open source", "Self-host anytime"],
              ].map(([stat, label]) => (
                <div key={stat} className="text-center">
                  <div className="text-lg font-semibold tracking-tight">{stat}</div>
                  <div className="text-sm text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Everything you need in one place
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                No SDKs, no webhooks, no configuration headaches.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Instant API Endpoint",
                  desc: "Each form gets a unique URL. Just POST JSON to it — no SDKs, no config, no headaches.",
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  ),
                },
                {
                  title: "Unified Inbox",
                  desc: "All messages from all forms in one place. Search, filter, sort — treat form submissions like email.",
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  ),
                },
                {
                  title: "Real-time Updates",
                  desc: "Messages appear instantly. Unread counter keeps you on top of new submissions as they arrive.",
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="relative group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/20 transition-all duration-300"
                >
                  <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <svg className="size-4.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-border/50 py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Two steps to get started
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                From zero to receiving messages in under a minute.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  title: "Create a form",
                  desc: "Give it a name. We generate a unique API endpoint automatically.",
                },
                {
                  step: "02",
                  title: "POST data to it",
                  desc: "Send any JSON payload. We extract name, email, and subject if present.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-xl border border-border/50 bg-card"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[11px] font-semibold text-primary tracking-widest">{item.step}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
              <div className="relative px-8 py-14 md:py-20 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                  Ready to simplify your forms?
                </h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Create your first form in seconds. No credit card required.
                </p>
                {!session?.user && (
                  <Link href="/register">
                    <Button
                      variant="default"
                      size="lg"
                      className="h-11 px-7 text-sm font-medium shadow-xl shadow-primary/25"
                    >
                      Create your first form
                      <svg className="ml-2 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="size-6 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-[9px]">MH</span>
              </div>
              <span className="text-xs text-muted-foreground">
                MessageHub &mdash; One inbox for every contact form
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
              <Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
