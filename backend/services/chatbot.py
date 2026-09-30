import requests

from backend.services.rag import rag


OLLAMA_URL = "http://127.0.0.1:11434/api/generate"
MODEL = "llama3.2:3b"


def soc_chat(message: str) -> dict:
    message = message.strip()

    if not message:
        return {
            "reply": "Please enter a cybersecurity question.",
            "sources": [],
            "engine": f"RAG + Ollama ({MODEL})",
        }

    documents = rag.retrieve(
        message,
        top_k=2,
        min_score=0.15,
    )

    context = "\n\n".join(
        document["content"]
        for document in documents
    )

    prompt = f"""
You are MITNICK ASSIST, a defensive cybersecurity SOC assistant.

Your role is to help a security analyst understand:
- security alerts
- network telemetry
- incident investigation
- defensive response
- SOC procedures
- threat detection
- MITNICK ASSIST architecture

Use the retrieved security knowledge when relevant.

Do not invent evidence.
Do not claim an attack succeeded unless evidence proves it.
Keep answers concise and practical.
Do not automatically execute security actions.
High-impact actions require human analyst approval.

SECURITY KNOWLEDGE:

{context}

ANALYST QUESTION:

{message}

Answer the analyst directly.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": False,
                "keep_alive": "30m",
                "options": {
                    "temperature": 0.2,
                    "num_predict": 180,
                    "num_ctx": 2048,
                },
            },
            timeout=90,
        )

        response.raise_for_status()

        result = response.json()

        reply = result.get(
            "response",
            "No response generated.",
        ).strip()

        return {
            "reply": reply,

            "sources": [
                {
                    "source": document["source"],
                    "score": document["score"],
                }
                for document in documents
            ],

            "engine": f"RAG + Ollama ({MODEL})",
        }

    except Exception as error:
        print(f"[CHATBOT] Error: {error}")

        return {
            "reply":
                "The local AI engine is currently unavailable.",

            "sources": [],

            "engine": "Unavailable",
        }
