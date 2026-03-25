"use client";

import { useState, useEffect } from "react";

const DESTINATIONS = [
  { query: "santorini greece ocean",  label: "Santorini"    },
  { query: "kyoto japan temple",      label: "Kyoto"        },
  { query: "maldives bungalow water", label: "Maldives"     },
  { query: "patagonia mountains",     label: "Patagonia"    },
  { query: "amalfi coast italy",      label: "Amalfi Coast" },
  { query: "iceland waterfall",       label: "Iceland"      },
  { query: "bali rice terrace",       label: "Bali"         },
  { query: "new zealand fiord",       label: "New Zealand"  },
];

// source.unsplash.com used as immediate fallback — shown while API images load
function fallbackUrl(query: string) {
  return `https://source.unsplash.com/1920x1080/?${encodeURIComponent(query)}`;
}

type Slide = { imageUrl: string; label: string };

export default function BackgroundSlideshow() {
  const [slides, setSlides] = useState<Slide[]>(
    DESTINATIONS.map((d) => ({ imageUrl: fallbackUrl(d.query), label: d.label }))
  );
  const [current, setCurrent] = useState(0);

  // Upgrade to Unsplash API images when the key is available
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
    if (!key || key === "your-access-key-here") return;

    Promise.all(
      DESTINATIONS.map(async (dest, i) => {
        try {
          const res = await fetch(
            `https://api.unsplash.com/photos/random?query=${encodeURIComponent(dest.query)}&orientation=landscape&client_id=${key}`
          );
          const json = await res.json();
          const url = json.urls?.regular;
          if (url) {
            setSlides((prev) =>
              prev.map((s, j) => (j === i ? { ...s, imageUrl: url } : s))
            );
          }
        } catch {
          // Keep fallback URL for this slide
        }
      })
    );
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % DESTINATIONS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.label}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${slide.imageUrl}')`,
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.5s ease-in-out",
          }}
        />
      ))}

      {/* Single dark overlay — enough to read UI, not enough to kill the scenery */}
      <div className="absolute inset-0 bg-black/[0.58]" />

      {/* Destination label */}
      <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest text-white/40 select-none z-10">
        {slides[current]?.label}
      </p>
    </div>
  );
}
