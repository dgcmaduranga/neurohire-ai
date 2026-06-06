from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse

from app.auth.schemas import GoogleLoginRequest, LoginRequest, RegisterRequest
from app.auth.service import google_login_user, login_user, register_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
async def register(request: RegisterRequest):
    return await register_user(
        name=request.name,
        email=request.email,
        password=request.password,
    )


@router.post("/login")
async def login(request: LoginRequest):
    return await login_user(
        email=request.email,
        password=request.password,
    )


@router.post("/google")
async def google_login(request: GoogleLoginRequest):
    return await google_login_user(token=request.token)


@router.get("/google/login")
async def google_login_redirect():
    redirect_uri = f"{settings.BACKEND_URL}/auth/google/callback"

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }

    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        + urlencode(params)
    )

    return RedirectResponse(google_auth_url)


@router.get("/google/callback")
async def google_callback(
    code: str | None = Query(default=None),
    error: str | None = Query(default=None),
):
    if error:
        raise HTTPException(
            status_code=400,
            detail=f"Google OAuth error: {error}",
        )

    if not code:
        raise HTTPException(
            status_code=400,
            detail="Google authorization code not found",
        )

    redirect_uri = f"{settings.BACKEND_URL}/auth/google/callback"

    async with httpx.AsyncClient(timeout=30) as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    token_data = token_response.json()

    if token_response.status_code != 200:
        raise HTTPException(
            status_code=400,
            detail=token_data,
        )

    if "id_token" not in token_data:
        raise HTTPException(
            status_code=400,
            detail=token_data,
        )

    login_data = await google_login_user(token=token_data["id_token"])

    frontend_url = (
        f"{settings.FRONTEND_URL}/user/dashboard"
        f"?token={login_data['token']}"
    )

    return RedirectResponse(frontend_url)