import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TransitLM — Interactive Benchmark Dashboard",
  description:
    "A Large-Scale Dataset and Benchmark for Map-Free Transit Route Generation. Explore evaluation results, funnel visualization, and sample routes.",
  keywords: [
    "TransitLM",
    "benchmark",
    "transit",
    "route generation",
    "LLM",
    "evaluation",
    "dataset",
  ],
  authors: [{ name: "TransitLM Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "TransitLM — Interactive Benchmark Dashboard",
    description:
      "Explore evaluation results for map-free transit route generation by LLMs",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[oklch(0.1_0.005_200)] text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
