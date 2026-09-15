"""
CopyRadar FastAPI service (swap-in for Next.js /api routes).

Run:
  pip install -r requirements.txt
  uvicorn backend.main:app --reload --port 8000

Then set NEXT_PUBLIC_API_URL=http://localhost:8000 in the frontend.
"""

from __future__ import annotations

import hashlib
import random
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

ContentType = Literal["image", "audio", "text"]

app = FastAPI(title="CopyRadar API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    contentType: ContentType = "image"
    seed: str = "copyradar"


class FingerprintRequest(BaseModel):
    contentType: ContentType = "image"
    seed: str = "asset"


MATCH_TYPES = {
    "image": ["Exact", "Cropped 12%", "Resized", "Filtered", "Color-graded"],
    "audio": ["Exact", "Remixed", "Sped up 1.2x", "Clipped segment"],
    "text": ["Exact", "Paraphrased", "Translated copy"],
}

SITES = [
    ("instagram.com", "https://instagram.com/p/credited_repost", "Credited", False, "Meta Platforms, Inc."),
    ("pinterest.com", "https://pinterest.com/pin/48291033", "Credited", False, "Pinterest, Inc."),
    ("stock.adobe.com", "https://stock.adobe.com/license/441882", "Licensed", False, "Adobe Inc."),
    ("behance.net", "https://behance.net/gallery/credited-study", "Credited", False, "Adobe Inc."),
    ("flickr.com", "https://flickr.com/photos/licensed-use", "Licensed", False, "SmugMug, Inc."),
    ("x.com", "https://x.com/artist/status/credited", "Credited", False, "X Corp."),
    ("artstation.com", "https://artstation.com/artwork/licensed", "Licensed", False, "Epic Games, Inc."),
    ("shady-blog.net", "https://shady-blog.net/posts/hot-steal", "No Credit", True, "Cloudflare, Inc. (hosting)"),
    ("etsy.com/listing/8832", "https://etsy.com/listing/8832/print-pack", "No Credit", True, "Etsy, Inc."),
    ("tiktok.com/@user", "https://tiktok.com/@user/video/uncredited", "No Credit", True, "ByteDance Ltd."),
    ("medium.com/@copycat", "https://medium.com/@copycat/rewritten-piece", "No Credit", True, "A Medium Corporation"),
    ("instagram.com", "https://instagram.com/p/copycatshop", "No Credit", True, "Meta Platforms, Inc."),
    ("reddit.com/r/freebies", "https://reddit.com/r/freebies/comments/dump", "No Credit", True, "Reddit, Inc."),
    ("cdn-mirror.xyz", "https://cdn-mirror.xyz/hotlink/asset", "No Credit", True, "DigitalOcean, LLC"),
]


def _rng(seed: str) -> random.Random:
    return random.Random(int(hashlib.sha256(seed.encode()).hexdigest()[:8], 16))


def fingerprint(content_type: ContentType, seed: str) -> dict[str, Any]:
    hex_id = hashlib.md5(f"{seed}:{content_type}".encode()).hexdigest()[:8]
    preview = [round(((int(hex_id, 16) * (i + 3)) % 1000) / 1000 - 0.5, 4) for i in range(12)]
    if content_type == "image":
        display = f"pHash: {hex_id[:4]}-{hex_id[4:8]}-22be"
        algo = "pHash"
        fid = f"phash_{hex_id}"
    elif content_type == "audio":
        display = f"SpectroPrint: F#{hex_id[:2].upper()}-{hex_id[2:6].upper()}"
        algo = "SpectroPrint"
        fid = f"spectro_{hex_id}"
    else:
        display = f"EmbVec: 768-dim · {hex_id[:6]}"
        algo = "EmbVec"
        fid = f"emb_{hex_id}"
    return {
        "algorithm": algo,
        "display": display,
        "id": fid,
        "embeddingPreview": preview,
        "dimensions": 768 if content_type == "text" else None,
    }


def simulate_scan(content_type: ContentType, seed: str) -> list[dict[str, Any]]:
    rng = _rng(f"{seed}:{content_type}")
    kinds = MATCH_TYPES[content_type]
    now = datetime.now(timezone.utc)
    results = []
    for i, (site, url, status, illegal, host) in enumerate(SITES):
        match_type = "Exact" if i in (0, 2, 7, 13) else kinds[i % len(kinds)]
        if match_type == "Exact":
            similarity = 95 + rng.randint(0, 5)
        elif illegal:
            similarity = 78 + rng.randint(0, 16)
        else:
            similarity = 85 + rng.randint(0, 10)
        results.append(
            {
                "id": f"m_{content_type}_{i}_{seed[:6]}",
                "site": site,
                "url": url,
                "matchType": match_type,
                "similarity": similarity,
                "confidence": min(99, similarity - 2 + rng.randint(0, 4)),
                "status": status,
                "illegal": illegal,
                "timestamp": (now - timedelta(hours=4 + rng.randint(0, 240))).isoformat(),
                "thumbnail": f"https://picsum.photos/id/{1015 + i}/160/120" if content_type == "image" else None,
                "title": site,
                "host": host,
            }
        )
    return results


@app.get("/health")
def health():
    return {"ok": True, "service": "copyradar-fastapi"}


@app.post("/api/fingerprint")
@app.post("/fingerprint")
def create_fingerprint(body: FingerprintRequest):
    return {
        "fingerprint": fingerprint(body.contentType, body.seed),
        "s3": {"bucket": "copyradar-demo", "key": f"works/{body.seed}"},
    }


@app.post("/api/scan")
@app.post("/scan")
def scan(body: ScanRequest):
    return {
        "provider": "fastapi-mock",
        "pinecone": {"index": "copyradar-prod", "upserted": True, "namespace": body.contentType},
        "matches": simulate_scan(body.contentType, body.seed),
    }


@app.get("/api/works")
@app.get("/works")
def works_info():
    return {
        "store": "sqlite-or-localStorage",
        "message": "Prototype persists in the Next.js client; wire this to SQLite when swapping.",
    }
