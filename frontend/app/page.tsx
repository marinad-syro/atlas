"use client";

import { useState } from "react";
import VoicePanel from "./components/VoicePanel";
import ResultsPanel from "./components/ResultsPanel";

// Shape mirrors the server tool response schemas from the design doc
export type TripCard = {
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
  destination: null,
  flights: null,
  hotels: null,
  activities: null,
};

export default function Home() {
  const [tripCard, setTripCard] = useState<TripCard>(EMPTY_TRIP);

  const handleTripSectionUpdate = (section: string, data: unknown) => {
    const validSections = ["destination", "flights", "hotels", "activities"] as const;
    if (!validSections.includes(section as (typeof validSections)[number])) return;
    setTripCard((prev) => ({ ...prev, [section]: data }));
  };

  const handleReset = () => setTripCard(EMPTY_TRIP);

  return (
    <div className="flex flex-col sm:flex-row h-screen overflow-hidden">
      {/* Left panel: voice conversation */}
      <div className="sm:w-2/5 sm:min-w-[340px] sm:border-r sm:border-b-0 border-b border-white/10">
        <VoicePanel onTripSectionUpdate={handleTripSectionUpdate} onReset={handleReset} />
      </div>

      {/* Right panel: trip card results */}
      <div className="flex-1 overflow-hidden">
        <ResultsPanel tripCard={tripCard} />
      </div>
    </div>
  );
}
