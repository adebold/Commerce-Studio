# Cloud Run Regulatory Compliance Tests

This directory contains tests to validate the regulatory compliance aspects of the EyewearML platform's Cloud Run deployment.

## Overview

The test suite validates compliance with:

1. **GDPR Requirements** - For handling EU user data
2. **Healthcare Data Regulations** - For prescription and biometric data
3. **Data Residency Requirements** - For region-specific data storage
4. **Audit Logging** - For comprehensive tracking of data access

## Prerequisites

- Python 3.8+
- `requests` library (`pip install requests`)
- Access to the deployed Cloud Run services
- Appropriate authentication credentials for testing admin endpoints

## Configuration

The test suite can be configured using a JSON configuration file or command-line arguments:

```json
{
  "regions": ["us", "eu"],
  "services": ["api", "auth", "frontend", "recommendation", "virtual-try-on", "analytics"],
  "domain": "dev.eyewearml.com",
  "timeout": 30,
  "retries": 3
}
```

## Usage

### Basic Usage

```bash
# Run all compliance tests with default configuration
python test_cloud_run_compliance.py

# Run with custom configuration file
python test_cloud_run_compliance.py --config config.json

# Run tests for specific regions
python test_cloud_run_compliance.py --regions us,eu

# Run tests for specific services
python test_cloud_run_compliance.py --services api,auth,frontend

# Save test results to a file
python test_cloud_run_compliance.py --output results.json
```

### Integration with CI/CD

Add the following step to your CI/CD pipeline to run compliance tests after deployment:

```yaml
# Example for GitHub Actions
- name: Run Compliance Tests
  run: |
    cd tests/compliance
    python test_cloud_run_compliance.py --regions us,eu --domain ${{ env.DOMAIN }} --output compliance-results.json
  env:
    DOMAIN: dev.eyewearml.com
```

## Test Categories

### GDPR Compliance Tests

- EU Region Availability
- Data Subject Rights Endpoints
- Privacy Policy Availability
- Cookie Consent Mechanism

### Healthcare Data Tests

- Encryption Headers
- Prescription Data Endpoints Security
- Biometric Data Consent

### Data Residency Tests

- Region-Specific Data Storage
- Cross-Region Data Transfer Controls

### Audit Logging Tests

- Audit Logging Endpoints
- Data Access Logging

## Extending the Tests

To add new compliance tests:

1. Create a new test class that inherits from `ComplianceTest`
2. Implement test methods that start with `test_`
3. Add the new test class to the `test_suites` list in the `main()` function

Example:

```python
class NewComplianceTest(ComplianceTest):
    """New compliance tests"""
    
    def test_new_requirement(self) -> bool:
        """Test a new compliance requirement"""
        # Implementation
        return True
```

## Troubleshooting

- **Connection Errors**: Ensure the services are deployed and accessible
- **Authentication Errors**: Verify that the test credentials have appropriate permissions
- **Timeout Errors**: Increase the timeout value using the `--timeout` parameter

## References

- [GDPR Compliance on GCP](https://cloud.google.com/security/compliance/gdpr)
- [Healthcare Compliance on GCP](https://cloud.google.com/security/compliance/hipaa)
- [Multi-regional Architectures](https://cloud.google.com/architecture/framework/regions)