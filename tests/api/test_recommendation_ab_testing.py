"""
Unit tests for the recommendation A/B testing service.

This module contains tests for the various functionalities of the
A/B testing service, including experiment creation, user assignment,
and result calculation.
"""

import unittest
from unittest.mock import patch
import uuid
import json
from datetime import datetime, timedelta

from src.api.services.recommendation_ab_testing import get_ab_testing_service, ABTestingService
from src.api.models.recommendation_models import ExperimentType, ExperimentStatus


class TestABTestingService(unittest.TestCase):
    """Test cases for the recommendation A/B testing service."""
    
    def setUp(self):
        """Set up the test environment."""
        self.service = ABTestingService()
        self.tenant_id = "test-tenant"
        
        # Create a test experiment
        self.experiment = self._create_test_experiment()
        self.experiment_id = self.experiment["experiment_id"]
    
    def _create_test_experiment(self):
        """Create a test experiment."""
        variants = {
            "control": {
                "name": "Control Variant",
                "description": "The baseline algorithm",
                "weight": 0.5,
                "config": {"algorithm": "collaborative_filtering"}
            },
            "test": {
                "name": "Test Variant",
                "description": "New algorithm to test",
                "weight": 0.5,
                "config": {"algorithm": "hybrid"}
            }
        }
        
        return self.service.create_experiment(
            tenant_id=self.tenant_id,
            name="Test Experiment",
            description="A test experiment",
            experiment_type=ExperimentType.RECOMMENDATION_ALGORITHM,
            variants=variants,
            traffic_allocation=1.0
        )
    
    def test_experiment_creation(self):
        """Test creating an experiment."""
        # Check experiment was created with correct attributes
        self.assertIsNotNone(self.experiment_id)
        self.assertEqual(self.experiment["tenant_id"], self.tenant_id)
        self.assertEqual(self.experiment["name"], "Test Experiment")
        self.assertEqual(self.experiment["status"], ExperimentStatus.CREATED.value)
        
        # Check variants
        self.assertEqual(len(self.experiment["variants"]), 2)
        self.assertIn("control", self.experiment["variants"])
        self.assertIn("test", self.experiment["variants"])
        
        # Check variant weights sum to 1.0
        total_weight = sum(v["weight"] for v in self.experiment["variants"].values())
        self.assertAlmostEqual(total_weight, 1.0)
    
    def test_experiment_lifecycle(self):
        """Test the experiment lifecycle: start, pause, stop."""
        # Start the experiment
        started_experiment = self.service.start_experiment(self.experiment_id)
        self.assertEqual(started_experiment["status"], ExperimentStatus.RUNNING.value)
        self.assertIsNotNone(started_experiment["start_date"])
        
        # Pause the experiment
        paused_experiment = self.service.pause_experiment(self.experiment_id)
        self.assertEqual(paused_experiment["status"], ExperimentStatus.PAUSED.value)
        
        # Restart the experiment
        restarted_experiment = self.service.start_experiment(self.experiment_id)
        self.assertEqual(restarted_experiment["status"], ExperimentStatus.RUNNING.value)
        
        # Stop the experiment
        stopped_experiment = self.service.stop_experiment(self.experiment_id)
        self.assertEqual(stopped_experiment["status"], ExperimentStatus.COMPLETED.value)
        self.assertIsNotNone(stopped_experiment["end_date"])
    
    def test_get_experiment(self):
        """Test getting an experiment by ID."""
        # Get the experiment
        experiment = self.service.get_experiment(self.experiment_id)
        self.assertIsNotNone(experiment)
        self.assertEqual(experiment["experiment_id"], self.experiment_id)
        
        # Try getting a non-existent experiment
        non_existent = self.service.get_experiment("non-existent-id")
        self.assertIsNone(non_existent)
    
    def test_list_experiments(self):
        """Test listing experiments."""
        # Create another experiment
        self._create_test_experiment()
        
        # List all experiments for the tenant
        experiments = self.service.list_experiments(self.tenant_id)
        self.assertGreaterEqual(len(experiments), 2)
        
        # List only CREATED experiments
        created_experiments = self.service.list_experiments(
            self.tenant_id, 
            status=ExperimentStatus.CREATED
        )
        self.assertGreaterEqual(len(created_experiments), 2)
        
        # Start one experiment
        self.service.start_experiment(self.experiment_id)
        
        # List only RUNNING experiments
        running_experiments = self.service.list_experiments(
            self.tenant_id, 
            status=ExperimentStatus.RUNNING
        )
        self.assertEqual(len(running_experiments), 1)
        self.assertEqual(running_experiments[0]["experiment_id"], self.experiment_id)
    
    def test_consistent_variant_assignment(self):
        """Test that users are consistently assigned to the same variant."""
        # Start the experiment
        self.service.start_experiment(self.experiment_id)
        
        # Assign a user to a variant
        user_id = "test-user-1"
        exp_id, variant_id, _ = self.service.get_variant_for_user(
            user_id=user_id,
            experiment_id=self.experiment_id
        )
        
        # Check assignment
        self.assertEqual(exp_id, self.experiment_id)
        self.assertIn(variant_id, ["control", "test"])
        
        # Assign the same user again and check for consistency
        for _ in range(5):
            new_exp_id, new_variant_id, _ = self.service.get_variant_for_user(
                user_id=user_id,
                experiment_id=self.experiment_id
            )
            self.assertEqual(new_exp_id, exp_id)
            self.assertEqual(new_variant_id, variant_id)
    
    def test_traffic_allocation(self):
        """Test that traffic allocation works correctly."""
        # Create an experiment with 50% traffic allocation
        variants = {
            "control": {"weight": 0.5},
            "test": {"weight": 0.5}
        }
        
        experiment = self.service.create_experiment(
            tenant_id=self.tenant_id,
            name="Traffic Allocation Test",
            description="Testing traffic allocation",
            experiment_type=ExperimentType.RECOMMENDATION_ALGORITHM,
            variants=variants,
            traffic_allocation=0.5  # Only 50% of users in experiment
        )
        
        experiment_id = experiment["experiment_id"]
        self.service.start_experiment(experiment_id)
        
        # Generate users and count how many are in the experiment
        user_count = 1000
        in_experiment = 0
        
        for i in range(user_count):
            user_id = f"traffic-test-user-{i}"
            try:
                self.service.get_variant_for_user(
                    user_id=user_id,
                    experiment_id=experiment_id
                )
                in_experiment += 1
            except ValueError:
                # User not in experiment
                pass
        
        # Check that approximately 50% of users are in the experiment
        # Allow for some statistical variation
        expected = user_count * 0.5
        self.assertGreater(in_experiment, expected * 0.8)  # At least 80% of expected
        self.assertLess(in_experiment, expected * 1.2)  # At most 120% of expected
    
    def test_track_impression(self):
        """Test tracking impressions."""
        # Start the experiment
        self.service.start_experiment(self.experiment_id)
        
        # Assign a user to a variant
        user_id = "impression-test-user"
        _, variant_id, _ = self.service.get_variant_for_user(
            user_id=user_id,
            experiment_id=self.experiment_id
        )
        
        # Track an impression
        result = self.service.track_impression(
            tenant_id=self.tenant_id,
            recommendation_id="rec-123",
            product_ids=["product-1", "product-2", "product-3"],
            user_id=user_id
        )
        
        self.assertTrue(result)
        
        # Check that impressions were tracked
        date_key = datetime.now().strftime("%Y-%m-%d")
        variant_impressions = self.service.impressions[self.experiment_id][variant_id][date_key]
        self.assertEqual(sum(variant_impressions.values()), 3)  # 3 products
    
    def test_track_conversion(self):
        """Test tracking conversions."""
        # Start the experiment
        self.service.start_experiment(self.experiment_id)
        
        # Assign a user to a variant
        user_id = "conversion-test-user"
        _, variant_id, _ = self.service.get_variant_for_user(
            user_id=user_id,
            experiment_id=self.experiment_id
        )
        
        # Track conversions of different types
        event_types = ["click", "add_to_cart", "purchase"]
        
        for event_type in event_types:
            result = self.service.track_conversion(
                tenant_id=self.tenant_id,
                event_type=event_type,
                product_id=f"product-{event_type}",
                user_id=user_id
            )
            
            self.assertTrue(result)
        
        # Check that conversions were tracked
        date_key = datetime.now().strftime("%Y-%m-%d")
        for event_type in event_types:
            self.assertEqual(
                self.service.conversions[self.experiment_id][variant_id][date_key][event_type],
                1
            )
    
    def test_calculate_experiment_results(self):
        """Test calculating experiment results."""
        # Start the experiment
        self.service.start_experiment(self.experiment_id)
        
        # Simulate impressions and conversions for control variant
        control_users = [f"control-user-{i}" for i in range(1000)]
        for user_id in control_users:
            self.service.user_assignments[user_id] = {self.experiment_id: "control"}
        
        # Simulate impressions and conversions for test variant
        test_users = [f"test-user-{i}" for i in range(1000)]
        for user_id in test_users:
            self.service.user_assignments[user_id] = {self.experiment_id: "test"}
        
        # Set up conversion data
        date_key = datetime.now().strftime("%Y-%m-%d")
        
        # Control variant: 1000 impressions, 150 clicks (15% CTR), 50 purchases (5% CVR)
        self.service.impressions[self.experiment_id]["control"][date_key] = {0: 1000}
        self.service.conversions[self.experiment_id]["control"][date_key]["click"] = 150
        self.service.conversions[self.experiment_id]["control"][date_key]["purchase"] = 50
        
        # Test variant: 1000 impressions, 200 clicks (20% CTR), 80 purchases (8% CVR)
        self.service.impressions[self.experiment_id]["test"][date_key] = {0: 1000}
        self.service.conversions[self.experiment_id]["test"][date_key]["click"] = 200
        self.service.conversions[self.experiment_id]["test"][date_key]["purchase"] = 80
        
        # Calculate results
        results = self.service.calculate_experiment_results(self.experiment_id)
        
        # Check results
        self.assertEqual(results["winning_variant"], "test")
        self.assertGreater(results["improvement"], 0)
        self.assertLess(results["p_value"], 0.05)  # Statistically significant
        
        # Check variant metrics
        self.assertEqual(results["variants"]["control"]["impressions"], 1000)
        self.assertEqual(results["variants"]["control"]["conversions"]["click"], 150)
        self.assertEqual(results["variants"]["control"]["conversions"]["purchase"], 50)
        
        self.assertEqual(results["variants"]["test"]["impressions"], 1000)
        self.assertEqual(results["variants"]["test"]["conversions"]["click"], 200)
        self.assertEqual(results["variants"]["test"]["conversions"]["purchase"], 80)
        
        # Check rates
        self.assertAlmostEqual(results["variants"]["control"]["rates"]["click_rate"], 0.15)
        self.assertAlmostEqual(results["variants"]["control"]["rates"]["purchase_rate"], 0.05)
        
        self.assertAlmostEqual(results["variants"]["test"]["rates"]["click_rate"], 0.20)
        self.assertAlmostEqual(results["variants"]["test"]["rates"]["purchase_rate"], 0.08)
    
    def test_get_experiment_metrics(self):
        """Test getting detailed experiment metrics."""
        # Start the experiment
        self.service.start_experiment(self.experiment_id)
        
        # Set up impression and conversion data for multiple days
        today = datetime.now()
        
        # Create data for the last 5 days
        for days_ago in range(5):
            date = today - timedelta(days=days_ago)
            date_key = date.strftime("%Y-%m-%d")
            
            # Add impressions
            self.service.impressions[self.experiment_id]["control"][date_key] = {0: 500}
            self.service.impressions[self.experiment_id]["test"][date_key] = {0: 500}
            
            # Add conversions (increasing conversion rates over time)
            control_clicks = 75 + days_ago * 5  # 75, 80, 85, 90, 95
            test_clicks = 100 + days_ago * 5  # 100, 105, 110, 115, 120
            
            self.service.conversions[self.experiment_id]["control"][date_key]["click"] = control_clicks
            self.service.conversions[self.experiment_id]["test"][date_key]["click"] = test_clicks
        
        # Get metrics for the last 7 days
        start_date = (today - timedelta(days=7)).strftime("%Y-%m-%d")
        end_date = today.strftime("%Y-%m-%d")
        
        metrics = self.service.get_experiment_metrics(
            experiment_id=self.experiment_id,
            start_date=start_date,
            end_date=end_date
        )
        
        # Check the results
        self.assertEqual(metrics["experiment_id"], self.experiment_id)
        self.assertEqual(metrics["start_date"], start_date)
        self.assertEqual(metrics["end_date"], end_date)
        
        # Check variant metrics
        self.assertEqual(metrics["variants"]["control"]["total_impressions"], 2500)  # 5 days * 500
        self.assertEqual(metrics["variants"]["test"]["total_impressions"], 2500)  # 5 days * 500
        
        # Check that daily metrics are present
        for days_ago in range(5):
            date = today - timedelta(days=days_ago)
            date_key = date.strftime("%Y-%m-%d")
            
            self.assertIn(date_key, metrics["daily_metrics"])
            self.assertIn("control", metrics["daily_metrics"][date_key])
            self.assertIn("test", metrics["daily_metrics"][date_key])
    
    def test_singleton_service(self):
        """Test that get_ab_testing_service returns a singleton."""
        service1 = get_ab_testing_service()
        service2 = get_ab_testing_service()
        
        # Check they're the same instance
        self.assertIs(service1, service2)


if __name__ == "__main__":
    unittest.main()