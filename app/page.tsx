import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { Footer } from "@/components/Footer";
import { LiveMark } from "@/components/LiveMark";
import { ArrowUpRight, BarChart3, Check, Globe2, Instagram, Link2, Music2, QrCode, ShieldCheck, Sparkles, Youtube } from "lucide-react";

const FEATURES = [
  { icon: Link2, title: "Unlimited links, from link one", body: "No 5-link ceiling, no 'upgrade to add more'. Add as many destinations as your work needs, today." },
  { icon: Globe2, title: "Your own domain, included", body: "Point yourname.com at your CRbio page. Elsewhere this sits behind a monthly plan — here it's part of the free tier." },
  { icon: BarChart3, title: "Analytics that mean something", body: "Clicks per link, visits over time, country, device, and referrer — the numbers you need to know what's working." },
  { icon: QrCode, title: "Built-in QR code", body: "Every profile gets a scannable, downloadable QR code automatically — for menus, posters, and packaging." },
  { icon: ShieldCheck, title: "No expiring free tier", body: "This isn't a 14-day trial. The full feature set stays free for as long as CRbio exists — that's the promise." },
  { icon: Sparkles, title: "An AI assistant, a shop, and booking — built in", body: "A self-contained chat widget, digital product sales, and appointment booking, all without extra tools or fees." },
];

const STEPS = [
  { n: "01", title: "Claim your handle", body: "crbio.app/yourname — reserved the moment you sign up, no waitlist." },
  { n: "02", title: "Add your links", body: "Drag to reorder, toggle on and off, and organize what visitors see first." },
  { n: "03", title: "Style it, share it", body: "Pick a theme, drop the link (or QR code) anywhere your audience already is." },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grain-glow" />
      <div className="pointer-events-none absolute left-1/2 top-16 -translate-x-1/2 sm:top-4">
        <LiveMark />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-mist md:flex">
          <a href="#features" className="transition-colors hover:text-white">Features</a>
          <a href="#how" className="transition-colors hover:text-white">How it works</a>
          <a href="#compare" className="transition-colors hover:text-white">Compare</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-mist transition-colors hover:text-white sm:block">Log in</Link>
          <Link href="/signup" className="btn-primary !px-5 !py-2.5 text-sm">Claim your handle</Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-24 pt-12 md:grid-cols-2 md:pt-20">
        <div className="animate-fade-up">
          <span className="label-eyebrow inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            Every paid feature, free — permanently
          </span>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] text-balance text-white sm:text-6xl">
            One link.<br /><span className="italic text-violet-soft">Everything</span> you make.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-mist">
            CRbio is the link-in-bio page other platforms charge you for — custom domains, real analytics, unlimited links, AI chat, and a built-in shop.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="btn-primary">Create your CRbio<ArrowUpRight className="h-4 w-4" /></Link>
            <a href="#compare" className="btn-secondary">See what's included</a>
          </div>
          <p className="mt-6 text-xs text-mist/70">No credit card. No trial countdown. Built by <span className="text-mist">CR Digital Enterprises</span>.</p>
        </div>

        <div className="relative mx-auto w-full max-w-[300px] animate-fade-up [animation-delay:150ms]">
          <div className="glass-panel relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -inset-24 bg-[radial-gradient(circle_at_50%_0%,rgba(124,108,246,0.15),transparent_60%)]" />
            <div className="relative flex flex-col items-center text-center">
              <div className="relative h-20 w-20">
                {/* Static gradient ring — a steady mark of quality, not a
                    looping spinner. Confidence reads as stillness. */}
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,#7C6CF6,#F0B429,#7C6CF6)] [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),#000_calc(100%-2px))]" />
                <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-ink font-display text-xl text-white">NC</div>
              </div>
              <p className="mt-4 font-display text-lg text-white">Nova Cafe</p>
              <p className="mt-1 text-xs leading-relaxed text-mist">Small-batch coffee, Lahore. New menu drops every Friday.</p>
              <div className="mt-6 w-full space-y-2.5">
                {[{ icon: Instagram, label: "Instagram" }, { icon: Music2, label: "This week's playlist" }, { icon: Youtube, label: "Behind the counter" }].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left text-xs font-medium text-white/90">
                    <item.icon className="h-3.5 w-3.5 text-violet-soft" />{item.label}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex w-full items-center justify-between border-t border-white/10 pt-4 text-[10px] font-mono text-mist">
                <span>1,204 visits</span><span>crbio.app/novacafe</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal className="max-w-xl">
          <span className="label-eyebrow">Everything included</span>
          <h2 className="mt-3 font-display text-3xl font-medium text-white sm:text-4xl">The paid tier, minus the paywall.</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.08} className="glass-panel p-6 transition-colors hover:bg-white/[0.07]">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-violet/15 text-violet-soft"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-4 font-display text-lg text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <span className="label-eyebrow">The setup</span>
          <h2 className="mt-3 font-display text-3xl font-medium text-white sm:text-4xl">Live in under three minutes.</h2>
        </Reveal>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1} className="relative">
              <span className="font-display text-4xl text-white/15">{s.n}</span>
              <h3 className="mt-3 font-display text-xl text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="compare" className="relative z-10 mx-auto max-w-4xl px-6 py-20">
        <Reveal className="text-center">
          <span className="label-eyebrow">Side by side</span>
          <h2 className="mt-3 font-display text-3xl font-medium text-white sm:text-4xl">What's usually locked behind a plan</h2>
        </Reveal>
        <Reveal delay={0.1} className="glass-panel mt-10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-mist">
                <th className="px-6 py-4 font-medium">Feature</th>
                <th className="px-6 py-4 text-center font-medium">Typical free tier</th>
                <th className="px-6 py-4 text-center font-medium text-gold">CRbio</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Number of links", "Limited (often 5)", "Unlimited"],
                ["Custom domain", "Paid add-on", "Included"],
                ["Click analytics", "Basic totals only", "Country, device, referrer"],
                ["AI chat widget", "Not offered", "Built in, self-contained"],
                ["Digital product sales", "Not offered", "Built in"],
                ["Booking / appointments", "Not offered", "Built in"],
                ["Ongoing cost", "Free tier expires or caps", "Free, no cap"],
              ].map((row, i) => (
                <tr key={row[0]} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                  <td className="px-6 py-4 text-white/90">{row[0]}</td>
                  <td className="px-6 py-4 text-center text-mist">{row[1]}</td>
                  <td className="px-6 py-4 text-center font-medium text-white">
                    <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-gold" />{row[2]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <p className="mt-4 text-center text-xs text-mist/70">General comparison based on publicly listed free-tier limits of common link-in-bio tools, for illustration.</p>
      </section>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
        <Reveal className="glass-panel relative overflow-hidden p-12 text-center">
          <div className="pointer-events-none absolute -inset-32 bg-[radial-gradient(circle_at_50%_0%,rgba(240,180,41,0.10),transparent_60%)]" />
          <h2 className="relative font-display text-3xl font-medium text-white sm:text-4xl">Your handle is still available.</h2>
          <p className="relative mx-auto mt-3 max-w-md text-mist">crbio.app/yourname — claim it before someone else does.</p>
          <Link href="/signup" className="btn-gold relative mt-8 inline-flex">Get started — it's free<ArrowUpRight className="h-4 w-4" /></Link>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
