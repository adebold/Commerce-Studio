# Cerner Integration Guide

## Overview

This guide provides detailed instructions for integrating Practice Studio with Cerner, one of the leading healthcare information systems. Cerner integration allows Practice Studio to exchange data with Cerner Millennium and CommunityWorks platforms.

![Cerner Integration Overview](../../assets/cerner-integration-diagram.png)

## Integration Methods

Practice Studio supports the following integration methods with Cerner:

1. **API-Based Integration** via Cerner's Millennium Web Services
2. **FHIR Integration** using Cerner's FHIR API
3. **HL7 Interface** for clinical data exchange
4. **File-Based Integration** for batch operations

## Prerequisites

Before implementing Cerner integration, ensure you have:

1. **Cerner Access and Credentials**
   - Cerner API access credentials for your domain
   - Appropriate API scopes and permissions
   - Cerner Millennium domain information

2. **Technical Requirements**
   - TLS 1.2+ for secure communication
   - IP whitelisting for API calls
   - Required data mapping specifications

3. **Compliance Documentation**
   - Business Associate Agreement (BAA)
   - Cerner third-party connect agreement
   - HIPAA compliance documentation

## API-Based Integration

### Authentication Setup

Cerner uses OAuth 2.0 for API authentication:

1. **Register Practice Studio as a Client Application**
   - Contact your Cerner representative to register a new application
   - Configure redirect URLs
   - Obtain client ID and client secret

2. **Configure OAuth in Practice Studio**
   - Navigate to Settings > Integrations > Cerner
   - Enter Cerner API endpoint URL
   - Input client ID and client secret
   - Test connection

### Millennium Web Services Configuration

Practice Studio integrates with Cerner's Millennium Web Services for data exchange:

1. **Service Configuration**
   - Enable required service components in Practice Studio
   - Configure service endpoints based on your Cerner environment
   - Set up authentication for each service

2. **Patient Data Integration**
   - Configure Person Services for patient demographics
   - Map patient identifiers between systems
   - Set up patient search functionality

3. **Clinical Data Exchange**
   - Configure Clinical Services for medical record access
   - Set up document exchange workflows
   - Configure results retrieval

### Sample API Calls

#### Patient Search

```
POST https://millennium-instance/patient/v1/Patient/search
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "resourceType": "Parameters",
  "parameter": [
    {
      "name": "family",
      "valueString": "Smith"
    },
    {
      "name": "given",
      "valueString": "John"
    }
  ]
}
```

#### Appointment Creation

```
POST https://millennium-instance/scheduling/v1/slots/{slot_id}/book
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "resourceType": "Appointment",
  "status": "booked",
  "description": "Annual physical examination",
  "start": "2023-06-15T09:00:00Z",
  "end": "2023-06-15T09:30:00Z",
  "participant": [
    {
      "actor": {
        "reference": "Patient/1234567",
        "display": "Smith, John"
      },
      "status": "accepted"
    },
    {
      "actor": {
        "reference": "Practitioner/9876543",
        "display": "Dr. Jane Johnson"
      },
      "status": "accepted"
    }
  ]
}
```

## FHIR Integration

Cerner provides a FHIR R4 API that Practice Studio can integrate with:

### FHIR Configuration

1. **FHIR Endpoint Setup**
   - Configure the Cerner FHIR endpoint in Practice Studio
   - Set up authentication for FHIR requests
   - Configure resource mapping

2. **Resource Mapping**
   - Map FHIR Patient resources to Practice Studio patients
   - Configure Appointment, Encounter, and Observation mappings
   - Set up DocumentReference for clinical document exchange

3. **SMART on FHIR**
   - Configure SMART app launch parameters
   - Set up context handling for patient and user context
   - Implement token refresh logic

### Sample FHIR Requests

#### Patient Read

```
GET https://fhir-instance/api/FHIR/R4/Patient/12345
Authorization: Bearer {access_token}
Accept: application/fhir+json
```

#### Creating an Observation

```
POST https://fhir-instance/api/FHIR/R4/Observation
Content-Type: application/fhir+json
Authorization: Bearer {access_token}

{
  "resourceType": "Observation",
  "status": "final",
  "category": [
    {
      "coding": [
        {
          "system": "http://terminology.hl7.org/CodeSystem/observation-category",
          "code": "vital-signs",
          "display": "Vital Signs"
        }
      ]
    }
  ],
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "8302-2",
        "display": "Body height"
      }
    ],
    "text": "Body height"
  },
  "subject": {
    "reference": "Patient/12345"
  },
  "effectiveDateTime": "2023-03-20T09:30:00Z",
  "valueQuantity": {
    "value": 180.0,
    "unit": "cm",
    "system": "http://unitsofmeasure.org",
    "code": "cm"
  }
}
```

## HL7 Integration

For clinical data exchange, Practice Studio supports HL7 v2.x integration with Cerner:

### HL7 Interface Setup

1. **Configure Cerner Interface**
   - Work with Cerner interface team to set up HL7 endpoints
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
| ADT A01, A04 | Patient Registration | Cerner → Practice Studio |
| ADT A08 | Patient Update | Cerner → Practice Studio |
| SIU S12 | Appointment Notification | Bi-directional |
| SIU S14 | Appointment Modification | Bi-directional |
| SIU S15 | Appointment Cancellation | Bi-directional |
| ORU R01 | Observation Result | Cerner → Practice Studio |
| DFT P03 | Financial Transaction | Cerner → Practice Studio |
| MDM T02 | Document Notification | Cerner → Practice Studio |

### Sample HL7 Message

```
MSH|^~\&|CERNER|CERNERHOST|PRACTICESTUDIO|PSSERVER|20220315142658||ADT^A04|12345|P|2.3|
EVN|A04|20220315142658|||
PID|1||12345^^^CERNER^MRN||DOE^JOHN^||19800515|M||White|123 MAIN ST^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|SANGAMON|(555)555-1234|(555)555-5678|ENG|M|CHR|100000^^^CERNER^FIN NBR|123-45-6789|||
NK1|1|DOE^JANE^|SPO||(555)555-4321||EC|||||||||||
PV1|1|O|CLINIC^^^FACILITY|||||12345^JOHNSON^JANE^^^^^CERNER^^^^PROVID|||||||||||100000^^^CERNER^FIN NBR|||||||||||||||||||||||||20220315142658|
IN1|1|BC123^BLUE CROSS|BLUEINS|BLUE CROSS|123 INSURANCE WAY^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|||(555)555-9876|100|FAMILY PLAN||||JOHN DOE|SELF|19800515|123 MAIN ST^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|Y|CO|BC123456789|||||||||||||||BC987654321||||||||||
```

## File-Based Integration

For certain workflows, Practice Studio supports file-based integration with Cerner:

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

## CCL Integration

Cerner's Clinical Computing Language (CCL) is used for custom queries and operations:

### CCL Script Integration

1. **CCL Script Development**
   - Develop CCL scripts for specialized data extraction
   - Test scripts in Cerner test environment
   - Document script execution parameters

2. **Executing CCL from Practice Studio**
   - Configure script execution credentials
   - Set up secure transport for script execution
   - Schedule periodic script execution

### Sample CCL Script

```
SELECT
    P.NAME_LAST_KEY,
    P.NAME_FIRST_KEY,
    P.BIRTH_DT_TM,
    P_A.STREET_ADDR,
    P_A.CITY,
    P_A.STATE,
    P_A.ZIP
FROM
    PERSON P,
    PERSON_ALIAS PA,
    ADDRESS P_A
WHERE
    P.PERSON_ID = PA.PERSON_ID
    AND P.PERSON_ID = P_A.PARENT_ENTITY_ID
    AND P_A.ADDRESS_TYPE_CD = 756 /* Home Address */
    AND P.ACTIVE_IND = 1
    AND PA.ALIAS_TYPE_CD = 10 /* MRN */
    AND PA.ALIAS = $MRN
ORDER BY
    P.PERSON_ID
WITH MAXREC = 1
GO
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

3. **Cerner Coordination**
   - Engage Cerner integration team
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
   - Coordinate Cerner version updates
   - Implement feature enhancements

## Troubleshooting

### Common Issues and Solutions

| Issue | Possible Causes | Resolution |
|-------|----------------|------------|
| Authentication failures | Expired credentials, incorrect scopes | Refresh OAuth tokens, verify API permissions |
| Missing patient data | Incomplete mapping, data access restrictions | Review data mappings, check Cerner security settings |
| Appointment sync errors | Time zone discrepancies, scheduling conflicts | Verify time zone handling, implement conflict resolution |
| HL7 message rejection | Message format errors, invalid data | Check message structure, validate required fields |
| CCL script errors | Syntax errors, permission issues | Validate script syntax, check execution permissions |

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

## Cerner Version Compatibility

| Cerner Version | Compatible Features | Known Limitations |
|----------------|---------------------|-------------------|
| Millennium 2015 | Basic patient demographics, CCL | Limited HL7 support |
| Millennium 2018 | Enhanced HL7 support, scheduling | Basic FHIR capabilities |
| Millennium 2020+ | Full FHIR R4 support, web services | None |
| CommunityWorks | Basic patient demographics, scheduling | Limited custom CCL support |

## Resources and Support

- [Cerner Developer Portal](https://developer.cerner.com)
- [Practice Studio Integration Support](mailto:integration-support@practicestudio.com)
- [Cerner Connect Programs](https://cerner.com/solutions/app-gallery)
- [HL7 FHIR Resources](https://hl7.org/fhir/)

## Appendix: Field Mappings

### Patient Demographics Mapping

| Cerner Field | Practice Studio Field | Notes |
|--------------|------------------------|-------|
| PERSON_ID | external_id | Cerner's patient identifier |
| NAME_FIRST_KEY | first_name | |
| NAME_LAST_KEY | last_name | |
| BIRTH_DT_TM | date_of_birth | Format: YYYY-MM-DD |
| GENDER_CD | gender | Mapped M/F/O/U to corresponding codes |
| STREET_ADDR | address.line1 | |
| STREET_ADDR2 | address.line2 | |
| CITY | address.city | |
| STATE | address.state | |
| ZIP | address.postal_code | |
| PHONE_NUM_HOME | phone_home | Format standardized to E.164 |
| PHONE_NUM_MOBILE | phone_mobile | Format standardized to E.164 |
| EMAIL | email | |
| LANGUAGE_CD | preferred_language | Mapped from Cerner language codes |
| RACE_CD | race | Mapped from Cerner race codes |
| ETHNIC_GRP_CD | ethnicity | Mapped from Cerner ethnicity codes |

### Appointment Mapping

| Cerner Field | Practice Studio Field | Notes |
|--------------|------------------------|-------|
| SCHEDULE_ID | external_id | Cerner's appointment identifier |
| PERSON_ID | patient_id | Mapped to Practice Studio patient ID |
| RESOURCE_CD | provider_id | Mapped to Practice Studio provider ID |
| APPT_TYPE_CD | appointment_type | Mapped to corresponding types |
| BEG_DT_TM | start_time | UTC format |
| END_DT_TM | end_time | UTC format |
| APPT_STATUS_CD | status | Mapped to corresponding statuses |
| REASON_TXT | reason | |
| LOCATION_CD | location_id | Mapped to Practice Studio location |
| RESULT_TXT | notes | |
