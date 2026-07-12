# Technical Requirements Document (TRD)

## MarketPilot AI — Technical Architecture

**Version:** 1.0  
**Date:** July 2026  
**Status:** HackIndia 2026 Hackathon

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [API Design](#4-api-design)
5. [Database Schema](#5-database-schema)
6. [AI Integration Architecture](#6-ai-integration-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Error Handling Strategy](#9-error-handling-strategy)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Testing Strategy](#11-testing-strategy)
12. [Development Workflow](#12-development-workflow)

---

## 1. Architecture Overview

### Design Principles

1. **Clean Architecture** — Separation of concerns across layers (Presentation → Application → Domain → Infrastructure)
2. **Feature-based Organization** — Code organized by feature, not by type
3. **Repository Pattern** — Data access abstracted behind interfaces
4. **Dependency Injection** — Loose coupling between components
5. **Event-driven AI** — AI agents communicate via orchestration layer
6. **API-first Design** — RESTful API designed before frontend implementation

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│         Next.js 14 + TypeScript + Tailwind           │
│                    shadcn/ui                          │
├─────────────────────────────────────────────────────┤
│                    API LAYER                         │
│         FastAPI (Python 3.11+) + Pydantic            │
├──────────────┬──────────────┬───────────────────────┤
│  APPLICATION │     AI       │   INFRASTRUCTURE      │
│    LAYER     │   LAYER      │      LAYER            │
│              │              │                       │
│  Use Cases   │  LangGraph   │  PostgreSQL           │
│  Services    │  Agents      │  Redis (Cache)        │
│  Repos       │  Gemini API  │  Celery (Tasks)       │
│              │  ChromaDB    │  MinIO (Objects)      │
└──────────────┴──────────────┴───────────────────────┘
```

---

## 2. Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.x (App Router) | React framework with SSR/SSG |
| React | 18.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Component library |
| Framer Motion | 11.x | Animations |
| Recharts | 2.x | Dashboard charts |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Schema validation |
| TanStack Query | 5.x | Server state management |
| Zustand | 4.x | Client state management |
| date-fns | 3.x | Date formatting |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | 0.111.x | Web framework |
| SQLAlchemy | 2.x | ORM |
| Alembic | 1.x | Database migrations |
| Pydantic | 2.x | Data validation |
| PyJWT | 2.x | JWT tokens |
| bcrypt | 4.x | Password hashing |
| python-multipart | 0.0.9 | File uploads |

### AI / ML

| Technology | Version | Purpose |
|---|---|---|
| LangChain | 0.2.x | LLM orchestration |
| LangGraph | 0.2.x | Agent state machines |
| Google Generative AI | 0.5.x | Gemini API client |
| ChromaDB | 0.5.x | Vector store (brand memory) |
| tiktoken | 0.7.x | Token counting |

### Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | 15+ | Primary database |
| Redis | 7.x | Caching, sessions, Celery broker |
| Celery | 5.x | Background task processing |
| Docker | 24.x | Containerization |
| Docker Compose | 2.x | Local development environment |
| Nginx | 1.25+ | Reverse proxy (production) |

### Development Tools

| Tool | Purpose |
|---|---|
| ruff | Python linter + formatter |
| black | Python code formatter |
| mypy | Python type checking |
| ESLint | TypeScript linting |
| Prettier | Code formatting |
| pytest | Python testing |
| Vitest | Frontend testing |
| Playwright | E2E testing |

---

## 3. System Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                  │
│  Next.js Pages → Components → API Client            │
├─────────────────────────────────────────────────────┤
│                  APPLICATION LAYER                   │
│  FastAPI Routes → Pydantic Schemas → Services       │
├─────────────────────────────────────────────────────┤
│                    DOMAIN LAYER                     │
│  Models → Repository Interfaces → Business Logic    │
├─────────────────────────────────────────────────────┤
│                INFRASTRUCTURE LAYER                 │
│  DB Repos → AI Clients → Cache → Task Queue         │
└─────────────────────────────────────────────────────┘
```

### Feature Module Structure

```
backend/app/
├── features/
│   ├── auth/
│   │   ├── router.py          # API endpoints
│   │   ├── schemas.py         # Request/Response models
│   │   ├── service.py         # Business logic
│   │   ├── dependencies.py    # Auth dependencies
│   │   └── tests/
│   ├── business/
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── repository.py      # Data access
│   │   └── tests/
│   ├── content/
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   └── tests/
│   ├── campaigns/
│   │   ├── router.py
│   │   ├── schemas.py
│   │   ├── service.py
│   │   └── tests/
│   ├── seo/
│   ├── ads/
│   ├── competitors/
│   ├── automation/
│   ├── analytics/
│   ├── personas/
│   └── chat/
├── core/
│   ├── config.py              # Settings
│   ├── database.py            # DB connection
│   ├── security.py            # JWT, hashing
│   ├── dependencies.py        # Shared dependencies
│   └── exceptions.py          # Custom exceptions
├── ai/
│   ├── orchestrator.py        # Agent orchestration
│   ├── agents/                # Individual agents
│   ├── prompts/               # Prompt templates
│   └── clients.py             # LLM API clients
├── shared/
│   ├── models.py              # Base models
│   ├── schemas.py             # Shared schemas
│   └── utils.py               # Utilities
└── main.py                    # FastAPI app
```

---

## 4. API Design

### API Versioning

All endpoints prefixed with `/api/v1/`

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/api/v1/auth/logout` | Invalidate refresh token | Yes |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |

### Business Profile Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/businesses` | Create business profile | Yes |
| GET | `/api/v1/businesses` | List user's businesses | Yes |
| GET | `/api/v1/businesses/{id}` | Get business details | Yes |
| PUT | `/api/v1/businesses/{id}` | Update business profile | Yes |
| DELETE | `/api/v1/businesses/{id}` | Delete business | Yes |
| POST | `/api/v1/businesses/{id}/analyze` | Trigger AI analysis | Yes |

### AI Content Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/content/generate` | Generate content asset | Yes |
| GET | `/api/v1/content` | List generated content | Yes |
| GET | `/api/v1/content/{id}` | Get content detail | Yes |
| PUT | `/api/v1/content/{id}` | Edit content | Yes |
| POST | `/api/v1/content/{id}/regenerate` | Regenerate with changes | Yes |
| POST | `/api/v1/content/{id}/variations` | Get A/B variations | Yes |
| GET | `/api/v1/content/calendar` | Get content calendar | Yes |

### Campaign Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/campaigns` | Create campaign | Yes |
| GET | `/api/v1/campaigns` | List campaigns | Yes |
| GET | `/api/v1/campaigns/{id}` | Get campaign details | Yes |
| PUT | `/api/v1/campaigns/{id}` | Update campaign | Yes |
| POST | `/api/v1/campaigns/{id}/generate` | AI-generate campaign | Yes |
| GET | `/api/v1/campaigns/{id}/calendar` | Campaign content calendar | Yes |
| GET | `/api/v1/campaigns/{id}/tasks` | Campaign tasks | Yes |

### SEO Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/seo/analyze` | Analyze URL/page | Yes |
| POST | `/api/v1/seo/keywords` | Keyword research | Yes |
| POST | `/api/v1/seo/audit` | Full SEO audit | Yes |
| GET | `/api/v1/seo/reports` | List SEO reports | Yes |
| GET | `/api/v1/seo/reports/{id}` | Get SEO report | Yes |
| POST | `/api/v1/seo/optimize` | Optimize content for SEO | Yes |

### Ads Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/ads/generate` | Generate ad variations | Yes |
| POST | `/api/v1/ads/optimize` | Optimize existing ads | Yes |
| POST | `/api/v1/ads/keywords` | Keyword suggestions | Yes |
| POST | `/api/v1/ads/budget` | Budget allocation | Yes |
| GET | `/api/v1/ads` | List generated ads | Yes |

### Competitor Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/competitors/analyze` | Analyze competitor | Yes |
| GET | `/api/v1/competitors` | List competitors | Yes |
| GET | `/api/v1/competitors/{id}` | Get competitor detail | Yes |
| POST | `/api/v1/competitors/compare` | Compare competitors | Yes |
| POST | `/api/v1/competitors/gap` | Content/gap analysis | Yes |

### Persona Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/personas/generate` | Generate personas | Yes |
| GET | `/api/v1/personas` | List personas | Yes |
| GET | `/api/v1/personas/{id}` | Get persona detail | Yes |
| PUT | `/api/v1/personas/{id}` | Update persona | Yes |

### Analytics Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/v1/analytics/dashboard` | Dashboard summary | Yes |
| GET | `/api/v1/analytics/campaigns/{id}` | Campaign analytics | Yes |
| GET | `/api/v1/analytics/content` | Content performance | Yes |
| GET | `/api/v1/analytics/roi` | ROI predictions | Yes |
| GET | `/api/v1/analytics/growth` | Growth trends | Yes |
| POST | `/api/v1/analytics/predict` | Generate ROI prediction | Yes |

### Automation Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/automation/workflows` | Create workflow | Yes |
| GET | `/api/v1/automation/workflows` | List workflows | Yes |
| GET | `/api/v1/automation/workflows/{id}` | Get workflow detail | Yes |
| PUT | `/api/v1/automation/workflows/{id}` | Update workflow | Yes |
| POST | `/api/v1/automation/workflows/{id}/activate` | Activate workflow | Yes |
| POST | `/api/v1/automation/workflows/{id}/deactivate` | Deactivate workflow | Yes |
| GET | `/api/v1/automation/templates` | Workflow templates | Yes |

### Chat Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/chat` | Send chat message | Yes |
| GET | `/api/v1/chat/history` | Get chat history | Yes |
| DELETE | `/api/v1/chat/history` | Clear chat history | Yes |

---

## 5. Database Schema

### Entity Relationship Overview

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│  Users   │────▶│ Organizations│────▶│  Businesses  │
└──────────┘     └──────────────┘     └──────────────┘
                                            │
        ┌───────────────────────────────────┤
        ▼               ▼                   ▼
┌──────────────┐ ┌──────────────┐  ┌──────────────┐
│   Personas   │ │  Campaigns   │  │  Competitors  │
└──────────────┘ └──────────────┘  └──────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│MarketingAssets│ │  AdCampaigns │ │  SEOReports  │
└──────────────┘ └──────────────┘ └──────────────┘
        │
        ▼
┌──────────────┐     ┌──────────────┐
│  Analytics   │     │  AIUsage     │
└──────────────┘     └──────────────┘
        │
        ▼
┌──────────────┐     ┌──────────────┐
│ Automation   │     │   Chats      │
│  Workflows   │     │              │
└──────────────┘     └──────────────┘
```

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id),
    plan VARCHAR(50) DEFAULT 'starter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### organization_members
```sql
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);
```

#### businesses
```sql
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    description TEXT,
    website_url VARCHAR(500),
    logo_url VARCHAR(500),
    products JSONB DEFAULT '[]',
    target_audience TEXT,
    marketing_goals JSONB DEFAULT '[]',
    budget_range VARCHAR(50),
    social_links JSONB DEFAULT '{}',
    brand_voice VARCHAR(100),
    business_analysis JSONB,
    marketing_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### personas
```sql
CREATE TABLE personas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    age_range VARCHAR(50),
    job_title VARCHAR(255),
    income_range VARCHAR(100),
    demographics JSONB,
    pain_points JSONB DEFAULT '[]',
    goals JSONB DEFAULT '[]',
    preferred_channels JSONB DEFAULT '[]',
    buying_behavior TEXT,
    content_preferences JSONB DEFAULT '[]',
    objections JSONB DEFAULT '[]',
    customer_journey JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### campaigns
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    objective VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    target_audience JSONB,
    platforms JSONB DEFAULT '[]',
    budget_total DECIMAL(10,2),
    budget_allocation JSONB DEFAULT '{}',
    start_date DATE,
    end_date DATE,
    content_calendar JSONB DEFAULT '[]',
    tasks JSONB DEFAULT '[]',
    kpis JSONB DEFAULT '{}',
    performance_data JSONB DEFAULT '{}',
    ai_strategy JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### marketing_assets
```sql
CREATE TABLE marketing_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    campaign_id UUID REFERENCES campaigns(id),
    asset_type VARCHAR(100) NOT NULL,
    platform VARCHAR(100),
    title VARCHAR(500),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    seo_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    performance_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### seo_reports
```sql
CREATE TABLE seo_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    url VARCHAR(500),
    report_type VARCHAR(100) NOT NULL,
    score INTEGER,
    keywords JSONB DEFAULT '[]',
    issues JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    meta_tags JSONB DEFAULT '{}',
    schema_suggestions JSONB DEFAULT '{}',
    topic_clusters JSONB DEFAULT '[]',
    competitor_data JSONB DEFAULT '{}',
    full_report JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ad_campaigns
```sql
CREATE TABLE ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    campaign_id UUID REFERENCES campaigns(id),
    platform VARCHAR(100) NOT NULL,
    ad_type VARCHAR(100) NOT NULL,
    headlines JSONB DEFAULT '[]',
    descriptions JSONB DEFAULT '[]',
    target_audience JSONB DEFAULT '{}',
    budget_recommendation DECIMAL(10,2),
    bidding_strategy VARCHAR(100),
    keywords JSONB DEFAULT '[]',
    predicted_ctr DECIMAL(5,2),
    predicted_cpc DECIMAL(5,2),
    ab_variations JSONB DEFAULT '[]',
    performance_data JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### competitors
```sql
CREATE TABLE competitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    website_url VARCHAR(500),
    analysis JSONB DEFAULT '{}',
    seo_comparison JSONB DEFAULT '{}',
    social_comparison JSONB DEFAULT '{}',
    strengths JSONB DEFAULT '[]',
    weaknesses JSONB DEFAULT '[]',
    marketing_gaps JSONB DEFAULT '[]',
    content_gaps JSONB DEFAULT '[]',
    pricing_analysis JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### automation_workflows
```sql
CREATE TABLE automation_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    workflow_type VARCHAR(100) NOT NULL,
    nodes JSONB DEFAULT '[]',
    edges JSONB DEFAULT '[]',
    triggers JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT FALSE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### analytics
```sql
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    campaign_id UUID REFERENCES campaigns(id),
    metric_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,2),
    dimensions JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### chats
```sql
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    messages JSONB DEFAULT '[]',
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### ai_usage
```sql
CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    operation_type VARCHAR(100) NOT NULL,
    model_used VARCHAR(100) NOT NULL,
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    estimated_cost DECIMAL(10,6) DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. AI Integration Architecture

### LLM Client Strategy

```python
# Primary: Gemini API (Google Generative AI)
# Fallback: OpenAI-compatible API (for rate limits)

class LLMClient:
    primary: GoogleGenerativeAI  # Gemini
    fallback: OpenAI             # OpenAI-compatible
    router: ModelRouter          # Intelligent routing
```

### Agent Orchestration with LangGraph

```python
from langgraph.graph import StateGraph, END

# State definition
class MarketingState(TypedDict):
    business_profile: dict
    personas: list[dict]
    strategy: dict
    content: list[dict]
    seo_data: dict
    ads: list[dict]
    campaign: dict
    analytics: dict
    errors: list[str]

# Graph construction
workflow = StateGraph(MarketingState)

# Nodes (agents)
workflow.add_node("research", research_agent)
workflow.add_node("strategy", strategy_agent)
workflow.add_node("personas", persona_agent)
workflow.add_node("content", content_agent)
workflow.add_node("seo", seo_agent)
workflow.add_node("ads", ads_agent)
workflow.add_node("campaign", campaign_agent)
workflow.add_node("analytics", analytics_agent)

# Edges (execution flow)
workflow.set_entry_point("research")
workflow.add_edge("research", "strategy")
workflow.add_edge("strategy", "personas")
workflow.add_edge("personas", "content")
workflow.add_edge("content", "seo")
workflow.add_edge("seo", "ads")
workflow.add_edge("ads", "campaign")
workflow.add_edge("campaign", "analytics")
workflow.add_edge("analytics", END)
```

### Prompt Management

```
ai/prompts/
├── business_analyzer.py      # SWOT, opportunities
├── persona_generator.py      # Customer personas
├── content_engine.py         # All content types
├── campaign_builder.py       # Campaign strategy
├── seo_optimizer.py          # SEO analysis
├── ads_generator.py          # Ad copy + optimization
├── competitor_analyst.py     # Competitor intelligence
├── automation_builder.py     # Workflow creation
├── analytics_analyst.py      # ROI predictions
├── personalization.py        # Dynamic content
├── chat_assistant.py         # Conversational AI
└── brand_voice.py            # Brand consistency
```

### Token Management

| Model | Input Cost | Output Cost | Max Context |
|---|---|---|---|
| Gemini 1.5 Flash | $0.075/1M tokens | $0.30/1M tokens | 1M tokens |
| Gemini 1.5 Pro | $1.25/1M tokens | $5.00/1M tokens | 2M tokens |
| GPT-4o-mini (fallback) | $0.15/1M tokens | $0.60/1M tokens | 128K tokens |

**Strategy:** Use Gemini Flash for high-volume operations (content generation), Gemini Pro for strategic analysis, GPT-4o-mini as fallback.

### Vector Store (ChromaDB)

Used for:
- Brand voice memory (learn from past content)
- Persona embeddings (similar persona matching)
- Content similarity (avoid repetition)
- Prompt template retrieval

---

## 7. Authentication & Authorization

### JWT Flow

```
Register/Login → Access Token (15min) + Refresh Token (7d)
     │
     ▼
API Request → Authorization: Bearer <access_token>
     │
     ├─ Token valid → Process request
     │
     └─ Token expired → POST /auth/refresh → New access token
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| **Owner** | Full access, manage members, billing, delete org |
| **Admin** | Manage all resources, invite members |
| **Member** | Create/edit content, campaigns, view analytics |
| **Viewer** | Read-only access to dashboard and reports |

### Security Middleware

```python
# Rate limiting
@router.post("/auth/login")
@rate_limit("5/minute")
async def login(...): ...

# Input validation
@router.post("/businesses")
async def create_business(
    data: BusinessCreateSchema  # Pydantic validates
): ...

# RBAC check
@router.delete("/businesses/{id}")
@require_role("owner", "admin")
async def delete_business(...): ...
```

---

## 8. Frontend Architecture

### App Router Structure

```
frontend/src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx              # Dashboard layout with sidebar
│   ├── page.tsx                # Main dashboard
│   ├── business/
│   │   ├── page.tsx            # Business list
│   │   ├── new/page.tsx        # Create business (onboarding)
│   │   └── [id]/
│   │       ├── page.tsx        # Business overview
│   │       ├── edit/page.tsx   # Edit business
│   │       ├── content/
│   │       │   ├── page.tsx    # Content library
│   │       │   ├── generate/page.tsx
│   │       │   └── calendar/page.tsx
│   │       ├── campaigns/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── seo/
│   │       │   ├── page.tsx
│   │       │   └── audit/page.tsx
│   │       ├── ads/
│   │       │   ├── page.tsx
│   │       │   └── generate/page.tsx
│   │       ├── competitors/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── personas/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── automation/
│   │       │   ├── page.tsx
│   │       │   └── workflows/
│   │       ├── analytics/
│   │       │   └── page.tsx
│   │       └── chat/
│   │           └── page.tsx
│   └── settings/
│       ├── page.tsx
│       └── profile/page.tsx
├── api/                        # API route handlers (if needed)
└── layout.tsx                  # Root layout
```

### Component Architecture

```
frontend/src/components/
├── ui/                         # shadcn/ui components
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── DashboardLayout.tsx
│   └── MobileNav.tsx
├── business/
│   ├── BusinessCard.tsx
│   ├── BusinessForm.tsx
│   └── BusinessSelector.tsx
├── dashboard/
│   ├── MarketingScore.tsx
│   ├── CampaignHealth.tsx
│   ├── GrowthChart.tsx
│   ├── ConversionFunnel.tsx
│   ├── AI Suggestions.tsx
│   └── ActivityFeed.tsx
├── content/
│   ├── ContentEditor.tsx
│   ├── ContentTypeSelector.tsx
│   ├── ContentCard.tsx
│   ├── ContentCalendar.tsx
│   └── PlatformPreview.tsx
├── campaigns/
│   ├── CampaignCard.tsx
│   ├── CampaignForm.tsx
│   ├── CampaignTimeline.tsx
│   └── KPICard.tsx
├── seo/
│   ├── SEOAuditCard.tsx
│   ├── KeywordTable.tsx
│   └── SEOIssuesList.tsx
├── ads/
│   ├── AdPreview.tsx
│   ├── AdVariationCard.tsx
│   └── BudgetAllocation.tsx
├── analytics/
│   ├── ROIPrediction.tsx
│   ├── PerformanceChart.tsx
│   └── MetricsGrid.tsx
├── competitors/
│   ├── CompetitorCard.tsx
│   ├── ComparisonTable.tsx
│   └── GapAnalysis.tsx
├── personas/
│   ├── PersonaCard.tsx
│   ├── PersonaDetail.tsx
│   └── JourneyMap.tsx
├── automation/
│   ├── WorkflowBuilder.tsx
│   ├── WorkflowCanvas.tsx
│   └── WorkflowTemplate.tsx
├── chat/
│   ├── ChatInterface.tsx
│   └── ChatMessage.tsx
└── shared/
    ├── LoadingSkeleton.tsx
    ├── EmptyState.tsx
    ├── PageHeader.tsx
    └── ConfirmDialog.tsx
```

### State Management

```typescript
// Zustand stores
stores/
├── authStore.ts          # User auth state
├── businessStore.ts      # Active business context
├── uiStore.ts            # Theme, sidebar, modals
└── chatStore.ts          # Chat state

// TanStack Query for server state
hooks/
├── useAuth.ts
├── useBusiness.ts
├── useContent.ts
├── useCampaigns.ts
├── useSEO.ts
├── useAds.ts
├── useCompetitors.ts
├── usePersonas.ts
├── useAnalytics.ts
├── useAutomation.ts
└── useChat.ts
```

---

## 9. Error Handling Strategy

### Backend Error Responses

```json
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid business profile data",
        "details": [
            {"field": "industry", "message": "Industry is required"}
        ]
    },
    "request_id": "uuid-here"
}
```

### Error Categories

| Code | HTTP Status | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Input validation failure |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| AI_ERROR | 500 | AI generation failure |
| INTERNAL_ERROR | 500 | Unexpected server error |

### Frontend Error Handling

- TanStack Query `onError` callbacks
- Toast notifications for user-facing errors
- Error boundaries for component crashes
- Graceful degradation for AI failures (show "Try Again" + cached results)

---

## 10. Deployment Architecture

### Local Development

```yaml
# docker-compose.yml
services:
  api:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend:/app"]
    depends_on: [db, redis]

  db:
    image: postgres:15
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: marketpilot
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    volumes: ["./frontend:/app", "/app/node_modules"]
```

### Production Deployment

```
┌──────────────────────────────────────────┐
│              VERCEL (Frontend)           │
│         Next.js + Edge Functions         │
└──────────────────┬───────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────┐
│           RAILWAY (Backend)              │
│    FastAPI + Celery + PostgreSQL         │
└──────────────────────────────────────────┘
```

### Environment Variables

```env
# Backend
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GEMINI_API_KEY=...
OPENAI_API_KEY=...  # fallback
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=MarketPilot AI
```

---

## 11. Testing Strategy

### Test Pyramid

```
        ╱╲
       ╱E2E╲         5% - Playwright
      ╱──────╲
     ╱Integration╲    15% - pytest + httpx
    ╱──────────────╲
   ╱    Unit Tests   ╲  80% - pytest + vitest
  ╱────────────────────╲
```

### Backend Testing

| Type | Tool | Coverage |
|---|---|---|
| Unit Tests | pytest | Services, utilities, models |
| Integration Tests | pytest + httpx | API endpoints with DB |
| AI Tests | pytest | Agent responses (mocked LLM) |
| Load Testing | locust | API performance |

### Frontend Testing

| Type | Tool | Coverage |
|---|---|---|
| Unit Tests | Vitest | Components, hooks, utils |
| Component Tests | Testing Library | Component rendering |
| E2E Tests | Playwright | Critical user flows |

### Test Commands

```bash
# Backend
pytest                    # Run all tests
pytest --cov=app          # With coverage
pytest -x                 # Stop on first failure

# Frontend
npm run test              # Run unit tests
npm run test:e2e          # Run E2E tests
```

---

## 12. Development Workflow

### Phase Execution Order

```
Phase 1-4: Documentation (PRD, TRD, Architecture)     ✅ DONE
Phase 5: Project scaffolding + folder structure
Phase 6: Database schema + migrations
Phase 7: Backend APIs (auth → business → AI modules)
Phase 8: Frontend (layout → dashboard → features)
Phase 9: AI agent implementation
Phase 10: Integration + testing
Phase 11: Polish + demo prep
Phase 12: Deployment
```

### Branch Strategy

```
main          ← Production-ready code
├── develop   ← Integration branch
├── feat/*    ← Feature branches
├── fix/*     ← Bug fixes
└── docs/*    ← Documentation
```

### Code Quality Gates

1. **Pre-commit:** ruff check + ruff format (Python), eslint + prettier (TypeScript)
2. **Pre-push:** pytest + vitest (all tests pass)
3. **PR merge:** CI runs full test suite + type checks

---

*End of TRD*
