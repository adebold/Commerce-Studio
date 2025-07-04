#!/usr/bin/env python
"""
Migration script from SQLAlchemy to Prisma.

This script exports data from the SQLAlchemy database and imports it into the Prisma database.
"""
import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent.absolute()
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Import SQLAlchemy and Prisma modules
try:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    from sqlalchemy.future import select
    from src.api.database import Base, Recommendation, Feedback
    from prisma import Prisma
except ImportError as e:
    logger.error(f"Error importing required modules: {e}")
    logger.error("Make sure SQLAlchemy and Prisma are installed")
    sys.exit(1)


async def export_from_sqlalchemy(database_url):
    """
    Export data from SQLAlchemy database.
    
    Args:
        database_url: SQLAlchemy database URL
        
    Returns:
        Dictionary containing exported data
    """
    logger.info("Exporting data from SQLAlchemy database...")
    
    # Create async engine
    engine = create_async_engine(
        database_url,
        echo=False,
        future=True,
    )
    
    # Create async session
    async_session = sessionmaker(
        engine, expire_on_commit=False, class_=AsyncSession
    )
    
    exported_data = {
        "recommendations": [],
        "feedback": [],
    }
    
    try:
        async with async_session() as session:
            # Export recommendations
            logger.info("Exporting recommendations...")
            result = await session.execute(select(Recommendation))
            recommendations = result.scalars().all()
            
            for recommendation in recommendations:
                exported_data["recommendations"].append({
                    "id": recommendation.id,
                    "tenant_id": recommendation.tenant_id,
                    "user_id": recommendation.user_id,
                    "session_id": recommendation.session_id,
                    "recommendation_type": recommendation.recommendation_type,
                    "timestamp": recommendation.timestamp.isoformat() if recommendation.timestamp else None,
                    "products": recommendation.products,
                    "recommendation_metadata": recommendation.recommendation_metadata,
                })
            
            logger.info(f"Exported {len(exported_data['recommendations'])} recommendations")
            
            # Export feedback
            logger.info("Exporting feedback...")
            result = await session.execute(select(Feedback))
            feedbacks = result.scalars().all()
            
            for feedback in feedbacks:
                exported_data["feedback"].append({
                    "id": feedback.id,
                    "tenant_id": feedback.tenant_id,
                    "user_id": feedback.user_id,
                    "session_id": feedback.session_id,
                    "product_id": feedback.product_id,
                    "recommendation_id": feedback.recommendation_id,
                    "feedback_type": feedback.feedback_type,
                    "value": feedback.value,
                    "timestamp": feedback.timestamp.isoformat() if feedback.timestamp else None,
                    "context": feedback.context,
                })
            
            logger.info(f"Exported {len(exported_data['feedback'])} feedback records")
    
    except Exception as e:
        logger.error(f"Error exporting data from SQLAlchemy: {e}")
        raise
    finally:
        await engine.dispose()
    
    return exported_data


async def import_to_prisma(exported_data):
    """
    Import data into Prisma database.
    
    Args:
        exported_data: Dictionary containing exported data
    """
    logger.info("Importing data into Prisma database...")
    
    # Initialize Prisma client
    prisma = Prisma()
    
    try:
        await prisma.connect()
        
        # Import recommendations
        logger.info("Importing recommendations...")
        for recommendation_data in exported_data["recommendations"]:
            # Convert timestamp string to datetime
            if recommendation_data.get("timestamp"):
                recommendation_data["timestamp"] = datetime.fromisoformat(recommendation_data["timestamp"])
            
            # Create recommendation
            await prisma.recommendation.create(data=recommendation_data)
        
        logger.info(f"Imported {len(exported_data['recommendations'])} recommendations")
        
        # Import feedback
        logger.info("Importing feedback...")
        for feedback_data in exported_data["feedback"]:
            # Convert timestamp string to datetime
            if feedback_data.get("timestamp"):
                feedback_data["timestamp"] = datetime.fromisoformat(feedback_data["timestamp"])
            
            # Create feedback
            await prisma.feedback.create(data=feedback_data)
        
        logger.info(f"Imported {len(exported_data['feedback'])} feedback records")
    
    except Exception as e:
        logger.error(f"Error importing data to Prisma: {e}")
        raise
    finally:
        await prisma.disconnect()


async def verify_migration():
    """
    Verify the migration was successful.
    
    Returns:
        True if verification passed, False otherwise
    """
    logger.info("Verifying migration...")
    
    # Initialize Prisma client
    prisma = Prisma()
    
    try:
        await prisma.connect()
        
        # Count recommendations
        recommendation_count = await prisma.recommendation.count()
        logger.info(f"Prisma database has {recommendation_count} recommendations")
        
        # Count feedback
        feedback_count = await prisma.feedback.count()
        logger.info(f"Prisma database has {feedback_count} feedback records")
        
        # Verification passed if counts are greater than 0
        verification_passed = recommendation_count > 0 or feedback_count > 0
        
        if verification_passed:
            logger.info("Migration verification passed")
        else:
            logger.warning("Migration verification failed: No data found in Prisma database")
        
        return verification_passed
    
    except Exception as e:
        logger.error(f"Error verifying migration: {e}")
        return False
    finally:
        await prisma.disconnect()


async def main():
    """Main function."""
    try:
        # Get database URLs
        sqlalchemy_db_url = os.environ.get("SQLALCHEMY_DATABASE_URL")
        if not sqlalchemy_db_url:
            logger.error("SQLALCHEMY_DATABASE_URL environment variable not set")
            return False
        
        # Export data from SQLAlchemy
        exported_data = await export_from_sqlalchemy(sqlalchemy_db_url)
        
        # Save exported data to file (for backup)
        export_file = project_root / "data" / "sqlalchemy_export.json"
        os.makedirs(export_file.parent, exist_ok=True)
        
        with open(export_file, "w") as f:
            json.dump(exported_data, f, indent=2)
        
        logger.info(f"Exported data saved to {export_file}")
        
        # Import data to Prisma
        await import_to_prisma(exported_data)
        
        # Verify migration
        verification_passed = await verify_migration()
        
        return verification_passed
    
    except Exception as e:
        logger.error(f"Error during migration: {e}")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)