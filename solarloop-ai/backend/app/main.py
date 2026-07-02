import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import plants, inspections, analysis, dashboard

# 1. Automatic Database Table Creation (Demo safety requirement)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Error initializing database tables: {e}")

# 2. Initialize FastAPI
app = FastAPI(
    title="SolarLoop AI API",
    description="Drone-based solar panel diagnostic and inspection platform MVP",
    version="1.0.0"
)

# 3. CORS Configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if settings.FRONTEND_ORIGIN and settings.FRONTEND_ORIGIN not in origins:
    origins.append(settings.FRONTEND_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Mount Static uploads folder
# Note: config.py ensures that settings.UPLOAD_DIR exists
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 5. Include API Routers
app.include_router(plants.router)
app.include_router(inspections.router)
app.include_router(analysis.router)
app.include_router(dashboard.router)

# 6. Health Check Endpoint
@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "ok",
        "service": "SolarLoop AI"
    }
