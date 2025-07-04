# Epic Integration Guide

## Overview

This guide provides detailed instructions for integrating Practice Studio with Epic, one of the most widely used healthcare software systems. Epic integration allows for seamless data exchange between Practice Studio and Epic EHR/PMS systems.

![Epic Integration Overview](../../assets/epic-integration-diagram.png)

## Integration Methods

Practice Studio supports the following integration methods with Epic:

1. **API-Based Integration** via Epic's FHIR API
2. **Direct Database Integration** (requires Epic approval)
3. **HL7 Interface** for legacy systems
4. **File-Based Integration** for batch operations

## Prerequisites

Before implementing Epic integration, ensure you have:

1. **Epic Access and Credentials**
   - Epic API access credentials
   - Appropriate API scopes and permissions
   - Epic instance URL

2. **Technical Requirements**
   - TLS 1.2+ for secure communication
   - IP whitelisting for API calls
   - Required data mapping specifications

3. **Compliance Documentation**
   - Business Associate Agreement (BAA)
   - Epic third-party connect agreement
   - HIPAA compliance documentation

## API-Based Integration

### Authentication Setup

Epic uses OAuth 2.0 with SMART on FHIR for authentication:

1. **Register Practice Studio as a Client Application**
   - Log into your Epic App Orchard account
   - Register a new application
   - Configure redirect URLs
   - Obtain client ID and client secret

2. **Configure OAuth in Practice Studio**
   - Navigate to Settings > Integrations > Epic
   - Enter Epic API endpoint URL
   - Input client ID and client secret
   - Test connection

### FHIR API Configuration

Practice Studio uses Epic's FHIR R4 APIs for data exchange:

1. **Patient Resource Mapping**
   - Map Epic patient demographics to Practice Studio fields
   - Configure patient search parameters
   - Set up patient creation/update flows

2. **Appointment Synchronization**
   - Map Epic scheduling slots to Practice Studio calendar
   - Configure appointment types and durations
   - Set up bi-directional updates

3. **Clinical Data Exchange**
   - Map clinical observations and measurements
   - Configure document retrieval and storage
   - Set up orders and results workflow

### Sample FHIR API Calls

#### Patient Search

```
GET https://epic-fhir-endpoint/api/FHIR/R4/Patient?family=Smith&given=John

Authorization: Bearer {access_token}
Accept: application/fhir+json
```

#### Appointment Creation

```
POST https://epic-fhir-endpoint/api/FHIR/R4/Appointment
Content-Type: application/fhir+json
Authorization: Bearer {access_token}

{
  "resourceType": "Appointment",
  "status": "booked",
  "serviceType": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/service-type",
          "code": "124",
          "display": "General Practice"
        }
      ]
    }
  ],
  "reasonCode": [
    {
      "text": "Annual physical examination"
    }
  ],
  "start": "2023-06-15T09:00:00Z",
  "end": "2023-06-15T09:30:00Z",
  "participant": [
    {
      "actor": {
        "reference": "Patient/1234567",
        "display": "Smith, John"
      },
      "status": "accepted",
      "type": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              "code": "ATND",
              "display": "attender"
            }
          ]
        }
      ]
    },
    {
      "actor": {
        "reference": "Practitioner/9876543",
        "display": "Dr. Jane Johnson"
      },
      "status": "accepted",
      "type": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
              "code": "ATND",
              "display": "attender"
            }
          ]
        }
      ]
    }
  ]
}
```

## HL7 Integration

For legacy Epic systems or specific data workflows, Practice Studio supports HL7 v2.x integration:

### HL7 Interface Setup

1. **Configure Epic Interface**
   - Work with Epic interface team to set up HL7 endpoints
   - Define message types to exchange (ADT, SIU, ORU, etc.)
   - Set up transport method (MLLP, TCP/IP, secure file transfer)

2. **Configure Practice Studio HL7 Receiver**
   - Navigate to Settings > Integrations > HL7
   - Configure connection parameters
   - Set up message filtering and transformation rules
   - Define acknowledgment settings

### Supported HL7 Message Types

| Message Type | Description | Direction |
|--------------|-------------|-----------|
| ADT A01, A04 | Patient Registration | Epic → Practice Studio |
| ADT A08 | Patient Update | Epic → Practice Studio |
| SIU S12 | Appointment Notification | Bi-directional |
| SIU S14 | Appointment Modification | Bi-directional |
| SIU S15 | Appointment Cancellation | Bi-directional |
| ORU R01 | Observation Result | Epic → Practice Studio |
| DFT P03 | Financial Transaction | Epic → Practice Studio |

### Sample HL7 Message

```
MSH|^~\&|EPIC|EPICFACILITY|PRACTICESTUDIO|PSSERVER|20220315142658||ADT^A04|12345|P|2.3|
EVN|A04|20220315142658|||
PID|1||12345^^^EPIC^MRN||DOE^JOHN^||19800515|M||White|123 MAIN ST^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|SANGAMON|(555)555-1234|(555)555-5678|ENG|M|CHR|100000^^^EPIC^FIN NBR|123-45-6789|||
NK1|1|DOE^JANE^|SPO||(555)555-4321||EC|||||||||||
PV1|1|O|CLINIC^^^FACILITY|||||12345^JOHNSON^JANE^^^^^EPIC^^^^PROVID|||||||||||100000^^^EPIC^FIN NBR|||||||||||||||||||||||||20220315142658|
IN1|1|BC123^BLUE CROSS|BLUEINS|BLUE CROSS|123 INSURANCE WAY^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|||(555)555-9876|100|FAMILY PLAN||||JOHN DOE|SELF|19800515|123 MAIN ST^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|Y|CO|BC123456789|||||||||||||||BC987654321||||||||||
```

## File-Based Integration

For batch processes or specific workflows, Practice Studio supports file-based integration with Epic:

### File Integration Setup

1. **Configure File Locations**
   - Set up secure file transfer protocol (SFTP/FTPS)
   - Define file locations and naming conventions
   - Configure file processing schedules

2. **Define File Formats**
   - Specify CSV/JSON structure
   - Map fields between systems
   - Define validation rules

### File Processing Workflows

1. **Patient Demographics Import**
   - Daily import of patient updates
   - Field-level reconciliation
   - Duplicate detection and resolution

2. **Appointment Batch Synchronization**
   - Nightly schedule import/export
   - Conflict resolution rules
   - Error handling and reporting

3. **Billing Data Exchange**
   - Claim file generation
   - Remittance processing
   - Payment reconciliation

### Sample File Format (CSV)

```csv
PatientID,FirstName,LastName,DOB,Gender,Address1,Address2,City,State,Zip,Phone,Email,InsuranceProvider,MemberID,GroupNumber
12345,John,Doe,1980-05-15,M,123 Main St,Apt 4B,Springfield,IL,62701,5551234567,john.doe@example.com,Blue Cross,BC987654321,GRP123456
54321,Jane,Smith,1975-08-22,F,456 Oak Ave,,Springfield,IL,62702,5559876543,jane.smith@example.com,Aetna,AET123456789,GRP987654
```

## Implementation Workflow

### Phase 1: Planning and Requirements

1. **Gather Requirements**
   - Identify data elements to exchange
   - Define integration scenarios
   - Document workflow requirements

2. **Solution Design**
   - Select appropriate integration methods
   - Design data flows and mappings
   - Define error handling and recovery procedures

3. **Epic Coordination**
   - Engage Epic integration team
   - Request necessary interface builds
   - Obtain required approvals

### Phase 2: Development and Configuration

1. **Environment Setup**
   - Configure test environments
   - Set up connectivity
   - Establish authentication

2. **Data Mapping Implementation**
   - Configure field mappings
   - Implement transformations
   - Develop validation rules

3. **Integration Development**
   - Build API integration components
   - Develop file processors
   - Create HL7 interface handlers

### Phase 3: Testing and Validation

1. **Unit Testing**
   - Test individual integration components
   - Validate data mappings
   - Verify error handling

2. **Integration Testing**
   - End-to-end workflow testing
   - Bi-directional data exchange validation
   - Performance and load testing

3. **User Acceptance Testing**
   - Validate with end users
   - Confirm workflow functionality
   - Document test results

### Phase 4: Deployment and Monitoring

1. **Production Deployment**
   - Coordinate go-live activities
   - Monitor initial data exchange
   - Provide go-live support

2. **Ongoing Monitoring**
   - Implement integration monitoring
   - Set up alerting for failures
   - Establish support procedures

3. **Maintenance and Updates**
   - Regular interface review
   - Coordinate Epic version updates
   - Implement feature enhancements

## Troubleshooting

### Common Issues and Solutions

| Issue | Possible Causes | Resolution |
|-------|----------------|------------|
| Authentication failures | Expired credentials, incorrect scopes | Refresh OAuth tokens, verify API permissions |
| Missing patient data | Incomplete mapping, data access restrictions | Review data mappings, check Epic security settings |
| Appointment sync errors | Time zone discrepancies, scheduling conflicts | Verify time zone handling, implement conflict resolution |
| HL7 message rejection | Message format errors, invalid data | Check message structure, validate required fields |
| Performance issues | High volume, inefficient queries | Implement pagination, optimize query parameters |

### Logging and Debugging

1. **Integration Logs**
   - Access at Settings > Integrations > Logs
   - Filter by integration type and time range
   - Export logs for analysis

2. **Error Handling**
   - Review error queues at Settings > Integrations > Error Management
   - Reprocess failed transactions
   - Analyze error patterns

3. **Connectivity Testing**
   - Use Settings > Integrations > Connectivity Test
   - Validate network connectivity
   - Check authentication

## Best Practices

1. **Data Synchronization**
   - Implement idempotent operations
   - Use unique identifiers across systems
   - Maintain audit trails of synchronized data

2. **Security and Compliance**
   - Encrypt all data in transit and at rest
   - Implement least privilege access
   - Maintain detailed audit logs for compliance

3. **Performance Optimization**
   - Use delta synchronization where possible
   - Implement caching strategies
   - Schedule batch operations during off-peak hours

4. **Maintenance and Support**
   - Document all integration components
   - Maintain version compatibility information
   - Establish monitoring and alerting

## Epic Version Compatibility

| Epic Version | Compatible Features | Known Limitations |
|--------------|---------------------|-------------------|
| Epic 2018 | Basic patient demographics, appointments | Limited FHIR support |
| Epic 2019 | Enhanced FHIR support, orders integration | No bulk data capabilities |
| Epic 2020 | Full FHIR R4 support, bulk data | Some custom fields not supported |
| Epic 2021+ | Complete integration support | None |

## Resources and Support

- [Epic Technical Documentation](https://open.epic.com)
- [Practice Studio Integration Support](mailto:integration-support@practicestudio.com)
- [Epic App Orchard](https://apporchard.epic.com)
- [HL7 FHIR Resources](https://hl7.org/fhir/)

## Appendix: Field Mappings

### Patient Demographics Mapping

| Epic Field | Practice Studio Field | Notes |
|------------|------------------------|-------|
| PatientID | external_id | Epic's patient identifier |
| Name.First | first_name | |
| Name.Last | last_name | |
| DOB | date_of_birth | Format: YYYY-MM-DD |
| Sex | gender | Mapped M/F/O/U to corresponding codes |
| Address.Line1 | address.line1 | |
| Address.Line2 | address.line2 | |
| Address.City | address.city | |
| Address.State | address.state | |
| Address.Zip | address.postal_code | |
| PhoneNumber.Home | phone_home | Format standardized to E.164 |
| PhoneNumber.Mobile | phone_mobile | Format standardized to E.164 |
| Email | email | |
| Language | preferred_language | Mapped from ISO codes |
| Race | race | Mapped from CDC race codes |
| Ethnicity | ethnicity | Mapped from CDC ethnicity codes |

### Appointment Mapping

| Epic Field | Practice Studio Field | Notes |
|------------|------------------------|-------|
| VisitID | external_id | Epic's visit identifier |
| Patient | patient_id | Mapped to Practice Studio patient ID |
| Provider | provider_id | Mapped to Practice Studio provider ID |
| VisitType | appointment_type | Mapped to corresponding types |
| StartTime | start_time | UTC format |
| EndTime | end_time | UTC format |
| Status | status | Mapped to corresponding statuses |
| Reason | reason | |
| Department | location_id | Mapped to Practice Studio location |
| Notes | notes | |
