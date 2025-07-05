"""
Tests for the API usage tracker.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from src.sku_genie.core.api_usage_tracker import (
    record_api_usage,
    calculate_api_cost,
    api_usage_decorator
)


class TestApiUsageTracker:
    """Tests for the API usage tracker."""

    @pytest.mark.asyncio
    async def test_record_api_usage(self):
        """Test recording API usage."""
        # Mock billing service
        mock_billing_service = AsyncMock()
        mock_billing_service.record_usage = AsyncMock(return_value=True)

        # Test data
        tenant_id = "test-tenant"
        api_name = "openai"
        operation = "completion"
        usage_data = {
            "model": "gpt-4",
            "input_tokens": 100,
            "output_tokens": 50
        }
        cost = 0.01

        # Call function
        await record_api_usage(
            tenant_id=tenant_id,
            api_name=api_name,
            operation=operation,
            usage_data=usage_data,
            cost=cost,
            billing_service=mock_billing_service
        )

        # Check if billing service was called
        mock_billing_service.record_usage.assert_called_once()
        call_args = mock_billing_service.record_usage.call_args[1]
        
        assert call_args["tenant_id"] == tenant_id
        assert call_args["feature"] == f"api.{api_name}.{operation}"
        assert call_args["quantity"] == 1
        assert "metadata" in call_args
        assert call_args["metadata"]["cost"] == cost
        assert call_args["metadata"]["usage_data"] == usage_data

    def test_calculate_api_cost(self):
        """Test calculating API cost."""
        # Test OpenAI cost calculation
        openai_usage = {
            "model": "gpt-4",
            "input_tokens": 1000,
            "output_tokens": 500
        }
        openai_cost = calculate_api_cost("openai", "completion", openai_usage)
        expected_openai_cost = 0.0 + (1000 / 1000.0 * 0.03) + (500 / 1000.0 * 0.06)
        assert openai_cost == expected_openai_cost

        # Test Vertex AI cost calculation
        vertex_usage = {
            "model": "gemini-pro",
            "input_tokens": 1000,
            "output_tokens": 500
        }
        vertex_cost = calculate_api_cost("vertex_ai", "completion", vertex_usage)
        expected_vertex_cost = 0.0 + (1000 / 1000.0 * 0.00025) + (500 / 1000.0 * 0.0005)
        assert vertex_cost == expected_vertex_cost

        # Test Apify cost calculation
        apify_usage = {
            "items": 2000
        }
        apify_cost = calculate_api_cost("apify", "fetch_data", apify_usage)
        expected_apify_cost = 0.0 + (2000 / 1000.0 * 0.25)
        assert apify_cost == expected_apify_cost

        # Test default cost calculation
        default_usage = {
            "requests": 5
        }
        default_cost = calculate_api_cost("unknown_api", "operation", default_usage)
        expected_default_cost = 0.0 + (5 * 0.01)
        assert default_cost == expected_default_cost

    @pytest.mark.asyncio
    async def test_api_usage_decorator(self):
        """Test API usage decorator."""
        # Create a mock class with a method to decorate
        class MockAdapter:
            def __init__(self):
                self.tenant_id = "test-tenant"
            
            @api_usage_decorator(api_name="openai", operation="completion")
            async def call_api(self, model, prompt):
                # Simulate API call
                return {
                    "model": model,
                    "usage": {
                        "prompt_tokens": len(prompt.split()),
                        "completion_tokens": 20
                    }
                }

        # Create instance and patch record_api_usage
        adapter = MockAdapter()
        
        with patch('src.sku_genie.core.api_usage_tracker.record_api_usage', new_callable=AsyncMock) as mock_record:
            # Call the decorated method
            result = await adapter.call_api("gpt-4", "This is a test prompt")
            
            # Wait for any pending tasks
            await asyncio.sleep(0.1)
            
            # Check if record_api_usage was called
            mock_record.assert_called_once()
            call_args = mock_record.call_args[1]
            
            assert call_args["tenant_id"] == "test-tenant"
            assert call_args["api_name"] == "openai"
            assert call_args["operation"] == "completion"
            assert "usage_data" in call_args
            assert call_args["usage_data"]["model"] == "gpt-4"
            assert call_args["usage_data"]["input_tokens"] == 5  # 5 words in prompt
            assert call_args["usage_data"]["output_tokens"] == 20