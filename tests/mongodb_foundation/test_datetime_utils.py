"""
Test-Driven Development for DateTime Utilities (Priority P3)

This test suite implements comprehensive datetime utility testing for:
- UTC timezone handling and conversion functions
- Expiration time calculations and validation
- Timestamp normalization and comparison utilities
- Time-based cache operations and TTL management

Following TDD Red-Green-Refactor cycle:
1. Write failing tests that define datetime requirements
2. Implement minimal utility code to make tests pass
3. Refactor for production readiness and consistency

Based on reflection_hardening_LS4.md analysis - Priority P3 utility critical
"""

import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional, Union
from unittest.mock import Mock, patch
import time


class TestDateTimeUtilityFunctions:
    """
    Test Suite: DateTime Utility Functions
    
    RED PHASE: Write failing tests for datetime utilities
    These tests define the datetime handling requirements before implementation
    """
    
    def test_utc_now_returns_timezone_aware_datetime(self):
        """
        TEST: utc_now should return timezone-aware datetime in UTC
        
        Expected behavior:
        - Return datetime object with UTC timezone
        - Ensure timezone awareness (not naive)
        - Consistent with datetime.now(timezone.utc)
        """
        from src.utils.datetime_utils import utc_now
        
        now = utc_now()
        
        # Should be timezone-aware
        assert now.tzinfo is not None
        assert now.tzinfo == timezone.utc
        
        # Should be close to current time
        system_now = datetime.now(timezone.utc)
        time_diff = abs((now - system_now).total_seconds())
        assert time_diff < 1.0  # Within 1 second
    
    def test_is_expired_function_validation(self):
        """
        TEST: is_expired should correctly validate expiration times
        
        Expected behavior:
        - Return True for past expiration times
        - Return False for future expiration times
        - Handle timezone-aware and naive datetimes
        """
        from src.utils.datetime_utils import is_expired, utc_now
        
        now = utc_now()
        
        # Past time should be expired
        past_time = now - timedelta(minutes=10)
        assert is_expired(past_time) is True
        
        # Future time should not be expired
        future_time = now + timedelta(minutes=10)
        assert is_expired(future_time) is False
        
        # Current time should be expired (edge case)
        assert is_expired(now) is True
        
        # Test with timestamps
        past_timestamp = time.time() - 600  # 10 minutes ago
        future_timestamp = time.time() + 600  # 10 minutes from now
        
        assert is_expired(past_timestamp) is True
        assert is_expired(future_timestamp) is False
    
    def test_get_expiry_datetime_calculation(self):
        """
        TEST: get_expiry_datetime should calculate correct expiration times
        
        Expected behavior:
        - Add TTL seconds to base time
        - Return timezone-aware datetime
        - Handle both datetime and timestamp inputs
        """
        from src.utils.datetime_utils import get_expiry_datetime, utc_now
        
        base_time = utc_now()
        ttl_seconds = 300  # 5 minutes
        
        # Calculate expiry from datetime
        expiry = get_expiry_datetime(base_time, ttl_seconds)
        expected_expiry = base_time + timedelta(seconds=ttl_seconds)
        
        assert expiry == expected_expiry
        assert expiry.tzinfo == timezone.utc
        
        # Calculate expiry from timestamp
        base_timestamp = time.time()
        expiry_from_timestamp = get_expiry_datetime(base_timestamp, ttl_seconds)
        
        assert expiry_from_timestamp.tzinfo == timezone.utc
        time_diff = abs(expiry_from_timestamp.timestamp() - (base_timestamp + ttl_seconds))
        assert time_diff < 0.1  # Should be very close
    
    def test_normalize_to_utc_conversion(self):
        """
        TEST: normalize_to_utc should convert various time formats to UTC
        
        Expected behavior:
        - Convert naive datetimes to UTC
        - Preserve timezone-aware datetimes in UTC
        - Convert timestamps to UTC datetimes
        - Handle string ISO formats
        """
        from src.utils.datetime_utils import normalize_to_utc
        
        # Test naive datetime (assumes local timezone)
        naive_dt = datetime(2023, 6, 15, 12, 0, 0)
        normalized_naive = normalize_to_utc(naive_dt)
        assert normalized_naive.tzinfo == timezone.utc
        
        # Test timezone-aware datetime
        aware_dt = datetime(2023, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        normalized_aware = normalize_to_utc(aware_dt)
        assert normalized_aware == aware_dt
        assert normalized_aware.tzinfo == timezone.utc
        
        # Test timestamp
        timestamp = 1686830400.0  # 2023-06-15 12:00:00 UTC
        normalized_timestamp = normalize_to_utc(timestamp)
        assert normalized_timestamp.tzinfo == timezone.utc
        assert abs(normalized_timestamp.timestamp() - timestamp) < 0.1
        
        # Test ISO string
        iso_string = "2023-06-15T12:00:00Z"
        normalized_iso = normalize_to_utc(iso_string)
        assert normalized_iso.tzinfo == timezone.utc
        assert normalized_iso.year == 2023
        assert normalized_iso.month == 6
        assert normalized_iso.day == 15
    
    def test_time_difference_calculations(self):
        """
        TEST: Time difference utility functions
        
        Expected behavior:
        - Calculate differences in various units
        - Handle both positive and negative differences
        - Support different input time formats
        """
        from src.utils.datetime_utils import (
            time_difference_seconds,
            time_difference_minutes,
            time_difference_hours,
            utc_now
        )
        
        base_time = utc_now()
        later_time = base_time + timedelta(hours=2, minutes=30, seconds=45)
        
        # Test seconds difference
        seconds_diff = time_difference_seconds(later_time, base_time)
        expected_seconds = (2 * 3600) + (30 * 60) + 45
        assert abs(seconds_diff - expected_seconds) < 1
        
        # Test minutes difference
        minutes_diff = time_difference_minutes(later_time, base_time)
        expected_minutes = (2 * 60) + 30 + (45 / 60)
        assert abs(minutes_diff - expected_minutes) < 0.1
        
        # Test hours difference
        hours_diff = time_difference_hours(later_time, base_time)
        expected_hours = 2.5 + (45 / 3600)
        assert abs(hours_diff - expected_hours) < 0.01
        
        # Test negative differences
        negative_seconds = time_difference_seconds(base_time, later_time)
        assert negative_seconds == -expected_seconds


class TestCacheExpirationHelpers:
    """
    Test Suite: Cache Expiration Helper Functions
    
    RED PHASE: Write failing tests for cache-specific datetime utilities
    These tests define the cache expiration requirements before implementation
    """
    
    def test_cache_entry_expiration_check(self):
        """
        TEST: Cache entry expiration validation
        
        Expected behavior:
        - Check if cache entries are expired
        - Handle different TTL configurations
        - Support custom expiration policies
        """
        from src.utils.datetime_utils import is_cache_entry_expired, utc_now
        
        now = utc_now()
        
        # Test non-expired entry
        entry_created = now - timedelta(minutes=2)
        entry_ttl = 300  # 5 minutes
        assert is_cache_entry_expired(entry_created, entry_ttl) is False
        
        # Test expired entry
        old_entry_created = now - timedelta(minutes=10)
        assert is_cache_entry_expired(old_entry_created, entry_ttl) is True
        
        # Test edge case - exactly at expiration
        edge_entry_created = now - timedelta(seconds=entry_ttl)
        assert is_cache_entry_expired(edge_entry_created, entry_ttl) is True
    
    def test_ttl_remaining_calculation(self):
        """
        TEST: Calculate remaining TTL for cache entries
        
        Expected behavior:
        - Return seconds remaining until expiration
        - Return 0 for expired entries
        - Handle negative TTL gracefully
        """
        from src.utils.datetime_utils import get_ttl_remaining, utc_now
        
        now = utc_now()
        ttl_seconds = 300  # 5 minutes
        
        # Entry created 2 minutes ago
        entry_created = now - timedelta(minutes=2)
        remaining = get_ttl_remaining(entry_created, ttl_seconds)
        expected_remaining = 300 - (2 * 60)  # 3 minutes remaining
        assert abs(remaining - expected_remaining) < 5  # Within 5 seconds
        
        # Expired entry
        expired_entry_created = now - timedelta(minutes=10)
        expired_remaining = get_ttl_remaining(expired_entry_created, ttl_seconds)
        assert expired_remaining == 0
        
        # Fresh entry
        fresh_entry_created = now
        fresh_remaining = get_ttl_remaining(fresh_entry_created, ttl_seconds)
        assert abs(fresh_remaining - ttl_seconds) < 1
    
    def test_cache_cleanup_scheduling(self):
        """
        TEST: Cache cleanup scheduling utilities
        
        Expected behavior:
        - Calculate next cleanup time
        - Support different cleanup intervals
        - Handle cleanup time drift
        """
        from src.utils.datetime_utils import (
            get_next_cleanup_time,
            should_run_cleanup,
            utc_now
        )
        
        now = utc_now()
        cleanup_interval = 60  # 1 minute
        
        # Calculate next cleanup time
        next_cleanup = get_next_cleanup_time(cleanup_interval)
        assert next_cleanup > now
        time_diff = (next_cleanup - now).total_seconds()
        assert abs(time_diff - cleanup_interval) < 1
        
        # Test cleanup scheduling
        last_cleanup = now - timedelta(seconds=30)  # 30 seconds ago
        should_cleanup_now = should_run_cleanup(last_cleanup, cleanup_interval)
        assert should_cleanup_now is False  # Too early
        
        old_last_cleanup = now - timedelta(seconds=90)  # 90 seconds ago
        should_cleanup_old = should_run_cleanup(old_last_cleanup, cleanup_interval)
        assert should_cleanup_old is True  # Time to cleanup
    
    def test_batch_expiration_validation(self):
        """
        TEST: Batch validation of multiple cache entries
        
        Expected behavior:
        - Process multiple entries efficiently
        - Return lists of expired and valid entries
        - Maintain entry order and metadata
        """
        from src.utils.datetime_utils import validate_batch_expiration, utc_now
        
        now = utc_now()
        
        # Create test entries with different ages
        entries = [
            {"key": "fresh", "created_at": now - timedelta(minutes=1), "ttl": 300},
            {"key": "expired1", "created_at": now - timedelta(minutes=10), "ttl": 300},
            {"key": "valid", "created_at": now - timedelta(minutes=3), "ttl": 300},
            {"key": "expired2", "created_at": now - timedelta(minutes=15), "ttl": 300},
        ]
        
        valid_entries, expired_entries = validate_batch_expiration(entries)
        
        # Verify results
        valid_keys = [entry["key"] for entry in valid_entries]
        expired_keys = [entry["key"] for entry in expired_entries]
        
        assert "fresh" in valid_keys
        assert "valid" in valid_keys
        assert "expired1" in expired_keys
        assert "expired2" in expired_keys
        assert len(valid_entries) == 2
        assert len(expired_entries) == 2


class TestTimezoneHandlingAndEdgeCases:
    """
    Test Suite: Timezone Handling and Edge Cases
    
    RED PHASE: Write failing tests for timezone scenarios
    These tests define the timezone handling requirements before implementation
    """
    
    def test_timezone_conversion_accuracy(self):
        """
        TEST: Accurate timezone conversions
        
        Expected behavior:
        - Handle different timezone inputs correctly
        - Preserve time accuracy across conversions
        - Support common timezone formats
        """
        from src.utils.datetime_utils import convert_to_utc, convert_from_utc
        
        # Test various timezone conversions
        test_cases = [
            ("US/Eastern", -5),  # EST (UTC-5)
            ("US/Pacific", -8),  # PST (UTC-8)
            ("Europe/London", 0),  # GMT (UTC+0)
            ("Asia/Tokyo", 9),    # JST (UTC+9)
        ]
        
        base_utc = datetime(2023, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        
        for tz_name, utc_offset in test_cases:
            # Convert from UTC to timezone
            local_time = convert_from_utc(base_utc, tz_name)
            
            # Convert back to UTC
            converted_utc = convert_to_utc(local_time)
            
            # Should match original UTC time
            assert converted_utc == base_utc
    
    def test_daylight_saving_time_handling(self):
        """
        TEST: Daylight saving time transitions
        
        Expected behavior:
        - Handle DST transitions correctly
        - Maintain time accuracy during spring/fall changes
        - Support timezone-aware calculations
        """
        from src.utils.datetime_utils import is_dst_transition, handle_dst_ambiguity
        
        # Test DST transition dates (approximate)
        spring_forward = datetime(2023, 3, 12, 7, 0, 0, tzinfo=timezone.utc)  # 2 AM EST becomes 3 AM EDT
        fall_back = datetime(2023, 11, 5, 6, 0, 0, tzinfo=timezone.utc)       # 2 AM EDT becomes 1 AM EST
        
        # Check DST transition detection
        assert is_dst_transition(spring_forward, "US/Eastern") is True
        assert is_dst_transition(fall_back, "US/Eastern") is True
        
        # Normal date should not be DST transition
        normal_date = datetime(2023, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        assert is_dst_transition(normal_date, "US/Eastern") is False
    
    def test_leap_second_and_edge_cases(self):
        """
        TEST: Leap seconds and edge case handling
        
        Expected behavior:
        - Handle leap seconds gracefully
        - Support edge cases in time calculations
        - Maintain precision for critical operations
        """
        from src.utils.datetime_utils import handle_leap_seconds, precise_time_diff
        
        # Test leap second handling (December 31, 2016 had a leap second)
        leap_second_date = datetime(2016, 12, 31, 23, 59, 59, tzinfo=timezone.utc)
        adjusted_time = handle_leap_seconds(leap_second_date)
        
        # Should handle leap second adjustment
        assert adjusted_time is not None
        assert adjusted_time.year == 2016
        assert adjusted_time.month == 12
        assert adjusted_time.day == 31
        
        # Test precise time differences
        time1 = datetime(2023, 6, 15, 12, 0, 0, 123456, tzinfo=timezone.utc)
        time2 = datetime(2023, 6, 15, 12, 0, 1, 123456, tzinfo=timezone.utc)
        
        precise_diff = precise_time_diff(time2, time1)
        assert abs(precise_diff - 1.0) < 0.000001  # Microsecond precision
    
    def test_performance_and_caching_optimizations(self):
        """
        TEST: Performance optimizations for datetime operations
        
        Expected behavior:
        - Cache timezone objects for reuse
        - Optimize repeated datetime calculations
        - Minimize object creation overhead
        """
        from src.utils.datetime_utils import (
            get_cached_timezone,
            bulk_normalize_timestamps,
            optimize_datetime_operations
        )
        
        # Test timezone caching
        tz1 = get_cached_timezone("US/Eastern")
        tz2 = get_cached_timezone("US/Eastern")
        assert tz1 is tz2  # Should be the same object (cached)
        
        # Test bulk operations
        timestamps = [time.time() + i for i in range(100)]
        normalized_times = bulk_normalize_timestamps(timestamps)
        
        assert len(normalized_times) == 100
        assert all(dt.tzinfo == timezone.utc for dt in normalized_times)
        
        # Test performance optimization context
        with optimize_datetime_operations():
            # Operations within this context should be optimized
            start_time = time.time()
            for _ in range(1000):
                get_cached_timezone("UTC")
            end_time = time.time()
            
            # Should complete quickly due to optimizations
            assert (end_time - start_time) < 0.1


class TestDateTimeValidationAndSanitization:
    """
    Test Suite: DateTime Validation and Sanitization
    
    RED PHASE: Write failing tests for datetime validation
    These tests define the validation requirements before implementation
    """
    
    def test_datetime_input_validation(self):
        """
        TEST: Validate various datetime input formats
        
        Expected behavior:
        - Accept valid datetime formats
        - Reject invalid or malicious inputs
        - Sanitize datetime strings safely
        """
        from src.utils.datetime_utils import validate_datetime_input, DateTimeValidationError
        
        # Valid inputs
        valid_inputs = [
            "2023-06-15T12:00:00Z",
            "2023-06-15 12:00:00",
            datetime(2023, 6, 15, 12, 0, 0),
            time.time(),
            1686830400  # Unix timestamp
        ]
        
        for valid_input in valid_inputs:
            result = validate_datetime_input(valid_input)
            assert result is not None
            assert isinstance(result, datetime)
            assert result.tzinfo == timezone.utc
        
        # Invalid inputs
        invalid_inputs = [
            "invalid_date",
            "2023-13-45T25:70:70Z",  # Invalid date/time
            "'; DROP TABLE dates; --",  # SQL injection attempt
            "<script>alert('xss')</script>",  # XSS attempt
            float('inf'),  # Invalid number
            None,
            {},
            []
        ]
        
        for invalid_input in invalid_inputs:
            with pytest.raises((DateTimeValidationError, ValueError, TypeError)):
                validate_datetime_input(invalid_input)
    
    def test_datetime_range_validation(self):
        """
        TEST: Validate datetime ranges and boundaries
        
        Expected behavior:
        - Enforce reasonable date ranges
        - Prevent far future or past dates
        - Support configurable range limits
        """
        from src.utils.datetime_utils import (
            validate_datetime_range,
            DateTimeRangeError,
            utc_now
        )
        
        now = utc_now()
        
        # Valid ranges
        valid_past = now - timedelta(days=30)
        valid_future = now + timedelta(days=30)
        
        assert validate_datetime_range(valid_past, max_past_days=365) is True
        assert validate_datetime_range(valid_future, max_future_days=365) is True
        
        # Invalid ranges
        too_far_past = now - timedelta(days=1000)
        too_far_future = now + timedelta(days=1000)
        
        with pytest.raises(DateTimeRangeError):
            validate_datetime_range(too_far_past, max_past_days=365)
        
        with pytest.raises(DateTimeRangeError):
            validate_datetime_range(too_far_future, max_future_days=365)
    
    def test_datetime_sanitization_for_storage(self):
        """
        TEST: Sanitize datetime values for safe storage
        
        Expected behavior:
        - Normalize to UTC for consistent storage
        - Remove microseconds if not needed
        - Validate against storage constraints
        """
        from src.utils.datetime_utils import sanitize_for_storage, StorageValidationError
        
        # Test various input formats
        test_inputs = [
            datetime(2023, 6, 15, 12, 0, 0, 123456),  # With microseconds
            "2023-06-15T12:00:00.123456Z",            # ISO with microseconds
            time.time(),                               # Timestamp
        ]
        
        for test_input in test_inputs:
            sanitized = sanitize_for_storage(test_input, precision='seconds')
            
            assert sanitized.tzinfo == timezone.utc
            assert sanitized.microsecond == 0  # Should be removed
            assert isinstance(sanitized, datetime)
        
        # Test storage constraint validation
        extreme_dates = [
            datetime(1900, 1, 1, tzinfo=timezone.utc),  # Too old
            datetime(2200, 1, 1, tzinfo=timezone.utc),  # Too far future
        ]
        
        for extreme_date in extreme_dates:
            with pytest.raises(StorageValidationError):
                sanitize_for_storage(extreme_date, enforce_constraints=True)


# Custom exceptions for testing
class DateTimeValidationError(Exception):
    """Exception raised for datetime validation failures"""
    pass


class DateTimeRangeError(Exception):
    """Exception raised for datetime range violations"""
    pass


class StorageValidationError(Exception):
    """Exception raised for storage validation failures"""
    pass


# Test execution markers
pytestmark = [
    pytest.mark.datetime_utils,
    pytest.mark.utilities,
    pytest.mark.mongodb_foundation,
    pytest.mark.tdd
]


if __name__ == "__main__":
    # Run datetime utils tests
    pytest.main([__file__, "-v", "--tb=short"])