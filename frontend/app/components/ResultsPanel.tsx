"use client";

import type { TripCard } from "../page";

interface ResultsPanelProps {
  tripCard: TripCard;
}

const SECTIONS = [
  { key: "destination" as const, label: "Destination", icon: "🌍" },
  { key: "flights" as const, label: "Flights", icon: "✈️" },
  { key: "hotels" as const, label: "Hotels", icon: "🏨" },
  { key: "activities" as const, label: "Activities", icon: "🎯" },
];

export default function ResultsPanel({ tripCard }: ResultsPanelProps) {
  const hasAnyData = Object.values(tripCard).some((v) => v !== null);

  return (
    <div className="h-full flex flex-col p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Your Trip</h2>
        {hasAnyData && (
          <div className="flex gap-2">
            {SECTIONS.map(({ key, icon }) => (
              <div
                key={key}
                className={`text-lg transition-opacity ${
                  tripCard[key] !== null ? "opacity-100" : "opacity-20"
                }`}
              >
                {icon}
              </div>
            ))}
          </div>
        )}
      </div>

      {!hasAnyData ? (
        <EmptyState />
      ) : (
        <div className="flex-1 overflow-y-auto results-scroll space-y-4 pr-1">
          {tripCard.destination && <DestinationSection data={tripCard.destination} />}
          {tripCard.flights && <FlightsSection data={tripCard.flights} />}
          {tripCard.hotels && <HotelsSection data={tripCard.hotels} />}
          {tripCard.activities && <ActivitiesSection data={tripCard.activities} />}
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 opacity-40">
      <div className="text-6xl">🗺️</div>
      <p className="text-gray-400 text-lg">Your trip plan will appear here</p>
      <p className="text-gray-500 text-sm">
        Start a voice conversation and describe where you want to go
      </p>
    </div>
  );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <h3 className="font-semibold text-white text-base">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ─── Destination ──────────────────────────────────────────────────────────────

function DestinationSection({ data }: { data: NonNullable<TripCard["destination"]> }) {
  return (
    <SectionCard title="Destination" icon="🌍">
      {data.destinations.map((dest, i) => (
        <div key={i} className="space-y-1">
          <p className="text-white font-medium">{dest.name}</p>
          <p className="text-gray-400 text-sm leading-relaxed">{dest.summary}</p>
          {dest.source_url && (
            <a
              href={dest.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Read more →
            </a>
          )}
        </div>
      ))}
    </SectionCard>
  );
}

// ─── Flights ──────────────────────────────────────────────────────────────────

function FlightsSection({ data }: { data: NonNullable<TripCard["flights"]> }) {
  return (
    <SectionCard title="Flights" icon="✈️">
      {data.options.map((opt, i) => (
        <div key={i} className="space-y-2">
          <p className="text-white font-medium text-sm">{opt.label}</p>
          {opt.depart_date && (
            <p className="text-gray-400 text-xs">
              {opt.depart_date} → {opt.return_date}
            </p>
          )}
          {opt.note && <p className="text-gray-500 text-xs italic">{opt.note}</p>}
          <a
            href={opt.skyscanner_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Search Skyscanner →
          </a>
        </div>
      ))}
    </SectionCard>
  );
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

function HotelsSection({ data }: { data: NonNullable<TripCard["hotels"]> }) {
  return (
    <SectionCard title="Hotels" icon="🏨">
      <div className="space-y-3">
        {data.hotels.map((hotel, i) => (
          <div key={i} className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{hotel.name}</p>
              {hotel.highlight && (
                <p className="text-gray-400 text-xs mt-0.5">{hotel.highlight}</p>
              )}
            </div>
            <a
              href={hotel.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs bg-orange-600 hover:bg-orange-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Book →
            </a>
          </div>
        ))}
      </div>
      {data.booking_search_url && (
        <a
          href={data.booking_search_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-gray-400 hover:text-gray-300 transition-colors"
        >
          See all options on Booking.com →
        </a>
      )}
    </SectionCard>
  );
}

// ─── Activities ───────────────────────────────────────────────────────────────

function ActivitiesSection({ data }: { data: NonNullable<TripCard["activities"]> }) {
  return (
    <SectionCard title="Activities" icon="🎯">
      <div className="space-y-3">
        {data.activities.map((act, i) => (
          <div key={i} className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs font-mono">{String(i + 1).padStart(2, "0")}</span>
              <p className="text-white text-sm font-medium">{act.name}</p>
            </div>
            {act.description && (
              <p className="text-gray-400 text-xs leading-relaxed pl-7">{act.description}</p>
            )}
            {act.source_url && (
              <a
                href={act.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block pl-7 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                More info →
              </a>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
