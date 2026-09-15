# CopyRadar

Hackathon prototype: AI-powered copyright watchdog for images, audio, and text.

Detection, S3, PostgreSQL, and Pinecone are **simulated** with realistic mock logic. Persistence is `localStorage` in the browser. Next.js API routes mirror a FastAPI service in `/backend` so you can swap later.

## Demo path

1. Open `/` → **Start Protecting**
2. Drop an image (or paste text / audio)
3. Watch fingerprinting: extract → hash → vector index
4. **Scan the Web** → terminal log + radar
5. Dashboard → Action → **Generate DMCA Takedown**

## Frontend

```bash
npm install
npm run dev
```

App Router pages: `/`, `/upload`, `/dashboard`, `/works`.

Optional: `NEXT_PUBLIC_API_URL=http://localhost:8000` to point scans at FastAPI (you would then change the client fetch URL).

## FastAPI (optional swap-in)

```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload --port 8000
```

## Stack

- Next.js 14 App Router, Tailwind, shadcn-style Radix UI, Framer Motion, Lucide, react-dropzone
- Mock scan: 14 results (7 legal / 7 illegal) with type-specific match labels
