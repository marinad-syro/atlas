"use client";

import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";

// ─── Mock mode ────────────────────────────────────────────────────────────────
// Set NEXT_PUBLIC_MOCK_AGENT=true in .env.local to simulate the full flow
// without an ElevenLabs account. Useful for building and testing the UI.

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_AGENT === "true";

const MOCK_SEQUENCE = [
  {
    delay: 1500,
    section: "destination",
    data: {
      destinations: [
        {
          name: "Sardinia, Italy",
          summary: "Crystal-clear water, quiet May crowds, wild coastline, and authentic food.",
          source_url: "https://www.lonelyplanet.com/italy/sardinia",
        },
      ],
      detailed_info: "Sardinia offers some of Europe's most stunning beaches...",
    },
  },
  {
    delay: 3500,
    section: "flights",
    data: {
      options: [
        {
          label: "New York (JFK) → Cagliari (CAG)",
          skyscanner_url:
            "https://www.skyscanner.com/transport/flights/jfk/cag/260523/260602/",
          depart_date: "2026-05-23",
          return_date: "2026-06-02",
          estimated_price: "Check Skyscanner for live prices",
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
        {
          name: "Hotel Bue Marino",
          highlight: "Beachfront, family-run, excellent reviews",
          booking_url: "https://www.booking.com/searchresults.html?ss=Sardinia",
        },
        {
          name: "Su Gologone",
          highlight: "Boutique inland hotel with local cuisine",
          booking_url: "https://www.booking.com/searchresults.html?ss=Sardinia",
        },
      ],
      booking_search_url: "https://www.booking.com/searchresults.html?ss=Sardinia",
    },
  },
  {
    delay: 7500,
    section: "activities",
    data: {
      activities: [
        {
          name: "Snorkeling at Cala Mariolu",
          description: "Remote cove with turquoise water accessible only by boat.",
          source_url: "https://www.lonelyplanet.com",
        },
        {
          name: "Nuraghe Su Nuraxi (UNESCO site)",
          description: "Mysterious Bronze Age tower complex, uniquely Sardinian.",
          source_url: "https://www.lonelyplanet.com",
        },
        {
          name: "Cagliari old town food tour",
          description: "Bottarga, pane carasau, and mirto liqueur in the historic quarter.",
          source_url: "https://www.lonelyplanet.com",
        },
      ],
    },
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface VoicePanelProps {
  onTripSectionUpdate: (section: string, data: unknown) => void;
  onReset: () => void;
}

type ConvMode = "speaking" | "listening";

export default function VoicePanel({ onTripSectionUpdate, onReset }: VoicePanelProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ConvMode>("listening");

  // Real ElevenLabs conversation hook
  const conversation = useConversation({
    clientTools: {
      show_trip_section: async ({
        section,
        data,
      }: {
        section: string;
        data: unknown;
      }) => {
        console.log("show_trip_section called:", section, `(${typeof data === "string" ? data.length : "?"} chars)`, data);
        const valid = ["destination", "flights", "hotels", "activities"];
        if (!valid.includes(section)) return "unknown section";
        // data arrives as a JSON string (EL client tool params don't support object type)
        let parsed: unknown;
        try {
          parsed = typeof data === "string" ? JSON.parse(data) : data;
        } catch (e) {
          console.error("show_trip_section: failed to parse data", e, data);
          return "parse error";
        }
        onTripSectionUpdate(section, parsed);
        return "displayed";
      },
    },
    onConnect: () => {
      setError(null);
    },
    onDisconnect: () => {
      setIsStarted(false);
    },
    onError: (err: unknown) => {
      const msg =
        typeof err === "string"
          ? err
          : err instanceof Error
          ? err.message
          : "Connection error";
      setError(msg);
      setIsStarted(false);
    },
    onModeChange: ({ mode: m }: { mode: ConvMode }) => {
      setMode(m);
    },
  });

  // ── Mock conversation (no ElevenLabs account needed) ──
  const runMockConversation = useCallback(() => {
    setIsStarted(true);
    setMode("speaking");

    MOCK_SEQUENCE.forEach(({ delay, section, data }) => {
      setTimeout(() => {
        onTripSectionUpdate(section, data);
      }, delay);
    });

    // "End" the mock after all steps are shown
    setTimeout(() => {
      setMode("listening");
    }, MOCK_SEQUENCE[MOCK_SEQUENCE.length - 1].delay + 1500);
  }, [onTripSectionUpdate]);

  // ── Start / end handlers ──
  const startConversation = async () => {
    if (MOCK_MODE) {
      runMockConversation();
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!,
        connectionType: "webrtc",
      });
      setIsStarted(true);
      setError(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to start conversation";
      setError(msg);
    }
  };

  const endConversation = async () => {
    if (!MOCK_MODE) {
      await conversation.endSession();
    }
    setIsStarted(false);
    setMode("listening");
  };

  const handleReset = () => {
    if (isStarted) endConversation();
    onReset();
  };

  const isSpeaking = MOCK_MODE ? mode === "speaking" : conversation.isSpeaking;

  // ── Render ──
  return (
    <div className="flex flex-col h-full p-8 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">TripAgent</h1>
          <p className="text-sm text-gray-400 mt-0.5">AI-powered travel planning</p>
        </div>
        {MOCK_MODE && (
          <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-1 rounded">
            MOCK MODE
          </span>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div
          className={`w-2 h-2 rounded-full transition-colors ${
            isStarted ? "bg-green-400" : "bg-gray-600"
          }`}
        />
        <span className="text-gray-400">
          {isStarted
            ? isSpeaking
              ? "Agent is speaking…"
              : "Listening…"
            : "Tap the mic to start"}
        </span>
      </div>

      {/* Waveform animation */}
      <div className="flex items-center justify-center h-16 gap-1">
        {[
          "animate-bar-1",
          "animate-bar-2",
          "animate-bar-3",
          "animate-bar-4",
          "animate-bar-5",
          "animate-bar-4",
          "animate-bar-3",
          "animate-bar-2",
          "animate-bar-1",
        ].map((anim, i) => (
          <div
            key={i}
            className={`waveform-bar ${isStarted ? anim : ""}`}
            style={{
              height: isStarted ? undefined : "4px",
              opacity: isStarted ? 1 : 0.3,
            }}
          />
        ))}
      </div>

      {/* Mic / End button */}
      <div className="flex flex-col items-center gap-4">
        {!isStarted ? (
          <button
            onClick={startConversation}
            className="w-20 h-20 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-blue-500/30"
            aria-label="Start conversation"
          >
            <MicIcon />
          </button>
        ) : (
          <button
            onClick={endConversation}
            className="w-20 h-20 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-red-500/30"
            aria-label="End conversation"
          >
            <StopIcon />
          </button>
        )}

        {isStarted && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            Reset trip
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-700/50 p-4 text-sm text-red-300">
          <span className="font-medium">Error:</span> {error}
        </div>
      )}

      {/* Prompt hints */}
      {!isStarted && !error && (
        <div className="mt-auto space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Try saying</p>
          {[
            "Warm beach, Europe, quiet, 10 days, $3k budget",
            "Mountains, Japan, two weeks, cultural experiences",
            "City break, Southeast Asia, street food, under $2k",
          ].map((hint) => (
            <div
              key={hint}
              className="text-sm text-gray-400 bg-white/5 rounded-lg px-4 py-2 border border-white/5"
            >
              {hint}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function MicIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
