"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Easing } from "motion";
import { Mic, RotateCcw, X } from "lucide-react";
import { Syne } from "next/font/google";
import type { TripCard, DeepDive } from "../page";
import ResultsPanel from "./ResultsPanel";

const syne = Syne({ subsets: ["latin"], weight: ["800"] });

// ─── Mock mode ────────────────────────────────────────────────────────────────

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AGENT === "true" || process.env.NEXT_PUBLIC_MOCK_AGENT === "multicity";
const MOCK_MULTI_CITY = process.env.NEXT_PUBLIC_MOCK_AGENT === "multicity";

const MOCK_SEQUENCE = [
  {
    delay: 800,
    section: "summary",
    data: { bullets: ["Sardinia in May — warm, uncrowded, and stunning."] },
  },
  {
    delay: 2000,
    section: "summary",
    data: { bullets: ["Sardinia in May — warm, uncrowded, and stunning.", "Fly into Cagliari (CAG) from JFK with 1 stop via Rome."] },
  },
  {
    delay: 3500,
    section: "summary",
    data: { bullets: ["Sardinia in May — warm, uncrowded, and stunning.", "Fly into Cagliari (CAG) from JFK with 1 stop via Rome.", "Stay near Cala Gonone for beach access and hiking.", "Budget ~$2,800 total including flights and 10 nights.", "Avoid peak July–August crowds — May is ideal timing.", "Must-eat: bottarga, pane carasau, and seafood pasta.", "Book hotels early — coastal spots fill up fast in May."] },
  },
  {
    delay: 5000,
    section: "destination",
    data: {
      destinations: [
        {
          name: "Sardinia, Italy",
          summary: "Crystal-clear water, quiet May crowds, wild coastline, and authentic food.",
          source_url: "https://www.lonelyplanet.com/italy/sardinia",
        },
      ],
    },
  },
  {
    delay: 3500,
    section: "flights",
    data: {
      options: [
        {
          label: "New York (JFK) → Cagliari (CAG)",
          skyscanner_url: "https://www.skyscanner.com/transport/flights/jfk/cag/260523/260602/",
          depart_date: "2026-05-23",
          return_date: "2026-06-02",
          note: "Typically 1 stop via Rome or Milan, ~13-15h",
        },
      ],
    },
  },
  {
    delay: 5500,
    section: "hotels",
    data: {
      hotels: [
        { name: "Hotel Bue Marino", highlight: "Beachfront, family-run, excellent reviews", booking_url: "https://www.booking.com/searchresults.html?ss=Sardinia" },
        { name: "Su Gologone", highlight: "Boutique inland hotel with local cuisine", booking_url: "https://www.booking.com/searchresults.html?ss=Sardinia" },
      ],
      booking_search_url: "https://www.booking.com/searchresults.html?ss=Sardinia",
    },
  },
  {
    delay: 7500,
    section: "activities",
    data: {
      activities: [
        { name: "Snorkeling at Cala Mariolu", description: "Remote cove with turquoise water accessible only by boat.", source_url: "https://www.lonelyplanet.com" },
        { name: "Nuraghe Su Nuraxi (UNESCO site)", description: "Mysterious Bronze Age tower complex, uniquely Sardinian.", source_url: "https://www.lonelyplanet.com" },
        { name: "Cagliari old town food tour", description: "Bottarga, pane carasau, and mirto liqueur in the historic quarter.", source_url: "https://www.lonelyplanet.com" },
      ],
    },
  },
];

const MOCK_MULTI_CITY_SEQUENCE = [
  // Step 1: route plan arrives
  {
    delay: 1000,
    section: "multiCity",
    data: {
      ordered_cities: ["Paris", "Barcelona", "Rome"],
      legs: [
        { from: "New York", to: "Paris", arrive: "2026-06-01", depart: "2026-06-05", nights: 4, options: [] },
        { from: "Paris", to: "Barcelona", arrive: "2026-06-05", depart: "2026-06-09", nights: 4, options: [] },
        { from: "Barcelona", to: "Rome", arrive: "2026-06-09", depart: "2026-06-14", nights: 5, options: [] },
        { from: "Rome", to: "New York", arrive: "2026-06-14", depart: "2026-06-14", nights: 0, options: [] },
      ],
      segments: [],
    },
  },
  // Step 2: transport for leg 1 (flight JFK→CDG)
  {
    delay: 3000,
    section: "multiCity",
    data: {
      ordered_cities: ["Paris", "Barcelona", "Rome"],
      legs: [
        { from: "New York", to: "Paris", arrive: "2026-06-01", depart: "2026-06-05", nights: 4, options: [
          { label: "New York (JFK) → Paris (CDG)", mode: "flight", provider: "Skyscanner", url: "https://www.skyscanner.com/transport/flights/jfk/cdg/260601/", travel_date: "2026-06-01" },
        ]},
        { from: "Paris", to: "Barcelona", arrive: "2026-06-05", depart: "2026-06-09", nights: 4, options: [] },
        { from: "Barcelona", to: "Rome", arrive: "2026-06-09", depart: "2026-06-14", nights: 5, options: [] },
        { from: "Rome", to: "New York", arrive: "2026-06-14", depart: "2026-06-14", nights: 0, options: [] },
      ],
      segments: [],
    },
  },
  // Step 3: transport for leg 2 (train Paris→Barcelona)
  {
    delay: 4500,
    section: "multiCity",
    data: {
      ordered_cities: ["Paris", "Barcelona", "Rome"],
      legs: [
        { from: "New York", to: "Paris", arrive: "2026-06-01", depart: "2026-06-05", nights: 4, options: [
          { label: "New York (JFK) → Paris (CDG)", mode: "flight", provider: "Skyscanner", url: "https://www.skyscanner.com/transport/flights/jfk/cdg/260601/", travel_date: "2026-06-01" },
        ]},
        { from: "Paris", to: "Barcelona", arrive: "2026-06-05", depart: "2026-06-09", nights: 4, options: [
          { label: "Paris → Barcelona", mode: "train", provider: "SNCF Connect", url: "https://www.sncf-connect.com/app/home/shop/search?originCode=FRPAR&destinationCode=ESBAR&outwardDate=2026-06-05T09:00:00", travel_date: "2026-06-05", duration_hint: "~6h 30m", note: "High-speed TGV, direct" },
          { label: "Paris (CDG) → Barcelona (BCN)", mode: "flight", provider: "Skyscanner", url: "https://www.skyscanner.com/transport/flights/cdg/bcn/260605/", travel_date: "2026-06-05" },
        ]},
        { from: "Barcelona", to: "Rome", arrive: "2026-06-09", depart: "2026-06-14", nights: 5, options: [] },
        { from: "Rome", to: "New York", arrive: "2026-06-14", depart: "2026-06-14", nights: 0, options: [] },
      ],
      segments: [],
    },
  },
  // Step 4: Paris hotels + activities
  {
    delay: 6000,
    section: "multiCity",
    data: {
      ordered_cities: ["Paris", "Barcelona", "Rome"],
      legs: [
        { from: "New York", to: "Paris", arrive: "2026-06-01", depart: "2026-06-05", nights: 4, options: [
          { label: "New York (JFK) → Paris (CDG)", mode: "flight", provider: "Skyscanner", url: "https://www.skyscanner.com/transport/flights/jfk/cdg/260601/", travel_date: "2026-06-01" },
        ]},
        { from: "Paris", to: "Barcelona", arrive: "2026-06-05", depart: "2026-06-09", nights: 4, options: [
          { label: "Paris → Barcelona", mode: "train", provider: "SNCF Connect", url: "https://www.sncf-connect.com/app/home/shop/search?originCode=FRPAR&destinationCode=ESBAR&outwardDate=2026-06-05T09:00:00", travel_date: "2026-06-05", duration_hint: "~6h 30m" },
        ]},
        { from: "Barcelona", to: "Rome", arrive: "2026-06-09", depart: "2026-06-14", nights: 5, options: [] },
        { from: "Rome", to: "New York", arrive: "2026-06-14", depart: "2026-06-14", nights: 0, options: [] },
      ],
      segments: [
        {
          city: "Paris", arrive: "2026-06-01", depart: "2026-06-05", nights: 4,
          hotels: { hotels: [{ name: "Hôtel du Louvre", booking_url: "https://www.booking.com/searchresults.html?ss=Paris&checkin=2026-06-01&checkout=2026-06-05" }], booking_search_url: "https://www.booking.com/searchresults.html?ss=Paris&checkin=2026-06-01&checkout=2026-06-05" },
          activities: { activities: [{ name: "Musée d'Orsay", description: "Impressionist masterpieces, skip the Louvre crowds.", source_url: "https://www.musee-orsay.fr" }, { name: "Le Marais food walk", description: "Falafel, croissants, and hidden courtyards.", source_url: "https://www.lonelyplanet.com" }] },
        },
      ],
    },
  },
  // Step 5: summary
  {
    delay: 8000,
    section: "summary",
    data: { bullets: [
      "3 cities in 13 nights: Paris → Barcelona → Rome.",
      "Train Paris→Barcelona: 6h 30m on TGV, no airport stress.",
      "Paris: 4 nights, best for art and food in Le Marais.",
      "Barcelona: 4 nights, architecture + beach combo.",
      "Rome: 5 nights, most historical density per square km.",
      "Book Paris hotels early — June is peak season.",
      "Eurail pass worth it if you add a 4th city.",
    ]},
  },
];


// ─── Orb animation variants ───────────────────────────────────────────────────
// Using repeatType: "mirror" with 2 keyframes so the animation bounces
// A → B → A → B continuously — no jump-back, no double-pause at loop point.

const orbVariants = {
  idle: {
    borderRadius: [
      "40% 60% 70% 30% / 40% 50% 60% 50%",
      "60% 40% 30% 70% / 50% 60% 40% 60%",
    ],
    y: [0, -18],
    scale: [1, 1.05],
    transition: {
      borderRadius: { duration: 3, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
      y: { duration: 2.5, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
      scale: { duration: 3.5, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
    },
  },
  listening: {
    borderRadius: [
      "30% 70% 70% 30% / 30% 30% 70% 70%",
      "70% 30% 30% 70% / 70% 70% 30% 30%",
    ],
    y: [0, -14],
    transition: {
      borderRadius: { duration: 5, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
      y: { duration: 3.5, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
    },
  },
  speaking: {
    borderRadius: [
      "20% 80% 20% 80% / 80% 20% 80% 20%",
      "80% 20% 80% 20% / 20% 80% 20% 80%",
    ],
    scale: [1, 1.1],
    y: [0, -14],
    boxShadow: [
      "0 0 30px rgba(139, 92, 246, 0.4)",
      "0 0 60px rgba(139, 92, 246, 0.7)",
    ],
    transition: {
      borderRadius: { duration: 0.9, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
      scale: { duration: 0.9, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
      y: { duration: 3.5, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
      boxShadow: { duration: 0.9, repeat: Infinity, repeatType: "mirror" as const, ease: "easeInOut" as Easing },
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface VoicePanelProps {
  onTripSectionUpdate: (section: string, data: unknown) => void;
  onTransportLegUpdate: (fromCity: string, toCity: string, options: unknown[]) => void;
  onCitySegmentUpdate: (city: string, hotels: TripCard["hotels"], activities: TripCard["activities"]) => void;
  onDeepDiveAdd: (deepDive: DeepDive) => void;
  onReset: () => void;
  tripCard: TripCard;
}

type ConvMode = "speaking" | "listening";

export default function VoicePanel({ onTripSectionUpdate, onTransportLegUpdate, onCitySegmentUpdate, onDeepDiveAdd, onReset, tripCard }: VoicePanelProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ConvMode>("listening");

  const hasAnyData = Object.values(tripCard).some((v) => v !== null);

  const conversation = useConversation({
    clientTools: {
      show_trip_section: async ({ section, data }: { section: string; data: unknown }) => {
        const valid = ["summary", "destination", "flights", "hotels", "activities", "multiCity"];
        if (!valid.includes(section)) return "displayed";
        let parsed: unknown;
        try {
          parsed = typeof data === "string" ? JSON.parse(data) : data;
        } catch {
          return "displayed";
        }
        onTripSectionUpdate(section, parsed);
        return "displayed";
      },
      show_transport_leg: async ({ from_city, to_city, options }: { from_city: string; to_city: string; options: unknown }) => {
        let parsedOptions: unknown[];
        try {
          parsedOptions = typeof options === "string" ? JSON.parse(options) : (Array.isArray(options) ? options : []);
        } catch {
          return "displayed";
        }
        onTransportLegUpdate(from_city, to_city, parsedOptions);
        return "displayed";
      },
      show_deep_dive: async ({ title, content, citation_url, citation_title }: { title: string; content: string; citation_url: string; citation_title: string }) => {
        onDeepDiveAdd({ title, content, citation_url, citation_title });
        return "displayed";
      },
      show_city_segment: async ({ city, hotels, activities }: { city: string; hotels: unknown; activities: unknown }) => {
        let parsedHotels: TripCard["hotels"] = null;
        let parsedActivities: TripCard["activities"] = null;
        try {
          parsedHotels = typeof hotels === "string" ? JSON.parse(hotels) : (hotels as TripCard["hotels"]);
          parsedActivities = typeof activities === "string" ? JSON.parse(activities) : (activities as TripCard["activities"]);
        } catch {
          return "displayed";
        }
        onCitySegmentUpdate(city, parsedHotels, parsedActivities);
        return "displayed";
      },
    },
    onConnect: () => setError(null),
    onDisconnect: () => setIsStarted(false),
    onError: (err: unknown) => {
      const msg = typeof err === "string" ? err : err instanceof Error ? err.message : "Connection error";
      setError(msg);
      setIsStarted(false);
    },
    onModeChange: ({ mode: m }: { mode: ConvMode }) => setMode(m),
  });

  const runMockConversation = useCallback(() => {
    setIsStarted(true);
    setMode("speaking");
    const seq = MOCK_MULTI_CITY ? MOCK_MULTI_CITY_SEQUENCE : MOCK_SEQUENCE;
    seq.forEach(({ delay, section, data }) => {
      setTimeout(() => onTripSectionUpdate(section, data), delay);
    });
    setTimeout(() => setMode("listening"), seq[seq.length - 1].delay + 1500);
  }, [onTripSectionUpdate]);

  const startConversation = async () => {
    if (MOCK_MODE) { runMockConversation(); return; }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        connectionType: "webrtc",
      });
      setIsStarted(true);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start conversation");
    }
  };

  const endConversation = async () => {
    if (!MOCK_MODE) await conversation.endSession();
    setIsStarted(false);
    setMode("listening");
  };

  const handleReset = () => {
    if (isStarted) endConversation();
    onReset();
  };

  const isSpeaking = MOCK_MODE ? mode === "speaking" : conversation.isSpeaking;

  // Map to the three orb states from v2
  const orbState: "idle" | "listening" | "speaking" = !isStarted
    ? "idle"
    : isSpeaking
    ? "speaking"
    : "listening";

  // Delayed slowdown: speed up to speaking immediately, but delay the transition
  // back to listening/idle so the orb doesn't snap to slow the moment speech ends.
  const [orbAnim, setOrbAnim] = useState<"idle" | "listening" | "speaking">("idle");
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (orbState === "speaking") {
      setOrbAnim("speaking");
    } else {
      t = setTimeout(() => setOrbAnim(orbState), 1200);
    }
    return () => clearTimeout(t);
  }, [orbState]);

  // ── Render ──
  return (
    <div className="flex flex-col items-center justify-between h-screen px-4 py-6 relative z-20">
      {/* Mock mode badge */}
      {MOCK_MODE && (
        <div className="absolute top-6 left-4 z-30">
          <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest glass px-3 py-1.5 rounded-full">
            Mock
          </span>
        </div>
      )}

      {/* Title — pinned near top, fades with the orb */}
      <AnimatePresence>
        {!hasAnyData && (
          <motion.h1
            key="title"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className={`${syne.className} absolute top-10 left-0 right-0 text-center text-3xl uppercase tracking-[0.3em] select-none z-20 bg-gradient-to-b from-white via-sky-200 to-sky-400 bg-clip-text text-transparent`}
            style={{ filter: "drop-shadow(0 2px 8px rgba(56, 189, 248, 0.5))" }}
          >
            Atlas
          </motion.h1>
        )}
      </AnimatePresence>

      {/* Centre content: orb or trip cards */}
      <main
        className={`flex-1 w-full flex flex-col items-center ${
          hasAnyData ? "justify-start pt-16" : "justify-center mt-10"
        } relative overflow-hidden transition-all duration-500`}
      >
        <AnimatePresence mode="wait">
          {!hasAnyData ? (
            <motion.div
              key="orb"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              {/* Orb */}
              <motion.div
                variants={orbVariants}
                animate={error ? "idle" : orbAnim}
                className="w-56 h-56 glass overflow-hidden flex items-center justify-center shadow-2xl relative"
              >
                {/* Moving rainbow gradient inside */}
                <div className="absolute inset-0 animate-moving-colors opacity-40 blur-xl" />
                <div className="w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse relative z-10" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="trip-cards"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full h-full flex flex-col"
            >
              <div
                className="flex-1 overflow-y-auto no-scrollbar pb-24"
              >
                <ResultsPanel tripCard={tripCard} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Status / hints */}
      <div className="w-full min-h-[80px] flex flex-col items-center justify-center text-center px-4 -mt-8">
        {error ? (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        ) : isStarted ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-indigo-400 font-medium"
          >
            {isSpeaking ? "speaking..." : "listening..."}
          </motion.p>
        ) : !hasAnyData ? (
          <p className="text-xs italic text-white/75">
            Try saying &ldquo;I want to explore Greece in April&rdquo;
          </p>
        ) : null}
      </div>

      {/* Bottom controls */}
      <footer className="w-full flex items-center justify-between pb-8 px-4">
        {/* Left: reset */}
        <div className="w-12 flex justify-center">
          {isStarted && (
            <button
              onClick={handleReset}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 shadow-sm hover:bg-white/40 transition-colors"
              aria-label="Reset trip"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>

        {/* Centre: mic button */}
        <div className="relative">
          {isStarted && (
            <div className="absolute inset-0 rounded-full bg-indigo-400/20 animate-mic-ring" />
          )}
          <button
            onClick={() => !isStarted && startConversation()}
            disabled={isStarted}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all z-10 relative glass ${
              isStarted
                ? "bg-indigo-500/50 text-white cursor-default"
                : "text-white hover:scale-105 active:scale-95"
            }`}
            aria-label={isStarted ? "Active" : "Start conversation"}
          >
            <Mic size={24} className={isStarted ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Right: end */}
        <div className="w-12 flex justify-center">
          {isStarted && (
            <button
              onClick={endConversation}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-500 shadow-sm hover:bg-white/40 transition-colors"
              aria-label="End conversation"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
