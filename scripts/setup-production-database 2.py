#!/usr/bin/env python3
"""
Production Database Setup Script for EyewearML Platform

This script sets up the production database connections and initializes
the database with sample data for the deployed API.
"""

import os
import sys
import asyncio
import logging
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent.parent / "src"))

from api.database import engine, Base, SessionLocal
from api.models import *  # Import all models

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def setup_database():
    """Set up the production database."""
    
    logger.info("🗄️ Setting up production database...")
    
    try:
        # Create all tables
        logger.info("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
        
        # Test database connection
        logger.info("🔌 Testing database connection...")
        db = SessionLocal()
        try:
            # Simple query to test connection
            db.execute("SELECT 1")
            logger.info("✅ Database connection successful")
        finally:
            db.close()
            
        # Seed with sample data
        await seed_sample_data()
        
        logger.info("🎉 Production database setup complete!")
        
    except Exception as e:
        logger.error(f"❌ Database setup failed: {e}")
        raise

async def seed_sample_data():
    """Seed the database with sample data."""
    
    logger.info("🌱 Seeding database with sample data...")
    
    db = SessionLocal()
    try:
        # Check if data already exists
        from api.database import Recommendation
        existing_count = db.query(Recommendation).count()
        
        if existing_count > 0:
            logger.info(f"📊 Database already has {existing_count} records, skipping seed")
            return
            
        # Add sample recommendations
        sample_recommendations = [
            Recommendation(
                tenant_id="default",
                user_id="sample_user_1",
                session_id="session_1",
                recommendation_type="style_based",
                products=[
                    {"id": "frame_1", "brand": "Sample Brand", "model": "Model 1", "score": 0.95},
                    {"id": "frame_2", "brand": "Sample Brand", "model": "Model 2", "score": 0.87},
                ],
                recommendation_metadata={"algorithm": "collaborative_filtering", "version": "1.0"}
            ),
            Recommendation(
                tenant_id="default",
                user_id="sample_user_2",
                session_id="session_2",
                recommendation_type="face_shape_based",
                products=[
                    {"id": "frame_3", "brand": "Sample Brand", "model": "Model 3", "score": 0.92},
                    {"id": "frame_4", "brand": "Sample Brand", "model": "Model 4", "score": 0.84},
                ],
                recommendation_metadata={"face_shape": "oval", "confidence": 0.89}
            )
        ]
        
        for rec in sample_recommendations:
            db.add(rec)
        
        db.commit()
        logger.info(f"✅ Added {len(sample_recommendations)} sample recommendations")
        
    except Exception as e:
        logger.error(f"❌ Failed to seed data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def check_environment():
    """Check if the environment is properly configured."""
    
    logger.info("🔍 Checking environment configuration...")
    
    required_vars = [
        "DATABASE_URL",
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.warning(f"⚠️ Missing environment variables: {', '.join(missing_vars)}")
        logger.info("💡 Using default SQLite database for development")
    else:
        logger.info("✅ Environment configuration looks good")

if __name__ == "__main__":
    check_environment()
    asyncio.run(setup_database())