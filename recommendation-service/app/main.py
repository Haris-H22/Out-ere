from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.recommendations import router


app = FastAPI(
    title="Out-ere Recommendation Service",
    description=(
        "Personalised activity recommendations "
        "for the Out-ere platform."
    ),
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


app.include_router(router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "out-ere-recommendations",
    }