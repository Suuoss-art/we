from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ===== KOPMA UNNES API ENDPOINTS =====

@api_router.get("/pages")
async def get_all_pages():
    """Get all pages"""
    pages = await db.pages.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "count": len(pages), "data": pages}

@api_router.get("/pages/{slug}")
async def get_page_by_slug(slug: str):
    """Get a specific page by slug"""
    page = await db.pages.find_one({"slug": slug}, {"_id": 0})
    if page:
        return {"success": True, "data": page}
    return {"success": False, "message": "Page not found"}

@api_router.get("/blog")
async def get_blog_posts():
    """Get all blog posts"""
    posts = await db.blog_posts.find({}, {"_id": 0}).sort("crawled_at", -1).to_list(1000)
    return {"success": True, "count": len(posts), "data": posts}

@api_router.get("/blog/{slug}")
async def get_blog_post(slug: str):
    """Get a specific blog post by slug"""
    post = await db.blog_posts.find_one({"slug": slug}, {"_id": 0})
    if post:
        return {"success": True, "data": post}
    return {"success": False, "message": "Blog post not found"}

@api_router.get("/categories")
async def get_categories():
    """Get all categories"""
    categories = await db.categories.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "count": len(categories), "data": categories}

@api_router.get("/categories/{slug}")
async def get_category(slug: str):
    """Get a specific category by slug"""
    category = await db.categories.find_one({"slug": slug}, {"_id": 0})
    if category:
        return {"success": True, "data": category}
    return {"success": False, "message": "Category not found"}

@api_router.get("/tags")
async def get_tags():
    """Get all tags"""
    tags = await db.tags.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "count": len(tags), "data": tags}

@api_router.get("/tags/{slug}")
async def get_tag(slug: str):
    """Get a specific tag by slug"""
    tag = await db.tags.find_one({"slug": slug}, {"_id": 0})
    if tag:
        return {"success": True, "data": tag}
    return {"success": False, "message": "Tag not found"}

@api_router.get("/homepage")
async def get_homepage():
    """Get homepage data"""
    homepage = await db.pages.find_one({"type": "homepage"}, {"_id": 0})
    if homepage:
        return {"success": True, "data": homepage}
    return {"success": False, "message": "Homepage not found"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()