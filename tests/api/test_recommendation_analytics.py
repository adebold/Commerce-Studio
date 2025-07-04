"""
Unit tests for the recommendation analytics service.

This module contains tests for the various functionalities of the
analytics service, including impression tracking, interaction metrics,
and dashboard summaries.
"""

import unittest
from unittest.mock import patch
import json
from datetime import datetime, timedelta

from src.api.services.recommendation_analytics import get_analytics_service, RecommendationAnalyticsService
from src.api.models.recommendation_models import FeedbackType, TimeFrame


class TestRecommendationAnalyticsService(unittest.TestCase):
    """Test cases for the recommendation analytics service."""
    
    def setUp(self):
        """Set up the test environment."""
        self.service = RecommendationAnalyticsService()
        self.tenant_id = "test-tenant"
        self.algorithm = "collaborative_filtering"
        self.user_id = "test-user"
    
    def test_track_impression(self):
        """Test tracking impressions."""
        # Track an impression
        result = self.service.track_impression(
            tenant_id=self.tenant_id,
            recommendation_id="rec-123",
            algorithm=self.algorithm,
            product_ids=["product-1", "product-2", "product-3"],
            user_id=self.user_id
        )
        
        self.assertTrue(result)
        
        # Check that impressions were tracked
        date_key = datetime.now().strftime("%Y-%m-%d")
        hour_key = datetime.now().hour
        
        # Check algorithm-level impressions
        self.assertEqual(
            self.service.impressions[self.tenant_id][self.algorithm][date_key][hour_key],
            3  # 3 products
        )
        
        # Check product-level impressions
        for i in range(1, 4):
            self.assertEqual(
                self.service.product_impressions[self.tenant_id][f"product-{i}"][date_key],
                1
            )
    
    def test_track_impression_with_categories(self):
        """Test tracking impressions with product categories."""
        # Track an impression with categories
        product_categories = {
            "product-1": "eyeglasses",
            "product-2": "sunglasses",
            "product-3": "accessories"
        }
        
        result = self.service.track_impression(
            tenant_id=self.tenant_id,
            recommendation_id="rec-456",
            algorithm=self.algorithm,
            product_ids=list(product_categories.keys()),
            user_id=self.user_id,
            product_categories=product_categories
        )
        
        self.assertTrue(result)
        
        # Check that category impressions were tracked
        date_key = datetime.now().strftime("%Y-%m-%d")
        
        for product_id, category in product_categories.items():
            self.assertEqual(
                self.service.category_metrics[self.tenant_id][category]["impressions"][date_key],
                1
            )
    
    def test_track_interaction(self):
        """Test tracking user interactions."""
        # Track interactions of different types
        event_types = [FeedbackType.CLICK, FeedbackType.ADD_TO_CART, FeedbackType.PURCHASE]
        
        for i, event_type in enumerate(event_types):
            product_id = f"product-{i+1}"
            result = self.service.track_interaction(
                tenant_id=self.tenant_id,
                recommendation_id=f"rec-{i+1}",
                algorithm=self.algorithm,
                product_id=product_id,
                event_type=event_type,
                user_id=self.user_id,
                category="eyeglasses"
            )
            
            self.assertTrue(result)
        
        # Check algorithm-level interactions
        date_key = datetime.now().strftime("%Y-%m-%d")
        hour_key = datetime.now().hour
        
        for event_type in event_types:
            self.assertEqual(
                self.service.interactions[self.tenant_id][self.algorithm][event_type.value][date_key][hour_key],
                1
            )
        
        # Check product-level interactions
        for i, event_type in enumerate(event_types):
            product_id = f"product-{i+1}"
            self.assertEqual(
                self.service.product_interactions[self.tenant_id][product_id][event_type.value][date_key],
                1
            )
        
        # Check category interactions
        for event_type in event_types:
            self.assertEqual(
                self.service.category_metrics[self.tenant_id]["eyeglasses"][event_type.value][date_key],
                1
            )
        
        # Check user-level interactions if enabled
        if self.service.config.store_user_history:
            for i, event_type in enumerate(event_types):
                product_id = f"product-{i+1}"
                interaction_list = self.service.user_interactions[self.tenant_id][self.user_id][event_type.value][date_key][product_id]
                self.assertEqual(len(interaction_list), 1)
    
    def test_get_impression_metrics(self):
        """Test getting impression metrics."""
        # Set up test data
        self._setup_test_data()
        
        # Get impression metrics for the last 7 days
        metrics = self.service.get_impression_metrics(
            tenant_id=self.tenant_id,
            time_frame=TimeFrame.WEEK
        )
        
        # Check results
        self.assertEqual(metrics["tenant_id"], self.tenant_id)
        self.assertEqual(metrics["time_frame"], TimeFrame.WEEK.value)
        
        # Check algorithm breakdown
        self.assertEqual(len(metrics["algorithms"]), 2)
        self.assertIn("collaborative_filtering", metrics["algorithms"])
        self.assertIn("hybrid", metrics["algorithms"])
        
        # Check total impressions
        total_impressions = sum(metrics["algorithms"].values())
        self.assertEqual(metrics["total_impressions"], total_impressions)
        self.assertEqual(total_impressions, 2000)  # From _setup_test_data
        
        # Check time series data
        self.assertGreaterEqual(len(metrics["time_series"]), 1)
    
    def test_get_interaction_metrics(self):
        """Test getting interaction metrics."""
        # Set up test data
        self._setup_test_data()
        
        # Get interaction metrics for the last 7 days
        metrics = self.service.get_interaction_metrics(
            tenant_id=self.tenant_id,
            time_frame=TimeFrame.WEEK
        )
        
        # Check results
        self.assertEqual(metrics["tenant_id"], self.tenant_id)
        self.assertEqual(metrics["time_frame"], TimeFrame.WEEK.value)
        
        # Check total impressions and interactions
        self.assertEqual(metrics["total_impressions"], 2000)  # From _setup_test_data
        
        # We expect 300 clicks + 150 purchases = 450 total interactions
        self.assertEqual(metrics["total_interactions"], 450)
        
        # Check interaction rate
        expected_rate = 450 / 2000
        self.assertAlmostEqual(metrics["interaction_rate"], expected_rate)
        
        # Check event types
        self.assertIn("click", metrics["event_types"])
        self.assertIn("purchase", metrics["event_types"])
        
        # Check algorithm breakdown
        self.assertEqual(len(metrics["algorithms"]), 2)
        
        # Check CF algorithm metrics
        cf_algo = metrics["algorithms"]["collaborative_filtering"]
        self.assertEqual(cf_algo["impressions"], 1200)
        self.assertEqual(cf_algo["events"]["click"], 180)
        self.assertEqual(cf_algo["events"]["purchase"], 60)
        
        # Check hybrid algorithm metrics
        hybrid_algo = metrics["algorithms"]["hybrid"]
        self.assertEqual(hybrid_algo["impressions"], 800)
        self.assertEqual(hybrid_algo["events"]["click"], 120)
        self.assertEqual(hybrid_algo["events"]["purchase"], 90)
    
    def test_get_product_metrics(self):
        """Test getting product-level metrics."""
        # Set up test data
        self._setup_test_data()
        
        # Get product metrics
        metrics = self.service.get_product_metrics(
            tenant_id=self.tenant_id,
            time_frame=TimeFrame.WEEK,
            limit=10
        )
        
        # Check results
        self.assertEqual(metrics["tenant_id"], self.tenant_id)
        self.assertEqual(metrics["time_frame"], TimeFrame.WEEK.value)
        
        # Check product breakdown
        self.assertGreaterEqual(len(metrics["products"]), 3)  # At least 3 products
        
        # Check metrics for a specific product
        product1 = metrics["products"].get("product-1")
        if product1:
            self.assertIn("impressions", product1)
            self.assertIn("clicks", product1)
            self.assertIn("purchases", product1)
            self.assertIn("ctr", product1)
            self.assertIn("conversion_rate", product1)
    
    def test_get_category_metrics(self):
        """Test getting category-level metrics."""
        # Set up test data
        self._setup_test_data()
        
        # Get category metrics
        metrics = self.service.get_category_metrics(
            tenant_id=self.tenant_id,
            time_frame=TimeFrame.WEEK
        )
        
        # Check results
        self.assertEqual(metrics["tenant_id"], self.tenant_id)
        self.assertEqual(metrics["time_frame"], TimeFrame.WEEK.value)
        
        # Check category breakdown
        self.assertGreaterEqual(len(metrics["categories"]), 2)  # At least 2 categories
        
        # Check metrics for eyeglasses category
        eyeglasses = metrics["categories"].get("eyeglasses")
        if eyeglasses:
            self.assertIn("impressions", eyeglasses)
            self.assertIn("clicks", eyeglasses)
            self.assertIn("purchases", eyeglasses)
            self.assertIn("ctr", eyeglasses)
            self.assertIn("conversion_rate", eyeglasses)
    
    def test_get_user_metrics(self):
        """Test getting user-specific metrics."""
        # Set up test data with user history
        self._setup_user_history()
        
        # Get user metrics
        metrics = self.service.get_user_metrics(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            time_frame=TimeFrame.MONTH
        )
        
        # Check results
        self.assertEqual(metrics["tenant_id"], self.tenant_id)
        self.assertEqual(metrics["user_id"], self.user_id)
        
        # Check interaction summary
        self.assertIn("interactions", metrics)
        self.assertIn("click", metrics["interactions"])
        self.assertIn("purchase", metrics["interactions"])
        
        # Check recent interactions
        self.assertIn("recent_interactions", metrics)
        self.assertGreaterEqual(len(metrics["recent_interactions"]), 1)
        
        # Check top products
        self.assertIn("top_products", metrics)
        self.assertGreaterEqual(len(metrics["top_products"]), 1)
    
    def test_get_algorithm_comparison(self):
        """Test comparing algorithm performance."""
        # Set up test data
        self._setup_test_data()
        
        # Get algorithm comparison
        comparison = self.service.get_algorithm_comparison(
            tenant_id=self.tenant_id,
            time_frame=TimeFrame.WEEK,
            algorithms=["collaborative_filtering", "hybrid"],
            metric="ctr"
        )
        
        # Check results
        self.assertEqual(comparison["tenant_id"], self.tenant_id)
        self.assertEqual(comparison["metric"], "ctr")
        
        # Check algorithm data
        self.assertEqual(len(comparison["algorithms"]), 2)
        
        # CF CTR should be 180/1200 = 0.15
        cf_ctr = comparison["algorithms"]["collaborative_filtering"]["ctr"]
        self.assertAlmostEqual(cf_ctr, 0.15)
        
        # Hybrid CTR should be 120/800 = 0.15
        hybrid_ctr = comparison["algorithms"]["hybrid"]["ctr"]
        self.assertAlmostEqual(hybrid_ctr, 0.15)
        
        # Get comparison with purchase rate metric
        purchase_comparison = self.service.get_algorithm_comparison(
            tenant_id=self.tenant_id,
            time_frame=TimeFrame.WEEK,
            algorithms=["collaborative_filtering", "hybrid"],
            metric="conversion_rate"
        )
        
        # CF purchase rate should be 60/1200 = 0.05
        cf_cvr = purchase_comparison["algorithms"]["collaborative_filtering"]["conversion_rate"]
        self.assertAlmostEqual(cf_cvr, 0.05)
        
        # Hybrid purchase rate should be 90/800 = 0.1125
        hybrid_cvr = purchase_comparison["algorithms"]["hybrid"]["conversion_rate"]
        self.assertAlmostEqual(hybrid_cvr, 0.1125)
        
        # Best algorithm should be hybrid for conversion rate
        self.assertEqual(purchase_comparison["best_algorithm"], "hybrid")
    
    def test_get_dashboard_summary(self):
        """Test getting dashboard summary metrics."""
        # Set up test data
        self._setup_test_data()
        
        # Get dashboard summary
        summary = self.service.get_dashboard_summary(
            tenant_id=self.tenant_id,
            period=TimeFrame.WEEK
        )
        
        # Check results
        self.assertEqual(summary["tenant_id"], self.tenant_id)
        self.assertEqual(summary["period"], TimeFrame.WEEK.value)
        
        # Check metrics sections
        self.assertIn("metrics", summary)
        self.assertIn("top_algorithms", summary)
        self.assertIn("top_products", summary)
        self.assertIn("top_categories", summary)
        
        # Check specific metrics
        metrics = summary["metrics"]
        self.assertIn("impressions", metrics)
        self.assertIn("clicks", metrics)
        self.assertIn("ctr", metrics)
        self.assertIn("purchases", metrics)
        self.assertIn("purchase_rate", metrics)
    
    def test_time_frame_selection(self):
        """Test different time frame selections."""
        # Get date ranges for different time frames
        day_range = self.service._get_date_range(TimeFrame.DAY)
        week_range = self.service._get_date_range(TimeFrame.WEEK)
        month_range = self.service._get_date_range(TimeFrame.MONTH)
        
        # Check lengths
        self.assertEqual(len(day_range), 1)  # Just today
        self.assertGreaterEqual(len(week_range), 7)  # At least 7 days
        self.assertGreaterEqual(len(month_range), 28)  # At least 28 days
        
        # Check custom date range
        today = datetime.now()
        ten_days_ago = (today - timedelta(days=10)).strftime("%Y-%m-%d")
        five_days_ago = (today - timedelta(days=5)).strftime("%Y-%m-%d")
        
        custom_range = self.service._get_date_range(
            TimeFrame.CUSTOM,
            start_date=ten_days_ago,
            end_date=five_days_ago
        )
        
        # Should be 6 days (inclusive of start and end)
        self.assertEqual(len(custom_range), 6)
    
    def test_singleton_service(self):
        """Test that get_analytics_service returns a singleton."""
        service1 = get_analytics_service()
        service2 = get_analytics_service()
        
        # Check they're the same instance
        self.assertIs(service1, service2)
    
    def _setup_test_data(self):
        """Set up test data for metrics calculations."""
        date_key = datetime.now().strftime("%Y-%m-%d")
        hour_key = datetime.now().hour
        
        # Set up impression data
        # Collaborative filtering: 1200 impressions
        self.service.impressions[self.tenant_id]["collaborative_filtering"][date_key][hour_key] = 1200
        
        # Hybrid: 800 impressions
        self.service.impressions[self.tenant_id]["hybrid"][date_key][hour_key] = 800
        
        # Set up product impressions
        for i in range(1, 6):  # 5 products
            product_id = f"product-{i}"
            
            # Different impression counts for each product
            impressions = 100 + i * 50
            self.service.product_impressions[self.tenant_id][product_id][date_key] = impressions
        
        # Set up category impressions
        self.service.category_metrics[self.tenant_id]["eyeglasses"]["impressions"][date_key] = 1200
        self.service.category_metrics[self.tenant_id]["sunglasses"]["impressions"][date_key] = 800
        
        # Set up interaction data
        # Collaborative filtering: 180 clicks (15% CTR), 60 purchases (5% CVR)
        self.service.interactions[self.tenant_id]["collaborative_filtering"]["click"][date_key][hour_key] = 180
        self.service.interactions[self.tenant_id]["collaborative_filtering"]["purchase"][date_key][hour_key] = 60
        
        # Hybrid: 120 clicks (15% CTR), 90 purchases (11.25% CVR)
        self.service.interactions[self.tenant_id]["hybrid"]["click"][date_key][hour_key] = 120
        self.service.interactions[self.tenant_id]["hybrid"]["purchase"][date_key][hour_key] = 90
        
        # Set up product interactions
        for i in range(1, 6):  # 5 products
            product_id = f"product-{i}"
            
            # Different interaction rates for each product
            clicks = int((100 + i * 50) * 0.15)  # 15% CTR
            purchases = int((100 + i * 50) * 0.05)  # 5% CVR
            
            self.service.product_interactions[self.tenant_id][product_id]["click"][date_key] = clicks
            self.service.product_interactions[self.tenant_id][product_id]["purchase"][date_key] = purchases
        
        # Set up category interactions
        self.service.category_metrics[self.tenant_id]["eyeglasses"]["click"][date_key] = 180
        self.service.category_metrics[self.tenant_id]["eyeglasses"]["purchase"][date_key] = 60
        
        self.service.category_metrics[self.tenant_id]["sunglasses"]["click"][date_key] = 120
        self.service.category_metrics[self.tenant_id]["sunglasses"]["purchase"][date_key] = 90
    
    def _setup_user_history(self):
        """Set up user history data."""
        date_key = datetime.now().strftime("%Y-%m-%d")
        timestamp = datetime.now().isoformat()
        
        # Set up click history
        for i in range(1, 6):  # 5 products
            product_id = f"product-{i}"
            
            # Multiple clicks on each product
            clicks = [f"{timestamp}_{j}" for j in range(i)]
            self.service.user_interactions[self.tenant_id][self.user_id]["click"][date_key][product_id] = clicks
        
        # Set up purchase history
        for i in range(1, 3):  # 2 products purchased
            product_id = f"product-{i}"
            
            # One purchase per product
            self.service.user_interactions[self.tenant_id][self.user_id]["purchase"][date_key][product_id] = [timestamp]


if __name__ == "__main__":
    unittest.main()