"use client";

import { useState } from "react";
import VoicePanel from "./components/VoicePanel";

// Multi-city types
export type TransportOption = {
  label: string;
  mode: "flight" | "train" | "bus";
  provider: string;
  url: string;
  travel_date?: string;
  duration_hint?: string;
  note?: string;
};

export type TransportLeg = {
  from: string;
  to: string;
  arrive: string;
  depart: string;
  nights: number;
  options: TransportOption[];
};

export type CitySegment = {
  city: string;
  arrive: string;
  depart: string;
  nights: number;
  hotels: TripCard["hotels"];
  activities: TripCard["activities"];
};

export type MultiCityPlan = {
  ordered_cities: string[];
  legs: TransportLeg[];
  segments: CitySegment[];
};

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
    hotels: Array<{ name: string; highlight?: string; booking_url: string; source_url?: string }>;
    booking_search_url?: string;
  } | null;
  activities: {
    activities: Array<{ name: string; description?: string; source_url?: string }>;
  } | null;
  multiCity: MultiCityPlan | null;
};

const EMPTY_TRIP: TripCard = {
  summary: null,
  destination: null,
  flights: null,
  hotels: null,
  activities: null,
  multiCity: null,
};

export default function Home() {
  const [tripCard, setTripCard] = useState<TripCard>(EMPTY_TRIP);

  const hasAnyData = Object.values(tripCard).some((v) => v !== null);

  const handleTripSectionUpdate = (section: string, data: unknown) => {
    const validSections = ["summary", "destination", "flights", "hotels", "activities", "multiCity"] as const;
    if (!validSections.includes(section as (typeof validSections)[number])) return;
    setTripCard((prev) => ({ ...prev, [section]: data }));
  };

  const handleTransportLegUpdate = (fromCity: string, toCity: string, options: unknown[]) => {
    setTripCard((prev) => {
      if (!prev.multiCity) return prev;
      const legs = prev.multiCity.legs.map((leg) =>
        leg.from.toLowerCase() === fromCity.toLowerCase() &&
        leg.to.toLowerCase() === toCity.toLowerCase()
          ? { ...leg, options: options as TransportOption[] }
          : leg
      );
      return { ...prev, multiCity: { ...prev.multiCity, legs } };
    });
  };

  const handleCitySegmentUpdate = (city: string, hotels: TripCard["hotels"], activities: TripCard["activities"]) => {
    setTripCard((prev) => {
      if (!prev.multiCity) return prev;
      const leg = prev.multiCity.legs.find(
        (l) => l.to.toLowerCase() === city.toLowerCase()
      );
      const newSegment: CitySegment = {
        city,
        arrive: leg?.arrive ?? "",
        depart: leg?.depart ?? "",
        nights: leg?.nights ?? 0,
        hotels: hotels ?? null,
        activities: activities ?? null,
      };
      const existing = prev.multiCity.segments;
      const alreadyExists = existing.some((s) => s.city.toLowerCase() === city.toLowerCase());
      const segments = alreadyExists
        ? existing.map((s) => s.city.toLowerCase() === city.toLowerCase() ? newSegment : s)
        : [...existing, newSegment];
      return { ...prev, multiCity: { ...prev.multiCity, segments } };
    });
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
        onTransportLegUpdate={handleTransportLegUpdate}
        onCitySegmentUpdate={handleCitySegmentUpdate}
        onReset={handleReset}
        tripCard={tripCard}
      />
    </div>
  );
}
