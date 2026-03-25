"use client";

import { useState } from "react";
import VoicePanel from "./components/VoicePanel";

// Shape mirrors the server tool response schemas from the design doc
export type TripCard = {
  summary: { bullets: string[] } | null;
  destination: {
    destinations: Array<{ name: string; summary: string; source_url: string }>;
    detailed_info?: string;
  } | null;
  flights: {
    options: Array<{
      label: string;
      skyscanner_url: string;
      depart_date?: string;
      return_date?: string;
      estimated_price?: string;
      note?: string;
    }>;
  } | null;
  hotels: {
    hotels: Array<{ name: string; highlight?: string; booking_url: string }>;
    booking_search_url?: string;
  } | null;
  activities: {
    activities: Array<{ name: string; description?: string; source_url?: string }>;
  } | null;
};

const EMPTY_TRIP: TripCard = {
  summary: null,
  destination: null,
  flights: null,
  hotels: null,
  activities: null,
};

export default function Home() {
  const [tripCard, setTripCard] = useState<TripCard>(EMPTY_TRIP);

  const hasAnyData = Object.values(tripCard).some((v) => v !== null);

  const handleTripSectionUpdate = (section: string, data: unknown) => {
    const validSections = ["summary", "destination", "flights", "hotels", "activities"] as const;
    if (!validSections.includes(section as (typeof validSections)[number])) return;
    setTripCard((prev) => ({ ...prev, [section]: data }));
  };

  const handleReset = () => setTripCard(EMPTY_TRIP);

  return (
    <div
      className={`mx-auto transition-all duration-500 ${
        hasAnyData ? "max-w-3xl" : "max-w-sm"
      }`}
    >
      <VoicePanel
        onTripSectionUpdate={handleTripSectionUpdate}
        onReset={handleReset}
        tripCard={tripCard}
      />
    </div>
  );
}
