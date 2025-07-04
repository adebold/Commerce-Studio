# PMS Integration Troubleshooting Guide

## Overview

This guide helps identify and resolve common issues that may arise during Practice Management System (PMS) integrations. Use this resource when experiencing problems with data synchronization, connectivity, or other integration-related issues.

## Diagnostic Process

Follow this general diagnostic process when troubleshooting integration issues:

1. **Identify the Symptom**: Clearly define what is not working correctly
2. **Check System Status**: Verify both Practice Studio and the PMS are operational
3. **Review Logs**: Examine integration logs for error messages
4. **Test Connectivity**: Verify network communication between systems
5. **Validate Configuration**: Check integration settings and credentials
6. **Isolate the Issue**: Determine if the problem is with specific data, a particular workflow, or system-wide
7. **Apply Resolution**: Implement the appropriate fix based on the issue identified

## Common Issues and Resolutions

### Authentication Problems

#### Symptoms
- "Authentication failed" errors in logs
- Unable to connect to PMS
- Intermittent connection drops
- 401 Unauthorized responses

#### Potential Causes
1. **Expired Credentials**
2. **Invalid API Keys or Tokens**
3. **Insufficient Permissions**
4. **IP Restrictions**
5. **Clock Synchronization Issues**

#### Resolution Steps

1. **Verify Credentials**
   ```
   Settings > Integrations > Credentials > Test Connection
   ```
   - Ensure API keys, client IDs, and secrets are correct
   - Check that usernames and passwords are valid
   - Verify the integration account has not been disabled

2. **Refresh Authentication Tokens**
   ```
   Settings > Integrations > Credentials > Refresh Token
   ```
   - For OAuth 2.0 integrations, request a new access token
   - Check token expiration settings and adjust if needed

3. **Check Permissions**
   - Verify the integration account has the necessary permissions in the PMS
   - Review role assignments and security settings
   - Request additional permissions from PMS administrator if needed

4. **Network Configuration**
   - Check if IP whitelisting is required by the PMS
   - Verify firewall settings allow traffic on required ports
   - Test basic connectivity using the Connection Tester tool

5. **Time Synchronization**
   - Ensure server clocks are synchronized
   - Check for time zone discrepancies between systems

### Data Synchronization Issues

#### Symptoms
- Missing data in Practice Studio or PMS
- Outdated information
- Duplicate records
- Synchronization jobs failing or timing out

#### Potential Causes
1. **Incomplete Data Mapping**
2. **Synchronization Schedule Issues**
3. **Data Validation Failures**
4. **Volume Limitations**
5. **Conflicting Updates**

#### Resolution Steps

1. **Review Data Mappings**
   ```
   Settings > Integrations > PMS Systems > [Your PMS] > Field Mappings
   ```
   - Verify all required fields are mapped correctly
   - Check for format mismatches (dates, phone numbers, etc.)
   - Ensure any custom fields are properly configured

2. **Check Synchronization Schedule**
   ```
   Settings > Integrations > Synchronization > Schedule
   ```
   - Verify synchronization jobs are running as expected
   - Check for overlapping or conflicting schedules
   - Adjust frequency based on data volume and importance

3. **Data Validation**
   ```
   Settings > Integrations > Diagnostics > Data Validator
   ```
   - Test sample records for validation issues
   - Check for required fields that might be missing
   - Verify data formats meet the expectations of both systems

4. **Volume Management**
   - For large datasets, implement batching
   - Adjust synchronization window size
   - Consider incremental synchronization instead of full sync

5. **Conflict Resolution**
   ```
   Settings > Integrations > PMS Systems > [Your PMS] > Conflict Resolution
   ```
   - Review conflict resolution rules
   - Set clear precedence for which system is authoritative
   - Implement manual review for critical conflicts

### API Connection Issues

#### Symptoms
- Timeout errors
- Intermittent connectivity
- Slow performance
- Rate limit exceeded messages

#### Potential Causes
1. **Network Issues**
2. **Rate Limiting**
3. **PMS System Load**
4. **Request Formatting**
5. **Endpoint Availability**

#### Resolution Steps

1. **Network Diagnostics**
   ```
   Settings > Integrations > Diagnostics > Connection Test
   ```
   - Check network latency to PMS endpoints
   - Verify DNS resolution is working correctly
   - Test basic HTTP/HTTPS connectivity

2. **Rate Limit Management**
   - Review API usage patterns and limits
   - Implement throttling or backoff strategies
   - Distribute requests more evenly throughout the day
   - Request rate limit increases if available

3. **Performance Monitoring**
   ```
   Settings > Integrations > Monitoring > Performance
   ```
   - Identify slow operations
   - Track response times over time
   - Correlate performance issues with PMS load patterns

4. **Request Validation**
   ```
   Settings > Integrations > Diagnostics > Message Tracer
   ```
   - Examine actual API requests and responses
   - Verify correct formatting of payloads
   - Check for invalid parameters or values

5. **Endpoint Status**
   - Check PMS system status page or dashboard
   - Verify specific endpoints are operational
   - Coordinate with PMS vendor on any service disruptions

### HL7 Integration Issues

#### Symptoms
- Messages not being received or processed
- ACK timeouts
- Malformed message errors
- Missing segments in messages

#### Potential Causes
1. **Connection Configuration**
2. **Message Format Issues**
3. **Encoding Problems**
4. **Missing Required Fields**
5. **Transport Layer Issues**

#### Resolution Steps

1. **Verify Connection Settings**
   ```
   Settings > Integrations > HL7 > Connections
   ```
   - Check IP addresses and ports
   - Verify MLLP settings if applicable
   - Test basic connectivity with telnet or similar tool

2. **Message Format Validation**
   ```
   Settings > Integrations > Diagnostics > HL7 Validator
   ```
   - Check message structure against HL7 standards
   - Verify segment order and cardinality
   - Check for proper delimiters and encoding characters

3. **Character Encoding**
   - Verify consistent character encoding (UTF-8, ASCII, etc.)
   - Check for special characters causing issues
   - Test with sample messages containing diverse character sets

4. **Field Requirements**
   - Verify all required fields are present in messages
   - Check field lengths and data types
   - Ensure identifiers are properly formatted

5. **Transport Troubleshooting**
   - Check for network interruptions
   - Verify TCP keep-alive settings
   - Monitor for connection resets

### File-Based Integration Issues

#### Symptoms
- Files not being processed
- Incomplete file transfers
- Format validation errors
- Missing or duplicate data

#### Potential Causes
1. **File Access Permissions**
2. **File Naming Conventions**
3. **Format Inconsistencies**
4. **Transfer Interruptions**
5. **Processing Schedule Issues**

#### Resolution Steps

1. **Check File Permissions**
   - Verify read/write permissions on file directories
   - Ensure service accounts have necessary access
   - Check file locks that might prevent processing

2. **File Naming and Location**
   ```
   Settings > Integrations > File Transfer > Configuration
   ```
   - Verify file paths are correct
   - Check naming patterns match expected formats
   - Ensure timestamp or sequence patterns are correct

3. **Format Validation**
   ```
   Settings > Integrations > Diagnostics > File Validator
   ```
   - Validate file structure and format
   - Check delimiters and field enclosures
   - Verify header rows if applicable

4. **Transfer Monitoring**
   ```
   Settings > Integrations > Monitoring > File Transfers
   ```
   - Check for incomplete transfers
   - Verify file sizes match expected values
   - Implement checksums or verification methods

5. **Processing Schedule**
   ```
   Settings > Integrations > File Transfer > Schedule
   ```
   - Verify processing jobs are running as scheduled
   - Check for file processing backlogs
   - Adjust frequency based on file volume

## System-Specific Issues

### Epic Integration

| Issue | Resolution |
|-------|------------|
| App Orchard credentials expiring | Renew through Epic App Orchard portal and update in Practice Studio |
| FHIR resource version mismatches | Check Epic FHIR resource versions and update mappings accordingly |
| Context data missing | Verify SMART launch context parameters are properly configured |

For more detailed Epic troubleshooting, see [Epic Integration Guide](./systems/epic-integration.md).

### Cerner Integration

| Issue | Resolution |
|-------|------------|
| Millennium domain validation | Verify domain settings match Cerner configuration |
| CCL script errors | Check custom scripts for syntax and logic errors |
| PowerChart integration issues | Verify PowerChart templates and mappings |

For more detailed Cerner troubleshooting, see [Cerner Integration Guide](./systems/cerner-integration.md).

### Allscripts Integration

| Issue | Resolution |
|-------|------------|
| Unity API connection issues | Verify Unity API credentials and endpoints |
| Touchworks/Professional EHR mappings | Check field mappings specific to Allscripts products |
| Dictionary mismatch errors | Update dictionary items to match Allscripts configuration |

For more detailed Allscripts troubleshooting, see [Allscripts Integration Guide](./systems/allscripts-integration.md).

## Advanced Troubleshooting

### Integration Logging

Enable detailed logging for deeper troubleshooting:

```
Settings > Integrations > Logging > Advanced Configuration
```

Available log levels:

| Level | Description | Use When |
|-------|-------------|----------|
| ERROR | Error events only | Normal operation |
| WARN | Warning and error events | Watching for potential issues |
| INFO | General information | Standard troubleshooting |
| DEBUG | Detailed process information | Active troubleshooting |
| TRACE | Most detailed level | Deep technical investigation |

Note: Higher log levels (DEBUG/TRACE) may impact performance and should be enabled temporarily.

### Message Tracing

Capture and analyze the full message exchange between systems:

```
Settings > Integrations > Diagnostics > Message Tracer > Start Trace
```

Message tracing options:

- **Direction**: Inbound, Outbound, or Both
- **Content Type**: All, HL7, FHIR, API, or File
- **Duration**: 5 minutes to 1 hour
- **Include PHI**: Yes/No (Note: Enable only when necessary and follow privacy policies)

### Database Verification

For advanced issues, verify database integrity and relationships:

```
Settings > Integrations > Diagnostics > Database Verification
```

This tool checks:

- Referential integrity between Practice Studio and PMS identifiers
- Orphaned records from failed synchronizations
- Duplicate mappings or conflicting entries
- Data consistency across systems

### Performance Analysis

Identify performance bottlenecks:

```
Settings > Integrations > Diagnostics > Performance Analyzer
```

Performance metrics available:

- API response times by endpoint
- Message processing durations
- Queue depths and processing rates
- Resource utilization during integration operations
- Transaction volume patterns

## Escalation Procedures

### When to Escalate

Escalate the issue when:

1. Initial troubleshooting steps don't resolve the problem
2. The issue impacts critical workflows or patient care
3. Data integrity problems are detected
4. System-wide integration failures occur
5. Performance degradation persists

### Escalation Process

1. **Internal Support**
   - Submit detailed ticket through Practice Studio support portal
   - Include error messages, logs, and troubleshooting steps attempted
   - Specify impact and urgency

2. **PMS Vendor Support**
   - Open ticket with PMS vendor support
   - Reference Practice Studio integration specifically
   - Provide integration identifiers and credentials (securely)

3. **Joint Troubleshooting**
   - Schedule joint meeting with Practice Studio and PMS support
   - Share diagnostic information between teams
   - Coordinate resolution efforts

### Required Information for Escalation

Prepare the following information when escalating:

- Integration type and version
- Specific error messages and codes
- Timestamps of occurrences
- User context if applicable
- Sample data (de-identified if containing PHI)
- Screenshots of relevant error messages
- Logs from diagnostic tools

## Preventative Measures

### Integration Monitoring

Set up proactive monitoring to catch issues early:

```
Settings > Integrations > Monitoring > Alerts
```

Recommended alerts:

- Failed authentication attempts
- Synchronization job failures
- Message queue backlog thresholds
- Response time degradation
- Error rate increases

### Regular Maintenance

Implement these maintenance practices:

1. **Weekly Reviews**
   - Check error logs and synchronization status
   - Verify no growing backlogs or queue depths
   - Spot-check data consistency between systems

2. **Monthly Maintenance**
   - Review and test authentication credentials
   - Update mappings for any new fields or codes
   - Analyze performance trends and optimize as needed

3. **Quarterly Audits**
   - Comprehensive data validation between systems
   - Review integration configuration for optimization
   - Update documentation and procedures

### Change Management

Follow these practices when making changes:

1. **Test in Development Environment First**
   - Validate changes in non-production environment
   - Perform integration tests for affected workflows
   - Document expected outcomes and verify results

2. **Coordinate with PMS Vendor**
   - Notify vendor of significant configuration changes
   - Coordinate during PMS upgrades or maintenance
   - Schedule joint testing for major changes

3. **Rollback Plan**
   - Develop clear rollback procedures for each change
   - Document configuration snapshots before changes
   - Test rollback procedures periodically

## Support Resources

- **Practice Studio Integration Support**: integration-support@practicestudio.com
- **Integration Knowledge Base**: https://support.practicestudio.com/integration
- **Community Forums**: https://community.practicestudio.com/integrations
- **Training Resources**: https://learn.practicestudio.com/integration-management

## Appendix: Diagnostic Tools Reference

| Tool | Location | Purpose |
|------|----------|---------|
| Connection Tester | Settings > Integrations > Diagnostics | Verify basic connectivity to PMS |
| Message Tracer | Settings > Integrations > Diagnostics | Capture and analyze API messages |
| Log Viewer | Settings > Integrations > Logging | View and search integration logs |
| Data Validator | Settings > Integrations > Diagnostics | Test data mapping and transformation |
| Sync Status Dashboard | Settings > Integrations > Monitoring | View synchronization job status |
| Performance Analyzer | Settings > Integrations > Diagnostics | Identify performance bottlenecks |
| HL7 Message Validator | Settings > Integrations > Diagnostics | Validate HL7 message structure |
| Integration Simulator | Settings > Integrations > Testing | Test integrations with simulated data |
