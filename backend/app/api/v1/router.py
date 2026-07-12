from fastapi import APIRouter

from app.features.auth.router import router as auth_router
from app.features.business.router import router as business_router
from app.features.content.router import router as content_router
from app.features.campaigns.router import router as campaigns_router
from app.features.personas.router import router as personas_router
from app.features.seo.router import router as seo_router
from app.features.ads.router import router as ads_router
from app.features.competitors.router import router as competitors_router
from app.features.analytics.router import router as analytics_router
from app.features.automation.router import router as automation_router
from app.features.chat.router import router as chat_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth_router)
api_router.include_router(business_router)
api_router.include_router(content_router)
api_router.include_router(campaigns_router)
api_router.include_router(personas_router)
api_router.include_router(seo_router)
api_router.include_router(ads_router)
api_router.include_router(competitors_router)
api_router.include_router(analytics_router)
api_router.include_router(automation_router)
api_router.include_router(chat_router)
