from fastapi import FastAPI

app = FastAPI(title="CORE-AUTH Enterprise", version="1.4.2-Prod")

@app.get("/")
async def root():
    return {"message": "CORE-AUTH Enterprise System Online"}
