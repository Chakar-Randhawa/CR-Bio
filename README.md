# CRbio

A free link-in-bio platform. Built by CR Digital Enterprises.

Stack: **Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase (Auth, Postgres, Storage)**.

---

## 1. What's included

**Phase 1 — Core Foundation**
- Email/password + Google auth, protected dashboard routes, password reset
- Username claim flow with live availability checking
- Drag-and-drop link builder, platform auto-icon detection
- Public SEO-optimized bio page, downloadable QR code
- Analytics (clicks, views, 14-day trend), account settings

**Phase 2 — Design & Customization Engine**
- 8 signature dark-glassmorphism themes, plus custom gradients, image, and video backgrounds
- 6 runtime-loaded font pairings
- Button style/shape/animation engine
- Mobile-first device-frame live preview while editing

**Phase 3 — "Paid Features, But Free"**
- Advanced analytics: clicks/views by country (via edge geolocation headers), device, referrer, selectable date range
- Unlimited blocks, no cap
- Free custom domain connect with real DNS verification
- Link/block scheduling (auto show/hide by date-time)
- Email lead-capture blocks with CSV export
- YouTube/Spotify/TikTok embeds, social icon-only link style

**Phase 4 — The Advance Layer**
- **AI chatbot widget** — self-contained keyword-matching Q&A, no external LLM API, no per-message cost
- **Digital product blocks** — free/gated downloads (email-gated, hosted on your own Supabase storage) or external checkout links (Stripe Payment Links, Gumroad, Lemon Squeezy)
- **Booking/appointments** — weekly recurring availability, timezone-aware slot generation, race-safe double-booking prevention
- **A/B auto-order** — link buttons automatically reorder by click-through performance when enabled
- **Multi-language pages** — creator-authored translations, auto-matched to the visitor's browser language, with a manual switcher
- **Team management** — invite editors by shareable link; they get full content access without owning the account

**Phase 5 — Scale & Polish**
- **Performance** — the public bio page runs on ISR (60s edge cache) with on-demand invalidation the instant a creator saves a change, so visitors get CDN speed and creators never see stale edits; avatars and backgrounds serve through Next.js's built-in image optimizer (resizing, format conversion, lazy loading) via `next/image`
- **SEO tools** — a real designed social-preview image is auto-generated per profile (`opengraph-image.tsx`, using the creator's theme colors, avatar, name, and bio — no external image API), a per-profile app icon, a dynamic `sitemap.xml` covering every published page, `robots.txt`, and JSON-LD `ProfilePage`/`Person` structured data for richer search results
- **Analytics export** — CSV export on the Analytics page (daily series + top links/countries/devices/referrers in one file) and a print-optimized PDF export (the dashboard chrome hides, the report reflows for paper, and the browser's native print-to-PDF handles the rest — no PDF-generation library needed)
- **Admin dashboard** — a `/admin` area gated by a database-only `is_platform_admin` flag (never settable through the app itself, so no in-app bug or bad actor can self-promote), showing aggregate platform stats and a creators list via security-definer database functions that never expose any individual creator's private leads, bookings, or chatbot content
- **PWA support** — every published bio page ships its own web manifest and icon, so visitors can "Add to Home Screen" and the page opens like an installed app, themed to that creator's own accent color

**Phase 6 — Trust & Polish**
- **Entrance sequence** — a brief, branded loading animation on first visit per browser session (like Stripe/PayPal/Payoneer), shown only on CRbio's own product surfaces (marketing site, auth, dashboard, admin) — never on a creator's public bio page, since visitors clicking a shared link need it instantly, not a splash screen
- **Fluid, restrained motion throughout** — page-to-page fade transitions, scroll-triggered reveals on the marketing page, and consistent professional easing (the same curve Stripe and Linear use) — powered by `framer-motion`, the one new dependency added in this phase, because hand-rolled CSS couldn't reliably match the requested quality bar
- **Toned-down visual language** — the looping spinning ring and neon glow shadows from earlier phases (which read as generic AI-template flash rather than enterprise trust) were replaced with a static gradient ring and quieter, more confident shadows; motion now confirms things happened rather than performing for its own sake
- **Respects motion preferences** — every animation backs off automatically for visitors with `prefers-reduced-motion` set, a baseline accessibility practice real enterprise products follow
- **First-time product tour** — a guided, spotlight-and-tooltip walkthrough of the dashboard for new creators (Next/Back/Skip), shown once and tracked via a `has_seen_tour` flag
- **A real footer** — multi-column (Product, Account, Legal), backed by actual Terms of Service and Privacy Policy pages so nothing links to a dead page

**Phase 7 — Premium Design System + Missing Features**
- **Signature hero mark** — a large, slow-rotating "CR / BIO" wordmark with a drifting aurora glow on the marketing page, original artwork inspired by (not copied from) premium agency sites — 90-second rotation, fully decorative, respects reduced-motion
- **24 original themes** — expanded from 8, spanning dark jewel tones, editorial noir, and light papers, each with its own accent
- **5 header layouts** — Classic, Hero, Banner, Cutout, Shape — a real, working layout system (not just a picker with one outcome), matching the Content/Header/Design/Enhance structure of established link-in-bio tools
- **Stickers** — lightweight emoji-based decorative overlays, positioned and sized per profile, zero image hosting cost
- **Footer branding toggle** — creators can hide the "Made with CRbio" line entirely
- **Link collections (folders)** — group blocks into an expandable/collapsible section on the public page
- **Quick-add social shortcuts** — one-click Instagram/TikTok/YouTube/Email block creation
- **Page password protection** — a real server-side gate (not a client-side illusion): protected pages never fetch or send their content to an unverified visitor's browser at all; verification happens via a security-definer database function against a bcrypt hash, never exposed to the client
- **Fixed: chatbot Q&A reordering** — was previously decorative only; now real drag-and-drop, persisted to the database
- **Security fix**: every `profiles` query that could reach a client component was audited and switched from `select("*")` to an explicit column list, so the page-password hash can never leak into a browser payload — public or the owner's own

Everything is real, working code. No mock data, no placeholder screens, no "coming soon" states.

---

## 2. Supabase setup (one-time)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and run it. This sets up everything — all tables, RLS policies, functions, and storage buckets (`avatars`, `backgrounds`, `products`) — for a fresh project.
   - **Upgrading an existing project?** Run whichever numbered files under `supabase/migrations/` you haven't applied yet, in order (`002`, `003`, `004`). Each is idempotent.
3. Go to **Authentication → URL Configuration** and set:
   - **Site URL**: your production URL
   - **Redirect URLs**: add `http://localhost:3000/auth/callback` and `https://yourdomain/auth/callback`
4. To enable Google login: **Authentication → Providers → Google**, add your OAuth Client ID/Secret from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
5. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.

---

## 3. Local setup

```bash
npm install
cp .env.local.example .env.local
```

Fill in `.env.local` with your Supabase URL/key, then:

```bash
npm run dev
```

---

## 4. Deploying

Deploy to **Vercel** (recommended) or any Node host.

1. Push to GitHub, import into Vercel.
2. Add the env vars from `.env.local.example` in the Vercel project settings.
3. Deploy. Update Supabase's Site URL/Redirect URLs to match your production domain.

CRbio doesn't need a purchased domain to launch — the free `*.vercel.app` URL works for every feature. Custom domains (Settings → Custom domain) are free to add on Vercel's Hobby plan too — the person just needs to own the domain itself.

### Custom domains for your creators

When a creator connects `links.theirbrand.com` in Settings, also add that same domain in **your Vercel project → Settings → Domains** so Vercel can issue the SSL cert and route traffic. The app's middleware then matches the incoming hostname to the right creator's page automatically. There's no automated Vercel API call wired up for this — it's a manual step per domain (or automatable later with a Vercel API token).

### Chatbot — how it actually works

The widget fetches the creator's Q&A pairs (via a public, RLS-scoped query) and matches the visitor's message against them client-side using token overlap scoring — no OpenAI/Claude/any external API call, no per-message billing, works at any scale for free. See `lib/chatbot.ts`.

### Digital products — payment honesty note

CRbio doesn't process card payments directly (that requires a licensed payment processor and API keys, which aren't included here). What it does:
- **Free / pay-what-you-want downloads**: fully self-hosted — file lives in your Supabase storage, gated behind an email capture, tracked in Dashboard → Products.
- **Paid products**: the block becomes a styled "Buy now" card linking out to a checkout URL you paste in (a Stripe Payment Link, Gumroad, or Lemon Squeezy page) — actual payment happens on that provider's page.

---

## 5. Project structure

```
app/
  page.tsx                    → marketing landing page
  login/, signup/, reset-password/, auth/callback/, onboarding/
  team/accept/[token]/         → team invite acceptance flow
  api/
    track/view/, track/click/     → click/view logging (geo + device)
    leads/capture/                 → lead-capture form submissions
    domains/verify/                → DNS check for custom domains
    booking/slots/, booking/create/ → booking slot computation + creation
    products/claim/                → free/gated product downloads
    team/invite/, team/accept/     → team invite flow
  dashboard/
    page.tsx (Links), appearance/, analytics/, leads/, products/,
    booking/, chatbot/, languages/, settings/
  [username]/page.tsx          → public bio page (SEO + tracking + i18n + schedule filtering)
components/                    → shared UI + block renderers + dashboard components
lib/
  supabase/                    → browser/server/middleware/anon Supabase clients
  utils.ts, device.ts, embed.ts, domain.ts, i18n.ts, chatbot.ts, booking.ts
supabase/
  schema.sql                   → full schema (fresh installs)
  migrations/                  → numbered incremental migrations (existing projects)
```

---

## 6. Setting up a platform admin

`is_platform_admin` is deliberately not exposed anywhere in the app UI. To make an account an admin, run this once in the Supabase SQL editor (after that person has signed up and claimed a username):

```sql
update public.profiles set is_platform_admin = true where username = 'yourusername';
```

They'll then see an "Admin" area at `/admin` the next time they log in.

## 7. What's next (Phase 6+)

- A true multi-profile workspace switcher for agencies managing several client pages from one login (Phase 4 already supports one account editing one other profile as a team member — this would let one account switch between several)
- Automated Vercel domain provisioning via API for custom domains
- Optional payment-processor integration (Stripe Connect) for direct in-app checkout
- A real service worker for offline support, layered on top of Phase 5's installable manifest

---

Built by **CR Digital Enterprises** — Unbeatable Prices. Elite Quality. Pay Only If You Are 101% Satisfied.
