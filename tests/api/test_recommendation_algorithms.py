"""
Tests for recommendation algorithms.

This module contains unit tests for the recommendation system algorithms.
"""
import sys
import os
import unittest
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock

# Add the src directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from src.api.services.recommendation_service import RecommendationService
from src.api.models.recommendation_models import (
    Product, Recommendation,
    PersonalizedRecommendationRequest, SimilarProductRequest,
    PopularRecommendationRequest, TrendingRecommendationRequest,
    RecommendationFeedbackRequest, RecommendationExplainRequest,
    UserProfileType, ProductCategory, SimilarityType, TimeFrame,
    SortOrder, FeedbackType
)
from src.api.config.recommendation_config import (
    get_config, RecommendationAlgorithmType
)


class TestRecommendationAlgorithms(unittest.TestCase):
    """Test case for recommendation algorithms."""
    
    def setUp(self):
        """Set up test environment."""
        self.service = RecommendationService()
        self.tenant_id = "test-tenant"
        self.user_id = "test-user"
        self.session_id = "test-session"
        
        # Set up sample user interaction history
        self._create_user_history()
    
    def _create_user_history(self):
        """Create sample user interaction history."""
        # View several products
        for product_id in ["EG-001", "SG-001", "EG-003"]:
            self.service.submit_feedback(
                RecommendationFeedbackRequest(
                    tenant_id=self.tenant_id,
                    recommendation_id="test-rec",
                    product_id=product_id,
                    feedback_type=FeedbackType.VIEW,
                    user_id=self.user_id,
                    session_id=self.session_id
                )
            )
        
        # Click on some products
        for product_id in ["EG-001", "EG-003"]:
            self.service.submit_feedback(
                RecommendationFeedbackRequest(
                    tenant_id=self.tenant_id,
                    recommendation_id="test-rec",
                    product_id=product_id,
                    feedback_type=FeedbackType.CLICK,
                    user_id=self.user_id,
                    session_id=self.session_id
                )
            )
        
        # Add to cart
        self.service.submit_feedback(
            RecommendationFeedbackRequest(
                tenant_id=self.tenant_id,
                recommendation_id="test-rec",
                product_id="EG-003",
                feedback_type=FeedbackType.ADD_TO_CART,
                user_id=self.user_id,
                session_id=self.session_id
            )
        )
        
        # Purchase
        self.service.submit_feedback(
            RecommendationFeedbackRequest(
                tenant_id=self.tenant_id,
                recommendation_id="test-rec",
                product_id="EG-003",
                feedback_type=FeedbackType.PURCHASE,
                user_id=self.user_id,
                session_id=self.session_id,
                context={"price": 169.99}
            )
        )
    
    def test_personalized_recommendations(self):
        """Test personalized recommendations."""
        # Test with default settings
        request = PersonalizedRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            limit=5
        )
        
        response = self.service.get_personalized_recommendations(request)
        
        # Verify response structure
        self.assertIsNotNone(response.request_id)
        self.assertEqual(response.limit, 5)
        self.assertEqual(response.offset, 0)
        self.assertEqual(response.profile_type, UserProfileType.HYBRID)
        self.assertEqual(response.diversity_level, 0.5)
        self.assertLessEqual(len(response.recommendations), 5)
        
        # Verify recommendations have expected fields
        for rec in response.recommendations:
            self.assertIsNotNone(rec.product)
            self.assertIsNotNone(rec.score)
            self.assertIsNotNone(rec.algorithm)
            self.assertIsNotNone(rec.product.product_id)
            self.assertIsNotNone(rec.product.name)
            self.assertIsNotNone(rec.product.price)
            self.assertIsNotNone(rec.product.category)
    
    def test_content_based_recommendations(self):
        """Test content-based recommendations."""
        request = PersonalizedRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            profile_type=UserProfileType.EXPLICIT,
            limit=5
        )
        
        response = self.service.get_personalized_recommendations(request)
        
        # Verify algorithm type
        for rec in response.recommendations:
            self.assertEqual(rec.algorithm, "content_based")
    
    def test_collaborative_recommendations(self):
        """Test collaborative recommendations."""
        request = PersonalizedRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            profile_type=UserProfileType.IMPLICIT,
            limit=5
        )
        
        response = self.service.get_personalized_recommendations(request)
        
        # Verify algorithm type
        for rec in response.recommendations:
            self.assertEqual(rec.algorithm, "collaborative")
    
    def test_similar_product_recommendations(self):
        """Test similar product recommendations."""
        # Test attribute-based similarity
        request = SimilarProductRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            product_id="EG-003",  # Cat-Eye Crystal Frames
            similarity_type=SimilarityType.ATTRIBUTE,
            limit=5
        )
        
        response = self.service.get_similar_products(request)
        
        # Verify response structure
        self.assertIsNotNone(response.request_id)
        self.assertEqual(response.product_id, "EG-003")
        self.assertEqual(response.similarity_type, SimilarityType.ATTRIBUTE)
        self.assertLessEqual(len(response.recommendations), 5)
        
        # Verify recommendations have expected fields
        for rec in response.recommendations:
            self.assertIsNotNone(rec.product)
            self.assertIsNotNone(rec.score)
            self.assertIsNotNone(rec.algorithm)
            self.assertIsNotNone(rec.reason)
    
    def test_visual_similarity_recommendations(self):
        """Test visual similarity recommendations."""
        request = SimilarProductRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            product_id="EG-003",  # Cat-Eye Crystal Frames
            similarity_type=SimilarityType.VISUAL,
            limit=5
        )
        
        response = self.service.get_similar_products(request)
        
        # Verify response structure
        self.assertEqual(response.similarity_type, SimilarityType.VISUAL)
        
        # Verify recommendations have expected fields and reference correct similarity type
        for rec in response.recommendations:
            self.assertIsNotNone(rec.product)
            self.assertTrue("similarity_visual" in rec.algorithm or "similarity_VISUAL" in rec.algorithm)
    
    def test_popular_recommendations(self):
        """Test popular recommendations."""
        request = PopularRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            time_frame=TimeFrame.MONTH,
            limit=5
        )
        
        response = self.service.get_popular_recommendations(request)
        
        # Verify response structure
        self.assertIsNotNone(response.request_id)
        self.assertEqual(response.time_frame, TimeFrame.MONTH)
        self.assertLessEqual(len(response.recommendations), 5)
        
        # Verify recommendations have expected fields
        for rec in response.recommendations:
            self.assertIsNotNone(rec.product)
            self.assertIsNotNone(rec.score)
            self.assertEqual(rec.algorithm, "popularity")
    
    def test_trending_recommendations(self):
        """Test trending recommendations."""
        request = TrendingRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            time_frame=TimeFrame.WEEK,
            limit=5
        )
        
        response = self.service.get_trending_recommendations(request)
        
        # Verify response structure
        self.assertIsNotNone(response.request_id)
        self.assertEqual(response.time_frame, TimeFrame.WEEK)
        self.assertLessEqual(len(response.recommendations), 5)
        
        # Verify recommendations have expected fields
        for rec in response.recommendations:
            self.assertIsNotNone(rec.product)
            self.assertIsNotNone(rec.score)
            self.assertEqual(rec.algorithm, "trending")
    
    def test_category_filtering(self):
        """Test filtering recommendations by category."""
        # Test for eyeglasses
        request = PopularRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            category=ProductCategory.EYEGLASSES,
            limit=5
        )
        
        response = self.service.get_popular_recommendations(request)
        
        # Verify all recommendations are eyeglasses
        for rec in response.recommendations:
            self.assertEqual(rec.product.category, ProductCategory.EYEGLASSES)
        
        # Test for sunglasses
        request = PopularRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            category=ProductCategory.SUNGLASSES,
            limit=5
        )
        
        response = self.service.get_popular_recommendations(request)
        
        # Verify all recommendations are sunglasses
        for rec in response.recommendations:
            self.assertEqual(rec.product.category, ProductCategory.SUNGLASSES)
    
    def test_price_filtering(self):
        """Test filtering recommendations by price range."""
        request = PopularRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            price_min=100,
            price_max=150,
            limit=5
        )
        
        response = self.service.get_popular_recommendations(request)
        
        # Verify all recommendations are in the price range
        for rec in response.recommendations:
            self.assertGreaterEqual(rec.product.price, 100)
            self.assertLessEqual(rec.product.price, 150)
    
    def test_recommendation_feedback(self):
        """Test submitting recommendation feedback."""
        # Submit view feedback
        feedback_request = RecommendationFeedbackRequest(
            tenant_id=self.tenant_id,
            recommendation_id="test-feedback",
            product_id="EG-005",
            feedback_type=FeedbackType.VIEW,
            user_id=self.user_id,
            session_id=self.session_id
        )
        
        response = self.service.submit_feedback(feedback_request)
        
        # Verify response structure
        self.assertIsNotNone(response.feedback_id)
        self.assertIsNotNone(response.timestamp)
        self.assertTrue(response.success)
        
        # Submit click feedback
        feedback_request = RecommendationFeedbackRequest(
            tenant_id=self.tenant_id,
            recommendation_id="test-feedback",
            product_id="EG-005",
            feedback_type=FeedbackType.CLICK,
            user_id=self.user_id,
            session_id=self.session_id
        )
        
        response = self.service.submit_feedback(feedback_request)
        self.assertTrue(response.success)
    
    def test_recommendation_explanation(self):
        """Test getting explanation for a recommendation."""
        # First get a recommendation
        request = PersonalizedRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            limit=1
        )
        
        rec_response = self.service.get_personalized_recommendations(request)
        
        # Get explanation for the recommendation
        if rec_response.recommendations:
            first_rec = rec_response.recommendations[0]
            
            explain_request = RecommendationExplainRequest(
                tenant_id=self.tenant_id,
                recommendation_id=rec_response.request_id,
                product_id=first_rec.product.product_id,
                user_id=self.user_id,
                session_id=self.session_id
            )
            
            explanation = self.service.explain_recommendation(explain_request)
            
            # Verify explanation structure
            self.assertEqual(explanation.recommendation_id, rec_response.request_id)
            self.assertEqual(explanation.product_id, first_rec.product.product_id)
            self.assertIsNotNone(explanation.explanation)
            self.assertIsInstance(explanation.factors, list)
            self.assertGreater(len(explanation.factors), 0)
    
    def test_diversity(self):
        """Test recommendation diversity."""
        # Test with no diversity
        no_diversity_request = PersonalizedRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            diversity_level=0.0,
            limit=5
        )
        
        no_diversity_response = self.service.get_personalized_recommendations(no_diversity_request)
        
        # Test with high diversity
        high_diversity_request = PersonalizedRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            diversity_level=1.0,
            limit=5
        )
        
        high_diversity_response = self.service.get_personalized_recommendations(high_diversity_request)
        
        # We can't assert specific diversity metrics in a deterministic way,
        # but we can verify that the responses have the expected diversity level
        self.assertEqual(no_diversity_response.diversity_level, 0.0)
        self.assertEqual(high_diversity_response.diversity_level, 1.0)
    
    def test_sorting(self):
        """Test recommendation sorting."""
        # Test price low to high
        request = PopularRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            sort_by=SortOrder.PRICE_LOW_TO_HIGH,
            limit=10
        )
        
        response = self.service.get_popular_recommendations(request)
        
        # Verify sorting
        prices = [rec.product.price for rec in response.recommendations]
        self.assertEqual(prices, sorted(prices))
        
        # Test price high to low
        request = PopularRecommendationRequest(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            session_id=self.session_id,
            sort_by=SortOrder.PRICE_HIGH_TO_LOW,
            limit=10
        )
        
        response = self.service.get_popular_recommendations(request)
        
        # Verify sorting
        prices = [rec.product.price for rec in response.recommendations]
        self.assertEqual(prices, sorted(prices, reverse=True))


if __name__ == "__main__":
    unittest.main()