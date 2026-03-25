import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BackgroundSlideshow from "./components/BackgroundSlideshow";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TripAgent — AI Travel Planner",
  description: "Voice-first travel planning powered by ElevenLabs and Firecrawl",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <BackgroundSlideshow />
        {children}
        <p className="fixed bottom-4 right-4 text-[10px] text-white/35 select-none z-50 tracking-wide">
          powered by ElevenLabs &amp; Firecrawl
        </p>
      </body>
    </html>
  );
}
