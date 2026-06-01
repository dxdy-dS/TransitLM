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
  title: "JelajahID - Peta Transit Jabodetabek",
  description:
    "Temukan rute perjalanan terbaik di Jabodetabek menggunakan MRT, LRT, KRL, dan TransJakarta. Data real dari jaringan transit Indonesia.",
  keywords: [
    "JelajahID",
    "transit",
    "Jakarta",
    "MRT",
    "LRT",
    "KRL",
    "TransJakarta",
    "Jabodetabek",
    "Indonesia",
  ],
  authors: [{ name: "JelajahID" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "JelajahID - Peta Transit Jabodetabek",
    description:
      "Temukan rute perjalanan terbaik di Jabodetabek menggunakan MRT, LRT, KRL, dan TransJakarta.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
