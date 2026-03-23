"""TripAgent FastAPI backend.

Exposes 4 webhook endpoints that the ElevenLabs Agent calls as server tools.
Run from the backend/ directory:

  uvicorn main:app --reload --port 8000

For development, expose with ngrok:
  ngrok http 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# Tool handlers are imported after load_dotenv() so env vars are available
from tools.suggest_destination import handle_suggest_destination
from tools.find_flights import handle_find_flights
from tools.find_hotels import handle_find_hotels
from tools.find_activities import handle_find_activities

app = FastAPI(title="TripAgent Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request models ────────────────────────────────────────────────────────────

class SuggestDestinationRequest(BaseModel):
    preferences: str


class FindFlightsRequest(BaseModel):
    destination_city: str
    origin_city: str
    depart_date: str
    return_date: str
    passengers: int = 1


class FindHotelsRequest(BaseModel):
    destination: str
    check_in: str
    check_out: str


class FindActivitiesRequest(BaseModel):
    destination: str
    preferences: str = ""


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/tools/suggest_destination")
def suggest_destination(req: SuggestDestinationRequest):
    return handle_suggest_destination(req.preferences)


@app.post("/tools/find_flights")
def find_flights(req: FindFlightsRequest):
    return handle_find_flights(
        req.destination_city,
        req.origin_city,
        req.depart_date,
        req.return_date,
        req.passengers,
    )


@app.post("/tools/find_hotels")
def find_hotels(req: FindHotelsRequest):
    return handle_find_hotels(req.destination, req.check_in, req.check_out)


@app.post("/tools/find_activities")
def find_activities(req: FindActivitiesRequest):
    return handle_find_activities(req.destination, req.preferences)
