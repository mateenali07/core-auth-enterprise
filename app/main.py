from fastapi import FastAPI
from .api.router import router as auth_router
from .database import engine, Base

app = FastAPI(
    title="CORE-AUTH Enterprise", 
    description="High-performance, non-blocking asynchronous security engine",
    version="1.4.2-Prod"
)

# Include Authentication Routes
app.include_router(auth_router)

@app.on_event("startup")
async def startup():
    # Pool Lifecycle Management: Configure state connections on start (Spec 2.1)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"message": "CORE-AUTH Enterprise System Online"}
