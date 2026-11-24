
import os
import requests

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Paper2Project AI",
    description="AI-powered Research Discovery and Project Innovation Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENALEX_URL = "https://api.openalex.org/works"


def reconstruct_abstract(inverted_index):
    if not inverted_index:
        return "Abstract not available."

    words = {}

    for word, positions in inverted_index.items():
        for position in positions:
            words[position] = word

    return " ".join(
        words[position] for position in sorted(words)
    )


@app.get("/")
def home():
    return {
        "message": "Welcome to Paper2Project AI!",
        "status": "Backend is running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/api/search")
def search_papers(
    query: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    cursor: str = Query("*")
):
    try:
        params = {
            "search": query,
            "per_page": limit,
            "cursor": cursor,
            "select": (
                "id,doi,title,publication_year,"
                "authorships,abstract_inverted_index,"
                "cited_by_count,primary_location,open_access"
            )
        }

        api_key = os.getenv("OPENALEX_API_KEY")
        mailto = os.getenv("OPENALEX_MAILTO")

        if api_key:
            params["api_key"] = api_key

        if mailto:
            params["mailto"] = mailto

        response = requests.get(
            OPENALEX_URL,
            params=params,
            timeout=30
        )

        response.raise_for_status()
        data = response.json()

        papers = []

        for item in data.get("results", []):
            authors = [
                author.get("author", {}).get("display_name")
                for author in item.get("authorships", [])
                if author.get("author")
            ]

            location = item.get("primary_location") or {}
            source = location.get("source") or {}
            open_access = item.get("open_access") or {}

            papers.append({
                "id": item.get("id"),
                "title": item.get("title") or "Untitled",
                "authors": authors,
                "year": item.get("publication_year"),
                "doi": item.get("doi"),
                "abstract": reconstruct_abstract(
                    item.get("abstract_inverted_index")
                ),
                "citations": item.get("cited_by_count", 0),
                "journal": source.get("display_name"),
                "is_open_access": open_access.get("is_oa", False),
                "pdf_url": open_access.get("oa_url"),
                "paper_url": item.get("doi") or item.get("id")
            })

        return {
            "query": query,
            "total_found": data.get("meta", {}).get("count", 0),
            "results_returned": len(papers),
            "next_cursor": data.get("meta", {}).get("next_cursor"),
            "papers": papers
        }

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="Research search timed out. Please try again."
        )

    except requests.exceptions.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"Research API error: {str(error)}"
        )
