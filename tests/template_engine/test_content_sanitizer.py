"""
TDD RED-phase tests for Template Content Sanitizer [LS3_1.1.2]

This test suite defines the content sanitization requirements for XSS prevention.
All tests are designed to FAIL initially to drive TDD implementation.

Security Requirements:
- Bleach-based HTML sanitizer with configurable whitelists
- CSS sanitization for style attributes
- URL validation and sanitization (javascript:/data: protocol exploits)
- Comprehensive sanitization strategy for user-generated content
- Selective sanitization based on content contexts

Coverage Target: >95%
Security Target: 100% of OWASP XSS cheat sheet attacks prevented
"""

import pytest
from urllib.parse import urlparse


class TestContentSanitizerCore:
    """Test suite for Content Sanitizer core functionality."""

    def setup_method(self):
        """Setup test fixtures - will be implemented during GREEN phase."""
        # These imports will fail initially - driving RED phase
        from src.store_generation.template_engine.content_sanitizer import ContentSanitizer
        from src.store_generation.template_engine.sanitization_strategies import (
            HTMLSanitizationStrategy,
            CSSSanitizationStrategy,
            URLSanitizationStrategy
        )
        
        self.sanitizer = ContentSanitizer()
        self.html_strategy = HTMLSanitizationStrategy()
        self.css_strategy = CSSSanitizationStrategy()
        self.url_strategy = URLSanitizationStrategy()

    def test_html_sanitization(self):
        """
        Verify removal of dangerous tags and attributes.
        
        Requirements:
        - All dangerous HTML tags must be removed or escaped
        - Malicious attributes must be stripped
        - Safe HTML should be preserved
        - Whitelist approach for allowed tags/attributes
        """
        dangerous_html_inputs = [
            # Script injections
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "<svg onload=alert('xss')>",
            
            # Event handlers
            "<div onclick='malicious()'>Content</div>",
            "<input onfocus='steal_data()' type='text'>",
            "<body onload='evil_script()'>",
            
            # Dangerous tags
            "<iframe src='javascript:alert(1)'></iframe>",
            "<object data='malicious.swf'></object>",
            "<embed src='malicious.swf'>",
            "<link rel='stylesheet' href='javascript:alert(1)'>",
            
            # Style injections
            "<div style='background:url(javascript:alert(1))'>Content</div>",
            "<p style='expression(alert(1))'>Content</p>",
        ]
        
        for dangerous_html in dangerous_html_inputs:
            # This should fail during RED phase - driving implementation
            sanitized = self.sanitizer.sanitize_html(dangerous_html)
            
            # Verify dangerous elements are removed/escaped
            assert "<script" not in sanitized.lower()
            assert "onerror=" not in sanitized.lower()
            assert "onload=" not in sanitized.lower()
            assert "onclick=" not in sanitized.lower()
            assert "javascript:" not in sanitized.lower()
            assert "expression(" not in sanitized.lower()
            
            # Verify output is safe
            assert not self._contains_active_content(sanitized)

    def test_css_sanitization(self):
        """
        Verify CSS-based XSS prevention.
        
        Requirements:
        - CSS expressions must be removed
        - URL() functions with javascript: must be blocked
        - Import statements must be sanitized
        - Dangerous CSS properties must be filtered
        """
        dangerous_css_inputs = [
            # CSS expressions (IE)
            "expression(alert('xss'))",
            "width: expression(document.body.clientWidth > 955 ? '955px' : 'auto')",
            
            # JavaScript URLs in CSS
            "background: url('javascript:alert(1)')",
            "background-image: url(javascript:void(0))",
            "list-style-image: url('javascript:alert(1)')",
            
            # CSS imports
            "@import url('javascript:alert(1)')",
            "@import 'data:text/css,malicious_css'",
            
            # Behavior property (IE)
            "behavior: url(malicious.htc)",
            "-moz-binding: url('javascript:alert(1)')",
        ]
        
        for dangerous_css in dangerous_css_inputs:
            # This should fail during RED phase - driving implementation
            sanitized = self.sanitizer.sanitize_css(dangerous_css)
            
            # Verify dangerous CSS is removed/escaped
            assert "expression(" not in sanitized.lower()
            assert "javascript:" not in sanitized.lower()
            assert "behavior:" not in sanitized.lower()
            assert "-moz-binding:" not in sanitized.lower()
            assert "@import" not in sanitized.lower() or "javascript:" not in sanitized.lower()

    def test_url_sanitization(self):
        """
        Verify javascript:/data: URL blocking and validation.
        
        Requirements:
        - javascript: protocol must be blocked
        - data: protocol must be validated/blocked for dangerous content
        - vbscript: and other dangerous protocols must be blocked
        - Relative URLs must be preserved
        - Absolute HTTP/HTTPS URLs must be preserved
        """
        url_test_cases = [
            # Dangerous protocols - should be blocked/sanitized
            ("javascript:alert('xss')", None),
            ("data:text/html,<script>alert(1)</script>", None),
            ("vbscript:msgbox('xss')", None),
            ("data:text/javascript,alert(1)", None),
            ("file:///etc/passwd", None),
            
            # Safe URLs - should be preserved
            ("https://example.com/image.jpg", "https://example.com/image.jpg"),
            ("http://safe-site.com", "http://safe-site.com"),
            ("/relative/path.html", "/relative/path.html"),
            ("./local/file.css", "./local/file.css"),
            ("mailto:user@example.com", "mailto:user@example.com"),
            ("tel:+1234567890", "tel:+1234567890"),
            
            # Edge cases
            ("JAVASCRIPT:alert(1)", None),  # Case insensitive
            ("  javascript:alert(1)  ", None),  # With whitespace
            ("&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;alert(1)", None),  # Encoded
        ]
        
        for input_url, expected_output in url_test_cases:
            # This should fail during RED phase - driving implementation
            sanitized = self.sanitizer.sanitize_url(input_url)
            
            if expected_output is None:
                # Dangerous URL should be blocked/sanitized
                assert sanitized is None or sanitized == "" or sanitized == "#"
                assert "javascript:" not in sanitized.lower() if sanitized else True
                assert "vbscript:" not in sanitized.lower() if sanitized else True
            else:
                # Safe URL should be preserved
                assert sanitized == expected_output

    def test_context_specific_sanitization(self):
        """
        Verify different sanitization rules for different contexts.
        
        Requirements:
        - HTML context: full HTML sanitization
        - Attribute context: attribute-safe sanitization
        - CSS context: CSS-specific sanitization
        - URL context: URL validation and sanitization
        - Text context: minimal sanitization preserving readability
        """
        test_content = "<script>alert('xss')</script><b>Bold text</b>"
        
        contexts_and_expectations = [
            ("html", test_content, lambda result: "<b>Bold text</b>" in result and "<script>" not in result),
            ("attribute", test_content, lambda result: "&lt;script&gt;" in result or "script" not in result),
            ("css", "background: url('javascript:alert(1)')", lambda result: "javascript:" not in result.lower()),
            ("url", "javascript:alert(1)", lambda result: result is None or result == "" or result == "#"),
            ("text", "<b>Bold text</b>", lambda result: "Bold text" in result),
        ]
        
        for context, content, validator in contexts_and_expectations:
            # This should fail during RED phase - driving implementation
            sanitized = self.sanitizer.sanitize_content(content, context=context)
            
            # Verify context-appropriate sanitization
            assert validator(sanitized), f"Sanitization failed for context '{context}' with content '{content}'"

    def test_xss_attack_prevention(self):
        """
        Test against OWASP XSS cheat sheet payloads.
        
        Requirements:
        - 100% of OWASP XSS cheat sheet attacks must be prevented
        - Common XSS vectors must be blocked
        - Browser-specific XSS techniques must be prevented
        """
        # OWASP XSS Cheat Sheet payloads
        owasp_xss_payloads = [
            # Basic XSS
            "<script>alert('XSS')</script>",
            "'><script>alert('XSS')</script>",
            "\"><script>alert('XSS')</script>",
            
            # Image XSS
            "<img src=x onerror=alert('XSS')>",
            "<img src='x' onerror='alert(String.fromCharCode(88,83,83))'>",
            
            # Body XSS
            "<body onload=alert('XSS')>",
            "<body background=\"javascript:alert('XSS')\">",
            
            # Table XSS
            "<table background=\"javascript:alert('XSS')\">",
            
            # Div XSS
            "<div style=\"background-image: url(javascript:alert('XSS'))\">",
            "<div style=\"width: expression(alert('XSS'));\">",
            
            # Object XSS
            "<object type=\"text/x-scriptlet\" data=\"http://hacker.com/xss.html\">",
            
            # Embed XSS
            "<embed src=\"data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K\">",
            
            # SVG XSS
            "<svg onload=alert('XSS')>",
            "<svg/onload=alert('XSS')>",
            
            # Event handler XSS
            "<input onfocus=alert('XSS') autofocus>",
            "<marquee onstart=alert('XSS')>",
            
            # CSS XSS
            "<style>@import'javascript:alert(\"XSS\")';</style>",
            "<link rel=\"stylesheet\" href=\"javascript:alert('XSS')\">",
        ]
        
        for payload in owasp_xss_payloads:
            # This should fail during RED phase - driving implementation
            sanitized = self.sanitizer.sanitize_html(payload)
            
            # Verify XSS payload is neutralized
            assert not self._contains_active_content(sanitized)
            assert "alert(" not in sanitized.lower()
            assert "javascript:" not in sanitized.lower()
            assert "<script" not in sanitized.lower()

    def test_whitelist_configuration(self):
        """
        Verify configurable whitelist functionality.
        
        Requirements:
        - Administrators must be able to configure allowed tags
        - Allowed attributes must be configurable per tag
        - Default whitelist must be secure
        - Custom whitelists must be validated
        """
        # Test default whitelist
        safe_html = "<p><strong>Bold</strong> and <em>italic</em> text with <a href='http://example.com'>link</a></p>"
        
        # This should fail during RED phase - driving implementation
        result = self.sanitizer.sanitize_html(safe_html)
        
        # Verify safe tags are preserved with default whitelist
        assert "<p>" in result
        assert "<strong>" in result
        assert "<em>" in result
        assert "<a href=" in result
        
        # Test custom restrictive whitelist
        custom_config = {
            "allowed_tags": ["p", "strong"],
            "allowed_attributes": {"a": ["href"]}
        }
        
        # This should fail during RED phase - driving implementation
        restricted_result = self.sanitizer.sanitize_html(safe_html, config=custom_config)
        
        # Verify only whitelisted tags are preserved
        assert "<p>" in restricted_result
        assert "<strong>" in restricted_result
        assert "<em>" not in restricted_result  # Not in whitelist
        assert "<a" not in restricted_result    # Not in whitelist

    def test_nested_sanitization(self):
        """
        Verify proper handling of nested and complex HTML structures.
        
        Requirements:
        - Nested tags must be properly sanitized
        - Malformed HTML must be handled gracefully
        - Deeply nested structures must not cause performance issues
        """
        nested_html_cases = [
            # Deeply nested structure
            "<div>" * 100 + "Content" + "</div>" * 100,
            
            # Mixed safe and unsafe nesting
            "<p><strong><script>alert('xss')</script>Bold</strong></p>",
            
            # Malformed HTML
            "<p><strong>Unclosed tags<em>Mixed nesting</p></strong></em>",
            
            # Attributes in nested tags
            "<div class='safe'><p onclick='malicious()'>Content</p></div>",
        ]
        
        for html in nested_html_cases:
            # This should fail during RED phase - driving implementation
            sanitized = self.sanitizer.sanitize_html(html)
            
            # Verify structure is preserved but dangerous content removed
            assert not self._contains_active_content(sanitized)
            assert "Content" in sanitized or "Bold" in sanitized  # Content preserved
            assert "<script>" not in sanitized
            assert "onclick=" not in sanitized

    def test_performance_requirements(self):
        """
        Verify sanitization performance meets requirements.
        
        Requirements:
        - Large content sanitization must complete within reasonable time
        - Memory usage must be bounded
        - Performance must scale linearly with content size
        """
        import time
        
        # Large content test
        large_content = "<p>" + "Safe content " * 10000 + "</p>"
        
        start_time = time.time()
        # This should fail during RED phase - driving implementation
        sanitized = self.sanitizer.sanitize_html(large_content)
        execution_time = time.time() - start_time
        
        # Verify performance requirements
        assert execution_time < 1.0  # Should complete within 1 second
        assert len(sanitized) > 0    # Content should be processed
        assert "Safe content" in sanitized

    def _contains_active_content(self, html_content):
        """
        Helper method to detect if HTML contains potentially active/dangerous content.
        
        Returns True if dangerous content is detected, False otherwise.
        """
        dangerous_patterns = [
            "javascript:", "vbscript:", "data:text/html",
            "on[a-z]+=", "<script", "<object", "<embed", "<iframe",
            "expression(", "behavior:", "@import", "-moz-binding"
        ]
        
        content_lower = html_content.lower()
        return any(pattern in content_lower for pattern in dangerous_patterns)


class TestSanitizationStrategies:
    """Test suite for different sanitization strategies."""

    def setup_method(self):
        """Setup strategy test fixtures."""
        # These imports will fail initially - driving RED phase
        from src.template_engine.sanitization_strategies import (
            HTMLSanitizationStrategy,
            CSSSanitizationStrategy,
            URLSanitizationStrategy,
            AttributeSanitizationStrategy,
            TextSanitizationStrategy
        )
        
        self.html_strategy = HTMLSanitizationStrategy()
        self.css_strategy = CSSSanitizationStrategy()
        self.url_strategy = URLSanitizationStrategy()
        self.attr_strategy = AttributeSanitizationStrategy()
        self.text_strategy = TextSanitizationStrategy()

    def test_html_strategy_configuration(self):
        """Test HTML sanitization strategy configuration and behavior."""
        # This should fail during RED phase - driving implementation
        config = self.html_strategy.get_default_config()
        
        # Verify secure defaults
        assert "script" not in config.get("allowed_tags", [])
        assert "iframe" not in config.get("allowed_tags", [])
        assert "object" not in config.get("allowed_tags", [])
        
        # Verify safe tags are included
        safe_tags = ["p", "strong", "em", "a", "img"]
        for tag in safe_tags:
            assert tag in config.get("allowed_tags", [])

    def test_css_strategy_property_filtering(self):
        """Test CSS strategy property filtering."""
        dangerous_properties = [
            "behavior", "-moz-binding", "expression",
            "javascript", "@import", "url("
        ]
        
        for prop in dangerous_properties:
            css_with_prop = f"div {{ {prop}: malicious-value; }}"
            
            # This should fail during RED phase - driving implementation
            sanitized = self.css_strategy.sanitize(css_with_prop)
            
            # Verify dangerous property is removed
            assert prop not in sanitized.lower()

    def test_url_strategy_protocol_validation(self):
        """Test URL strategy protocol validation."""
        protocol_tests = [
            ("http://example.com", True),
            ("https://example.com", True),
            ("ftp://example.com", True),
            ("mailto:user@example.com", True),
            ("javascript:alert(1)", False),
            ("data:text/html,<script>", False),
            ("vbscript:msgbox(1)", False),
        ]
        
        for url, should_be_safe in protocol_tests:
            # This should fail during RED phase - driving implementation
            is_safe = self.url_strategy.is_safe_url(url)
            assert is_safe == should_be_safe

    def test_attribute_strategy_escaping(self):
        """Test attribute sanitization strategy."""
        attribute_values = [
            ("normal text", "normal text"),
            ("text with 'quotes'", "text with &#x27;quotes&#x27;"),
            ('text with "quotes"', "text with &quot;quotes&quot;"),
            ("text with <tags>", "text with &lt;tags&gt;"),
            ("javascript:alert(1)", ""),  # Should be completely removed
        ]
        
        for input_val, expected in attribute_values:
            # This should fail during RED phase - driving implementation
            sanitized = self.attr_strategy.sanitize(input_val)
            
            if expected == "":
                assert sanitized == "" or sanitized is None
            else:
                assert expected in sanitized or input_val == sanitized

    def test_text_strategy_preservation(self):
        """Test text sanitization strategy content preservation."""
        text_cases = [
            "Normal text should be preserved",
            "Text with <b>HTML</b> should escape tags",
            "Text with 'quotes' and \"double quotes\"",
            "Special chars: !@#$%^&*()",
        ]
        
        for text in text_cases:
            # This should fail during RED phase - driving implementation
            sanitized = self.text_strategy.sanitize(text)
            
            # Verify core content is preserved
            assert len(sanitized) > 0
            assert "Normal text" in sanitized or "Text with" in sanitized or "Special chars" in sanitized


# Test fixtures and data for RED phase
@pytest.fixture
def xss_test_vectors():
    """XSS test vectors for comprehensive testing."""
    return {
        "basic": [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "<svg onload=alert('xss')>",
        ],
        "advanced": [
            "';alert(String.fromCharCode(88,83,83))//';alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//--></SCRIPT>\">'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>",
            "<IMG SRC=\"javascript:alert('XSS')\">",
            "<IMG SRC=javascript:alert('XSS')>",
            "<IMG SRC=JaVaScRiPt:alert('XSS')>",
        ],
        "encoded": [
            "&#60;script&#62;alert('xss')&#60;/script&#62;",
            "%3Cscript%3Ealert('xss')%3C/script%3E",
            "\\u003cscript\\u003ealert('xss')\\u003c/script\\u003e",
        ]
    }


@pytest.fixture
def sanitization_contexts():
    """Different contexts for content sanitization."""
    return ["html", "attribute", "css", "url", "text", "javascript"]