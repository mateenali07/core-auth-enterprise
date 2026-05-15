# CORE-AUTH Enterprise Security Engine

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![SQLAlchemy](https://img.shields.io/badge/sqlalchemy-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

A high-performance, non-blocking asynchronous security and user routing engine designed for senior engineering benchmarks. This system implements a zero-trust architecture using a stateless/stateful hybrid token management strategy.

## 🚀 Core Features

### 1. Asynchronous Execution Model
- **Non-Blocking I/O**: Fully asynchronous entry points, database interactions, and caching layers using `FastAPI` and `SQLAlchemy (Asyncio)`.
- **Pool Lifecycle Management**: Optimized connection state management tied to application startup/shutdown.

### 2. High-Security Cryptographic Strategy
- **Dual-Token System**: Separation of short-lived **Access Tokens** (15m) and long-lived **Refresh Tokens** (7d) using distinct cryptographic secrets.
- **Structural Attributes**: Tokens enforce `HS256` signing and contain explicit usage identifiers to prevent token extensions.
- **User Extraction Injection**: Secure dependency injection for automated user profile context retrieval from authorization headers.

### 3. Zero-Trust Token Invalidation
- **Fast Memory Blacklist**: Instant invalidation of tokens upon logout via a high-speed memory layer, ensuring revoked sessions are blocked immediately across all downstream business logic.

## 🎨 Premium Frontend Dashboard
The project includes a state-of-the-art **Split-Screen Dashboard** featuring:
- **Glassmorphism UI**: Built with modern CSS techniques and mesh gradients.
- **Live Auth Integration**: Real-time communication with the FastAPI engine.
- **Registration-First Flow**: Optimized user journey for identity initialization.

## 🛠️ Tech Stack
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy (Async), Pydantic V2, Python-Jose (JWT), Passlib (BCrypt).
- **Frontend**: Vanilla JS, HTML5, CSS3 (Modern Design System).
- **Database**: SQLite (AioSQLite) for async local persistence.
- **Quality**: Flake8 (Linter), Bandit (SAST), Pytest (Integration).

## 📥 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/mateenali07/core-auth-enterprise.git
   cd core-auth-enterprise
   ```

2. **Initialize Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   Create a `.env` file based on `.env.example`:
   ```env
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   DATABASE_URL=sqlite+aiosqlite:///./auth.db
   ```

## 🏃 Running the Application

### Start the Backend Engine
```bash
uvicorn app.main:app --reload
```
API Documentation available at: `http://localhost:8000/docs`

### Start the Frontend Dashboard
```bash
# From a separate terminal
python -m http.server 5000 --directory frontend
```
Access the Dashboard at: `http://localhost:5000`

## 🧪 Results Verification (Quality Gate)
The project is verified via an automated pipeline and local testing suites:

```bash
# Run the E2E Success Sequence
pytest tests/test_auth.py
```

### Automated Pipeline Stages:
- **Linter Engine**: PEP8 adherence and syntax validation.
- **Static Security Audits (SAST)**: Scanning for hardcoded credentials and weak cryptography.
- **Asynchronous Suites**: 100% pass requirement for integration test assertions.

## 📂 Project Structure
```text
├── app/
│   ├── api/          # Authentication routes
│   ├── models.py     # Database entities
│   ├── schemas.py    # Strict JSON result schemas
│   ├── security.py   # JWT & Hashing logic
│   ├── blacklist.py  # Zero-Trust memory layer
│   └── database.py   # Async engine configuration
├── frontend/         # Premium Dashboard UI
├── tests/            # E2E Integration suites
└── .github/          # CI/CD Pipeline configuration
```

---
**Confidential // Project Core-Auth Spec v1.4**
