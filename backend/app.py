import json
from pathlib import Path

from fastapi import FastAPI


from fastapi.middleware.cors import CORSMiddleware

from backend.services.investigator import investigate_alert

from backend.services.genai import investigate_with_genai

app = FastAPI(
    title="MITNICK ASSIST API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):517[3-9]",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREDICTION_LOG = Path(
    "ml/logs/live_predictions.jsonl"
)


def load_predictions():
    if not PREDICTION_LOG.exists():
        return []

    records = []

    with PREDICTION_LOG.open() as file:
        for line in file:
            line = line.strip()

            if not line:
                continue

            try:
                records.append(json.loads(line))
            except json.JSONDecodeError:
                continue

    return records


@app.get("/")
def root():
    return {
        "project": "MITNICK ASSIST",
        "status": "ONLINE",
        "service": "SOC Backend",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "detection_engine": "available",
    }


@app.get("/alerts")
def get_alerts(limit: int = 50):
    records = load_predictions()

    alerts = []

    for record in records:
        if record.get("prediction") == "NORMAL":
            continue

        alerts.append({
            "timestamp": record["timestamp"],
            "node": record["node"],
            "attack": record["prediction"],
            "confidence": round(
                record["confidence"] * 100,
                2
            ),
            "severity": record["severity"],
            "features": record["features"],
            "status": "OPEN",
        })

    return alerts[-limit:][::-1]


@app.get("/alerts/latest")
def latest_alert():
    records = load_predictions()

    for record in reversed(records):
        if record.get("prediction") != "NORMAL":
            return {
                "timestamp": record["timestamp"],
                "node": record["node"],
                "attack": record["prediction"],
                "confidence": round(
                    record["confidence"] * 100,
                    2
                ),
                "severity": record["severity"],
                "features": record["features"],
                "status": "OPEN",
            }

    return {
        "message": "No active security alerts"
    }


@app.get("/stats")
def stats():
    records = load_predictions()

    normal = 0
    brute_force = 0
    port_scan = 0

    for record in records:
        prediction = record.get("prediction")

        if prediction == "NORMAL":
            normal += 1

        elif prediction == "BRUTE_FORCE":
            brute_force += 1

        elif prediction == "PORT_SCAN":
            port_scan += 1

    attacks = brute_force + port_scan

    return {
        "total_events": len(records),
        "normal": normal,
        "attacks": attacks,
        "brute_force": brute_force,
        "port_scan": port_scan,
    }




@app.get("/ai/investigate/latest")
def investigate_latest():

    records = load_predictions()

    for record in reversed(records):

        if record.get("prediction") == "NORMAL":
            continue

        alert = {
            "timestamp": record["timestamp"],
            "node": record["node"],
            "attack": record["prediction"],
            "confidence": round(
                record["confidence"] * 100,
                2
            ),
            "severity": record["severity"],
            "features": record["features"],
            "status": "OPEN",
        }

        return investigate_with_genai(alert)

    return {
        "message": "No active incident available for investigation"
    }
