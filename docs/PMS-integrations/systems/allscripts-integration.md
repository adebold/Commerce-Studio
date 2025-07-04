# Allscripts Integration Guide

## Overview

This guide provides detailed instructions for integrating Practice Studio with Allscripts healthcare information systems. The integration allows seamless data exchange between Practice Studio and Allscripts Professional EHR, TouchWorks EHR, and Sunrise Clinical Manager.

![Allscripts Integration Overview](../../assets/allscripts-integration-diagram.png)

## Integration Methods

Practice Studio supports the following integration methods with Allscripts:

1. **Unity API Integration** - Allscripts' primary integration API
2. **FollowMyHealth API** - Patient engagement integration
3. **HL7 Interface** - Clinical data exchange
4. **File-Based Integration** - Batch operations

## Prerequisites

Before implementing Allscripts integration, ensure you have:

1. **Allscripts Access and Credentials**
   - Unity API credentials (AppName, Username, Password)
   - Allscripts instance information
   - Appropriate API scopes and permissions

2. **Technical Requirements**
   - TLS 1.2+ for secure communication
   - IP whitelisting for API calls
   - Required data mapping specifications

3. **Compliance Documentation**
   - Business Associate Agreement (BAA)
   - Allscripts third-party connect agreement
   - HIPAA compliance documentation

## Unity API Integration

### Unity API Overview

The Unity API is the primary integration point for Allscripts systems, providing SOAP-based web services for accessing clinical and practice management data:

- Supports Professional EHR and TouchWorks EHR
- Provides comprehensive access to patient data
- Enables bi-directional data exchange
- Offers real-time and batch operation modes

### Authentication Setup

1. **Register for Unity API Access**
   - Contact Allscripts to register as a certified integration partner
   - Obtain Unity API credentials (AppName, Username, Password)
   - Get access to the Allscripts Developer Portal

2. **Configure Unity API in Practice Studio**
   - Navigate to Settings > Integrations > Allscripts
   - Enter Unity API endpoint URL
   - Input AppName, Username, and Password
   - Test connection

### Magic Action Integration

The Unity API uses "Magic" actions for data operations:

1. **Magic Action Configuration**
   - Configure action mappings in Practice Studio
   - Set up required parameters for each action
   - Define response handlers

2. **Patient Data Integration**
   - Implement GetPatient, GetPatientDemographics, and SearchPatients actions
   - Map patient identifiers between systems
   - Configure patient search functionality

3. **Clinical Data Exchange**
   - Set up GetClinicalSummary and SaveClinicalDocument actions
   - Configure document exchange workflows
   - Implement results retrieval

### Sample Unity API Calls

#### Patient Search

```xml
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header>
    <Security xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <UsernameToken>
        <Username>your_username</Username>
        <Password>your_password</Password>
      </UsernameToken>
    </Security>
  </soap:Header>
  <soap:Body>
    <Unity_RunRequest xmlns="http://www.allscripts.com/Unity">
      <PatientFindRequest>
        <Action>SearchPatients</Action>
        <AppUserID>your_app_user_id</AppUserID>
        <Appname>your_app_name</Appname>
        <PatientFindData>
          <SearchString>Smith, John</SearchString>
        </PatientFindData>
      </PatientFindRequest>
    </Unity_RunRequest>
  </soap:Body>
</soap:Envelope>
```

#### Appointment Scheduling

```xml
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header>
    <Security xmlns="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
      <UsernameToken>
        <Username>your_username</Username>
        <Password>your_password</Password>
      </UsernameToken>
    </Security>
  </soap:Header>
  <soap:Body>
    <Unity_RunRequest xmlns="http://www.allscripts.com/Unity">
      <PatientFindRequest>
        <Action>SaveAppointment</Action>
        <AppUserID>your_app_user_id</AppUserID>
        <Appname>your_app_name</Appname>
        <Parameter>
          <Name>PatientID</Name>
          <Value>12345</Value>
        </Parameter>
        <Parameter>
          <Name>ProviderID</Name>
          <Value>54321</Value>
        </Parameter>
        <Parameter>
          <Name>AppointmentDate</Name>
          <Value>06/15/2023</Value>
        </Parameter>
        <Parameter>
          <Name>AppointmentTime</Name>
          <Value>09:00</Value>
        </Parameter>
        <Parameter>
          <Name>Duration</Name>
          <Value>30</Value>
        </Parameter>
        <Parameter>
          <Name>ReasonCode</Name>
          <Value>PHYSICAL</Value>
        </Parameter>
      </PatientFindRequest>
    </Unity_RunRequest>
  </soap:Body>
</soap:Envelope>
```

### Common Unity API Actions

| Action | Description | Key Parameters |
|--------|-------------|----------------|
| GetPatient | Retrieve patient details | PatientID |
| SearchPatients | Search for patients | SearchString |
| GetSchedule | Retrieve provider schedule | ProviderID, StartDate, EndDate |
| SaveAppointment | Create or update appointment | PatientID, ProviderID, AppointmentDate, AppointmentTime |
| GetClinicalSummary | Retrieve patient clinical summary | PatientID |
| GetResults | Retrieve lab and test results | PatientID, StartDate, EndDate |
| SaveClinicalDocument | Save clinical document to patient chart | PatientID, DocumentType, DocumentContent |
| GetDictionary | Retrieve system dictionaries | DictionaryName |

## FollowMyHealth Integration

For patient engagement functionality, Practice Studio integrates with Allscripts FollowMyHealth:

### FollowMyHealth API Setup

1. **Register for FollowMyHealth API Access**
   - Contact Allscripts to register as a development partner
   - Obtain API credentials
   - Configure redirect URLs

2. **Configure OAuth in Practice Studio**
   - Navigate to Settings > Integrations > FollowMyHealth
   - Enter API endpoint URL
   - Input client ID and client secret
   - Test connection

### Patient Portal Integration

1. **Patient Authentication**
   - Implement OAuth flow for patient access
   - Configure patient matching between systems
   - Set up token management

2. **Patient Data Access**
   - Configure patient profile synchronization
   - Set up appointment access and management
   - Implement medical record viewing

3. **Patient Communication**
   - Set up secure messaging integration
   - Configure appointment reminders
   - Implement notification delivery

## HL7 Integration

For clinical data exchange, Practice Studio supports HL7 v2.x integration with Allscripts:

### HL7 Interface Setup

1. **Configure Allscripts Interface**
   - Work with Allscripts interface team to set up HL7 endpoints
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
| ADT A01, A04 | Patient Registration | Allscripts → Practice Studio |
| ADT A08 | Patient Update | Allscripts → Practice Studio |
| SIU S12 | Appointment Notification | Bi-directional |
| SIU S14 | Appointment Modification | Bi-directional |
| SIU S15 | Appointment Cancellation | Bi-directional |
| ORU R01 | Observation Result | Allscripts → Practice Studio |
| DFT P03 | Financial Transaction | Allscripts → Practice Studio |
| MDM T02 | Document Notification | Allscripts → Practice Studio |

### Sample HL7 Message

```
MSH|^~\&|ALLSCRIPTS|ALLSCRIPTSHOST|PRACTICESTUDIO|PSSERVER|20220315142658||ADT^A04|12345|P|2.3|
EVN|A04|20220315142658|||
PID|1||12345^^^ALLSCRIPTS^MRN||DOE^JOHN^||19800515|M||White|123 MAIN ST^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|SANGAMON|(555)555-1234|(555)555-5678|ENG|M|CHR|100000^^^ALLSCRIPTS^FIN NBR|123-45-6789|||
NK1|1|DOE^JANE^|SPO||(555)555-4321||EC|||||||||||
PV1|1|O|CLINIC^^^FACILITY|||||12345^JOHNSON^JANE^^^^^ALLSCRIPTS^^^^PROVID|||||||||||100000^^^ALLSCRIPTS^FIN NBR|||||||||||||||||||||||||20220315142658|
IN1|1|BC123^BLUE CROSS|BLUEINS|BLUE CROSS|123 INSURANCE WAY^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|||(555)555-9876|100|FAMILY PLAN||||JOHN DOE|SELF|19800515|123 MAIN ST^^SPRINGFIELD^IL^62701^USA^^^SANGAMON|Y|CO|BC123456789|||||||||||||||BC987654321||||||||||
```

## File-Based Integration

For batch processes or specific workflows, Practice Studio supports file-based integration with Allscripts:

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

## Special Considerations for Allscripts Products

### Professional EHR

1. **Database Structure**
   - Use appropriate Professional EHR-specific Unity actions
   - Configure Professional-specific data mappings
   - Handle Professional-specific dictionaries

2. **Integration Limitations**
   - Be aware of data access limitations
   - Handle Professional-specific error codes
   - Implement proper error recovery mechanisms

### TouchWorks EHR

1. **Multi-organization Support**
   - Configure organization-specific parameters
   - Handle organization-specific dictionaries
   - Implement organization filtering

2. **Document Storage**
   - Configure document type mappings
   - Set up document routing rules
   - Implement document workflow integration

### Sunrise Clinical Manager

1. **HL7 Integration Focus**
   - Configure SCM-specific HL7 message formats
   - Map SCM-specific identifiers
   - Implement SCM-specific validation rules

2. **Data Access Considerations**
   - Configure SCM-specific security protocols
   - Implement SCM-specific data transformation logic
   - Handle SCM-specific code mappings

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

3. **Allscripts Coordination**
   - Engage Allscripts integration team
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
   - Build Unity API integration components
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
   - Coordinate Allscripts version updates
   - Implement feature enhancements

## Troubleshooting

### Common Issues and Solutions

| Issue | Possible Causes | Resolution |
|-------|----------------|------------|
| Unity API authentication failures | Expired credentials, incorrect AppName | Verify Unity API credentials, check AppName case sensitivity |
| Patient matching issues | Inconsistent patient identifiers | Review patient matching rules, implement fuzzy matching |
| Dictionary mapping errors | Mismatched dictionary values | Update dictionary mappings, synchronize codes |
| HL7 message rejection | Message format errors, invalid data | Check message structure, validate required fields |
| Performance degradation | High transaction volume, inefficient queries | Optimize query parameters, implement caching |

### Logging and Debugging

1. **Unity API Logs**
   - Access at Settings > Integrations > Logs > Allscripts
   - Filter by action type and time range
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
   - Use GetChanges actions for incremental synchronization
   - Implement caching strategies
   - Schedule batch operations during off-peak hours

4. **Maintenance and Support**
   - Document all integration components
   - Maintain version compatibility information
   - Establish monitoring and alerting

## Allscripts Version Compatibility

| Allscripts Version | Compatible Features | Known Limitations |
|-------------------|---------------------|-------------------|
| Professional EHR 11.x | Basic Unity API, HL7 | Limited FollowMyHealth integration |
| Professional EHR 13.x+ | Full Unity API support, enhanced HL7 | None |
| TouchWorks EHR 15.x | Basic Unity API support | Limited custom document types |
| TouchWorks EHR 17.x+ | Full Unity API support, FollowMyHealth | None |
| Sunrise Clinical Manager 18.x+ | HL7 integration, limited API | No direct Unity API support |

## Resources and Support

- [Allscripts Developer Portal](https://developer.allscripts.com)
- [Practice Studio Integration Support](mailto:integration-support@practicestudio.com)
- [Allscripts Connect Programs](https://www.allscripts.com/solution/open-platform/)
- [HL7 Resources](https://hl7.org/implement/standards/)

## Appendix: Field Mappings

### Patient Demographics Mapping

| Allscripts Field | Practice Studio Field | Notes |
|------------------|------------------------|-------|
| PatientID | external_id | Allscripts patient identifier |
| FirstName | first_name | |
| LastName | last_name | |
| DOB | date_of_birth | Format: YYYY-MM-DD |
| Sex | gender | Mapped M/F/O/U to corresponding codes |
| Address1 | address.line1 | |
| Address2 | address.line2 | |
| City | address.city | |
| State | address.state | |
| Zip | address.postal_code | |
| HomePhone | phone_home | Format standardized to E.164 |
| MobilePhone | phone_mobile | Format standardized to E.164 |
| Email | email | |
| Language | preferred_language | Mapped from Allscripts language codes |
| Race | race | Mapped from Allscripts race codes |
| Ethnicity | ethnicity | Mapped from Allscripts ethnicity codes |

### Appointment Mapping

| Allscripts Field | Practice Studio Field | Notes |
|------------------|------------------------|-------|
| AppointmentID | external_id | Allscripts appointment identifier |
| PatientID | patient_id | Mapped to Practice Studio patient ID |
| ProviderID | provider_id | Mapped to Practice Studio provider ID |
| AppointmentTypeID | appointment_type | Mapped to corresponding types |
| AppointmentDate + AppointmentTime | start_time | Combined and converted to UTC |
| Duration | end_time | Calculated from start time + duration |
| Status | status | Mapped to corresponding statuses |
| Reason | reason | |
| Location | location_id | Mapped to Practice Studio location |
| Notes | notes | |
