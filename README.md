# Atlas

An AI-powered voice travel planner. Talk to Atlas — a conversational travel agent — and it'll build you a full trip: flights, hotels, activities, and multi-city itineraries, all in real time.

## What it does

- **Voice-first** — speak naturally; no forms to fill out
- **Destination suggestions** — Atlas recommends places based on your vibe, budget, and trip length
- **Flights & hotels** — deep-links to Skyscanner and Booking.com with your dates pre-filled
- **Activities** — local picks and hidden gems for each city
- **Multi-city trips** — optimized city order, day splits, and transport options between cities
- **Deep-dive research** — ask for more on food, nightlife, hiking, etc. and get sourced recommendations
- **Live trip card** — a visual itinerary builds up on screen as the conversation progresses

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Motion |
| Voice AI | ElevenLabs Conversational Agent (Claude 3.5 Sonnet) |
| Backend | FastAPI (Python), Uvicorn |
| Web research | Firecrawl |
| Testing | Vitest, React Testing Library |

## Project structure

```
├── frontend/               # Next.js app
│   ├── app/
│   │   ├── page.tsx        # Root — owns trip card state
│   │   ├── components/
│   │   │   ├── VoicePanel.tsx          # ElevenLabs conversation UI
│   │   │   ├── ResultsPanel.tsx        # Trip card display
│   │   │   └── BackgroundSlideshow.tsx # Animated travel background
│   └── src/test/           # Vitest tests
│
└── backend/                # FastAPI server
    ├── main.py             # 7 webhook endpoints
    ├── tools/              # One file per tool
    │   ├── suggest_destination.py
    │   ├── find_flights.py
    │   ├── find_hotels.py
    │   ├── find_activities.py
    │   ├── find_transport.py
    │   ├── plan_route.py
    │   └── research_topic.py
    ├── iata.py             # City → airport code lookup
    └── cache.py            # In-memory result cache
```

## Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- [ElevenLabs](https://elevenlabs.io) account (for the agent)
- [Firecrawl](https://firecrawl.dev) API key (for web research)
- [ngrok](https://ngrok.com) or similar (to expose backend webhooks during local dev)

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```
FIRECRAWL_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
```

Start the server:
```bash
uvicorn main:app --reload --port 8000
```

Expose it publicly for ElevenLabs webhooks:
```bash
ngrok http 8000
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (see `.env.local.example`):
```
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id_here
NEXT_PUBLIC_MOCK_AGENT=false
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=optional_for_background_images
```

Start the dev server:
```bash
npm run dev   # http://localhost:3000
```

### ElevenLabs agent

See [AGENT_SETUP.md](./AGENT_SETUP.md) for the full walkthrough. In short:

1. Create an agent at elevenlabs.io → set LLM to `claude-3-5-sonnet`
2. Paste in the system prompt from AGENT_SETUP.md
3. Add **7 server tools** (webhooks to your ngrok URL):
   - `suggest_destination`, `find_flights`, `find_hotels`, `find_activities`
   - `find_transport`, `plan_route`, `research_topic`
4. Add **3 client tools** (React callbacks): `show_trip_section`, `show_transport_leg`, `show_city_segment`
5. Copy your Agent ID into `.env.local`

NOTE: I did this using the dashboard at the time, but it can be done via the API instead.
## How it works

```
User speaks → ElevenLabs streams audio → Claude 3.5 Sonnet decides which tools to call
     ↓
Server tools → POST to FastAPI → Firecrawl fetches real travel data → returns to agent
     ↓
Client tools → React callbacks → trip card state updates live in the browser
```

The agent orchestrates the conversation flow. Server tools handle data fetching; client tools update the UI without interrupting the voice stream.

## Running tests

```bash
cd frontend
npm test
```

See [TESTING.md](./TESTING.md) for conventions. 100% coverage is the goal.

## Mock mode

To run the frontend without ElevenLabs (useful for UI development):

```
NEXT_PUBLIC_MOCK_AGENT=true       # single-city mock
NEXT_PUBLIC_MOCK_AGENT=multicity  # multi-city mock
```

## Environment variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | Yes | Your ElevenLabs Agent ID |
| `NEXT_PUBLIC_MOCK_AGENT` | No | `true` or `multicity` to skip real API calls |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | No | For background slideshow images |

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `FIRECRAWL_API_KEY` | Yes | Firecrawl API key for web research |
| `ELEVENLABS_API_KEY` | Yes | ElevenLabs API key |
| `WEBHOOK_SECRET` | No | For future webhook authentication |
