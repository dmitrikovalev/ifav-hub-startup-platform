from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import auth, startups, investors, deals, events, documents, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Startup Ecosystem Platform",
    description="MVP platform for founders, investors, startups, and developers.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list({settings.FRONTEND_URL, "http://localhost:5173"}),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(startups.router, prefix="/api/startups", tags=["Startups"])
app.include_router(investors.router, prefix="/api/investors", tags=["Investors"])
app.include_router(deals.router, prefix="/api/deals", tags=["Deals"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "version": "1.0.0"}
