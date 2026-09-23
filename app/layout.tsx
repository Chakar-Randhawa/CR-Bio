import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppEntranceLoader } from "@/components/AppEntranceLoader";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "500", "600", "700"], style: ["normal", "italic"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jbMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://crbio.app"),
  title: { default: "CRbio — One link for everything you make", template: "%s · CRbio" },
  description: "CRbio is a free link-in-bio platform with the premium features other tools lock behind a paywall — custom domains, unlimited links, real analytics, and more.",
  openGraph: { siteName: "CRbio", type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${jbMono.variable}`}>
      <body className="font-sans antialiased bg-ink text-white min-h-screen">
        <AppEntranceLoader />
        {children}
      </body>
    </html>
  );
}
