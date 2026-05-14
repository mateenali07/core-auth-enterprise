import pytest
import httpx
from app.main import app
from app.database import engine, Base

@pytest.mark.asyncio
async def test_e2e_success_sequence():
    """
    Executes the full functional execution routine as per Section 4.1 of the spec.
    """
    # Create tables for testing
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        email = "senior.engineer@enterprise.com"
        password = "strongpassword123"

        # 1. The Registration Step
        reg_resp = await ac.post("/api/auth/register", json={
            "email": email,
            "password": password
        })
        assert reg_resp.status_code == 201
        data = reg_resp.json()
        assert data["email"] == email
        assert "id" in data
        assert "password" not in data # Ensure no plaintext password returned

        # 2. The Authentication Step
        login_resp = await ac.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_resp.status_code == 200
        tokens = login_resp.json()
        assert "access_token" in tokens
        assert "refresh_token" in tokens
        assert tokens["token_type"] == "bearer"
        
        access_token = tokens["access_token"]
        refresh_token = tokens["refresh_token"]

        # 3. The Security Access Step
        headers = {"Authorization": f"Bearer {access_token}"}
        me_resp = await ac.get("/api/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == email

        # 4. The Rotation Step
        rot_resp = await ac.post("/api/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert rot_resp.status_code == 200
        new_tokens = rot_resp.json()
        assert "access_token" in new_tokens
        
        new_access_token = new_tokens["access_token"]

        # 5. The Session Revocation Step
        logout_headers = {"Authorization": f"Bearer {new_access_token}"}
        logout_resp = await ac.post("/api/auth/logout", headers=logout_headers)
        assert logout_resp.status_code == 200
        assert logout_resp.json()["detail"] == "Revocation complete"

        # 6. The Zero-Trust Post-Validation Step
        # Try using the blacklisted access token again
        blocked_resp = await ac.get("/api/auth/me", headers=logout_headers)
        assert blocked_resp.status_code == 401
        assert blocked_resp.json()["detail"] == "Token has been revoked"
