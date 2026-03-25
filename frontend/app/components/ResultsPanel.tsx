"use client";

import { ReactNode, useState, useCallback } from "react";
import { motion } from "motion/react";
import { MapPin, Plane, Hotel, Target, Globe, ExternalLink, Sparkles, Train, Map, Copy, Check, BookOpen } from "lucide-react";
import type { TripCard, MultiCityPlan, TransportLeg, CitySegment, TransportOption, DeepDive } from "../page";

interface ResultsPanelProps {
  tripCard: TripCard;
}

const SECTIONS = [
  { key: "summary" as const, Icon: Sparkles },
  { key: "destination" as const, Icon: Globe },
  { key: "flights" as const, Icon: Plane },
  { key: "hotels" as const, Icon: Hotel },
  { key: "activities" as const, Icon: Target },
  { key: "multiCity" as const, Icon: Map },
];

function buildMarkdown(tripCard: TripCard): string {
  const lines: string[] = [];

  const destName = tripCard.destination?.destinations?.[0]?.name ?? "Trip Plan";
  lines.push(`# ${destName}\n`);

  if (tripCard.summary) {
    lines.push("## Summary\n");
    tripCard.summary.bullets.forEach((b) => lines.push(`- ${b}`));
    lines.push("");
  }

  if (tripCard.destination) {
    lines.push("## Destinations\n");
    (tripCard.destination.destinations ?? []).forEach((d) => {
      lines.push(`### [${d.name}](${d.source_url})`);
      lines.push(d.summary);
      lines.push("");
    });
  }

  if (tripCard.flights) {
    lines.push("## Flights\n");
    (tripCard.flights.options ?? []).forEach((f) => {
      lines.push(`- [${f.label}](${f.skyscanner_url})`);
      if (f.note) lines.push(`  *${f.note}*`);
    });
    lines.push("");
  }

  if (tripCard.hotels) {
    lines.push("## Hotels\n");
    (tripCard.hotels.hotels ?? []).forEach((h) => {
      lines.push(`- [${h.name}](${h.booking_url})`);
    });
    lines.push("");
  }

  if (tripCard.activities) {
    lines.push("## Activities\n");
    (tripCard.activities.activities ?? []).forEach((a, i) => {
      const link = a.source_url ? `[${a.name}](${a.source_url})` : a.name;
      lines.push(`${i + 1}. ${link}${a.description ? ` — ${a.description}` : ""}`);
    });
    lines.push("");
  }

  if (tripCard.multiCity) {
    const plan = tripCard.multiCity;
    lines.push(`## Multi-City Route: ${plan.ordered_cities.join(" → ")}\n`);
    plan.legs.forEach((leg) => {
      if (leg.nights === 0) return;
      lines.push(`### ${leg.to} (${leg.nights} nights, ${leg.arrive} – ${leg.depart})`);
      if (leg.options.length > 0) {
        lines.push("**Getting there:**");
        leg.options.forEach((opt) => lines.push(`- [${opt.label}](${opt.url}) *(${opt.mode})*`));
      }
      const seg = plan.segments.find((s) => s.city.toLowerCase() === leg.to.toLowerCase());
      if (seg?.hotels) {
        lines.push("**Hotels:**");
        (seg.hotels.hotels ?? []).forEach((h) => lines.push(`- [${h.name}](${h.booking_url})`));
      }
      if (seg?.activities) {
        lines.push("**Activities:**");
        (seg.activities.activities ?? []).forEach((a, i) => {
          const link = a.source_url ? `[${a.name}](${a.source_url})` : a.name;
          lines.push(`${i + 1}. ${link}${a.description ? ` — ${a.description}` : ""}`);
        });
      }
      lines.push("");
    });
  }

  if (tripCard.deepDives && tripCard.deepDives.length > 0) {
    lines.push("## Research Notes\n");
    tripCard.deepDives.forEach((dd) => {
      lines.push(`### ${dd.title}`);
      lines.push(dd.content);
      lines.push(`\n*Source: [${dd.citation_title}](${dd.citation_url})*`);
      lines.push("");
    });
  }

  return lines.join("\n");
}

export default function ResultsPanel({ tripCard }: ResultsPanelProps) {
  const hasAnyData = Object.values(tripCard).some((v) => v !== null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const md = buildMarkdown(tripCard);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [tripCard]);

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

  // Toolbar: progress icons + copy button, all inside normal flow
  const toolbar = (
    <div className="flex items-center justify-between mb-3">
      <div className="flex gap-2">
        {SECTIONS.map(({ key, Icon }) => {
          const active = tripCard[key] !== null;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0.35 }}
              className={`p-1.5 rounded-full ${active ? "bg-indigo-500/80 text-white shadow-md" : "glass text-white/50"}`}
            >
              <Icon size={14} />
            </motion.div>
          );
        })}
      </div>
      <button
        onClick={handleCopy}
        title="Copy as Markdown"
        className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/20 transition-all"
      >
        {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );

  const deepDives = tripCard.deepDives && tripCard.deepDives.length > 0 ? tripCard.deepDives : null;

  // Multi-city layout
  if (tripCard.multiCity) {
    return (
      <div>
        {toolbar}
        {tripCard.summary && <SummaryCard data={tripCard.summary} />}
        <MultiCityView plan={tripCard.multiCity} />
        {deepDives && <DeepDivesSection dives={deepDives} />}
      </div>
    );
  }

  return (
    <div>
      {toolbar}

      {/* Summary card — full width */}
      {tripCard.summary && <SummaryCard data={tripCard.summary} />}

      {/* 2×2 grid of detail cards */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        {tripCard.destination && <DestinationCard data={tripCard.destination} />}
        {tripCard.flights && <FlightsCard data={tripCard.flights} />}
        {tripCard.hotels && (
            <HotelsCard
              data={tripCard.hotels}
              departDate={tripCard.flights?.options?.[0]?.depart_date}
              returnDate={tripCard.flights?.options?.[0]?.return_date}
              destination={tripCard.destination?.destinations?.[0]?.name}
            />
          )}
        {tripCard.activities && <ActivitiesCard data={tripCard.activities} />}
      </div>

      {/* Deep dive research cards */}
      {deepDives && <DeepDivesSection dives={deepDives} />}
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
    <Card title="Your Trip Plan ✨" icon={<Sparkles className="text-indigo-700" size={18} />}>
      <ul className="space-y-2">
        {(data.bullets ?? []).map((bullet, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2 text-sm text-gray-8§00"
          >
            <span className="text-indigo-700 font-black text-xs mt-0.5 shrink-0">
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
      <div className="bg-white/30 p-2 rounded-lg">
        {dest.source_url ? (
          <a
            href={dest.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-indigo-700 hover:underline truncate block"
          >
            {dest.name}
          </a>
        ) : (
          <p className="text-xs font-bold text-gray-800 truncate">{dest.name}</p>
        )}
        <p className="text-[10px] text-gray-700 mt-0.5 line-clamp-3 leading-relaxed">{dest.summary}</p>
      </div>
    </Card>
  );
}

// ─── Flights ──────────────────────────────────────────────────────────────────

function FlightsCard({ data }: { data: NonNullable<TripCard["flights"]> }) {
  const opt = data.options?.[0];
  if (!opt) return null;
  return (
    <Card title="Flights ✈️" icon={<Plane className="text-indigo-500" size={18} />}>
      <div className="bg-white/30 p-2 rounded-lg">
        <p className="text-xs font-bold text-gray-800 truncate">{opt.label}</p>
        {opt.depart_date && (
          <p className="text-[10px] text-gray-700 mt-0.5">
            {opt.depart_date} → {opt.return_date}
          </p>
        )}
        {opt.note && (
          <p className="text-[10px] text-gray-700 mt-0.5 italic line-clamp-2">{opt.note}</p>
        )}
      </div>
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

function buildBookingUrl(destination?: string, departDate?: string, returnDate?: string) {
  const base = "https://www.booking.com/searchresults.html";
  const params = new URLSearchParams();
  if (destination) params.set("ss", destination);
  if (departDate) params.set("checkin", departDate);
  if (returnDate) params.set("checkout", returnDate);
  params.set("group_adults", "2");
  return `${base}?${params.toString()}`;
}

function HotelsCard({
  data,
  departDate,
  returnDate,
  destination,
}: {
  data: NonNullable<TripCard["hotels"]>;
  departDate?: string;
  returnDate?: string;
  destination?: string;
}) {
  const searchUrl = data.booking_search_url ?? buildBookingUrl(destination, departDate, returnDate);

  return (
    <Card title="Hotels 🏨" icon={<Hotel className="text-indigo-500" size={18} />}>
      <div className="space-y-2">
        {(data.hotels ?? []).slice(0, 3).map((hotel, i) => (
          <div key={i} className="bg-white/30 p-2 rounded-lg">
            <a
              href={hotel.source_url ?? hotel.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-indigo-700 hover:underline truncate block"
            >
              {hotel.name}
            </a>
            {hotel.highlight && (
              <p className="text-[10px] text-gray-700">{hotel.highlight}</p>
            )}
          </div>
        ))}
      </div>
      {searchUrl && (
        <a
          href={searchUrl}
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
          <div key={i} className="bg-white/30 p-2 rounded-lg">
            {act.source_url ? (
              <a
                href={act.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-indigo-700 hover:underline truncate block"
              >
                {act.name}
              </a>
            ) : (
              <p className="text-xs font-bold text-gray-800 truncate">{act.name}</p>
            )}
            {act.description && (
              <p className="text-[10px] text-gray-700 mt-0.5 line-clamp-2">{act.description}</p>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-2 italic text-center">And more...</p>
    </Card>
  );
}

// ─── Multi-city components ─────────────────────────────────────────────────────

const CITY_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

function RouteTimeline({ plan }: { plan: MultiCityPlan }) {
  const stops = plan.ordered_cities ?? [];
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 mb-6 px-1">
      {stops.map((city, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="rounded-full glass px-3 py-1 text-xs font-bold"
            style={{ borderLeft: `3px solid ${CITY_COLORS[i % CITY_COLORS.length]}` }}
          >
            {city} <span className="text-gray-600 font-normal ml-1">{plan.legs?.[i]?.nights ?? 0}n</span>
          </span>
          {i < stops.length - 1 && (
            <span className="text-gray-600 text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  );
}

function TransportLegCard({ leg }: { leg: TransportLeg }) {
  const options = leg.options ?? [];
  if (options.length === 0) {
    return (
      <div className="glass rounded-2xl p-3 text-xs text-gray-700 italic">
        No transport options found
      </div>
    );
  }
  const best = options[0];
  const rest = options.slice(1);
  const ModeIcon = best.mode === "flight" ? Plane : Train;

  return (
    <div className="glass rounded-2xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <ModeIcon size={14} className="text-indigo-500 shrink-0" />
        <span className="text-xs font-bold text-gray-800 truncate">{best.label}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] text-gray-700 font-medium">{best.provider}</p>
          {best.duration_hint && (
            <p className="text-[10px] text-gray-700">{best.duration_hint}</p>
          )}
          {best.note && (
            <p className="text-[10px] text-gray-600 italic line-clamp-1">{best.note}</p>
          )}
        </div>
      </div>
      <a
        href={best.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-bold flex items-center justify-center hover:bg-indigo-700 transition-colors"
      >
        Book via {best.provider} <ExternalLink size={10} className="ml-1" />
      </a>
      {rest.length > 0 && (
        <div className="mt-2 space-y-1 border-t border-white/20 pt-2">
          {rest.map((opt, i) => {
            const AltIcon = opt.mode === "flight" ? Plane : Train;
            return (
              <a
                key={i}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-indigo-500 hover:underline"
              >
                <AltIcon size={10} />
                {opt.provider}
                {opt.duration_hint && <span className="text-gray-600">· {opt.duration_hint}</span>}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CityBlock({
  city,
  colorIndex,
  arrivalLeg,
  segment,
}: {
  city: string;
  colorIndex: number;
  arrivalLeg: TransportLeg | undefined;
  segment: CitySegment | undefined;
}) {
  const color = CITY_COLORS[colorIndex % CITY_COLORS.length];
  const arrive = arrivalLeg?.arrive ?? segment?.arrive ?? "";
  const depart = arrivalLeg?.depart ?? segment?.depart ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: colorIndex * 0.08 }}
      className="glass-card rounded-3xl p-5 w-full mb-4"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      {/* City header */}
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} style={{ color }} />
        <h3 className="font-black text-base text-gray-800">{city}</h3>
        {arrive && depart && (
          <span className="text-xs text-gray-700 ml-auto">
            {arrive} → {depart}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Getting here */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Getting here</p>
          {arrivalLeg ? (
            <TransportLegCard leg={arrivalLeg} />
          ) : (
            <div className="glass rounded-2xl p-3 text-xs text-gray-700 italic">Searching...</div>
          )}
        </div>

        {/* Hotels */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Hotels</p>
          {segment?.hotels ? (
            <div className="glass rounded-2xl p-3 space-y-2">
              {(segment.hotels.hotels ?? []).slice(0, 2).map((hotel, i) => (
                <div key={i}>
                  <a
                    href={hotel.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-indigo-700 hover:underline truncate block"
                  >
                    {hotel.name}
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-3 text-xs text-gray-700 italic">Searching...</div>
          )}
        </div>

        {/* Activities */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Activities</p>
          {segment?.activities ? (
            <div className="glass rounded-2xl p-3 space-y-2">
              {(segment.activities.activities ?? []).slice(0, 2).map((act, i) => (
                <div key={i}>
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
                    <p className="text-[10px] text-gray-500 line-clamp-1">{act.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-3 text-xs text-gray-700 italic">Searching...</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MultiCityView({ plan }: { plan: MultiCityPlan }) {
  const cities = plan.ordered_cities ?? [];
  const legs = plan.legs ?? [];
  const segments = plan.segments ?? [];

  // Build lookup: city name (lowercase) → segment
  const segmentMap: Record<string, CitySegment> = {};
  for (const seg of segments) {
    segmentMap[seg.city.toLowerCase()] = seg;
  }

  // Build lookup: destination city (lowercase) → arrival leg (excludes return leg)
  const arrivalLegMap: Record<string, TransportLeg> = {};
  for (const leg of legs) {
    if (leg.nights > 0) {
      arrivalLegMap[leg.to.toLowerCase()] = leg;
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Map size={16} className="text-indigo-500" />
        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-200">Multi-City Itinerary</h2>
      </div>
      <RouteTimeline plan={plan} />
      {cities.map((city, i) => (
        <CityBlock
          key={city}
          city={city}
          colorIndex={i}
          arrivalLeg={arrivalLegMap[city.toLowerCase()]}
          segment={segmentMap[city.toLowerCase()]}
        />
      ))}
    </div>
  );
}

// ─── Deep Dive Research Cards ─────────────────────────────────────────────────

function DeepDivesSection({ dives }: { dives: DeepDive[] }) {
  return (
    <div className="mt-4 space-y-3">
      {dives.map((dive, i) => (
        <Card key={i} title={dive.title} icon={<BookOpen className="text-indigo-700" size={18} />}>
          <div className="bg-white/30 p-3 rounded-xl">
            <p className="text-xs text-gray-700 leading-relaxed">{dive.content}</p>
          </div>
          <a
            href={dive.citation_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-1 text-[10px] text-indigo-700 hover:underline"
          >
            <ExternalLink size={9} />
            {dive.citation_title}
          </a>
        </Card>
      ))}
    </div>
  );
}
