import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

import { StickyNav } from "@/components/ui/sticky-nav";
import { Footer } from "@/components/ui/footer";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KeyshiBros | Play. Earn. Dominate.",
  description: "Enter the premier cyber-combat arena. Stake tokens, crush opponents, and claim daily airdrops in a neon-drenched reality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased selection:bg-kb-primary/30 selection:text-white`}
      >
        <StickyNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
