import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripAgent — AI Travel Planner",
  description: "Voice-first travel planning powered by ElevenLabs and Firecrawl",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
