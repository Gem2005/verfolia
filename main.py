from fastapi import FastAPI, Query, HTTPException
from typing import List, Dict, Optional, Union
from pydantic import BaseModel
from supabase import create_client, Client
from user_agents import parse  # pip install pyyaml ua-parser user-agents
from dotenv import load_dotenv
from collections import Counter, defaultdict
import datetime, os
import httpx

# -----------------------------
# App
# -----------------------------
app = FastAPI(
    title="Analytics Dashboard API",
    description="API backend for profile analytics dashboard (Supabase resume_views)",
    version="1.0.0"
)

load_dotenv()

# -----------------------------
# Supabase Client
# -----------------------------
SUPABASE_URL = (
    os.getenv("SUPABASE_URL")
    or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
)

# Accept either service role or anon key; prefer service role if available.
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("SUPABASE_ANON_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
)

# Backward compatibility: allow using SUPABASE_PROJECT_ID when URL isn't provided
SUPABASE_PROJECT_ID = os.getenv("SUPABASE_PROJECT_ID")
if not SUPABASE_URL and SUPABASE_PROJECT_ID:
    if SUPABASE_PROJECT_ID.startswith("http://") or SUPABASE_PROJECT_ID.startswith("https://") or "supabase.co" in SUPABASE_PROJECT_ID:
        SUPABASE_URL = SUPABASE_PROJECT_ID
    else:
        SUPABASE_URL = f"https://{SUPABASE_PROJECT_ID}.supabase.co"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "❌ Missing Supabase credentials. Provide SUPABASE_URL (or SUPABASE_PROJECT_ID) and a Supabase key."
    )

SUPABASE_URL = SUPABASE_URL.rstrip("/")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -----------------------------
# Data Models
# -----------------------------
class Core4Response(BaseModel):
    resume_id: str
    reach: int
    engagement: float
    conversions: int
    return_interest_pct: float

class InsightsResponse(BaseModel):
    resume_id: str
    referrers: Dict[str, int]
    devices: Dict[str, int]
    geography: Dict[str, int]
    heatmap: Dict[str, int]

class AdvancedResponse(BaseModel):
    resume_id: str
    returning_visitor_alerts: List[str]

# -----------------------------
# Endpoints
# -----------------------------

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/healthz")
def healthz():
    return {"status": "healthy"}
@app.get("/core4", response_model=Union[List[Core4Response], Core4Response])
def get_core4(resume_id: Optional[str] = Query(None, description="Resume ID to fetch metrics for (optional)")):
    # If a specific resume_id is provided, return single result
    if resume_id:
        try:
            rows = (
                supabase
                .table("resume_views")
                .select("session_id, view_duration")
                .eq("resume_id", resume_id)
                .execute()
                .data
            )
        except httpx.ConnectError as e:
            raise HTTPException(status_code=502, detail="Failed to connect to Supabase. Check SUPABASE_URL.") from e
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail="Supabase HTTP error while fetching data.") from e
        except Exception as e:
            raise HTTPException(status_code=500, detail="Unexpected error while querying Supabase.") from e

        session_counts = Counter([r.get("session_id") for r in rows if r.get("session_id")])
        print(session_counts)
        reach = len(session_counts)
        durations = [r.get("view_duration") for r in rows if r.get("view_duration") is not None]
        engagement = sum(durations) / len(durations) if durations else 0
        conversions = 0
        returning = sum(1 for c in session_counts.values() if c > 1)
        return_interest_pct = (returning / reach * 100) if reach else 0

        return Core4Response(
            resume_id=resume_id,
            reach=reach,
            engagement=engagement,
            conversions=conversions,
            return_interest_pct=return_interest_pct
        )

    # Otherwise, aggregate and return results for all unique resume_ids
    try:
        rows = (
            supabase
            .table("resume_views")
            .select("resume_id, session_id, view_duration")
            .execute()
            .data
        )
    except httpx.ConnectError as e:
        raise HTTPException(status_code=502, detail="Failed to connect to Supabase. Check SUPABASE_URL.") from e
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail="Supabase HTTP error while fetching data.") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unexpected error while querying Supabase.") from e

    grouped: Dict[str, Dict[str, List]] = defaultdict(lambda: {"sessions": [], "durations": []})
    for r in rows:
        rid = r.get("resume_id")
        if not rid:
            continue
        if r.get("session_id"):
            grouped[rid]["sessions"].append(r.get("session_id"))
        if r.get("view_duration") is not None:
            grouped[rid]["durations"].append(r.get("view_duration"))

    results: List[Core4Response] = []
    for rid, vals in grouped.items():
        session_counts = Counter(vals["sessions"])
        reach = len(session_counts)
        durations = vals["durations"]
        engagement = sum(durations) / len(durations) if durations else 0
        returning = sum(1 for c in session_counts.values() if c > 1)
        return_interest_pct = (returning / reach * 100) if reach else 0
        results.append(Core4Response(
            resume_id=rid,
            reach=reach,
            engagement=engagement,
            conversions=0,
            return_interest_pct=return_interest_pct
        ))

    return results


@app.get("/insights", response_model=Union[List[InsightsResponse], InsightsResponse])
def get_insights(resume_id: Optional[str] = Query(None, description="Resume ID to fetch insights for (optional)")):
    # Specific resume insights
    if resume_id:
        try:
            rows = (
                supabase
                .table("resume_views")
                .select("referrer, country, user_agent, viewed_at")
                .eq("resume_id", resume_id)
                .execute()
                .data
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail="Supabase HTTP error while fetching data.") from e
        except Exception as e:
            raise HTTPException(status_code=500, detail="Unexpected error while querying Supabase.") from e

        referrers, devices, geography, heatmap = {}, {}, {}, {}
        for r in rows:
            ref = r.get("referrer") or "Direct"
            referrers[ref] = referrers.get(ref, 0) + 1
            c = r.get("country") or "Unknown"
            geography[c] = geography.get(c, 0) + 1
            ua_str = r.get("user_agent") or ""
            ua = parse(ua_str)
            device_type = "mobile" if ua.is_mobile else ("tablet" if ua.is_tablet else "desktop")
            devices[device_type] = devices.get(device_type, 0) + 1
            if r.get("viewed_at"):
                day = datetime.datetime.fromisoformat(r["viewed_at"]).strftime("%A")
                heatmap[day] = heatmap.get(day, 0) + 1

        return InsightsResponse(
            resume_id=resume_id,
            referrers=referrers,
            devices=devices,
            geography=geography,
            heatmap=heatmap
        )

    # Aggregate across all resume_ids
    try:
        rows = (
            supabase
            .table("resume_views")
            .select("resume_id, referrer, country, user_agent, viewed_at")
            .execute()
            .data
        )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail="Supabase HTTP error while fetching data.") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unexpected error while querying Supabase.") from e

    agg: Dict[str, Dict[str, Dict[str, int] or Dict[str, int] or Dict[str, int]]] = {}
    heatmaps: Dict[str, Dict[str, int]] = {}
    for r in rows:
        rid = r.get("resume_id")
        if not rid:
            continue
        if rid not in agg:
            agg[rid] = {
                "referrers": {},
                "devices": {},
                "geography": {}
            }
            heatmaps[rid] = {}
        # Referrer
        ref = r.get("referrer") or "Direct"
        agg[rid]["referrers"][ref] = agg[rid]["referrers"].get(ref, 0) + 1
        # Geography
        c = r.get("country") or "Unknown"
        agg[rid]["geography"][c] = agg[rid]["geography"].get(c, 0) + 1
        # Device
        ua_str = r.get("user_agent") or ""
        ua = parse(ua_str)
        device_type = "mobile" if ua.is_mobile else ("tablet" if ua.is_tablet else "desktop")
        agg[rid]["devices"][device_type] = agg[rid]["devices"].get(device_type, 0) + 1
        # Heatmap
        if r.get("viewed_at"):
            day = datetime.datetime.fromisoformat(r["viewed_at"]).strftime("%A")
            heatmaps[rid][day] = heatmaps[rid].get(day, 0) + 1

    results: List[InsightsResponse] = []
    for rid, parts in agg.items():
        results.append(InsightsResponse(
            resume_id=rid,
            referrers=parts["referrers"],
            devices=parts["devices"],
            geography=parts["geography"],
            heatmap=heatmaps[rid]
        ))

    return results


@app.get("/advanced", response_model=Union[List[AdvancedResponse], AdvancedResponse])
def get_advanced(resume_id: Optional[str] = Query(None, description="Resume ID to fetch advanced features for (optional)")):
    # Specific resume advanced data
    if resume_id:
        try:
            rows = (
                supabase
                .table("resume_views")
                .select("ip_address, country, city, region, session_id, viewed_at, user_agent")
                .eq("resume_id", resume_id)
                .execute()
                .data
            )
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail="Supabase HTTP error while fetching data.") from e
        except Exception as e:
            raise HTTPException(status_code=500, detail="Unexpected error while querying Supabase.") from e

        visitor_map = defaultdict(list)
        for r in rows:
            key = f"{r.get('ip_address')}-{r.get('country')}-{r.get('city')}-{r.get('region')}"
            if r.get("viewed_at"):
                visitor_map[key].append(r["viewed_at"])

        alerts = []
        for key, visits in visitor_map.items():
            if len(visits) > 1:
                latest = max(visits)
                alerts.append(f"Visitor {key} has returned {len(visits)} times, last at {latest}")

        return AdvancedResponse(
            resume_id=resume_id,
            returning_visitor_alerts=alerts[:5]
        )

    # Aggregate across all resume_ids
    try:
        rows = (
            supabase
            .table("resume_views")
            .select("resume_id, ip_address, country, city, region, session_id, viewed_at, user_agent")
            .execute()
            .data
        )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail="Supabase HTTP error while fetching data.") from e
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unexpected error while querying Supabase.") from e

    maps: Dict[str, Dict[str, List[str]]] = defaultdict(lambda: defaultdict(list))
    for r in rows:
        rid = r.get("resume_id")
        if not rid:
            continue
        key = f"{r.get('ip_address')}-{r.get('country')}-{r.get('city')}-{r.get('region')}"
        if r.get("viewed_at"):
            maps[rid][key].append(r["viewed_at"])

    results: List[AdvancedResponse] = []
    for rid, visitor_map in maps.items():
        alerts: List[str] = []
        for key, visits in visitor_map.items():
            if len(visits) > 1:
                latest = max(visits)
                alerts.append(f"Visitor {key} has returned {len(visits)} times, last at {latest}")
        results.append(AdvancedResponse(
            resume_id=rid,
            returning_visitor_alerts=alerts[:5]
        ))

    return results
