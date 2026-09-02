"""
VoiceShield AI — backend API (Flask)

Provides mock-but-structured endpoints for the frontend demo:
  POST /api/analyze   -> run detection engines + risk score for a call
  POST /api/verify     -> speaker verification against an enrolled profile
  GET  /api/risk        -> current risk-engine snapshot
  POST /api/respond   -> record a security response for a call
  GET  /api/threats     -> threat intelligence feed (filterable)
  GET  /api/analytics -> chart-ready analytics data
  GET  /api/speakers  -> enrolled speaker profiles
  GET  /api/health      -> health check

Run:
    pip install -r requirements.txt
    python app.py
Server starts on http://localhost:5000
"""
from __future__ import annotations

import random
import string
import time
from datetime import datetime, timedelta

from flask import Flask, jsonify, request

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    """Allow the static frontend (served separately, e.g. via a simple HTTP
    server or opened as a file) to call this API without an extra dependency."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/api/<path:_any>", methods=["OPTIONS"])
def cors_preflight(_any):
    return ("", 204)

# ---------------------------------------------------------------------------
# In-memory "database" (demo only — replace with real storage in production)
# ---------------------------------------------------------------------------


SCENARIOS = {
    "safe": {
        "voice_integrity": 0.96,
        "speaker_match": 0.94,
        "synthetic_probability": 0.03,
        "context_risk": 0.12},
    "suspicious": {
        "voice_integrity": 0.78,
        "speaker_match": 0.71,
        "synthetic_probability": 0.22,
        "context_risk": 0.48},
    "clone": {
        "voice_integrity": 0.55,
        "speaker_match": 0.38,
        "synthetic_probability": 0.88,
        "context_risk": 0.60},
    "highrisk": {
        "voice_integrity": 0.31,
        "speaker_match": 0.22,
        "synthetic_probability": 0.96,
        "context_risk": 0.85},
}

SPEAKERS = [{"name": "Rajesh Kumar",
             "role": "Account Holder",
             "samples": 14,
             "last_verified": "2 minutes ago",
             "status": "Active",
             "match": 92.4},
            {"name": "Anita Sharma",
             "role": "Relationship Manager",
             "samples": 9,
             "last_verified": "1 hour ago",
             "status": "Active",
             "match": 88.1},
            {"name": "Vikram Singh",
             "role": "Executive",
             "samples": 22,
             "last_verified": "3 hours ago",
             "status": "Active",
             "match": 95.7},
            {"name": "Priya Nair",
             "role": "Account Holder",
             "samples": 6,
             "last_verified": "1 day ago",
             "status": "Pending Re-enrollment",
             "match": 61.2},
            {"name": "Suresh Iyer",
             "role": "Account Holder",
             "samples": 11,
             "last_verified": "4 hours ago",
             "status": "Active",
             "match": 89.9},
            ]

THREAT_TYPES = [
    "Voice Clone",
    "Synthetic Voice",
    "Spoof Attempt",
    "Normal Call",
    "Replay Attack"]

RESPONSE_LOG: list[dict] = []


def _risk_score(
        voice_integrity: float,
        speaker_match: float,
        synthetic_probability: float,
        context_risk: float) -> int:
    """Combine the four sub-scores into a single 0-100 impersonation risk score."""
    integrity_risk = (1 - voice_integrity) * 100
    identity_risk = (1 - speaker_match) * 100
    synthetic_risk = synthetic_probability * 100
    context = context_risk * 100

    score = (
        integrity_risk * 0.30
        + identity_risk * 0.25
        + synthetic_risk * 0.30
        + context * 0.15
    )
    return max(0, min(100, round(score)))


def _recommendation(score: int) -> str:
    if score < 30:
        return "ALLOW"
    if score < 60:
        return "REQUEST_VERIFICATION"
    if score < 85:
        return "BLOCK"
    return "BLOCK_AND_ESCALATE"


def _risk_level(score: int) -> str:
    if score < 30:
        return "LOW"
    if score < 60:
        return "MEDIUM"
    if score < 85:
        return "HIGH"
    return "CRITICAL"


def _gen_api_key() -> str:
    return "vs_live_" + "".join(random.choices(string.hexdigits.lower(), k=24))


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return jsonify({"status": "operational",
                    "service": "VoiceShield AI API",
                    "time": datetime.utcnow().isoformat()})


@app.post("/api/analyze")
def analyze():
    """Run the detection engine for a call. Accepts an optional `scenario` key
    (safe / suspicious / clone / highrisk) for the demo mode; otherwise
    generates a plausible random profile."""
    payload = request.get_json(silent=True) or {}
    call_id = payload.get(
        "call_id",
        "VS-" +
        "".join(
            random.choices(
                string.digits,
                k=5)))
    scenario = payload.get("scenario")

    if scenario in SCENARIOS:
        base = SCENARIOS[scenario]
        def jitter(v): return max(
            0.0, min(1.0, v + random.uniform(-0.03, 0.03)))
        metrics = {k: round(jitter(v), 3) for k, v in base.items()}
    else:
        # simulate a call leaning toward "safe" most of the time
        metrics = {
            "voice_integrity": round(random.uniform(0.7, 0.99), 3),
            "speaker_match": round(random.uniform(0.65, 0.98), 3),
            "synthetic_probability": round(random.uniform(0.01, 0.25), 3),
            "context_risk": round(random.uniform(0.05, 0.5), 3),
        }

    score = _risk_score(**metrics)
    result = {
        "call_id": call_id,
        **metrics,
        "risk_score": score,
        "risk_level": _risk_level(score),
        "recommendation": _recommendation(score),
        "analyzed_at": datetime.utcnow().isoformat(),
    }
    return jsonify(result)


@app.post("/api/verify")
def verify():
    """Verify a caller's voiceprint against an enrolled speaker profile."""
    payload = request.get_json(silent=True) or {}
    name = payload.get("speaker_name", "Rajesh Kumar")
    speaker = next(
        (s for s in SPEAKERS if s["name"].lower() == name.lower()),
        SPEAKERS[0])

    match = round(
        max(0, min(100, speaker["match"] + random.uniform(-2, 2))), 1)
    verified = match >= 75
    return jsonify({
        "speaker_name": speaker["name"],
        "role": speaker["role"],
        "match_confidence": match,
        "verified": verified,
        "status": "VERIFIED" if verified else "UNVERIFIED",
        "profile_status": speaker["status"],
    })


@app.get("/api/risk")
def risk_snapshot():
    """Return the current context-aware risk engine snapshot."""
    inputs = {
        "voice_integrity": 94,
        "speaker_identity": 87,
        "caller_context": 79,
        "transaction_context": 70,
    }
    score = _risk_score(
        voice_integrity=inputs["voice_integrity"] / 100,
        speaker_match=inputs["speaker_identity"] / 100,
        synthetic_probability=1 - inputs["caller_context"] / 100,
        context_risk=1 - inputs["transaction_context"] / 100,
    )
    return jsonify({
        "inputs": inputs,
        "risk_score": score,
        "risk_level": _risk_level(score),
        "recommendation": _recommendation(score),
    })


@app.post("/api/respond")
def respond():
    """Record a security response (approve / verify / block) for a call."""
    payload = request.get_json(silent=True) or {}
    call_id = payload.get("call_id", "unknown")
    action = payload.get("action")
    if action not in {"approve", "verify", "block"}:
        return jsonify(
            {"error": "action must be one of: approve, verify, block"}), 400

    entry = {
        "call_id": call_id,
        "action": action,
        "recorded_at": datetime.utcnow().isoformat(),
    }
    RESPONSE_LOG.append(entry)
    return jsonify({"status": "recorded", **entry})


@app.get("/api/threats")
def threats():
    """Return a threat-intelligence feed. Supports ?risk=critical|high|medium|low and ?q=search"""
    risk_filter = request.args.get("risk", "all").lower()
    q = request.args.get("q", "").lower()

    now = datetime.utcnow()
    rows = []
    for i in range(30):
        t = THREAT_TYPES[random.randrange(len(THREAT_TYPES))]
        if t == "Normal Call":
            confidence = random.randint(0, 9)
            risk = "low"
            status = "Allowed"
        else:
            confidence = random.randint(55, 99)
            risk = "critical" if confidence > 90 else "high" if confidence > 75 else "medium"
            status = {
                "critical": "Blocked",
                "high": "Investigating",
                "medium": "Verified"}[risk]
        ts = now - timedelta(minutes=random.randint(0, 600))
        rows.append({
            "time": ts.strftime("%H:%M"),
            "caller": f"+91 {random.randint(70, 99)}XXX{random.randint(10000, 99999)}",
            "threat": t,
            "confidence": confidence,
            "risk": risk.capitalize(),
            "status": status,
        })

    if risk_filter != "all":
        rows = [r for r in rows if r["risk"].lower() == risk_filter]
    if q:
        rows = [r for r in rows if q in r["caller"].lower()
                or q in r["threat"].lower()]

    rows.sort(key=lambda r: r["time"], reverse=True)
    return jsonify({"count": len(rows), "results": rows})


@app.get("/api/speakers")
def speakers():
    return jsonify({"count": len(SPEAKERS), "results": SPEAKERS})


@app.get("/api/analytics")
def analytics():
    """Chart-ready aggregate data for the analytics dashboard."""
    range_key = request.args.get("range", "24h")
    points = {"24h": 12, "7d": 7, "30d": 30, "90d": 12}.get(range_key, 12)

    threats_series = [random.randint(5, 45) for _ in range(points)]
    accuracy_series = [round(random.uniform(93, 99.6), 1)
                       for _ in range(points)]

    return jsonify(
        {
            "range": range_key,
            "threats_over_time": threats_series,
            "detection_accuracy": accuracy_series,
            "threat_distribution": {
                "AI Voice Clone": 28,
                "Synthetic Speech": 19,
                "Replay Attack": 11,
                "Spoofing": 15,
                "Normal": 27,
            },
            "risk_distribution": {
                "Low": 61,
                "Medium": 22,
                "High": 11,
                "Critical": 6},
            "kpis": {
                "calls_analyzed": 12847,
                "threats_detected": 184,
                "verified_speakers": 9421,
                "active_calls": random.randint(
                    15,
                    35),
            },
        })


@app.post("/api/keys/generate")
def generate_key():
    return jsonify({"api_key": _gen_api_key(),
                    "generated_at": datetime.utcnow().isoformat()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
