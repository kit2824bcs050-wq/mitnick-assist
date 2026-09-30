from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


PROJECT_ROOT = Path(__file__).resolve().parents[2]
KNOWLEDGE_DIR = PROJECT_ROOT / "knowledge"


class SecurityRAG:

    def __init__(self):
        self.documents = []
        self.names = []

        for path in sorted(
            KNOWLEDGE_DIR.glob("*.md")
        ):
            text = path.read_text(
                encoding="utf-8"
            )

            self.documents.append(text)
            self.names.append(path.name)

        if not self.documents:
            raise RuntimeError(
                f"No knowledge documents found in "
                f"{KNOWLEDGE_DIR}"
            )

        self.vectorizer = TfidfVectorizer(
            stop_words="english"
        )

        self.document_vectors = (
            self.vectorizer.fit_transform(
                self.documents
            )
        )

    def retrieve(
        self,
        query,
        top_k=2,
        min_score=0.20,
    ):
        query_vector = (
            self.vectorizer.transform(
                [query]
            )
        )

        scores = cosine_similarity(
            query_vector,
            self.document_vectors,
        )[0]

        ranked = scores.argsort()[::-1]

        results = []

        for index in ranked:
            score = float(
                scores[index]
            )

            if score < min_score:
                continue

            results.append({
                "source":
                    self.names[index],

                "score":
                    round(
                        score,
                        4,
                    ),

                "content":
                    self.documents[index],
            })

            if len(results) >= top_k:
                break

        return results


# Global RAG instance used by GenAI and chatbot
rag = SecurityRAG()
