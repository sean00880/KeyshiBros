import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { headers } from "next/headers";

import { StickyNav } from "@/components/ui/sticky-nav";
import { Footer } from "@/components/ui/footer";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { AppKitProvider } from "@/components/providers/appkit-provider";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pass cookies for WagmiProvider SSR hydration (matching normie-tool)
  const headersObj = await headers();
  const cookies = headersObj.get("cookie");

  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased selection:bg-kb-primary/30 selection:text-white`}
      >
        <AppKitProvider cookies={cookies}>
          <SidebarLayout>
            <StickyNav />
            {children}
            <Footer />
          </SidebarLayout>
        </AppKitProvider>
      </body>
    </html>
  );
}
