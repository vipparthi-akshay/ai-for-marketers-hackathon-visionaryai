# MarketPilot AI

## "The Autonomous AI Marketing Team"

> AI-powered marketing operating system for small businesses. Automate content, SEO, ads, campaigns, analytics, and more — all from one platform.

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Gemini API key (or OpenAI key as fallback)

### 1. Clone & Setup

```bash
cd "AI for Marketers Hackathon"
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

### 2. Start with Docker Compose

```bash
docker-compose up -d
```

This starts:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### 3. Manual Setup (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create database
createdb marketpilot

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│              FRONTEND                    │
│    Next.js 14 + TypeScript + Tailwind   │
├─────────────────────────────────────────┤
│              BACKEND API                 │
│        FastAPI + Python 3.11+           │
├──────────────┬──────────────────────────┤
│   AI LAYER   │      DATA LAYER          │
│  LangGraph   │   PostgreSQL + Redis     │
│  Gemini API  │   ChromaDB (vectors)     │
└──────────────┴──────────────────────────┘
```

## AI Modules

| Module | Description |
|---|---|
| Business Analyzer | SWOT analysis, growth recommendations |
| Persona Generator | Customer personas with demographics |
| Content Engine | 15+ content types across platforms |
| Campaign Builder | Complete campaign strategies |
| SEO Engine | Keywords, audits, meta tags |
| Ads Optimization | Google/Meta/LinkedIn ad variations |
| Competitor Intelligence | Competitive analysis & gaps |
| Marketing Automation | Visual workflow builder |
| Analytics Dashboard | ROI predictions, growth tracking |
| Chat Assistant | Conversational AI marketing help |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind, shadcn/ui |
| Backend | FastAPI, SQLAlchemy 2.x, Pydantic 2.x, Alembic |
| AI | LangChain, LangGraph, Gemini API, ChromaDB |
| Database | PostgreSQL 15, Redis 7 |
| Deployment | Docker, Vercel, Railway |

## API Endpoints

- `POST /api/v1/auth/register` — Register user
- `POST /api/v1/auth/login` — Login
- `GET /api/v1/auth/me` — Current user
- `POST /api/v1/businesses/{org_id}/businesses` — Create business
- `POST /api/v1/businesses/{org_id}/businesses/{id}/analyze` — AI analysis
- `POST /api/v1/content/generate` — Generate content
- `POST /api/v1/campaigns/generate` — Generate campaign
- `POST /api/v1/seo/analyze` — SEO audit
- `POST /api/v1/ads/generate` — Generate ads
- `POST /api/v1/competitors/analyze` — Competitor analysis
- `POST /api/v1/personas/generate` — Generate personas
- `GET /api/v1/analytics/dashboard/{id}` — Dashboard data
- `POST /api/v1/analytics/predict` — ROI prediction
- `POST /api/v1/chat` — Chat assistant

## Project Structure

```
marketpilot-ai/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, security, DB, exceptions
│   │   ├── features/       # Feature modules (11 features)
│   │   ├── ai/             # AI agents and prompts
│   │   ├── shared/         # Shared models and utils
│   │   └── main.py         # FastAPI app entry
│   ├── migrations/         # Alembic migrations
│   ├── tests/              # Unit, integration, API tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # API client, utilities
│   │   └── stores/         # Zustand state stores
│   ├── package.json
│   └── Dockerfile
├── docs/                   # PRD, TRD, Architecture
├── docker-compose.yml
└── README.md
```

## Hackathon Tracks

| Track | Coverage |
|---|---|
| AI Content Engine | 15+ content types: blogs, social, email, ads, video scripts |
| AI Ads Optimization | Google/Meta/LinkedIn with CTR prediction |
| Marketing Automation | Visual workflow builder with templates |
| Customer Insights | AI personas, analytics, ROI prediction |
| Personalization Engine | Dynamic content, segment messaging |

## Environment Variables

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/marketpilot
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
GEMINI_API_KEY=your-gemini-key
CORS_ORIGINS=http://localhost:3000
```

## License

MIT — Built for HackIndia 2026
