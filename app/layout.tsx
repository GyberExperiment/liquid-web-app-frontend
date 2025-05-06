import type { Metadata } from "next";
import { WalletProvider } from "@/shared/lib/context";

import './globals.css'

export const metadata: Metadata = {
  title: "lqd banks",
  description: "Welcome to lqd! Our goal is to elevate decentralized finance (DeFi) to a new functional level where decentralized financial instruments can fully compete with and surpass traditional banking services in terms of convenience, power, and functionality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
