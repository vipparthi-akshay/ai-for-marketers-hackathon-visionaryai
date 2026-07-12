# System Architecture

## MarketPilot AI — Architecture Documentation

**Version:** 1.0  
**Date:** July 2026

---

## 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        Browser["Web Browser<br/>Next.js + React"]
        Mobile["Mobile Browser<br/>Responsive UI"]
    end

    subgraph CDN["Edge Layer"]
        Vercel["Vercel<br/>Static Assets + SSR"]
    end

    subgraph API["API Layer"]
        FastAPI["FastAPI<br/>REST API"]
        WebSocket["WebSocket<br/>Real-time Updates"]
    end

    subgraph App["Application Layer"]
        AuthService["Auth Service"]
        BusinessService["Business Service"]
        ContentService["Content Service"]
        CampaignService["Campaign Service"]
        SEOService["SEO Service"]
        AdsService["Ads Service"]
        AnalyticsService["Analytics Service"]
        AutomationService["Automation Service"]
    end

    subgraph AI["AI Layer"]
        Orchestrator["Agent Orchestrator<br/>LangGraph"]
        ResearchAgent["Research Agent"]
        StrategyAgent["Strategy Agent"]
        PersonaAgent["Persona Agent"]
        ContentAgent["Content Agent"]
        SEOAgent["SEO Agent"]
        AdsAgent["Ads Agent"]
        CampaignAgent["Campaign Agent"]
        AnalyticsAgent["Analytics Agent"]
        CompetitorAgent["Competitor Agent"]
        PersonalizationAgent["Personalization Agent"]
        BrandAgent["Brand Agent"]
    end

    subgraph Data["Data Layer"]
        PostgreSQL["PostgreSQL<br/>Primary DB"]
        Redis["Redis<br/>Cache + Sessions"]
        ChromaDB["ChromaDB<br/>Vector Store"]
        Celery["Celery<br/>Task Queue"]
    end

    subgraph External["External APIs"]
        Gemini["Gemini API<br/>Primary LLM"]
        OpenAI["OpenAI API<br/>Fallback LLM"]
    end

    Browser --> Vercel
    Mobile --> Vercel
    Vercel --> FastAPI
    Vercel --> WebSocket
    
    FastAPI --> AuthService
    FastAPI --> BusinessService
    FastAPI --> ContentService
    FastAPI --> CampaignService
    FastAPI --> SEOService
    FastAPI --> AdsService
    FastAPI --> AnalyticsService
    FastAPI --> AutomationService
    
    ContentService --> Orchestrator
    CampaignService --> Orchestrator
    SEOService --> Orchestrator
    AdsService --> Orchestrator
    AnalyticsService --> Orchestrator
    
    Orchestrator --> ResearchAgent
    Orchestrator --> StrategyAgent
    Orchestrator --> PersonaAgent
    Orchestrator --> ContentAgent
    Orchestrator --> SEOAgent
    Orchestrator --> AdsAgent
    Orchestrator --> CampaignAgent
    Orchestrator --> AnalyticsAgent
    Orchestrator --> CompetitorAgent
    Orchestrator --> PersonalizationAgent
    Orchestrator --> BrandAgent
    
    ResearchAgent --> Gemini
    StrategyAgent --> Gemini
    ContentAgent --> Gemini
    SEOAgent --> Gemini
    AdsAgent --> Gemini
    
    AuthService --> PostgreSQL
    BusinessService --> PostgreSQL
    ContentService --> PostgreSQL
    CampaignService --> PostgreSQL
    
    AuthService --> Redis
    ContentService --> ChromaDB
    AnalyticsService --> Celery
    AutomationService --> Celery
    
    Celery --> Redis
```

---

## 2. Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as FastAPI
    participant O as Orchestrator
    participant AG as AI Agents
    participant LLM as Gemini API
    participant DB as PostgreSQL
    participant R as Redis
    participant C as ChromaDB

    U->>F: Enter business profile
    F->>A: POST /api/v1/businesses
    A->>DB: Save business profile
    A->>O: Trigger analysis pipeline
    O->>AG: Research Agent
    AG->>LLM: Analyze business
    LLM->>AG: Business insights
    AG->>O: Return analysis
    O->>AG: Strategy Agent
    AG->>LLM: Generate strategy
    LLM->>AG: Strategy document
    AG->>O: Return strategy
    O->>AG: Persona Agent
    AG->>LLM: Generate personas
    LLM->>AG: Persona data
    AG->>DB: Save personas
    O->>AG: Content Agent
    AG->>LLM: Generate content
    AG->>C: Store brand embeddings
    LLM->>AG: Content pieces
    AG->>DB: Save content
    O->>AG: SEO Agent
    AG->>LLM: SEO analysis
    LLM->>AG: SEO data
    AG->>DB: Save SEO report
    O->>AG: Ads Agent
    AG->>LLM: Generate ads
    LLM->>AG: Ad variations
    AG->>DB: Save ads
    O->>AG: Analytics Agent
    AG->>LLM: Predict ROI
    LLM->>AG: Predictions
    AG->>DB: Save analytics
    A->>F: Return all generated data
    F->>U: Display dashboard with insights
```

---

## 3. Agent Orchestration Flow

```mermaid
graph TD
    Start([Business Profile Input]) --> Research
    
    subgraph Phase1["Phase 1: Research"]
        Research["🔍 Research Agent<br/>Market Analysis"]
        Research --> Competitor["🏢 Competitor Agent<br/>Competitive Intelligence"]
    end
    
    Phase1 --> Phase2
    
    subgraph Phase2["Phase 2: Strategy"]
        Strategy["📋 Strategy Agent<br/>Marketing Plan"]
        Persona["👥 Persona Agent<br/>Audience Research"]
    end
    
    Phase2 --> Phase3
    
    subgraph Phase3["Phase 3: Creation"]
        Content["✍️ Content Agent<br/>Multi-Platform Content"]
        SEO["🔍 SEO Agent<br/>Search Optimization"]
        Ads["📢 Ads Agent<br/>Ad Campaigns"]
        Brand["🎨 Brand Agent<br/>Voice Consistency"]
    end
    
    Phase3 --> Phase4
    
    subgraph Phase4["Phase 4: Execution"]
        Campaign["📊 Campaign Agent<br/>Campaign Builder"]
        Auto["⚙️ Automation Agent<br/>Workflow Builder"]
    end
    
    Phase4 --> Phase5
    
    subgraph Phase5["Phase 5: Analysis"]
        Analytics["📈 Analytics Agent<br/>ROI Prediction"]
        Personalization["🎯 Personalization Agent<br/>Dynamic Content"]
    end
    
    Phase5 --> End([Dashboard Output])
    
    style Start fill:#10b981,color:#fff
    style End fill:#10b981,color:#fff
    style Phase1 fill:#3b82f6,color:#fff
    style Phase2 fill:#8b5cf6,color:#fff
    style Phase3 fill:#f59e0b,color:#fff
    style Phase4 fill:#ef4444,color:#fff
    style Phase5 fill:#06b6d4,color:#fff
```

---

## 4. Database Entity Relationship Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        varchar email UK
        varchar full_name
        varchar password_hash
        varchar avatar_url
        boolean is_active
        boolean is_verified
        timestamp last_login_at
        timestamp created_at
        timestamp updated_at
    }
    
    organizations {
        uuid id PK
        varchar name
        varchar slug UK
        uuid owner_id FK
        varchar plan
        timestamp created_at
        timestamp updated_at
    }
    
    organization_members {
        uuid id PK
        uuid organization_id FK
        uuid user_id FK
        varchar role
        timestamp joined_at
    }
    
    businesses {
        uuid id PK
        uuid organization_id FK
        varchar name
        varchar industry
        text description
        varchar website_url
        varchar logo_url
        jsonb products
        text target_audience
        jsonb marketing_goals
        varchar budget_range
        jsonb social_links
        varchar brand_voice
        jsonb business_analysis
        integer marketing_score
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    personas {
        uuid id PK
        uuid business_id FK
        varchar name
        varchar age_range
        varchar job_title
        varchar income_range
        jsonb demographics
        jsonb pain_points
        jsonb goals
        jsonb preferred_channels
        text buying_behavior
        jsonb content_preferences
        jsonb objections
        jsonb customer_journey
        boolean is_active
        timestamp created_at
    }
    
    campaigns {
        uuid id PK
        uuid business_id FK
        varchar name
        varchar objective
        varchar status
        jsonb target_audience
        jsonb platforms
        decimal budget_total
        jsonb budget_allocation
        date start_date
        date end_date
        jsonb content_calendar
        jsonb tasks
        jsonb kpis
        jsonb performance_data
        jsonb ai_strategy
        timestamp created_at
        timestamp updated_at
    }
    
    marketing_assets {
        uuid id PK
        uuid business_id FK
        uuid campaign_id FK
        varchar asset_type
        varchar platform
        varchar title
        text content
        jsonb metadata
        jsonb seo_data
        varchar status
        jsonb performance_data
        timestamp created_at
        timestamp updated_at
    }
    
    seo_reports {
        uuid id PK
        uuid business_id FK
        varchar url
        varchar report_type
        integer score
        jsonb keywords
        jsonb issues
        jsonb recommendations
        jsonb meta_tags
        jsonb schema_suggestions
        jsonb topic_clusters
        jsonb competitor_data
        jsonb full_report
        timestamp created_at
    }
    
    ad_campaigns {
        uuid id PK
        uuid business_id FK
        uuid campaign_id FK
        varchar platform
        varchar ad_type
        jsonb headlines
        jsonb descriptions
        jsonb target_audience
        decimal budget_recommendation
        varchar bidding_strategy
        jsonb keywords
        decimal predicted_ctr
        decimal predicted_cpc
        jsonb ab_variations
        jsonb performance_data
        varchar status
        timestamp created_at
    }
    
    competitors {
        uuid id PK
        uuid business_id FK
        varchar name
        varchar website_url
        jsonb analysis
        jsonb seo_comparison
        jsonb social_comparison
        jsonb strengths
        jsonb weaknesses
        jsonb marketing_gaps
        jsonb content_gaps
        jsonb pricing_analysis
        jsonb recommendations
        timestamp created_at
        timestamp updated_at
    }
    
    automation_workflows {
        uuid id PK
        uuid business_id FK
        varchar name
        text description
        varchar workflow_type
        jsonb nodes
        jsonb edges
        jsonb triggers
        boolean is_active
        integer execution_count
        timestamp last_executed_at
        timestamp created_at
        timestamp updated_at
    }
    
    analytics {
        uuid id PK
        uuid business_id FK
        uuid campaign_id FK
        varchar metric_type
        varchar metric_name
        decimal metric_value
        jsonb dimensions
        timestamp recorded_at
    }
    
    chats {
        uuid id PK
        uuid user_id FK
        uuid business_id FK
        jsonb messages
        jsonb context
        timestamp created_at
        timestamp updated_at
    }
    
    ai_usage {
        uuid id PK
        uuid user_id FK
        uuid organization_id FK
        varchar operation_type
        varchar model_used
        integer tokens_input
        integer tokens_output
        decimal estimated_cost
        integer duration_ms
        varchar status
        timestamp created_at
    }
    
    notifications {
        uuid id PK
        uuid user_id FK
        varchar title
        text message
        varchar type
        boolean is_read
        varchar link
        timestamp created_at
    }

    users ||--o{ organizations : "owns"
    users ||--o{ organization_members : "belongs to"
    organizations ||--o{ organization_members : "has"
    organizations ||--o{ businesses : "has"
    organizations ||--o{ ai_usage : "tracks"
    businesses ||--o{ personas : "defines"
    businesses ||--o{ campaigns : "runs"
    businesses ||--o{ marketing_assets : "creates"
    businesses ||--o{ seo_reports : "analyzes"
    businesses ||--o{ ad_campaigns : "advertises"
    businesses ||--o{ competitors : "tracks"
    businesses ||--o{ automation_workflows : "automates"
    businesses ||--o{ analytics : "measures"
    businesses ||--o{ chats : "converses"
    campaigns ||--o{ marketing_assets : "contains"
    campaigns ||--o{ ad_campaigns : "includes"
    campaigns ||--o{ analytics : "tracked by"
    users ||--o{ chats : "initiates"
    users ||--o{ notifications : "receives"
```

---

## 5. Deployment Architecture

```mermaid
graph TB
    subgraph Users["End Users"]
        Browser["Browser"]
        Mobile["Mobile"]
    end
    
    subgraph Vercel["Vercel Edge Network"]
        NextJS["Next.js App"]
        StaticAssets["Static Assets"]
        ISR["ISR Pages"]
    end
    
    subgraph Railway["Railway Cloud"]
        subgraph API["API Server"]
            FastAPI["FastAPI"]
            CeleryWorker["Celery Worker"]
        end
        
        subgraph DB["Database"]
            PG["PostgreSQL 15"]
            RedisDB["Redis 7"]
        end
        
        subgraph Storage["Storage"]
            ChromaStore["ChromaDB"]
        end
    end
    
    subgraph External["External Services"]
        GeminiAPI["Gemini API"]
        OpenAIAPI["OpenAI API"]
    end
    
    Browser --> Vercel
    Mobile --> Vercel
    NextJS --> FastAPI
    FastAPI --> PG
    FastAPI --> RedisDB
    FastAPI --> ChromaStore
    CeleryWorker --> RedisDB
    CeleryWorker --> PG
    FastAPI --> GeminiAPI
    FastAPI --> OpenAIAPI
    CeleryWorker --> GeminiAPI
    
    style Vercel fill:#000,color:#fff
    style Railway fill:#0B0D0E,color:#fff
```

---

## 6. User Flow Diagrams

### Onboarding Flow

```mermaid
graph TD
    Start([Landing Page]) --> Register["Register<br/>Email + Password"]
    Register --> Verify["Email Verification"]
    Verify --> Onboarding["Onboarding Wizard"]
    
    Onboarding --> Step1["Step 1: Business Name<br/>+ Industry"]
    Step1 --> Step2["Step 2: Products<br/>+ Services"]
    Step2 --> Step3["Step 3: Target Audience<br/>+ Goals"]
    Step3 --> Step4["Step 4: Budget<br/>+ Social Links"]
    Step4 --> Submit["Submit Profile"]
    
    Submit --> AI["AI Analysis<br/>Loading..."]
    AI --> SWOT["SWOT Analysis"]
    AI --> Personas["Customer Personas"]
    AI --> Strategy["Marketing Strategy"]
    
    SWOT --> Dashboard["Main Dashboard"]
    Personas --> Dashboard
    Strategy --> Dashboard
    
    style Start fill:#10b981,color:#fff
    style Dashboard fill:#3b82f6,color:#fff
    style AI fill:#f59e0b,color:#fff
```

### Content Generation Flow

```mermaid
graph TD
    Dashboard["Dashboard"] --> ContentPage["Content Page"]
    ContentPage --> SelectType["Select Content Type<br/>Blog / Social / Email / Ad"]
    SelectType --> Configure["Configure Options<br/>Platform, Tone, Length"]
    Configure --> Generate["Generate with AI"]
    
    Generate --> Loading["AI Generating...<br/>30 seconds"]
    Loading --> Variations["2-3 Variations"]
    Variations --> Edit["Edit / Refine"]
    Edit --> Save["Save to Library"]
    Save --> Schedule["Schedule / Publish"]
    
    style Generate fill:#8b5cf6,color:#fff
    style Loading fill:#f59e0b,color:#fff
```

### Campaign Creation Flow

```mermaid
graph TD
    Campaigns["Campaigns Page"] --> New["Create Campaign"]
    New --> Objective["Set Objective<br/>Awareness / Leads / Sales"]
    Objective --> Audience["Select Audience<br/>From Personas"]
    Audience --> Platforms["Choose Platforms"]
    Platforms --> Budget["Set Budget"]
    Budget --> AIGenerate["AI Generate Strategy"]
    
    AIGenerate --> Strategy["Strategy Document"]
    Strategy --> Calendar["Content Calendar"]
    Strategy --> Tasks["Task List"]
    Strategy --> KPIs["KPI Targets"]
    
    Calendar --> Review["Review & Edit"]
    Tasks --> Review
    KPIs --> Review
    
    Review --> Launch["Launch Campaign"]
    Launch --> Track["Track Performance"]
    
    style AIGenerate fill:#8b5cf6,color:#fff
    style Launch fill:#10b981,color:#fff
```

---

## 7. Security Architecture

```mermaid
graph TD
    Client["Client Request"] --> CORS["CORS Check"]
    CORS --> RateLimit["Rate Limiter"]
    RateLimit --> AuthCheck{"Authenticated?"}
    
    AuthCheck -->|No| PublicEndpoints{"Public Endpoint?"}
    PublicEndpoints -->|Yes| Process["Process Request"]
    PublicEndpoints -->|No| Reject401["401 Unauthorized"]
    
    AuthCheck -->|Yes| ValidateJWT["Validate JWT"]
    ValidateJWT --> InvalidToken{"Token Valid?"}
    InvalidToken -->|No| RefreshCheck{"Refresh Token?"}
    RefreshCheck -->|Yes| Refresh["Refresh Access Token"]
    Refresh --> Process
    RefreshCheck -->|No| Reject401
    
    InvalidToken -->|Yes| RBAC["RBAC Check"]
    RBAC --> HasPermission{"Has Permission?"}
    HasPermission -->|Yes| ValidateInput["Pydantic Validation"]
    HasPermission -->|No| Reject403["403 Forbidden"]
    
    ValidateInput --> ValidInput{"Input Valid?"}
    ValidInput -->|No| Reject400["400 Bad Request"]
    ValidInput -->|Yes| Execute["Execute Handler"]
    
    Execute --> SQLCheck["SQL Injection Check<br/>SQLAlchemy ORM"]
    SQLCheck --> XSSCheck["XSS Check<br/>React Auto-escape"]
    XSSCheck --> Process
    
    Process --> Response["Return Response"]
    
    style Client fill:#3b82f6,color:#fff
    style Response fill:#10b981,color:#fff
    style Reject401 fill:#ef4444,color:#fff
    style Reject403 fill:#ef4444,color:#fff
    style Reject400 fill:#ef4444,color:#fff
```

---

## 8. Component Architecture (Frontend)

```mermaid
graph TB
    subgraph Layout["Layout Components"]
        RootLayout["RootLayout"]
        DashboardLayout["DashboardLayout"]
        Sidebar["Sidebar"]
        Header["Header"]
        MobileNav["MobileNav"]
    end
    
    subgraph Pages["Page Components"]
        Dashboard["Dashboard Page"]
        BusinessList["Business List"]
        BusinessDetail["Business Detail"]
        ContentPage["Content Page"]
        CampaignsPage["Campaigns Page"]
        SEOPage["SEO Page"]
        AdsPage["Ads Page"]
        CompetitorsPage["Competitors Page"]
        PersonasPage["Personas Page"]
        AutomationPage["Automation Page"]
        AnalyticsPage["Analytics Page"]
        ChatPage["Chat Page"]
    end
    
    subgraph Features["Feature Components"]
        MarketingScore["MarketingScore"]
        CampaignHealth["CampaignHealth"]
        GrowthChart["GrowthChart"]
        ContentEditor["ContentEditor"]
        CampaignForm["CampaignForm"]
        WorkflowBuilder["WorkflowBuilder"]
        ChatInterface["ChatInterface"]
        PersonaCard["PersonaCard"]
        SEOAudit["SEOAudit"]
        AdPreview["AdPreview"]
    end
    
    subgraph Shared["Shared Components"]
        LoadingSkeleton["LoadingSkeleton"]
        EmptyState["EmptyState"]
        PageHeader["PageHeader"]
        ConfirmDialog["ConfirmDialog"]
        Toast["Toast Notifications"]
    end
    
    RootLayout --> DashboardLayout
    DashboardLayout --> Sidebar
    DashboardLayout --> Header
    DashboardLayout --> MobileNav
    
    DashboardLayout --> Dashboard
    DashboardLayout --> BusinessList
    DashboardLayout --> ContentPage
    
    Dashboard --> MarketingScore
    Dashboard --> CampaignHealth
    Dashboard --> GrowthChart
    
    ContentPage --> ContentEditor
    CampaignsPage --> CampaignForm
    AutomationPage --> WorkflowBuilder
    ChatPage --> ChatInterface
    PersonasPage --> PersonaCard
    SEOPage --> SEOAudit
    AdsPage --> AdPreview
    
    AllPages["All Pages"] --> LoadingSkeleton
    AllPages --> EmptyState
    AllPages --> PageHeader
    
    style Layout fill:#3b82f6,color:#fff
    style Features fill:#8b5cf6,color:#fff
    style Shared fill:#10b981,color:#fff
```

---

## 9. AI Model Selection Strategy

```mermaid
graph TD
    Request["AI Request"] --> Router["Model Router"]
    
    Router --> Classify{"Request Type?"}
    
    Classify -->|High Volume / Simple| Flash["Gemini 1.5 Flash<br/>$0.075/1M tokens<br/>Fast, cost-effective"]
    Classify -->|Complex / Strategic| Pro["Gemini 1.5 Pro<br/>$1.25/1M tokens<br/>High quality"]
    Classify -->|Fallback| OpenAI["GPT-4o-mini<br/>$0.15/1M tokens<br/>Backup"]
    
    Flash --> ContentGen["Content Generation<br/>Social posts, emails, ads"]
    Flash --> SEOOp["SEO Optimization<br/>Meta tags, keywords"]
    Flash --> PersonGen["Persona Generation<br/>Basic personas"]
    
    Pro --> Strategy["Strategy Analysis<br/>SWOT, campaign plans"]
    Pro --> ROI["ROI Prediction<br/>Complex calculations"]
    Pro --> Competitor["Competitor Analysis<br/>Deep insights"]
    
    OpenAI --> FallbackHandler["Rate Limit /<br/>Error Fallback"]
    
    Router --> RateLimit{"Rate Limited?"}
    RateLimit -->|Yes| OpenAI
    RateLimit -->|No| Classify
    
    style Flash fill:#10b981,color:#fff
    style Pro fill:#f59e0b,color:#fff
    style OpenAI fill:#ef4444,color:#fff
```

---

## 10. Error Handling Flow

```mermaid
graph TD
    Error["Error Occurs"] --> Type{"Error Type?"}
    
    Type -->|Validation| Pydantic["Pydantic Error<br/>400 Bad Request"]
    Type -->|Auth| JWT["JWT Error<br/>401 Unauthorized"]
    Type -->|Permission| RBAC["RBAC Error<br/>403 Forbidden"]
    Type -->|Not Found| NF["Not Found<br/>404"]
    Type -->|AI| AIErr["AI Service Error<br/>503 Service Unavailable"]
    Type -->|DB| DBErr["Database Error<br/>500 Internal Error"]
    Type -->|Rate Limit| RL["Rate Limit<br/>429 Too Many"]
    
    Pydantic --> Response["Structured Error Response"]
    JWT --> Response
    RBAC --> Response
    NF --> Response
    RL --> Response
    
    AIErr --> Retry["Retry with Fallback Model"]
    Retry --> Success{"Success?"}
    Success -->|Yes| Response
    Success -->|No| Cached["Return Cached Data"]
    Cached --> Response
    
    DBErr --> Log["Log Error<br/>Alert Team"]
    Log --> Response
    
    Response --> Client["Return to Client"]
    Client --> Toast["Show Toast Notification"]
    
    style Error fill:#ef4444,color:#fff
    style Response fill:#f59e0b,color:#fff
    style Toast fill:#10b981,color:#fff
```

---

*End of Architecture Documentation*
