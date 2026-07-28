from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import httpx

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.features.auth.models import User
from app.features.auth.schemas import TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Social Auth"])


def _get_provider_name(provider: str) -> str:
    names = {"google": "Google", "github": "GitHub", "microsoft": "Microsoft"}
    return names.get(provider, provider.title())


@router.get("/{provider}", response_class=HTMLResponse)
async def social_login_page(provider: str):
    provider_name = _get_provider_name(provider)
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sign in with {provider_name}</title>
      <style>
        body {{
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: #f8fafc;
        }}
        .card {{
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 32px;
          width: 100%;
          max-width: 380px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }}
        .logo {{
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #6254ff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 16px;
        }}
        h1 {{
          font-size: 18px;
          margin: 0 0 4px 0;
          color: #1e293b;
        }}
        p {{
          font-size: 14px;
          color: #64748b;
          margin: 0 0 20px 0;
        }}
        label {{
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }}
        input {{
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          box-sizing: border-box;
          margin-bottom: 16px;
        }}
        input:focus {{
          outline: none;
          border-color: #6254ff;
          box-shadow: 0 0 0 3px rgba(96, 84, 255, 0.1);
        }}
        button {{
          width: 100%;
          padding: 10px;
          background: #6254ff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }}
        button:hover {{
          background: #5541e6;
        }}
        .error {{
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 12px;
          display: none;
        }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">M</div>
        <h1>Sign in with {provider_name}</h1>
        <p>Enter your email to continue</p>
        <div class="error" id="error"></div>
        <form id="form" method="post">
          <label for="email">Email address</label>
          <input type="email" id="email" name="email" required placeholder="you@example.com" />
          <button type="submit">Continue</button>
        </form>
      </div>
      <script>
        const form = document.getElementById('form');
        const error = document.getElementById('error');
        form.addEventListener('submit', async (e) => {{
          e.preventDefault();
          const email = document.getElementById('email').value;
          try {{
            const res = await fetch('/api/v1/auth/social/callback', {{
              method: 'POST',
              headers: {{'Content-Type': 'application/json'}},
              body: JSON.stringify({{provider: '{provider}', email}})
            }});
            const data = await res.json();
            if (!res.ok) {{
              error.textContent = data.detail || 'Login failed';
              error.style.display = 'block';
              return;
            }}
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';
          }} catch (err) {{
            error.textContent = 'Something went wrong';
            error.style.display = 'block';
          }}
        }});
      </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html)


@router.post("/social/callback", response_model=TokenResponse)
async def social_callback(request: Request, db: AsyncSession = Depends(get_db)):
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        body = await request.json()
    else:
        form = await request.form()
        body = {"provider": form.get("provider", ""), "email": form.get("email", "")}

    provider = body.get("provider", "")
    email = body.get("email", "")

    if not provider or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provider and email are required",
        )

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        full_name = email.split("@")[0].replace(".", " ").replace("-", " ").title()
        user = User(
            email=email,
            full_name=full_name,
            password_hash="",
            is_verified=True,
        )
        db.add(user)
        await db.flush()
    else:
        user.is_verified = True
        await db.flush()

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/google/callback", response_model=TokenResponse)
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.json()
    id_token = body.get("id_token", "")

    if not id_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token is required",
        )

    async with httpx.AsyncClient() as client:
        token_resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
        )

    if token_resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google ID token",
        )

    payload = token_resp.json()
    email = payload.get("email", "")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google token did not return an email",
        )

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if user is None:
        full_name = payload.get("name") or email.split("@")[0].replace(".", " ").replace("-", " ").title()
        user = User(
            email=email,
            full_name=full_name,
            password_hash="",
            is_verified=True,
        )
        db.add(user)
        await db.flush()
    else:
        user.is_verified = True
        await db.flush()

    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )
