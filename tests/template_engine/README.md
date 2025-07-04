# Template Engine Test Suite

Comprehensive test infrastructure for Phase 4.2 Template Engine based on LS2_002 prompt. This test suite provides >80% coverage for renderer, asset_handler, theme_manager, and service modules with unit tests, integration tests, performance tests, and security validation tests.

## 📋 Overview

This test suite follows Test-Driven Development (TDD) principles and includes:

- **Unit Tests**: Individual component testing with mocking
- **Integration Tests**: Component interaction testing
- **Performance Tests**: Load testing and benchmarking
- **Security Tests**: Security validation and vulnerability testing
- **Fixtures**: Comprehensive test data and mock utilities
- **Coverage**: Automated coverage reporting with >80% threshold

## 🏗️ Test Structure

```
tests/template_engine/
├── __init__.py                 # Test package initialization
├── conftest.py                 # Shared fixtures and configuration
├── pytest.ini                 # Pytest configuration
├── requirements-test.txt       # Test dependencies
├── run_tests.py               # Test runner script
├── README.md                  # This documentation
│
├── test_renderer.py           # TemplateRenderer unit tests
├── test_asset_handler.py      # AssetHandler unit tests  
├── test_theme_manager.py      # ThemeManager unit tests
├── test_service.py            # TemplateEngineService unit tests
├── test_performance.py        # Performance and load tests
├── test_security.py           # Security validation tests
└── test_integration.py        # Integration and E2E tests
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip package manager
- Template Engine source code

### Installation

1. **Install test dependencies:**
   ```bash
   pip install -r tests/template_engine/requirements-test.txt
   ```

2. **Run the complete test suite:**
   ```bash
   python tests/template_engine/run_tests.py --all
   ```

3. **Run with coverage reporting:**
   ```bash
   python tests/template_engine/run_tests.py --coverage
   ```

## 🧪 Test Categories

### Unit Tests

Test individual components in isolation using mocks and fixtures:

```bash
# Run unit tests only
python tests/template_engine/run_tests.py --unit

# Or with pytest directly
pytest tests/template_engine/ -m "unit" -v
```

**Coverage:**
- TemplateRenderer: Template rendering, caching, validation
- AssetHandler: Asset processing, optimization, CDN integration
- ThemeManager: Theme discovery, validation, hot reload
- TemplateEngineService: Service orchestration, lifecycle management

### Integration Tests

Test component interactions and end-to-end workflows:

```bash
# Run integration tests only
python tests/template_engine/run_tests.py --integration

# Or with pytest directly
pytest tests/template_engine/test_integration.py -v
```

**Scenarios:**
- Complete store generation workflow
- Theme switching and validation
- Asset pipeline integration
- Cache consistency across operations
- Error recovery and resilience

### Performance Tests

Benchmark performance and validate scalability:

```bash
# Run performance tests only
python tests/template_engine/run_tests.py --performance

# Or with pytest directly
pytest tests/template_engine/test_performance.py -v --durations=20
```

**Test Areas:**
- Single template rendering speed
- Concurrent rendering performance
- Cache performance benefits
- Memory usage monitoring
- Load balancing simulation

### Security Tests

Validate security measures and prevent vulnerabilities:

```bash
# Run security tests only
python tests/template_engine/run_tests.py --security

# Or with pytest directly
pytest tests/template_engine/test_security.py -v
```

**Security Validation:**
- Path traversal prevention
- Template injection protection
- XSS prevention
- Input validation
- File access restrictions
- Configuration security

## 🔧 Test Runner Usage

The `run_tests.py` script provides comprehensive test execution options:

### Basic Usage

```bash
# Run all tests
python tests/template_engine/run_tests.py --all

# Run specific test categories
python tests/template_engine/run_tests.py --unit
python tests/template_engine/run_tests.py --integration
python tests/template_engine/run_tests.py --performance
python tests/template_engine/run_tests.py --security

# Run with coverage reporting
python tests/template_engine/run_tests.py --coverage
```

### Advanced Options

```bash
# Verbose output
python tests/template_engine/run_tests.py --all --verbose

# Install dependencies first
python tests/template_engine/run_tests.py --install-deps --all

# Run lint checks
python tests/template_engine/run_tests.py --lint

# Run security scans
python tests/template_engine/run_tests.py --scan

# Generate test reports
python tests/template_engine/run_tests.py --all --report
```

### CI Pipeline

```bash
# Run complete CI pipeline
python tests/template_engine/run_tests.py --ci
```

The CI pipeline includes:
1. Dependency installation
2. Lint checks (flake8, mypy)
3. Security scans (bandit, safety)
4. Unit tests
5. Integration tests
6. Security tests
7. Performance tests
8. Coverage validation (≥80%)

## 📊 Coverage Reporting

### HTML Coverage Report

```bash
python tests/template_engine/run_tests.py --coverage
```

View the HTML report at: `tests/template_engine/htmlcov/index.html`

### Coverage Requirements

- **Minimum Coverage**: 80%
- **Target Coverage**: 90%+
- **Critical Components**: 95%+

### Coverage Exclusions

The following are excluded from coverage requirements:
- Abstract methods
- Debug code
- Exception handling for impossible conditions
- Protocol definitions

## 🏷️ Test Markers

Tests are categorized using pytest markers:

```bash
# Run tests by marker
pytest tests/template_engine/ -m "unit"
pytest tests/template_engine/ -m "integration"  
pytest tests/template_engine/ -m "performance"
pytest tests/template_engine/ -m "security"
pytest tests/template_engine/ -m "slow"
pytest tests/template_engine/ -m "asyncio"
```

Available markers:
- `unit`: Unit tests for individual components
- `integration`: Integration tests for component interaction
- `performance`: Performance and load testing
- `security`: Security validation tests
- `slow`: Tests that take longer to run
- `asyncio`: Async tests
- `mock`: Tests that use extensive mocking
- `real_data`: Tests that use real data files
- `cache`: Tests focused on caching behavior
- `error_handling`: Tests focused on error scenarios

## 🛠️ Test Fixtures

### Core Fixtures

- `temp_themes_dir`: Temporary theme directory for testing
- `sample_theme_structure`: Complete theme with templates and assets
- `mock_cache_manager`: Mocked cache manager
- `sample_store_config`: Sample store configuration
- `sample_products`: Sample product data
- `performance_test_data`: Large dataset for performance testing

### Component Fixtures

- `theme_manager`: Initialized ThemeManager instance
- `asset_handler`: Initialized AssetHandler instance
- `template_renderer`: Initialized TemplateRenderer instance
- `template_engine_service`: TemplateEngineService instance
- `initialized_template_engine_service`: Fully initialized service

### Security Fixtures

- `malicious_template_content`: Potentially dangerous template content
- `secure_template_content`: Safe template content examples

## 🔍 Test Data

### Sample Themes

Tests include complete sample themes with:
- Theme configuration (`theme.json`)
- Base templates (`base.html`, `store_listing.html`, `product_page.html`)
- Template partials (`partials/product_card.html`)
- CSS and JavaScript assets
- Image placeholders

### Product Data

Sample products include:
- Enhanced product models
- Media assets (images, videos)
- SEO data
- Face shape compatibility scores
- Quality scores

### Performance Data

Large datasets for performance testing:
- 100+ product records
- Complex nested data structures
- Various data sizes for stress testing

## 🚨 Error Testing

### Error Scenarios

Tests cover comprehensive error scenarios:
- Missing templates and themes
- Invalid configurations
- Network failures
- Cache failures
- Timeout conditions
- Security violations
- Resource exhaustion

### Error Recovery

Tests validate error recovery:
- Graceful degradation
- Service resilience
- Cache rebuild
- Component restart
- Fallback mechanisms

## ⚡ Performance Benchmarks

### Performance Targets

- **Single Template Render**: < 100ms
- **Concurrent Renders (10x)**: < 500ms average
- **Asset Processing**: < 2s for 50 images
- **Theme Discovery**: < 5s for 50 themes
- **Memory Growth**: < 100MB for 100 renders

### Load Testing

- **Concurrent Users**: Up to 20 simultaneous
- **Request Patterns**: Burst and steady loads
- **Cache Performance**: 10x improvement minimum
- **Error Rate**: < 1% under normal load

## 🔒 Security Testing

### Security Validations

- **Path Traversal**: Prevention of `../` attacks
- **Template Injection**: Blocking dangerous functions
- **XSS Prevention**: Input sanitization
- **File Access**: Restricted file system access
- **Input Validation**: Size and content limits
- **Configuration Security**: Secure defaults

### Threat Modeling

Tests address OWASP template engine vulnerabilities:
- Server-Side Template Injection (SSTI)
- Cross-Site Scripting (XSS)
- Path Traversal
- Denial of Service (DoS)
- Information Disclosure

## 📈 Continuous Integration

### CI Configuration

The test suite is designed for CI/CD integration:

```yaml
# Example GitHub Actions workflow
- name: Run Template Engine Tests
  run: |
    cd tests/template_engine
    python run_tests.py --ci
```

### CI Outputs

- Test results (JUnit XML)
- Coverage reports (HTML, XML)
- Performance benchmarks
- Security scan results
- Test artifacts and logs

## 🛡️ Quality Gates

### Required Checks

1. **All unit tests pass** ✓
2. **Integration tests pass** ✓
3. **Coverage ≥ 80%** ✓
4. **Security tests pass** ✓
5. **Performance within limits** ✓
6. **No security vulnerabilities** ✓
7. **Code quality checks pass** ✓

### Optional Checks

1. Performance benchmarks
2. Memory usage profiling
3. Load testing results
4. Documentation coverage

## 🐛 Debugging Tests

### Debugging Options

```bash
# Run with debug output
pytest tests/template_engine/ -v -s --tb=long

# Run specific test
pytest tests/template_engine/test_renderer.py::TestTemplateRenderer::test_successful_template_render -v -s

# Debug with pdb
pytest tests/template_engine/ --pdb

# Keep temporary files
pytest tests/template_engine/ --basetemp=/tmp/pytest-debug
```

### Test Isolation

Each test runs in isolation with:
- Fresh temporary directories
- Clean mock states
- Isolated cache instances
- Independent configuration

## 📚 Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Use Descriptive Names**: Test names should explain the scenario
3. **Mock External Dependencies**: Use fixtures for external services
4. **Test Edge Cases**: Include boundary conditions and error cases
5. **Maintain Test Independence**: Tests should not depend on each other

### Test Organization

1. **Group Related Tests**: Use test classes for organization
2. **Use Appropriate Markers**: Tag tests for easy filtering
3. **Document Complex Tests**: Add docstrings for complex scenarios
4. **Keep Tests Fast**: Mock expensive operations
5. **Test Pyramid**: More unit tests, fewer integration tests

### Performance Considerations

1. **Use Fixtures Efficiently**: Scope fixtures appropriately
2. **Parallel Execution**: Use pytest-xdist for speed
3. **Skip Slow Tests**: Mark and conditionally skip slow tests
4. **Resource Cleanup**: Ensure proper cleanup in fixtures
5. **Mock External Services**: Avoid real network calls

## 🤝 Contributing

### Adding New Tests

1. Place test files in appropriate categories
2. Use existing fixtures when possible
3. Add new fixtures to `conftest.py` if reusable
4. Update markers and documentation
5. Ensure >80% coverage for new code

### Test Naming Convention

```python
def test_[component]_[scenario]_[expected_outcome]:
    """Test description explaining the scenario and expected behavior."""
    pass
```

### Fixture Guidelines

1. Use appropriate scope (`function`, `class`, `module`, `session`)
2. Clean up resources in fixture teardown
3. Make fixtures configurable when needed
4. Document fixture purpose and usage
5. Avoid fixture dependencies when possible

## 📞 Support

For questions or issues with the test suite:

1. Check existing test examples
2. Review fixture documentation
3. Run tests with verbose output
4. Check CI pipeline logs
5. Consult the Template Engine documentation

## 🔄 Test Maintenance

### Regular Tasks

1. **Update Dependencies**: Keep test dependencies current
2. **Review Coverage**: Ensure coverage remains >80%
3. **Performance Monitoring**: Track performance regression
4. **Security Updates**: Keep security scans current
5. **Documentation**: Update test documentation

### Refactoring Guidelines

1. Maintain backward compatibility
2. Update all affected tests
3. Preserve coverage levels
4. Update documentation
5. Validate CI pipeline

---

**Test Suite Version**: 1.0.0  
**Template Engine Version**: Phase 4.2  
**Last Updated**: 2024-05-24  
**Coverage Target**: 80%+ (Current: Pending Implementation)