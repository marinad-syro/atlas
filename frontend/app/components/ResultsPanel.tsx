"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { MapPin, Plane, Hotel, Target, Globe, ExternalLink, Sparkles } from "lucide-react";
import type { TripCard } from "../page";

interface ResultsPanelProps {
  tripCard: TripCard;
}

const SECTIONS = [
  { key: "summary" as const, Icon: Sparkles },
  { key: "destination" as const, Icon: Globe },
  { key: "flights" as const, Icon: Plane },
  { key: "hotels" as const, Icon: Hotel },
  { key: "activities" as const, Icon: Target },
];

export default function ResultsPanel({ tripCard }: ResultsPanelProps) {
  const hasAnyData = Object.values(tripCard).some((v) => v !== null);

  if (!hasAnyData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 opacity-40 py-20">
        <div className="text-6xl">🗺️</div>
        <p className="text-gray-500 text-lg">Your trip plan will appear here</p>
        <p className="text-gray-400 text-sm">
          Start a voice conversation and describe where you want to go
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Section progress icons */}
      <div className="absolute -top-10 right-0 flex gap-2 p-2 z-30">
        {SECTIONS.map(({ key, Icon }) => {
          const active = tripCard[key] !== null;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0.45 }}
              className={`p-1.5 rounded-full ${active ? "bg-indigo-500/80 text-white shadow-md" : "glass text-white/70"}`}
            >
              <Icon size={16} />
            </motion.div>
          );
        })}
      </div>

      {/* Summary card — full width */}
      {tripCard.summary && <SummaryCard data={tripCard.summary} />}

      {/* 2×2 grid of detail cards */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {tripCard.destination && <DestinationCard data={tripCard.destination} />}
        {tripCard.flights && <FlightsCard data={tripCard.flights} />}
        {tripCard.hotels && <HotelsCard data={tripCard.hotels} />}
        {tripCard.activities && <ActivitiesCard data={tripCard.activities} />}
      </div>
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-3xl p-5 w-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-white/40">{icon}</div>
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-700">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function SummaryCard({ data }: { data: NonNullable<TripCard["summary"]> }) {
  return (
    <Card title="Your Trip Plan ✨" icon={<Sparkles className="text-indigo-500" size={18} />}>
      <ul className="space-y-2">
        {(data.bullets ?? []).map((bullet, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <span className="text-indigo-400 font-black text-xs mt-0.5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="leading-snug">{bullet}</span>
          </motion.li>
        ))}
      </ul>
    </Card>
  );
}

// ─── Destination ──────────────────────────────────────────────────────────────

function DestinationCard({ data }: { data: NonNullable<TripCard["destination"]> }) {
  const dest = data.destinations?.[0];
  if (!dest) return null;
  return (
    <Card title="Destination 🌍" icon={<MapPin className="text-indigo-500" size={18} />}>
      <h3 className="font-bold text-lg text-gray-800">{dest.name}</h3>
      <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-4">{dest.summary}</p>
      {dest.source_url && (
        <a
          href={dest.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-indigo-600 text-sm font-medium mt-3 hover:underline"
        >
          Read more <ExternalLink size={12} className="ml-1" />
        </a>
      )}
    </Card>
  );
}

// ─── Flights ──────────────────────────────────────────────────────────────────

function FlightsCard({ data }: { data: NonNullable<TripCard["flights"]> }) {
  const opt = data.options?.[0];
  if (!opt) return null;
  return (
    <Card title="Flights ✈️" icon={<Plane className="text-indigo-500" size={18} />}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-gray-800">{opt.label}</p>
          {opt.depart_date && (
            <p className="text-xs text-gray-700">
              {opt.depart_date} → {opt.return_date}
            </p>
          )}
        </div>
      </div>
      {opt.note && (
        <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">&ldquo;{opt.note}&rdquo;</p>
      )}
      <a
        href={opt.skyscanner_url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors"
      >
        Search Skyscanner →
      </a>
    </Card>
  );
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

function HotelsCard({ data }: { data: NonNullable<TripCard["hotels"]> }) {
  return (
    <Card title="Hotels 🏨" icon={<Hotel className="text-indigo-500" size={18} />}>
      <div className="space-y-2">
        {(data.hotels ?? []).slice(0, 3).map((hotel, i) => (
          <div key={i} className="bg-white/30 p-2 rounded-lg">
            <p className="text-xs font-bold text-gray-800 truncate">{hotel.name}</p>
            {hotel.highlight && (
              <p className="text-[10px] text-gray-700">{hotel.highlight}</p>
            )}
          </div>
        ))}
      </div>
      {data.booking_search_url && (
        <a
          href={data.booking_search_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full mt-3 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold flex items-center justify-center hover:bg-orange-600 transition-colors"
        >
          Search Booking.com →
        </a>
      )}
    </Card>
  );
}

// ─── Activities ───────────────────────────────────────────────────────────────

function ActivitiesCard({ data }: { data: NonNullable<TripCard["activities"]> }) {
  return (
    <Card title="Activities 🎯" icon={<Target className="text-indigo-500" size={18} />}>
      <div className="space-y-3">
        {(data.activities ?? []).slice(0, 3).map((act, i) => (
          <div key={i} className="relative pl-5">
            <span className="absolute left-0 top-0 text-indigo-400 font-black text-sm leading-none">
              {String(i + 1).padStart(2, "0")}
            </span>
            {act.source_url ? (
              <a
                href={act.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-600 hover:underline truncate block"
              >
                {act.name}
              </a>
            ) : (
              <p className="text-xs font-bold text-gray-800 truncate">{act.name}</p>
            )}
            {act.description && (
              <p className="text-[10px] text-gray-700 mt-0.5 line-clamp-1">{act.description}</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2 italic text-center">And more...</p>
    </Card>
  );
}
