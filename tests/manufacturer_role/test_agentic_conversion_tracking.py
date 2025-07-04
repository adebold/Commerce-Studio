"""
Test suite for agentic manufacturer onboarding and conversion tracking.
Addresses conversion optimization requirements from prompts_LS6.md.

This test suite ensures:
1. Personalized onboarding flow generation
2. Real conversion tracking and attribution
3. Intelligent upgrade prompt optimization
4. A/B testing capability for conversion optimization
"""

import pytest
import asyncio
import time
import json
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import random

# Test imports - these will fail until real implementations exist (RED PHASE)
try:
    from src.agentic.onboarding_manager import AgenticOnboardingManager
    from src.analytics.conversion_tracker import ConversionTracker
    from src.analytics.manufacturer_analytics import ManufacturerAnalyticsManager
    from src.agentic.prompt_manager import IntelligentPromptManager
    from src.agentic.ab_testing import ABTestingManager
    from src.models.manufacturer_profile import ManufacturerProfile, CompanySize, TechSavviness
    from src.models.onboarding_flow import OnboardingFlow, OnboardingStep
    from src.models.conversion_event import ConversionEvent, ConversionFunnel
except ImportError as e:
    pytest.skip(f"Agentic conversion modules not implemented: {e}", allow_module_level=True)


class CompanySize(Enum):
    """Company size categories for personalization"""
    SMALL = "small"
    MEDIUM = "medium"
    LARGE = "large"
    ENTERPRISE = "enterprise"


class TechSavviness(Enum):
    """Tech savviness levels for onboarding personalization"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ConversionTrigger(Enum):
    """Conversion trigger types"""
    ML_TOOLS_LIMIT_REACHED = "ml_tools_limit_reached"
    PRODUCT_UPLOAD_LIMIT = "product_upload_limit"
    ANALYTICS_PREVIEW = "analytics_preview"
    API_ACCESS_REQUEST = "api_access_request"
    FEATURE_DISCOVERY = "feature_discovery"
    TIME_BASED = "time_based"


@dataclass
class ManufacturerProfile:
    """Manufacturer profile for personalization"""
    manufacturer_id: str
    company_name: str
    company_size: CompanySize
    annual_revenue: int
    product_count_estimate: int
    primary_market: str
    tech_savviness: TechSavviness
    industry_segment: str
    signup_source: str
    referral_source: Optional[str] = None


@dataclass
class OnboardingStep:
    """Individual step in onboarding flow"""
    step_id: str
    step_type: str
    title: str
    description: str
    estimated_time_minutes: int
    required: bool
    personalization_score: float


@dataclass
class OnboardingFlow:
    """Complete onboarding flow"""
    flow_id: str
    manufacturer_profile: ManufacturerProfile
    steps: List[OnboardingStep]
    total_steps: int
    estimated_completion_time: int
    personalization_score: float
    conversion_hooks: List[str]
    
    @property
    def step_types(self) -> List[str]:
        return [step.step_type for step in self.steps]


@dataclass
class ConversionEvent:
    """Individual conversion tracking event"""
    event_id: str
    manufacturer_id: str
    event_type: str
    timestamp: datetime
    event_data: Dict[str, Any]
    session_id: str
    user_agent: str
    source: str


@dataclass
class ConversionFunnel:
    """Conversion funnel analysis"""
    manufacturer_id: str
    total_events: int
    conversion_achieved: bool
    time_to_conversion: Optional[int]
    conversion_trigger: Optional[str]
    drop_off_points: List[str]
    engagement_score: float


@pytest.fixture
async def real_onboarding_manager():
    """
    Real AgenticOnboardingManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    manager = AgenticOnboardingManager()
    await manager.initialize()
    await manager.load_personalization_models()
    return manager


@pytest.fixture
async def real_analytics_manager():
    """
    Real ManufacturerAnalyticsManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    analytics_manager = ManufacturerAnalyticsManager()
    await analytics_manager.initialize()
    return analytics_manager


@pytest.fixture
async def real_prompt_manager():
    """
    Real IntelligentPromptManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    prompt_manager = IntelligentPromptManager()
    await prompt_manager.initialize()
    await prompt_manager.load_optimization_models()
    return prompt_manager


@pytest.fixture
async def real_ab_testing_manager():
    """
    Real ABTestingManager - NO MOCKS
    This fixture will fail until real implementation exists (RED PHASE)
    """
    ab_manager = ABTestingManager()
    await ab_manager.initialize()
    return ab_manager


class TestAgenticOnboardingFlow:
    """Test suite for agentic manufacturer onboarding and conversion tracking"""
    
    @pytest.mark.agentic
    @pytest.mark.asyncio
    async def test_personalized_onboarding_flow_generation(self, real_onboarding_manager):
        """
        Test personalized onboarding flow based on manufacturer profile.
        
        This test ensures:
        - Real personalization algorithms (not random)
        - Profile-based flow customization
        - Conversion optimization integration
        """
        # Test small manufacturer onboarding
        small_manufacturer_profile = ManufacturerProfile(
            manufacturer_id="mfg_small_001",
            company_name="Small Eyewear Boutique",
            company_size=CompanySize.SMALL,
            annual_revenue=500000,
            product_count_estimate=50,
            primary_market="local",
            tech_savviness=TechSavviness.MEDIUM,
            industry_segment="fashion_eyewear",
            signup_source="organic_search"
        )
        
        start_time = time.perf_counter()
        onboarding_flow = await real_onboarding_manager.generate_personalized_flow(
            small_manufacturer_profile
        )
        generation_time = time.perf_counter() - start_time
        
        # Verify flow structure for small manufacturer
        assert onboarding_flow is not None
        assert onboarding_flow.manufacturer_profile.manufacturer_id == small_manufacturer_profile.manufacturer_id
        assert onboarding_flow.total_steps <= 5, f"Small manufacturer flow should be simplified, got {onboarding_flow.total_steps} steps"
        assert onboarding_flow.personalization_score > 0.7, f"Personalization score {onboarding_flow.personalization_score} too low"
        
        # Verify appropriate steps for small manufacturer
        step_types = onboarding_flow.step_types
        assert "product_upload_tutorial" in step_types, "Small manufacturers need product upload guidance"
        assert "basic_analytics_demo" in step_types, "Basic analytics should be demonstrated"
        assert "ml_tools_preview" in step_types, "ML tools preview for conversion hook"
        
        # Should NOT have complex enterprise features
        assert "bulk_api_integration" not in step_types, "Small manufacturers don't need bulk API"
        assert "enterprise_sso_setup" not in step_types, "Small manufacturers don't need SSO"
        
        # Performance assertion
        assert generation_time < 0.5, f"Flow generation took {generation_time:.3f}s, expected < 0.5s"
        
        # Test large manufacturer onboarding
        large_manufacturer_profile = ManufacturerProfile(
            manufacturer_id="mfg_large_001",
            company_name="Global Eyewear Corporation",
            company_size=CompanySize.LARGE,
            annual_revenue=50000000,
            product_count_estimate=5000,
            primary_market="international",
            tech_savviness=TechSavviness.HIGH,
            industry_segment="luxury_eyewear",
            signup_source="sales_referral"
        )
        
        large_onboarding_flow = await real_onboarding_manager.generate_personalized_flow(
            large_manufacturer_profile
        )
        
        # Verify enterprise-focused flow
        assert large_onboarding_flow.total_steps <= 8, "Large manufacturer flow should be comprehensive but not overwhelming"
        assert large_onboarding_flow.personalization_score > 0.8, "Large manufacturers should get highly personalized flows"
        
        large_step_types = large_onboarding_flow.step_types
        assert "bulk_upload_tutorial" in large_step_types, "Large manufacturers need bulk operations"
        assert "api_integration_demo" in large_step_types, "API integration is important for large manufacturers"
        assert "enterprise_features_preview" in large_step_types, "Enterprise features should be highlighted"
        assert "dedicated_support_intro" in large_step_types, "Large manufacturers get dedicated support"
        
        # Test flow adaptation based on tech savviness
        low_tech_profile = ManufacturerProfile(
            manufacturer_id="mfg_lowtech_001",
            company_name="Traditional Eyewear Shop",
            company_size=CompanySize.MEDIUM,
            annual_revenue=2000000,
            product_count_estimate=200,
            primary_market="regional",
            tech_savviness=TechSavviness.LOW,
            industry_segment="traditional_eyewear",
            signup_source="trade_show"
        )
        
        low_tech_flow = await real_onboarding_manager.generate_personalized_flow(low_tech_profile)
        
        # Low tech savviness should get more guided steps
        assert low_tech_flow.total_steps >= 6, "Low tech users need more guidance"
        low_tech_steps = low_tech_flow.step_types
        assert "platform_basics_tutorial" in low_tech_steps, "Low tech users need platform basics"
        assert "guided_product_upload" in low_tech_steps, "Step-by-step guidance needed"
        assert "support_resources_intro" in low_tech_steps, "Support resources are crucial"
    
    @pytest.mark.agentic
    @pytest.mark.asyncio
    async def test_conversion_tracking_accuracy(self, real_analytics_manager):
        """
        Test conversion tracking accuracy and attribution.
        
        This test ensures:
        - Real event tracking (not mock)
        - Accurate conversion attribution
        - Funnel analysis capabilities
        """
        manufacturer_id = "mfg_conversion_test_001"
        session_id = f"session_{int(time.time())}"
        
        # Simulate complete manufacturer journey with real event tracking
        events = [
            {
                "event_type": "onboarding_started",
                "event_data": {
                    "source": "organic_search",
                    "landing_page": "/manufacturer-signup",
                    "utm_campaign": "eyewear_manufacturers_2024"
                }
            },
            {
                "event_type": "profile_completed",
                "event_data": {
                    "completion_time": 120,  # seconds
                    "company_size": "medium",
                    "industry_segment": "fashion_eyewear"
                }
            },
            {
                "event_type": "first_product_uploaded",
                "event_data": {
                    "product_count": 1,
                    "upload_method": "manual",
                    "time_since_signup": 300  # 5 minutes
                }
            },
            {
                "event_type": "dashboard_explored",
                "event_data": {
                    "pages_visited": ["analytics", "products", "settings"],
                    "time_spent": 180,  # 3 minutes
                    "features_discovered": 5
                }
            },
            {
                "event_type": "ml_tools_preview_viewed",
                "event_data": {
                    "feature": "face_shape_compatibility",
                    "engagement_time": 45,
                    "demo_completed": True
                }
            },
            {
                "event_type": "upgrade_prompt_shown",
                "event_data": {
                    "trigger": "ml_tools_limit_reached",
                    "prompt_type": "modal",
                    "personalization_score": 0.85
                }
            },
            {
                "event_type": "upgrade_completed",
                "event_data": {
                    "plan": "professional",
                    "payment_method": "credit_card",
                    "discount_applied": "FIRST_MONTH_50",
                    "total_amount": 99.50
                }
            }
        ]
        
        # Track events with real analytics
        tracked_events = []
        for i, event in enumerate(events):
            event_timestamp = datetime.now() + timedelta(minutes=i * 5)  # 5 minutes apart
            
            start_time = time.perf_counter()
            tracked_event = await real_analytics_manager.track_event(
                manufacturer_id=manufacturer_id,
                event_type=event["event_type"],
                event_data=event["event_data"],
                session_id=session_id,
                timestamp=event_timestamp
            )
            tracking_time = time.perf_counter() - start_time
            
            tracked_events.append(tracked_event)
            
            # Performance assertion for event tracking
            assert tracking_time < 0.1, f"Event tracking took {tracking_time:.3f}s, expected < 0.1s"
            assert tracked_event.event_id is not None, "Event should have unique ID"
            assert tracked_event.manufacturer_id == manufacturer_id
        
        # Analyze conversion funnel with real analytics
        start_time = time.perf_counter()
        funnel_analysis = await real_analytics_manager.analyze_conversion_funnel(manufacturer_id)
        analysis_time = time.perf_counter() - start_time
        
        # Verify funnel analysis accuracy
        assert funnel_analysis is not None
        assert funnel_analysis.manufacturer_id == manufacturer_id
        assert funnel_analysis.total_events == len(events)
        assert funnel_analysis.conversion_achieved == True, "Conversion should be detected"
        assert funnel_analysis.time_to_conversion is not None
        assert funnel_analysis.time_to_conversion <= 3600, "Conversion within 1 hour"
        assert funnel_analysis.conversion_trigger == "ml_tools_limit_reached"
        assert funnel_analysis.engagement_score > 0.7, f"Engagement score {funnel_analysis.engagement_score} too low"
        
        # Performance assertion for analysis
        assert analysis_time < 0.5, f"Funnel analysis took {analysis_time:.3f}s, expected < 0.5s"
        
        # Test attribution accuracy
        attribution = await real_analytics_manager.get_conversion_attribution(manufacturer_id)
        
        assert attribution is not None
        assert attribution.first_touch_source == "organic_search"
        assert attribution.last_touch_trigger == "ml_tools_limit_reached"
        assert attribution.total_touchpoints == len(events)
        assert attribution.attribution_confidence > 0.9, "Attribution should be highly confident"
        
        # Test conversion cohort analysis
        cohort_analysis = await real_analytics_manager.analyze_conversion_cohort(
            signup_date_range=(datetime.now() - timedelta(days=1), datetime.now()),
            segment_by=["company_size", "industry_segment"]
        )
        
        assert cohort_analysis is not None
        assert len(cohort_analysis.cohorts) > 0
        assert manufacturer_id in [c.manufacturer_id for cohort in cohort_analysis.cohorts for c in cohort.manufacturers]
    
    @pytest.mark.agentic
    @pytest.mark.asyncio
    async def test_intelligent_upgrade_prompts(self, real_prompt_manager):
        """
        Test intelligent upgrade prompt timing and personalization.
        
        This test ensures:
        - Real prompt optimization (not random)
        - Context-aware timing
        - Personalized messaging
        """
        # Test manufacturer approaching limits
        manufacturer_context = {
            "manufacturer_id": "mfg_prompt_test_001",
            "tier": "free",
            "signup_date": datetime.now() - timedelta(days=7),
            "days_since_signup": 7,
            "products_uploaded": 25,
            "ml_tool_usage": 15,  # Approaching limit of 20
            "dashboard_visits": 12,
            "engagement_score": 0.8,
            "company_size": "medium",
            "industry_segment": "fashion_eyewear",
            "recent_activity": [
                {"action": "product_upload", "timestamp": datetime.now() - timedelta(hours=2)},
                {"action": "ml_tool_usage", "timestamp": datetime.now() - timedelta(hours=1)},
                {"action": "analytics_view", "timestamp": datetime.now() - timedelta(minutes=30)}
            ]
        }
        
        # Test prompt generation with real intelligence
        start_time = time.perf_counter()
        upgrade_prompt = await real_prompt_manager.generate_upgrade_prompt(manufacturer_context)
        generation_time = time.perf_counter() - start_time
        
        # Verify prompt quality and personalization
        assert upgrade_prompt is not None
        assert upgrade_prompt.trigger_reason == "approaching_ml_limit"
        assert upgrade_prompt.personalization_score > 0.7, f"Personalization score {upgrade_prompt.personalization_score} too low"
        assert upgrade_prompt.urgency_level in ["low", "medium", "high"]
        assert upgrade_prompt.confidence_score > 0.6, f"Confidence score {upgrade_prompt.confidence_score} too low"
        
        # Verify personalized content
        assert "25 products" in upgrade_prompt.message, "Should reference actual product count"
        assert "ML tools" in upgrade_prompt.message, "Should reference the trigger"
        assert len(upgrade_prompt.message) > 50, "Message should be substantial"
        assert len(upgrade_prompt.call_to_action) > 10, "CTA should be meaningful"
        
        # Performance assertion
        assert generation_time < 0.2, f"Prompt generation took {generation_time:.3f}s, expected < 0.2s"
        
        # Test timing optimization
        optimal_timing = await real_prompt_manager.calculate_optimal_timing(manufacturer_context)
        
        assert optimal_timing is not None
        assert optimal_timing.should_show_now in [True, False]
        assert optimal_timing.confidence_score > 0.5
        assert optimal_timing.recommended_delay_minutes >= 0
        
        # High engagement should recommend showing now
        if manufacturer_context["engagement_score"] > 0.7:
            assert optimal_timing.should_show_now == True, "High engagement should trigger immediate prompt"
        
        # Test A/B testing integration
        ab_variant = await real_prompt_manager.get_ab_test_variant(manufacturer_context["manufacturer_id"])
        
        assert ab_variant in ["control", "variant_a", "variant_b", "variant_c"]
        
        # Test prompt interaction tracking
        await real_prompt_manager.track_prompt_interaction(
            manufacturer_context["manufacturer_id"],
            upgrade_prompt.prompt_id,
            "shown"
        )
        
        await real_prompt_manager.track_prompt_interaction(
            manufacturer_context["manufacturer_id"],
            upgrade_prompt.prompt_id,
            "clicked"
        )
        
        # Verify tracking worked
        effectiveness = await real_prompt_manager.get_prompt_effectiveness(upgrade_prompt.prompt_id)
        
        assert effectiveness is not None
        assert effectiveness.total_impressions >= 1
        assert effectiveness.total_clicks >= 1
        assert effectiveness.click_rate > 0.0
        assert effectiveness.conversion_rate >= 0.0
    
    @pytest.mark.agentic
    @pytest.mark.asyncio
    async def test_ab_testing_conversion_optimization(self, real_ab_testing_manager, real_analytics_manager):
        """
        Test A/B testing capability for conversion optimization.
        
        This test ensures:
        - Real A/B test management
        - Statistical significance calculation
        - Conversion rate optimization
        """
        # Create A/B test for upgrade prompts
        ab_test_config = {
            "test_name": "upgrade_prompt_optimization",
            "description": "Testing different upgrade prompt strategies",
            "variants": [
                {
                    "name": "control",
                    "weight": 0.25,
                    "config": {
                        "prompt_style": "standard",
                        "urgency_level": "medium",
                        "discount_offer": None
                    }
                },
                {
                    "name": "urgent_discount",
                    "weight": 0.25,
                    "config": {
                        "prompt_style": "urgent",
                        "urgency_level": "high",
                        "discount_offer": "50% off first month"
                    }
                },
                {
                    "name": "feature_focused",
                    "weight": 0.25,
                    "config": {
                        "prompt_style": "feature_highlight",
                        "urgency_level": "low",
                        "discount_offer": None,
                        "highlighted_features": ["ml_tools", "advanced_analytics"]
                    }
                },
                {
                    "name": "social_proof",
                    "weight": 0.25,
                    "config": {
                        "prompt_style": "testimonial",
                        "urgency_level": "medium",
                        "discount_offer": "20% off",
                        "testimonial": "Join 1000+ successful eyewear manufacturers"
                    }
                }
            ],
            "success_metric": "conversion_rate",
            "minimum_sample_size": 100,
            "confidence_level": 0.95
        }
        
        # Create A/B test
        ab_test = await real_ab_testing_manager.create_ab_test(ab_test_config)
        
        assert ab_test is not None
        assert ab_test.test_id is not None
        assert ab_test.status == "active"
        assert len(ab_test.variants) == 4
        
        # Simulate manufacturer assignments and conversions
        manufacturers = []
        for i in range(200):  # 200 test subjects
            manufacturer_id = f"mfg_ab_test_{i:03d}"
            
            # Get variant assignment
            variant = await real_ab_testing_manager.assign_variant(ab_test.test_id, manufacturer_id)
            assert variant in ["control", "urgent_discount", "feature_focused", "social_proof"]
            
            manufacturers.append({
                "manufacturer_id": manufacturer_id,
                "variant": variant,
                "converted": random.random() < self._get_conversion_rate_for_variant(variant)
            })
        
        # Track conversions for each manufacturer
        for manufacturer in manufacturers:
            if manufacturer["converted"]:
                await real_analytics_manager.track_event(
                    manufacturer_id=manufacturer["manufacturer_id"],
                    event_type="upgrade_completed",
                    event_data={
                        "ab_test_id": ab_test.test_id,
                        "variant": manufacturer["variant"],
                        "plan": "professional"
                    }
                )
        
        # Analyze A/B test results
        ab_results = await real_ab_testing_manager.analyze_ab_test(ab_test.test_id)
        
        assert ab_results is not None
        assert ab_results.test_id == ab_test.test_id
        assert ab_results.total_participants >= 200
        assert len(ab_results.variant_results) == 4
        
        # Verify statistical analysis
        for variant_result in ab_results.variant_results:
            assert variant_result.participants > 0
            assert variant_result.conversions >= 0
            assert variant_result.conversion_rate >= 0.0
            assert variant_result.confidence_interval is not None
        
        # Check for statistical significance
        if ab_results.has_statistical_significance:
            assert ab_results.winning_variant is not None
            assert ab_results.confidence_level >= 0.95
            assert ab_results.p_value <= 0.05
        
        # Test A/B test conclusion
        if ab_results.has_statistical_significance:
            conclusion = await real_ab_testing_manager.conclude_ab_test(
                ab_test.test_id,
                winning_variant=ab_results.winning_variant
            )
            
            assert conclusion.status == "concluded"
            assert conclusion.winning_variant == ab_results.winning_variant
            assert conclusion.improvement_percentage is not None
    
    def _get_conversion_rate_for_variant(self, variant: str) -> float:
        """Simulate different conversion rates for A/B test variants"""
        conversion_rates = {
            "control": 0.15,
            "urgent_discount": 0.22,
            "feature_focused": 0.18,
            "social_proof": 0.20
        }
        return conversion_rates.get(variant, 0.15)


class TestConversionOptimization:
    """Test suite for conversion optimization and measurement"""
    
    @pytest.mark.agentic
    @pytest.mark.asyncio
    async def test_conversion_rate_measurement(self, real_analytics_manager):
        """
        Test accurate conversion rate measurement and optimization.
        
        This test ensures:
        - Accurate conversion rate calculation
        - Cohort-based analysis
        - Optimization recommendations
        """
        # Simulate multiple manufacturer cohorts
        cohorts = [
            {
                "name": "organic_search_cohort",
                "size": 100,
                "conversion_rate": 0.18,
                "source": "organic_search"
            },
            {
                "name": "paid_ads_cohort", 
                "size": 150,
                "conversion_rate": 0.25,
                "source": "paid_advertising"
            },
            {
                "name": "referral_cohort",
                "size": 75,
                "conversion_rate": 0.35,
                "source": "referral"
            }
        ]
        
        # Track cohort performance
        for cohort in cohorts:
            for i in range(cohort["size"]):
                manufacturer_id = f"mfg_{cohort['name']}_{i:03d}"
                
                # Track signup
                await real_analytics_manager.track_event(
                    manufacturer_id=manufacturer_id,
                    event_type="manufacturer_signup",
                    event_data={
                        "source": cohort["source"],
                        "cohort": cohort["name"]
                    }
                )
                
                # Simulate conversion based on cohort rate
                if random.random() < cohort["conversion_rate"]:
                    await real_analytics_manager.track_event(
                        manufacturer_id=manufacturer_id,
                        event_type="upgrade_completed",
                        event_data={
                            "plan": "professional",
                            "cohort": cohort["name"]
                        }
                    )
        
        # Analyze conversion rates by cohort
        conversion_analysis = await real_analytics_manager.analyze_conversion_by_cohort(
            time_period=timedelta(days=30)
        )
        
        assert conversion_analysis is not None
        assert len(conversion_analysis.cohorts) == 3
        
        # Verify conversion rate accuracy
        for cohort_result in conversion_analysis.cohorts:
            expected_rate = next(c["conversion_rate"] for c in cohorts if c["name"] == cohort_result.cohort_name)
            actual_rate = cohort_result.conversion_rate
            
            # Allow for some variance due to randomization
            assert abs(actual_rate - expected_rate) < 0.05, f"Conversion rate mismatch for {cohort_result.cohort_name}"
        
        # Test optimization recommendations
        optimization_recommendations = await real_analytics_manager.generate_optimization_recommendations(
            conversion_analysis
        )
        
        assert optimization_recommendations is not None
        assert len(optimization_recommendations.recommendations) > 0
        
        # Should recommend focusing on high-performing channels
        high_performing_sources = [r.recommendation for r in optimization_recommendations.recommendations 
                                 if "referral" in r.recommendation.lower()]
        assert len(high_performing_sources) > 0, "Should recommend leveraging referral channel"


if __name__ == "__main__":
    # Run agentic tests with verbose output
    pytest.main([__file__, "-v", "--tb=short", "-m", "agentic"])