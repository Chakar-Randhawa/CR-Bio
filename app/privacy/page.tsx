import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grain-glow" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <Link href="/" className="mb-10 inline-block"><Logo /></Link>
        <h1 className="font-display text-3xl text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-mist">Last updated: {new Date().toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose-invert mt-10 space-y-8 text-sm leading-relaxed text-mist">
          <section>
            <h2 className="mb-2 font-display text-lg text-white">What we collect</h2>
            <p>When you create an account: your email and, if you sign in with Google, your name and profile photo. When you build a page: whatever you choose to add — bio, links, uploaded images, product files, chatbot content. When visitors use your page: an anonymized view/click event (timestamp, referring site, coarse country and device type from network-level signals — never a precise location), and, if they submit a form you added, the email/name/message they typed in.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">How it's used</h2>
            <p>To run your account and page, to show you your own analytics, and to operate features you turn on (lead capture, booking, product delivery, the chatbot). We don't sell visitor or creator data, and we don't run ads on CRbio.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">Where it's stored</h2>
            <p>Account and page data is stored in a Supabase (PostgreSQL) database, with row-level security so only you — and any team member you invite — can read your private data (leads, bookings, analytics). Uploaded files live in Supabase Storage.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">Third parties</h2>
            <p>We use Supabase for auth, database, and file storage. If you add a paid product with an external checkout link, that provider (e.g. Stripe or Gumroad) handles that transaction under their own privacy policy — CRbio never sees the payment details.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">Your controls</h2>
            <p>You can export leads as CSV, delete individual leads or bookings, unpublish or delete your page, and delete your account entirely from Settings — all of which remove the underlying data.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">Contact</h2>
            <p>Questions about this policy can be sent to the contact details listed on the CR Digital Enterprises website.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
