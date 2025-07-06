# Test Automation Module for VARAi Platform

This Terraform module sets up comprehensive test automation for the VARAi Platform. It creates the necessary infrastructure and resources to run automated tests in a Kubernetes environment.

## Features

### Smoke Tests

Smoke tests are lightweight tests that verify the basic functionality of the application. They run quickly and are designed to catch obvious issues early in the deployment process.

- Automatically run on a schedule
- Verify core functionality
- Quick execution time
- Early detection of major issues

### Integration Tests

Integration tests verify that different components of the application work together correctly. They test the interactions between services and ensure that data flows correctly through the system.

- Test service interactions
- Verify API contracts
- Validate data flow
- Test authentication and authorization

### Performance Tests

Performance tests measure the responsiveness, throughput, reliability, and scalability of the application under various load conditions.

- Load testing
- Stress testing
- Endurance testing
- Scalability testing
- Response time measurement

### Security Scans

Security scans identify vulnerabilities, misconfigurations, and other security issues in the application and infrastructure.

- Vulnerability scanning
- Dependency checking
- Configuration analysis
- Compliance verification
- Penetration testing

### Data Validation Tests

Data validation tests ensure that data is correctly processed, stored, and retrieved by the application.

- Schema validation
- Data integrity checks
- Migration validation
- Consistency verification
- Edge case handling

### User Experience Tests

User experience tests verify that the application provides a good user experience and meets usability requirements.

- UI functionality testing
- Visual regression testing
- Accessibility testing
- Cross-browser compatibility
- Mobile responsiveness

## Usage

```hcl
module "test_automation" {
  source = "../../modules/test_automation"
  
  environment          = "staging"
  kubernetes_namespace = "varai-staging"
  domain_name          = "staging.varai.ai"
  api_url              = "https://staging.varai.ai/api"
  auth_url             = "https://staging.varai.ai/auth"
  frontend_url         = "https://staging.varai.ai"
  test_schedule        = "0 */4 * * *"  # Run every 4 hours
  notification_channels = [
    "projects/your-gcp-project-id/notificationChannels/your-notification-channel-id"
  ]
  enable_smoke_tests   = true
  enable_integration_tests = true
  enable_performance_tests = true
  enable_security_scans = true
  enable_data_validation = true
  enable_ux_tests      = true
  test_results_bucket  = "varai-test-results-staging"
  test_timeout         = 600  # 10 minutes
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| environment | Environment name (e.g., dev, staging, prod) | `string` | n/a | yes |
| kubernetes_namespace | Kubernetes namespace for the application | `string` | n/a | yes |
| domain_name | Domain name for the application | `string` | n/a | yes |
| api_url | URL for the API service | `string` | n/a | yes |
| auth_url | URL for the Auth service | `string` | n/a | yes |
| frontend_url | URL for the Frontend service | `string` | n/a | yes |
| test_schedule | Cron schedule for automated tests | `string` | `"0 */4 * * *"` | no |
| notification_channels | List of notification channel IDs for alerts | `list(string)` | `[]` | no |
| enable_smoke_tests | Enable smoke tests | `bool` | `true` | no |
| enable_integration_tests | Enable integration tests | `bool` | `true` | no |
| enable_performance_tests | Enable performance tests | `bool` | `true` | no |
| enable_security_scans | Enable security scans | `bool` | `true` | no |
| enable_data_validation | Enable data validation tests | `bool` | `true` | no |
| enable_ux_tests | Enable user experience tests | `bool` | `true` | no |
| test_results_bucket | GCS bucket name for test results | `string` | n/a | yes |
| test_timeout | Timeout for tests in seconds | `number` | `600` | no |
| api_key | API key for testing | `string` | `""` | no |
| test_user | Username for testing | `string` | `"test-user"` | no |
| test_password | Password for testing | `string` | `""` | no |
| test_image_registry | Container registry for test images | `string` | `"ghcr.io"` | no |
| test_image_prefix | Prefix for test container images | `string` | `"varai"` | no |
| test_image_tag | Tag for test container images | `string` | `"latest"` | no |
| performance_test_users | Number of simulated users for performance tests | `number` | `100` | no |
| security_scan_schedule | Cron schedule for security scans | `string` | `"0 0 * * *"` | no |

## Outputs

| Name | Description |
|------|-------------|
| test_namespace | The Kubernetes namespace for test resources |
| dashboard_url | The URL for the test dashboard |
| test_results_bucket | The GCS bucket for test results |
| smoke_test_status | The status of smoke tests |
| integration_test_status | The status of integration tests |
| performance_test_status | The status of performance tests |
| security_scan_status | The status of security scans |
| data_validation_status | The status of data validation tests |
| ux_test_status | The status of user experience tests |

## Test Images

The module expects the following test images to be available in the specified container registry:

- `${test_image_registry}/${test_image_prefix}/smoke-tests:${test_image_tag}`
- `${test_image_registry}/${test_image_prefix}/integration-tests:${test_image_tag}`
- `${test_image_registry}/${test_image_prefix}/performance-tests:${test_image_tag}`
- `${test_image_registry}/${test_image_prefix}/security-scans:${test_image_tag}`
- `${test_image_registry}/${test_image_prefix}/data-validation:${test_image_tag}`
- `${test_image_registry}/${test_image_prefix}/ux-tests:${test_image_tag}`

## Monitoring

The module creates a Cloud Monitoring dashboard for test results, which includes:

- Smoke test success rate
- Integration test success rate
- Performance test results
- Security scan results

It also creates alert policies for test failures, which will send notifications to the specified notification channels.

## Test Results

Test results are stored in the specified GCS bucket, organized by test type and timestamp. The results include:

- Test logs
- Test reports
- Performance metrics
- Security scan reports
- Screenshots (for UI tests)
- Videos (for UI tests)

## Troubleshooting

### Common Issues

1. **Test Failures**: Check the test logs in the GCS bucket for details on why tests failed.

2. **Resource Constraints**: If tests are failing due to resource constraints, adjust the resource limits in the module configuration.

3. **Timeouts**: If tests are timing out, increase the `test_timeout` parameter.

4. **Authentication Issues**: Ensure that the `api_key`, `test_user`, and `test_password` parameters are correctly set.

### Getting Help

For additional help, contact the VARAi Platform team at devops@varai.ai.