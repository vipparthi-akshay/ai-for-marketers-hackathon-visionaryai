import re
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, verify_business_access
from app.core.exceptions import NotFoundException
from app.features.auth.models import User
from app.features.business.models import Business
from app.features.content.models import SEOReport
from app.features.seo.schemas import SEOAnalyzeRequest, SEOResponse
from app.ai.agents.seo_agent import analyze_seo

router = APIRouter(prefix="/seo", tags=["SEO Engine"])

settings = get_settings()

BLOCKED_NETWORKS = [
    ("127,0,0,0", "8"),
    ("10,0,0,0", "8"),
    ("172,16,0,0", "12"),
    ("192,168,0,0", "16"),
    ("169,254,0,0", "16"),
    ("0,0,0,0", "8"),
    ("100,64,0,0", "10"),
    ("192,0,0,0", "24"),
    ("198,18,0,0", "15"),
]


def _is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
    except Exception:
        return False

    if parsed.scheme not in ("http", "https"):
        return False

    hostname = parsed.hostname
    if not hostname:
        return False

    if hostname in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        return False

    import ipaddress
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    except ValueError:
        pass

    for prefix, length in BLOCKED_NETWORKS:
        parts = prefix.split(",")
        if hostname.startswith(f"{parts[0]}."):
            return False

    return True


class CrawlRequest(BaseModel):
    url: str
    business_id: str


@router.post("/crawl")
async def crawl_website(
    data: CrawlRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Live crawl a website and extract basic SEO data."""
    url = data.url
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    await verify_business_access(data.business_id, current_user=current_user, db=db)

    if not _is_safe_url(url):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="URL is not safe to crawl")

    result = {
        "url": url,
        "status_code": 200,
        "load_time_ms": None,
        "word_count": 0,
        "links_count": 0,
        "meta_tags": {},
        "headings": [],
        "images_without_alt": 0,
    }

    try:
        async with httpx.AsyncClient(
            timeout=settings.CRAWL_TIMEOUT_SECONDS,
            follow_redirects=True,
            max_redirects=3,
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
        ) as client:
            response = await client.get(url, headers={
                "User-Agent": "MarketPilot-SEO-Bot/1.0",
                "Accept": "text/html",
                "Accept-Encoding": "gzip, deflate",
            })

            content_length = int(response.headers.get("content-length", 0))
            if content_length > settings.CRAWL_MAX_RESPONSE_MB * 1024 * 1024:
                raise ValueError("Response too large")

            result["status_code"] = response.status_code
            html = response.text[:500_000]
            result["word_count"] = len(html.split())
            result["links_count"] = html.lower().count("<a ")

            title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
            if title_match:
                result["meta_tags"]["title"] = title_match.group(1).strip()

            desc_match = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
            if desc_match:
                result["meta_tags"]["description"] = desc_match.group(1).strip()

            og_matches = re.findall(r'<meta\s+property=["\']og:(.*?)["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
            for prop, content in og_matches:
                result["meta_tags"][f"og:{prop}"] = content.strip()

            viewport_match = re.search(r'<meta\s+name=["\']viewport["\']', html, re.IGNORECASE)
            result["meta_tags"]["viewport"] = "present" if viewport_match else "missing"

            heading_tags = re.findall(r"<(h[1-6])[^>]*>(.*?)</\1>", html, re.IGNORECASE | re.DOTALL)
            result["headings"] = [{"tag": tag, "text": re.sub(r"<[^>]+>", "", text).strip()[:100]} for tag, text in heading_tags[:20]]

            result["images_without_alt"] = len(re.findall(r"<img(?![^>]*alt=)[^>]*>", html, re.IGNORECASE))

    except httpx.TimeoutException:
        result["status_code"] = 408
    except ValueError:
        result["status_code"] = 413
    except Exception:
        result["status_code"] = 0

    return result


@router.post("/analyze", response_model=SEOResponse)
async def analyze_seo_endpoint(
    data: SEOAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    business = await verify_business_access(data.business_id, current_user=current_user, db=db)

    ai_result = await analyze_seo(
        business_name=business.name,
        industry=business.industry,
        website_url=data.url or business.website_url or "",
        description=business.description or "",
    )

    report = SEOReport(
        business_id=data.business_id,
        url=data.url or business.website_url,
        report_type="full_audit",
        score=ai_result.get("seo_score", 0),
        keywords=ai_result.get("keywords", []),
        issues=ai_result.get("issues", []),
        recommendations=ai_result.get("recommendations", []),
        meta_tags=ai_result.get("meta_tags", {}),
        topic_clusters=ai_result.get("topic_clusters", []),
        full_report=ai_result,
    )
    db.add(report)
    await db.flush()

    return SEOResponse.model_validate(report)


@router.get("/{business_id}", response_model=list[SEOResponse])
async def list_seo_reports(
    business_id: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await verify_business_access(business_id, current_user=current_user, db=db)

    offset = (page - 1) * page_size
    result = await db.execute(
        select(SEOReport)
        .where(SEOReport.business_id == business_id)
        .order_by(SEOReport.created_at.desc())
        .offset(offset)
        .limit(page_size)
    )
    reports = result.scalars().all()
    return [SEOResponse.model_validate(r) for r in reports]


@router.get("/detail/{report_id}", response_model=SEOResponse)
async def get_seo_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SEOReport).where(SEOReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if report is None:
        raise NotFoundException("SEO Report", str(report_id))
    await verify_business_access(report.business_id, current_user=current_user, db=db)
    return SEOResponse.model_validate(report)


@router.delete("/detail/{report_id}", status_code=status.HTTP_200_OK)
async def delete_seo_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SEOReport).where(SEOReport.id == report_id)
    )
    report = result.scalar_one_or_none()
    if report is None:
        raise NotFoundException("SEO Report", str(report_id))
    await verify_business_access(report.business_id, current_user=current_user, db=db)
    await db.delete(report)
    await db.flush()
    return {"success": True, "message": "SEO report deleted"}
