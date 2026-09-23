import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-grain-glow" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <Link href="/" className="mb-10 inline-block"><Logo /></Link>
        <h1 className="font-display text-3xl text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-mist">Last updated: {new Date().toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose-invert mt-10 space-y-8 text-sm leading-relaxed text-mist">
          <section>
            <h2 className="mb-2 font-display text-lg text-white">1. Using CRbio</h2>
            <p>CRbio is provided by CR Digital Enterprises. By creating an account or a page, you agree to use the service lawfully and not to publish content that is illegal, infringing, or intended to deceive or harm visitors.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">2. Your content</h2>
            <p>You keep ownership of everything you upload or publish — links, images, product files, chatbot answers, and anything else. You're responsible for having the rights to what you post, including any digital products you sell.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">3. Payments &amp; products</h2>
            <p>CRbio does not process card payments directly. Paid product blocks link out to a checkout provider you choose and control (for example, a Stripe Payment Link or Gumroad page). Any transaction, refund, or dispute for a paid product is between you and your visitor, handled through that provider.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">4. Custom domains &amp; team access</h2>
            <p>If you connect a custom domain, you're responsible for maintaining ownership and DNS configuration for it. If you invite team members, they can manage your page's content on your behalf — you're responsible for who you grant that access to.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">5. Availability</h2>
            <p>CRbio is offered free of charge, as-is, without uptime guarantees. We aim to keep it reliable, but we're not liable for lost revenue or data from downtime or service changes.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">6. Account termination</h2>
            <p>You can delete your account and page at any time from Settings. We may suspend accounts that violate these terms or applicable law.</p>
          </section>
          <section>
            <h2 className="mb-2 font-display text-lg text-white">7. Contact</h2>
            <p>Questions about these terms can be sent to the contact details listed on the CR Digital Enterprises website.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
