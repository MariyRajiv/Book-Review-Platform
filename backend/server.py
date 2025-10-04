from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
import json
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_TIME = timedelta(days=7)

# Create the main app without a prefix
app = FastAPI(title="Book Review Platform", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Define Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

class Book(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    author: str
    description: str
    genre: str
    published_year: int
    added_by: str  # user id
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    average_rating: float = 0.0
    total_reviews: int = 0

class BookCreate(BaseModel):
    title: str
    author: str
    description: str
    genre: str
    published_year: int

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    published_year: Optional[int] = None

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    book_id: str
    user_id: str
    rating: int = Field(ge=1, le=5)
    review_text: str
    sentiment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    book_id: str
    rating: int = Field(ge=1, le=5)
    review_text: str

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = None

class ReviewWithUser(BaseModel):
    id: str
    book_id: str
    user_id: str
    user_name: str
    rating: int
    review_text: str
    sentiment: Optional[str] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    description: str
    genre: str
    published_year: int
    added_by: str
    added_by_name: str
    created_at: datetime
    average_rating: float
    total_reviews: int

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + JWT_EXPIRATION_TIME,
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def analyze_sentiment(text: str) -> str:
    """Analyze sentiment of review text using Gemini Pro"""
    try:
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id="sentiment-analysis",
            system_message="You are a sentiment analyzer. Analyze the sentiment of book reviews and return only 'positive', 'negative', or 'neutral'."
        ).with_model("gemini", "gemini-2.0-flash")
        
        user_message = UserMessage(
            text=f"Analyze the sentiment of this book review and respond with only one word: positive, negative, or neutral: {text}"
        )
        
        response = await chat.send_message(user_message)
        sentiment = response.strip().lower()
        
        # Ensure valid sentiment
        if sentiment in ['positive', 'negative', 'neutral']:
            return sentiment
        return 'neutral'
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        return 'neutral'

async def get_book_recommendations(user_id: str, limit: int = 5) -> List[str]:
    """Get AI-powered book recommendations based on user's reading history"""
    try:
        # Get user's reviewed books and their ratings
        user_reviews = await db.reviews.find({"user_id": user_id}).to_list(100)
        
        if not user_reviews:
            # If no reviews, return popular books
            popular_books = await db.books.find().sort("average_rating", -1).limit(limit).to_list(limit)
            return [book["title"] + " by " + book["author"] for book in popular_books]
        
        # Create user profile for AI
        liked_books = []
        disliked_books = []
        
        for review in user_reviews:
            book = await db.books.find_one({"id": review["book_id"]})
            if book:
                book_info = f"{book['title']} by {book['author']} (Genre: {book['genre']})"
                if review["rating"] >= 4:
                    liked_books.append(book_info)
                elif review["rating"] <= 2:
                    disliked_books.append(book_info)
        
        chat = LlmChat(
            api_key=os.environ.get('EMERGENT_LLM_KEY'),
            session_id="book-recommendations",
            system_message="You are a book recommendation expert. Based on user's reading preferences, suggest similar books they might enjoy."
        ).with_model("gemini", "gemini-2.0-flash")
        
        prompt = f"""Based on this user's reading history, recommend {limit} books they might enjoy.

Liked books (rated 4-5 stars):
{chr(10).join(liked_books) if liked_books else "None"}

Disliked books (rated 1-2 stars):  
{chr(10).join(disliked_books) if disliked_books else "None"}

Please respond with exactly {limit} book recommendations in this format:
1. Title by Author
2. Title by Author
etc."""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse recommendations
        recommendations = []
        lines = response.strip().split('\n')
        for line in lines:
            if re.match(r'^\d+\.\s*', line):
                book_rec = re.sub(r'^\d+\.\s*', '', line).strip()
                recommendations.append(book_rec)
        
        return recommendations[:limit]
        
    except Exception as e:
        logger.error(f"Book recommendation error: {e}")
        return []

# Authentication Routes
@api_router.post("/auth/signup", response_model=Token)
async def signup(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Create user
    user = User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    
    await db.users.insert_one(user.dict())
    
    # Create token
    token = create_jwt_token(user.id)
    user_response = UserResponse(id=user.id, name=user.name, email=user.email, created_at=user.created_at)
    
    return Token(access_token=token, token_type="bearer", user=user_response)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    # Find user
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create token
    token = create_jwt_token(user["id"])
    user_response = UserResponse(**user)
    
    return Token(access_token=token, token_type="bearer", user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        created_at=current_user.created_at
    )

# Book Routes
@api_router.get("/books", response_model=List[BookResponse])
async def get_books(
    page: int = 1,
    limit: int = 5,
    search: Optional[str] = None,
    genre: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc"
):
    skip = (page - 1) * limit
    
    # Build filter
    filter_dict = {}
    if search:
        filter_dict["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"author": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    if genre:
        filter_dict["genre"] = genre
    
    # Build sort
    sort_direction = -1 if sort_order == "desc" else 1
    sort_field = sort_by if sort_by in ["created_at", "title", "author", "published_year", "average_rating"] else "created_at"
    
    books = await db.books.find(filter_dict).sort(sort_field, sort_direction).skip(skip).limit(limit).to_list(limit)
    
    # Get user names for books
    book_responses = []
    for book in books:
        user = await db.users.find_one({"id": book["added_by"]})
        book_response = BookResponse(
            **book,
            added_by_name=user["name"] if user else "Unknown User"
        )
        book_responses.append(book_response)
    
    return book_responses

@api_router.get("/books/{book_id}", response_model=BookResponse)
async def get_book(book_id: str):
    book = await db.books.find_one({"id": book_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    user = await db.users.find_one({"id": book["added_by"]})
    return BookResponse(
        **book,
        added_by_name=user["name"] if user else "Unknown User"
    )

@api_router.post("/books", response_model=BookResponse)
async def create_book(book_data: BookCreate, current_user: User = Depends(get_current_user)):
    book = Book(
        **book_data.dict(),
        added_by=current_user.id
    )
    
    await db.books.insert_one(book.dict())
    
    return BookResponse(
        **book.dict(),
        added_by_name=current_user.name
    )

@api_router.put("/books/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    book_data: BookUpdate,
    current_user: User = Depends(get_current_user)
):
    book = await db.books.find_one({"id": book_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book["added_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own books")
    
    update_data = {k: v for k, v in book_data.dict().items() if v is not None}
    if update_data:
        await db.books.update_one({"id": book_id}, {"$set": update_data})
        book.update(update_data)
    
    return BookResponse(
        **book,
        added_by_name=current_user.name
    )

@api_router.delete("/books/{book_id}")
async def delete_book(book_id: str, current_user: User = Depends(get_current_user)):
    book = await db.books.find_one({"id": book_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    if book["added_by"] != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own books")
    
    await db.books.delete_one({"id": book_id})
    await db.reviews.delete_many({"book_id": book_id})
    
    return {"message": "Book deleted successfully"}

# Review Routes
@api_router.get("/books/{book_id}/reviews", response_model=List[ReviewWithUser])
async def get_book_reviews(book_id: str):
    reviews = await db.reviews.find({"book_id": book_id}).sort("created_at", -1).to_list(100)
    
    review_responses = []
    for review in reviews:
        user = await db.users.find_one({"id": review["user_id"]})
        review_response = ReviewWithUser(
            **review,
            user_name=user["name"] if user else "Unknown User"
        )
        review_responses.append(review_response)
    
    return review_responses

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, current_user: User = Depends(get_current_user)):
    # Check if book exists
    book = await db.books.find_one({"id": review_data.book_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if user already reviewed this book
    existing_review = await db.reviews.find_one({"book_id": review_data.book_id, "user_id": current_user.id})
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this book")
    
    # Analyze sentiment
    sentiment = await analyze_sentiment(review_data.review_text)
    
    review = Review(
        **review_data.dict(),
        user_id=current_user.id,
        sentiment=sentiment
    )
    
    await db.reviews.insert_one(review.dict())
    
    # Update book's average rating and total reviews
    await update_book_rating(review_data.book_id)
    
    return review

@api_router.put("/reviews/{review_id}", response_model=Review)
async def update_review(
    review_id: str,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user)
):
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews")
    
    update_data = {k: v for k, v in review_data.dict().items() if v is not None}
    
    # Re-analyze sentiment if review text changed
    if "review_text" in update_data:
        sentiment = await analyze_sentiment(update_data["review_text"])
        update_data["sentiment"] = sentiment
    
    if update_data:
        await db.reviews.update_one({"id": review_id}, {"$set": update_data})
        review.update(update_data)
        
        # Update book's average rating
        await update_book_rating(review["book_id"])
    
    return Review(**review)

@api_router.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current_user: User = Depends(get_current_user)):
    review = await db.reviews.find_one({"id": review_id})
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")
    
    book_id = review["book_id"]
    await db.reviews.delete_one({"id": review_id})
    
    # Update book's average rating
    await update_book_rating(book_id)
    
    return {"message": "Review deleted successfully"}

async def update_book_rating(book_id: str):
    """Update book's average rating and total reviews count"""
    reviews = await db.reviews.find({"book_id": book_id}).to_list(1000)
    
    if reviews:
        total_reviews = len(reviews)
        average_rating = sum(r["rating"] for r in reviews) / total_reviews
    else:
        total_reviews = 0
        average_rating = 0.0
    
    await db.books.update_one(
        {"id": book_id},
        {"$set": {"average_rating": round(average_rating, 1), "total_reviews": total_reviews}}
    )

# AI Routes
@api_router.get("/ai/recommendations")
async def get_recommendations(current_user: User = Depends(get_current_user)):
    recommendations = await get_book_recommendations(current_user.id)
    return {"recommendations": recommendations}

# Stats Routes
@api_router.get("/books/{book_id}/stats")
async def get_book_stats(book_id: str):
    reviews = await db.reviews.find({"book_id": book_id}).to_list(1000)
    
    # Rating distribution
    rating_dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    sentiment_dist = {"positive": 0, "negative": 0, "neutral": 0}
    
    for review in reviews:
        rating_dist[review["rating"]] += 1
        sentiment = review.get("sentiment", "neutral")
        sentiment_dist[sentiment] += 1
    
    return {
        "total_reviews": len(reviews),
        "rating_distribution": rating_dist,
        "sentiment_distribution": sentiment_dist
    }

# Utility Routes
@api_router.get("/genres")
async def get_genres():
    """Get all unique genres"""
    genres = await db.books.distinct("genre")
    return {"genres": sorted(genres)}

@api_router.get("/")
async def root():
    return {"message": "Book Review Platform API"}

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