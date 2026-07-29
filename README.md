# MarketPilot AI

## "The Autonomous AI Marketing Team"

> AI-powered marketing operating system for small businesses. Automate content, SEO, ads, campaigns, analytics, and more — all from one platform.

---

## 🚀 Clone & Run (One Command)

**Prerequisite:** Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and make sure it's running.

Then run:

| Platform | Command / File |
|---|---|
| **Windows** | Double-click `setup.bat` |
| **Mac / Linux** | Run `bash run.sh` |
| **Any (PowerShell)** | Run `.\run-hackathon.ps1` |

Or directly with Docker Compose:

```bash
docker-compose up -d
```

Open **http://localhost:3000** in your browser.

---

## 🌐 Live Demo (One-Click Deploy)

Deploy this project to the cloud for free in 2 minutes. No local setup required.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vipparthi-akshay/ai-for-marketers-hackathon-visionaryai)
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.app/new/template?template=https://github.com/vipparthi-akshay/ai-for-marketers-hackathon-visionaryai)

### Deploy Steps

**Step 1: Deploy Backend (Railway)**
1. Click the **"Deploy on Railway"** button above
2. Sign up with your GitHub account (free)
3. Railway will auto-detect the Python backend and deploy it
4. Wait ~1-2 minutes for deployment to complete
5. Copy your Railway backend URL (e.g., `https://marketpilot-api.up.railway.app`)

**Step 2: Deploy Frontend (Vercel)**
1. Click the **"Deploy with Vercel"** button above
2. Sign up with your GitHub account (free)
3. Vercel will import the repository and deploy the frontend
4. Wait ~1-2 minutes for deployment to complete
5. Copy your Vercel frontend URL (e.g., `https://marketpilot-frontend.vercel.app`)

**Step 3: Connect Frontend to Backend**
1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add a new environment variable:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** Your Railway backend URL (from Step 1)
3. Click **Save** and **Redeploy** the Vercel project

**Step 4: Configure CORS**
1. In your Railway project dashboard, go to your backend service → **Variables**
2. Add/modify the `CORS_ORIGINS` variable:
   - **Value:** Your Vercel frontend URL (from Step 2)
3. Railway will automatically redeploy with the new settings

### Verify Deployment

- **Frontend:** Open your Vercel URL in a browser
- **Backend Health:** Visit `https://your-railway-url.up.railway.app/health` - should return `{"status": "healthy"}`
- **API Docs:** Visit `https://your-railway-url.up.railway.app/docs`

> **Note:** If you see an error about "image.png" during Vercel deployment, this is from Vercel's platform AI features, not from this codebase. The deployment will still succeed. If needed, disable AI-powered site analysis in your Vercel project settings.

---

## Live Demo (Local)

When you run the project locally, you get:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Database:** PostgreSQL on port 5432
- **Cache:** Redis on port 6379

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- OR Python 3.11+, Node.js 20+, PostgreSQL 15+, Redis 7+

### 1. Clone the Repository

```bash
git clone https://github.com/vipparthi-akshay/ai-for-marketers-hackathon-visionaryai.git
cd ai-for-marketers-hackathon-visionaryai
```

### 2. Start with Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts all services:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

Wait 15-20 seconds, then visit **http://localhost:3000** in Chrome.

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

## Hackathon Quick Start

**Fastest way to run the project — double-click one file:**

Double-click `setup.bat` (Windows) or run `bash run.sh` (Mac/Linux).
This single script will:
1. Start Docker Desktop Service if it's stopped
2. Launch all services (database, cache, backend, frontend)
3. Open **only Google Chrome** with the running website
4. No other applications will open — no console windows, no error pages

> **Note:** If you see a security warning, click "More Info" → "Run Anyway".

### Manual Steps (if script doesn't work)

### Step 1: Start Docker Desktop

Launch **Docker Desktop** (double-click its icon in Start Menu) and wait until the whale icon in the system tray is running (no errors).

### Step 2: Start the Application

```bash
docker-compose up -d
```

This will start 4 services:
- **Database** (PostgreSQL) on port 5432
- **Cache** (Redis) on port 6379
- **Backend API** on port 8000
- **Frontend** on port 3000

Wait about 15-20 seconds for all services to be ready.

### Step 3: Open in Chrome

Visit **http://localhost:3000** in Google Chrome.

You should see the MarketPilot AI dashboard — the running website, not an error page.

### Verify Everything is Working

- **Frontend:** http://localhost:3000 → should load the website
- **Backend API:** http://localhost:8000/docs → should show API docs
- **Health Check:** http://localhost:8000/health → should return `{"status": "healthy"}`

### Troubleshooting

| Problem | Solution |
|---|---|
| "This site can't be reached" | Docker Desktop is not running. Launch it and try `docker-compose up -d` again |
| "Port 3000 already in use" | Another process using port 3000. Close it and re-run `docker-compose up -d` |
| "Port 8000 already in use" | Another process using port 8000. Close it and re-run `docker-compose up -d` |
| Chrome opens error page | Wait 20 seconds — services may still be starting up |

### Manual Setup (No Docker)

If Docker is not available, run services manually:

**Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

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

## Security Features

| Feature | Implementation |
|---|---|
| JWT Authentication | HS256 with issuer validation, short-lived access tokens (15min) |
| Password Security | bcrypt hashing, strength validation, common password blocking |
| Rate Limiting | Per-IP rate limits (30/min general, 5/min auth) |
| Account Lockout | 5 failed attempts → 15-minute lockout |
| SSRF Protection | URL validation blocking private IPs, localhost, metadata endpoints |
| Security Headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| CORS | Explicit origin allowlist, restricted methods and headers |
| Ownership Verification | All data access verified against organization membership |
| Input Validation | Pydantic models on every endpoint, field length limits |
| Error Handling | No stack traces in production, generic error messages |
| Database Security | Connection pooling, pool recycling, pre-ping health checks |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register user
- `POST /api/v1/auth/login` — Login (with rate limiting and lockout)
- `POST /api/v1/auth/refresh` — Refresh access token
- `GET /api/v1/auth/me` — Current user profile
- `PUT /api/v1/auth/me` — Update profile
- `POST /api/v1/auth/change-password` — Change password
- `POST /api/v1/auth/forgot-password` — Request password reset
- `POST /api/v1/auth/reset-password` — Reset password with token

### Business Management
- `POST /api/v1/businesses/` — Create organization
- `POST /api/v1/businesses/{org_id}/businesses` — Create business
- `GET /api/v1/businesses/{org_id}/businesses` — List businesses (paginated)
- `GET /api/v1/businesses/{org_id}/businesses/{id}` — Get business
- `PUT /api/v1/businesses/{org_id}/businesses/{id}` — Update business
- `POST /api/v1/businesses/{org_id}/businesses/{id}/analyze` — AI analysis

### Content Engine
- `POST /api/v1/content/generate` — Generate content (15+ types)
- `GET /api/v1/content/{business_id}` — List content (paginated)
- `GET /api/v1/content/detail/{asset_id}` — Get content detail
- `DELETE /api/v1/content/detail/{asset_id}` — Delete content

### Campaigns
- `POST /api/v1/campaigns/` — Create campaign
- `POST /api/v1/campaigns/generate` — AI campaign generation
- `GET /api/v1/campaigns/{business_id}` — List campaigns (paginated)
- `GET /api/v1/campaigns/detail/{campaign_id}` — Get campaign detail

### SEO Engine
- `POST /api/v1/seo/crawl` — Live website crawl (SSRF-protected)
- `POST /api/v1/seo/analyze` — AI SEO audit
- `GET /api/v1/seo/{business_id}` — List SEO reports (paginated)

### Ads Optimization
- `POST /api/v1/ads/generate` — Generate ad variations
- `GET /api/v1/ads/{business_id}` — List ad campaigns (paginated)

### Competitor Intelligence
- `POST /api/v1/competitors/analyze` — Analyze competitor
- `GET /api/v1/competitors/{business_id}` — List competitors (paginated)

### Personas
- `POST /api/v1/personas/generate` — Generate customer personas
- `GET /api/v1/personas/{business_id}` — List personas (paginated)

### Analytics
- `GET /api/v1/analytics/dashboard/{business_id}` — Dashboard data
- `POST /api/v1/analytics/predict` — ROI prediction

### Marketing Automation
- `POST /api/v1/automation/workflows` — Create workflow
- `GET /api/v1/automation/workflows/{business_id}` — List workflows (paginated)
- `GET /api/v1/automation/templates` — Get workflow templates
- `POST /api/v1/automation/workflows/{id}/activate` — Activate workflow
- `POST /api/v1/automation/workflows/{id}/deactivate` — Deactivate workflow

### Chat Assistant
- `POST /api/v1/chat` — Send message (streaming)
- `GET /api/v1/chat/history/{business_id}` — Get chat history
- `DELETE /api/v1/chat/history/{business_id}` — Clear chat history

### Email Integration
- `POST /api/v1/email/send` — Send email
- `POST /api/v1/email/generate-template` — AI email template generation
- `GET /api/v1/email/templates` — List email templates

### Notifications
- `GET /api/v1/notifications` — List notifications (paginated)
- `GET /api/v1/notifications/unread-count` — Unread count
- `PUT /api/v1/notifications/read-all` — Mark all as read
- `PUT /api/v1/notifications/{id}/read` — Mark as read
- `DELETE /api/v1/notifications/{id}` — Delete notification

### Settings
- `GET /api/v1/settings/profile` — Get profile with preferences
- `PUT /api/v1/settings/profile` — Update profile
- `GET /api/v1/settings/notifications` — Get notification preferences
- `PUT /api/v1/settings/notifications` — Update notification preferences
- `DELETE /api/v1/settings/account` — Deactivate account

## Project Structure

```
marketpilot-ai/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, security, DB, exceptions, rate limiting
│   │   ├── features/       # Feature modules (12 features)
│   │   │   ├── auth/       # Authentication, password reset, notifications, settings
│   │   │   ├── business/   # Organizations, businesses
│   │   │   ├── content/    # Content engine, SEO, ads, competitors, automation
│   │   │   ├── campaigns/  # Campaign management
│   │   │   ├── personas/   # Customer personas
│   │   │   ├── analytics/  # Dashboard, ROI prediction
│   │   │   ├── chat/       # AI chat assistant
│   │   │   ├── email/      # Email integration
│   │   │   └── automation/ # Marketing automation
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
│   │   ├── lib/            # API client, utilities, validations
│   │   └── stores/         # Zustand state stores
│   ├── package.json
│   └── Dockerfile
├── docs/                   # PRD, TRD, Architecture
├── docker-compose.yml
└── README.md
```

## Environment Variables

```env
# Required
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/marketpilot
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Optional (for AI features)
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Optional (for production)
REDIS_URL=redis://localhost:6379/0
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=production
```

## Hackathon Tracks

| Track | Coverage |
|---|---|
| AI Content Engine | 15+ content types: blogs, social, email, ads, video scripts |
| AI Ads Optimization | Google/Meta/LinkedIn with CTR prediction |
| Marketing Automation | Visual workflow builder with templates |
| Customer Insights | AI personas, analytics, ROI prediction |
| Personalization Engine | Dynamic content, segment messaging |

## Security Architecture

### OWASP Top 10 Compliance

| Vulnerability | Mitigation |
|---|---|
| Broken Access Control | Ownership verification on all data access |
| Security Misconfiguration | No stack traces in production, restricted CORS |
| Injection | Pydantic validation on all inputs, parameterized queries |
| Authentication Failures | Account lockout, JWT with explicit algorithm, token expiry |
| Cryptographic Failures | bcrypt for passwords, HS256 for JWT, HTTPS enforcement |
| Insecure Design | SSRF protection, rate limiting, input sanitization |
| Security Logging | Structured logging, audit trail for auth events |

### Rate Limiting

| Endpoint | Limit |
|---|---|
| General API | 30 requests/minute per IP |
| Auth (login/register) | 5 requests/minute per IP |
| AI endpoints | 20 requests/minute per IP |

### Data Protection

- Passwords hashed with bcrypt (cost factor 12)
- JWT tokens expire in 15 minutes (access) / 7 days (refresh)
- Password reset tokens expire in 1 hour
- No sensitive data in JWT payloads
- Database connection pooling with health checks

## License

MIT — Built for HackIndia 2026
