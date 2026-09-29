import json
import time

import requests

from backend.services.rag import rag
from backend.services.investigator import investigate_alert


OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "llama3.2:3b"


def build_query(alert: dict) -> str:
    features = alert.get("features", {})

    return f"""
Cybersecurity incident: {alert.get("attack")}
Severity: {alert.get("severity")}
Confidence: {alert.get("confidence")}%

Authentication failures: {features.get("auth_failures", 0)}
Unique ports: {features.get("unique_ports", 0)}
Connection rate: {features.get("connection_rate", 0)}
Packet rate: {features.get("packet_rate", 0)}
Bytes out: {features.get("bytes_out", 0)}
"""


def investigate_with_genai(alert: dict) -> dict:
    try:
        query = build_query(alert)

        documents = rag.retrieve(
            query,
            top_k=1,
        )

        context = "\n\n".join(
            doc["content"]
            for doc in documents
        )

        prompt = f"""
You are MITNICK ASSIST, a defensive SOC analyst assistant.

Analyze the incident using only the supplied incident evidence
and retrieved security guidance.

Do not invent:
- IP addresses
- usernames
- malware names
- successful compromise
- events that are not present in the evidence

Do not automatically execute containment actions.
Human analyst approval is required.

INCIDENT DATA

Node: {alert.get("node")}
Attack: {alert.get("attack")}
Confidence: {alert.get("confidence")}%
Severity: {alert.get("severity")}

Observed Features:

{json.dumps(alert.get("features", {}), indent=2)}

RETRIEVED SECURITY KNOWLEDGE

{context}

Return ONLY valid JSON using this exact structure:

{{
  "summary": "short SOC incident summary",
  "analysis": "short explanation of why the activity is suspicious",
  "risk": "LOW, MEDIUM, HIGH, or CRITICAL",
  "evidence": [
    "evidence point"
  ],
  "recommended_actions": [
    "defensive investigation or response action"
  ]
}}
"""

        start = time.perf_counter()

        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "keep_alive": "30m",
                "options": {
                    "temperature": 0.1,
                    "num_predict": 140,
                    "num_ctx": 1536,
                },
            },
            timeout=90,
        )

        elapsed = time.perf_counter() - start

        print(
            f"[GENAI] Ollama generation: {elapsed:.2f}s"
        )

        response.raise_for_status()

        ollama_response = response.json()

        generated = json.loads(
            ollama_response["response"]
        )

        return {
            "node": alert.get("node"),
            "incident": alert.get("attack"),
            "confidence": alert.get("confidence"),
            "severity": alert.get("severity"),
            "summary": generated.get(
                "summary",
                "No summary generated.",
            ),
            "reasoning": generated.get(
                "analysis",
                "No analysis generated.",
            ),
            "risk": generated.get(
                "risk",
                alert.get("severity"),
            ),
            "evidence": generated.get(
                "evidence",
                [],
            ),
            "recommended_actions": generated.get(
                "recommended_actions",
                [],
            ),
            "rag_sources": [
                {
                    "source": doc["source"],
                    "score": doc["score"],
                }
                for doc in documents
            ],
            "analyst_decision_required": True,
            "engine": f"RAG + Ollama ({MODEL})",
            "generation_time_seconds": round(
                elapsed,
                2,
            ),
        }

    except Exception as error:
        print(
            f"[GENAI] Ollama failed: {error}"
        )

        fallback = investigate_alert(alert)

        fallback["engine"] = "Rule-Based Fallback"
        fallback["genai_error"] = str(error)

        return fallback
