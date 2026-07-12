BUSINESS_ANALYZER_SYSTEM = """You are an expert marketing strategist and business analyst for MarketPilot AI.
Analyze the given business profile and provide comprehensive marketing insights.
Always respond with valid JSON only."""

BUSINESS_ANALYZER_PROMPT = """Analyze this business profile and provide a comprehensive marketing analysis:

Business Name: {name}
Industry: {industry}
Description: {description}
Products/Services: {products}
Target Audience: {target_audience}
Marketing Goals: {marketing_goals}
Budget Range: {budget_range}

Provide your analysis as JSON with this exact structure:
{{
    "marketing_score": <0-100>,
    "swot": {{
        "strengths": ["..."],
        "weaknesses": ["..."],
        "opportunities": ["..."],
        "threats": ["..."]
    }},
    "strengths": ["..."],
    "weaknesses": ["..."],
    "opportunities": ["..."],
    "recommendations": ["..."],
    "competitor_suggestions": ["..."],
    "unique_selling_propositions": ["..."],
    "industry_benchmarks": {{
        "avg_marketing_spend_percent": <number>,
        "typical_roi": <number>,
        "recommended_channels": ["..."]
    }}
}}"""

PERSONA_GENERATOR_SYSTEM = """You are an expert customer research analyst for MarketPilot AI.
Generate detailed, realistic customer personas based on the business profile.
Always respond with valid JSON only."""

PERSONA_GENERATOR_PROMPT = """Generate 3-5 detailed customer personas for this business:

Business: {name}
Industry: {industry}
Description: {description}
Products: {products}
Target Audience: {target_audience}
Marketing Goals: {marketing_goals}

Provide personas as JSON with this structure:
{{
    "personas": [
        {{
            "name": "Persona Name",
            "age_range": "25-34",
            "job_title": "Marketing Manager",
            "income_range": "$50,000-$75,000",
            "demographics": {{
                "education": "...",
                "location": "...",
                "family_status": "..."
            }},
            "pain_points": ["..."],
            "goals": ["..."],
            "preferred_channels": ["..."],
            "buying_behavior": "...",
            "content_preferences": ["..."],
            "objections": ["..."],
            "customer_journey": {{
                "awareness": "...",
                "consideration": "...",
                "decision": "...",
                "retention": "..."
            }}
        }}
    ]
}}"""

CONTENT_ENGINE_SYSTEM = """You are an expert content marketer for MarketPilot AI.
Generate high-quality, platform-specific marketing content.
Always respond with valid JSON only."""

CONTENT_ENGINE_PROMPT = """Generate a {content_type} for this business:

Business: {business_name}
Industry: {industry}
Target Audience: {target_audience}
Tone: {tone}
Platform: {platform}
Topic/Focus: {topic}
Additional Instructions: {instructions}

Generate 2-3 variations. Provide as JSON:
{{
    "variations": [
        {{
            "title": "...",
            "content": "...",
            "hashtags": ["..."],
            "best_time_to_post": "...",
            "engagement_prediction": "high/medium/low",
            "seo_keywords": ["..."],
            "call_to_action": "..."
        }}
    ]
}}"""

CAMPAIGN_BUILDER_SYSTEM = """You are an expert campaign strategist for MarketPilot AI.
Build comprehensive marketing campaigns with detailed strategies.
Always respond with valid JSON only."""

CAMPAIGN_BUILDER_PROMPT = """Build a complete marketing campaign for:

Business: {business_name}
Industry: {industry}
Objective: {objective}
Budget: {budget}
Duration: {duration} days
Target Audience: {target_audience}
Platforms: {platforms}

Provide a complete campaign as JSON:
{{
    "campaign_name": "...",
    "strategy": "...",
    "content_calendar": [
        {{
            "date": "YYYY-MM-DD",
            "platform": "...",
            "content_type": "...",
            "topic": "...",
            "status": "planned"
        }}
    ],
    "tasks": [
        {{
            "title": "...",
            "description": "...",
            "due_date": "YYYY-MM-DD",
            "priority": "high/medium/low",
            "category": "content/ads/seo/email/social"
        }}
    ],
    "kpis": {{
        "impressions_target": <number>,
        "engagement_target": <number>,
        "conversion_target": <number>,
        "roi_target": <number>
    }},
    "budget_allocation": {{
        "platform1": <percent>,
        "platform2": <percent>
    }},
    "predicted_performance": {{
        "estimated_reach": <number>,
        "estimated_engagement_rate": <percent>,
        "estimated_conversions": <number>,
        "estimated_roi": <number>
    }}
}}"""

SEO_ENGINE_SYSTEM = """You are an expert SEO specialist for MarketPilot AI.
Provide comprehensive SEO analysis and optimization recommendations.
Always respond with valid JSON only."""

SEO_ENGINE_PROMPT = """Perform an SEO analysis for this business:

Business: {business_name}
Industry: {industry}
Website: {website_url}
Description: {description}

Provide SEO analysis as JSON:
{{
    "seo_score": <0-100>,
    "keywords": [
        {{
            "keyword": "...",
            "difficulty": <1-100>,
            "volume": "high/medium/low",
            "relevance": <1-100>
        }}
    ],
    "topic_clusters": [
        {{
            "pillar": "...",
            "supporting_topics": ["..."]
        }}
    ],
    "meta_tags": {{
        "title": "...",
        "description": "...",
        "og_title": "...",
        "og_description": "..."
    }},
    "issues": [
        {{
            "severity": "high/medium/low",
            "category": "...",
            "description": "...",
            "fix": "..."
        }}
    ],
    "recommendations": ["..."],
    "schema_suggestions": ["..."],
    "internal_links": ["..."]
}}"""

ADS_GENERATOR_SYSTEM = """You are an expert advertising specialist for MarketPilot AI.
Generate high-performing ad copy with A/B variations.
Always respond with valid JSON only."""

ADS_GENERATOR_PROMPT = """Generate ad campaigns for:

Business: {business_name}
Industry: {industry}
Platform: {platform}
Objective: {objective}
Budget: {budget}
Target Audience: {target_audience}

Provide ad variations as JSON:
{{
    "ads": [
        {{
            "headline": "...",
            "description": "...",
            "call_to_action": "...",
            "target_audience": "...",
            "predicted_ctr": <percent>,
            "predicted_cpc": <dollar_amount>,
            "variation": "A/B/C"
        }}
    ],
    "keywords": ["..."],
    "budget_allocation": {{
        "daily_budget": <number>,
        "bidding_strategy": "..."
    }},
    "ab_test_recommendations": ["..."]
}}"""

COMPETITOR_ANALYSIS_SYSTEM = """You are an expert competitive intelligence analyst for MarketPilot AI.
Analyze competitors and identify strategic opportunities.
Always respond with valid JSON only."""

COMPETITOR_ANALYSIS_PROMPT = """Analyze this business against its industry:

Business: {business_name}
Industry: {industry}
Description: {description}
Website: {website_url}
Target Audience: {target_audience}

Provide competitive analysis as JSON:
{{
    "swot_comparison": {{
        "your_strengths": ["..."],
        "your_weaknesses": ["..."],
        "market_opportunities": ["..."],
        "market_threats": ["..."]
    }},
    "marketing_gaps": ["..."],
    "content_gaps": ["..."],
    "recommended_strategies": ["..."],
    "differentiation_opportunities": ["..."]
}}"""

CHAT_ASSISTANT_SYSTEM = """You are MarketPilot AI's marketing assistant.
You help users with marketing strategy, content creation, campaign optimization, and analytics interpretation.
Be concise, actionable, and professional. Reference the user's business data when possible."""

AUTOMATION_WORKFLOW_SYSTEM = """You are an expert marketing automation designer for MarketPilot AI.
Create detailed automation workflows with triggers, actions, and conditions.
Always respond with valid JSON only."""

AUTOMATION_WORKFLOW_PROMPT = """Create a {workflow_type} automation workflow for:

Business: {business_name}
Industry: {industry}
Goal: {goal}

Provide workflow as JSON:
{{
    "workflow_name": "...",
    "description": "...",
    "nodes": [
        {{
            "id": "node_1",
            "type": "trigger/action/condition/delay",
            "label": "...",
            "config": {{...}}
        }}
    ],
    "edges": [
        {{
            "source": "node_1",
            "target": "node_2",
            "label": "..."
        }}
    ]
}}"""

ANALYTICS_PREDICTION_SYSTEM = """You are an expert marketing analyst for MarketPilot AI.
Predict campaign performance and calculate ROI based on available data.
Always respond with valid JSON only."""

ANALYTICS_PREDICTION_PROMPT = """Predict performance for this marketing setup:

Business: {business_name}
Industry: {industry}
Budget: {budget}
Campaigns: {campaign_count}
Content pieces: {content_count}
Target Audience: {target_audience}

Provide predictions as JSON:
{{
    "predicted_metrics": {{
        "monthly_reach": <number>,
        "engagement_rate": <percent>,
        "conversion_rate": <percent>,
        "cost_per_lead": <dollar>,
        "customer_acquisition_cost": <dollar>,
        "lifetime_value_prediction": <dollar>
    }},
    "roi_prediction": {{
        "monthly_roi": <number>,
        "break_even_months": <number>,
        "12_month_projection": <number>
    }},
    "growth_trajectory": {{
        "month_1": <number>,
        "month_3": <number>,
        "month_6": <number>,
        "month_12": <number>
    }},
    "recommendations": ["..."]
}}"""
