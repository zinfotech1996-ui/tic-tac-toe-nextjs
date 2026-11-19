import type { Metadata, Viewport } from "next";
import { Caveat, Geist, Patrick_Hand } from "next/font/google";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-patrick",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Tic Tac Toe — ink & paper",
  description:
    "A hand-drawn game of tic tac toe for two players sharing one screen. Line up three, keep score, and try not to gloat.",
  applicationName: "Tic Tac Toe",
  keywords: ["tic tac toe", "game", "two player", "React", "Next.js"],
  authors: [{ name: "Tic Tac Toe" }],
  openGraph: {
    title: "Tic Tac Toe — ink & paper",
    description:
      "A hand-drawn game of tic tac toe for two players sharing one screen.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tic Tac Toe — ink & paper",
    description:
      "A hand-drawn game of tic tac toe for two players sharing one screen.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6efe0",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${patrickHand.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
