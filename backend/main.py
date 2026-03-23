"""TripAgent FastAPI backend.

Exposes 4 webhook endpoints that the ElevenLabs Agent calls as server tools.
Run from the backend/ directory:

  uvicorn main:app --reload --port 8000

For development, expose with ngrok:
  ngrok http 8000
"""

import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# ─── Logging ───────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("tripagent")

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


# ─── Request logging middleware ────────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    # Reading body here caches it in Starlette so downstream handlers can still read it
    body = await request.body()
    log.info("→ %s %s  body=%s", request.method, request.url.path, body.decode()[:500] or "(empty)")
    response = await call_next(request)
    elapsed = (time.time() - start) * 1000
    log.info("← %s %s  status=%d  %.0fms", request.method, request.url.path, response.status_code, elapsed)
    return response


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
    log.info("suggest_destination: preferences=%r", req.preferences)
    result = handle_suggest_destination(req.preferences)
    log.info("suggest_destination: returning %d destination(s)", len(result.get("destinations", [])))
    return result


@app.post("/tools/find_flights")
def find_flights(req: FindFlightsRequest):
    log.info("find_flights: %s → %s  %s–%s", req.origin_city, req.destination_city, req.depart_date, req.return_date)
    result = handle_find_flights(
        req.destination_city,
        req.origin_city,
        req.depart_date,
        req.return_date,
        req.passengers,
    )
    log.info("find_flights: returning %d option(s)", len(result.get("options", [])))
    return result


@app.post("/tools/find_hotels")
def find_hotels(req: FindHotelsRequest):
    log.info("find_hotels: %s  %s–%s", req.destination, req.check_in, req.check_out)
    result = handle_find_hotels(req.destination, req.check_in, req.check_out)
    log.info("find_hotels: returning %d hotel(s)", len(result.get("hotels", [])))
    return result


@app.post("/tools/find_activities")
def find_activities(req: FindActivitiesRequest):
    log.info("find_activities: %s  prefs=%r", req.destination, req.preferences)
    result = handle_find_activities(req.destination, req.preferences)
    log.info("find_activities: returning %d activity(s)", len(result.get("activities", [])))
    return result


# ─── 422 validation error handler ─────────────────────────────────────────────
# ElevenLabs tool calls will return 422 if field names don't match the model.
# Log these so mismatches are immediately visible in the terminal.

from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    log.error(
        "422 validation error on %s %s\n  body: %s\n  errors: %s",
        request.method, request.url.path,
        body.decode()[:500],
        exc.errors(),
    )
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
