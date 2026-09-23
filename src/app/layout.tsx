import type { Metadata } from "next";
import { Hanken_Grotesk, Geist_Mono } from "next/font/google";
import "./globals.css";

// Hanken Grotesk replaces Geist Sans as the primary typeface (design
// handoff, Coach Violet + Lime system). Geist Mono stays, used only for
// tabular data and IDs per the handoff's type rules.
const hankenSans = Hanken_Grotesk({
  variable: "--font-hanken-sans",
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Get100-Customers",
  description: "An AI growth coach to get your startup to its first 100 customers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${hankenSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-primary font-sans">{children}</body>
    </html>
  );
}
