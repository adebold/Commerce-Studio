# PMS Integration API Reference

## Overview

This document provides a comprehensive reference for the Practice Studio API endpoints used for PMS integrations. These APIs enable bidirectional data exchange between Practice Studio and third-party Practice Management Systems.

## API Versioning

All API endpoints are versioned to ensure backward compatibility:

- Current stable version: `v1`
- Beta version: `v2`
- Base URL: `https://api.practicestudio.com/{version}`

## Authentication

### OAuth 2.0 Authentication

Practice Studio uses OAuth 2.0 for secure API access:

1. **Authorization Code Flow** (for web applications)
2. **Client Credentials Flow** (for server-to-server integration)
3. **Resource Owner Password Flow** (for trusted applications)

#### Obtaining Access Tokens

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id={your_client_id}
&client_secret={your_client_secret}
&scope=read:patients write:appointments
```

#### Sample Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:patients write:appointments"
}
```

### API Key Authentication (Legacy)

For legacy integrations, API key authentication is available:

```
GET /api/v1/patients
Authorization: ApiKey your_api_key_here
```

## Common Headers

| Header | Description | Required |
|--------|-------------|----------|
| `Authorization` | Bearer token or API key | Yes |
| `Content-Type` | Media type of request | Yes for POST/PUT |
| `Accept` | Media type of response | No (defaults to JSON) |
| `X-Request-ID` | Client-generated request ID for tracing | No |
| `X-Correlation-ID` | ID for correlating requests across systems | No |

## Rate Limiting

API requests are subject to rate limiting:

- Standard tier: 100 requests per minute
- Premium tier: 1000 requests per minute
- Enterprise tier: Custom limits

Rate limit headers in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1614556800
```

## Patient Endpoints

### Get Patients List

```
GET /api/v1/patients
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search term for patient name or ID |
| `limit` | integer | Number of results (default: 20, max: 100) |
| `offset` | integer | Pagination offset |
| `sort` | string | Field to sort by (e.g., name, dob) |
| `order` | string | Sort order (asc, desc) |
| `status` | string | Filter by patient status |

Response:

```json
{
  "total": 143,
  "limit": 20,
  "offset": 0,
  "patients": [
    {
      "id": "PAT-12345",
      "mrn": "MRN-67890",
      "firstName": "John",
      "lastName": "Doe",
      "dateOfBirth": "1980-05-15",
      "gender": "M",
      "contactInfo": {
        "email": "john.doe@example.com",
        "phone": "555-123-4567",
        "address": {
          "line1": "123 Main St",
          "line2": "Apt 4B",
          "city": "Springfield",
          "state": "IL",
          "postalCode": "62701",
          "country": "USA"
        }
      },
      "insurance": {
        "primary": {
          "provider": "Blue Cross",
          "memberId": "BC987654321",
          "groupNumber": "GRP123456"
        }
      },
      "created": "2022-03-15T14:30:00Z",
      "updated": "2023-01-20T09:45:00Z",
      "_links": {
        "self": {"href": "/api/v1/patients/PAT-12345"},
        "appointments": {"href": "/api/v1/patients/PAT-12345/appointments"},
        "records": {"href": "/api/v1/patients/PAT-12345/records"}
      }
    },
    // Additional patients...
  ]
}
```

### Get Patient Details

```
GET /api/v1/patients/{patient_id}
```

Path Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | string | Practice Studio patient ID |

Response:

```json
{
  "id": "PAT-12345",
  "mrn": "MRN-67890",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1980-05-15",
  "gender": "M",
  "contactInfo": {
    "email": "john.doe@example.com",
    "phone": "555-123-4567",
    "address": {
      "line1": "123 Main St",
      "line2": "Apt 4B",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701",
      "country": "USA"
    }
  },
  "insurance": {
    "primary": {
      "provider": "Blue Cross",
      "memberId": "BC987654321",
      "groupNumber": "GRP123456"
    },
    "secondary": {
      "provider": "Medicare",
      "memberId": "MED12345",
      "groupNumber": ""
    }
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Spouse",
    "phone": "555-987-6543"
  },
  "preferredLanguage": "English",
  "preferredPharmacy": {
    "id": "PHARM-123",
    "name": "City Pharmacy",
    "phone": "555-111-2222"
  },
  "allergies": [
    {
      "allergen": "Penicillin",
      "reaction": "Hives",
      "severity": "Moderate",
      "noted": "2021-06-12T10:30:00Z"
    }
  ],
  "created": "2022-03-15T14:30:00Z",
  "updated": "2023-01-20T09:45:00Z",
  "_links": {
    "self": {"href": "/api/v1/patients/PAT-12345"},
    "appointments": {"href": "/api/v1/patients/PAT-12345/appointments"},
    "records": {"href": "/api/v1/patients/PAT-12345/records"}
  }
}
```

### Create Patient

```
POST /api/v1/patients
Content-Type: application/json
```

Request Body:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1975-08-22",
  "gender": "F",
  "contactInfo": {
    "email": "jane.smith@example.com",
    "phone": "555-987-6543",
    "address": {
      "line1": "456 Oak Ave",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62702",
      "country": "USA"
    }
  },
  "insurance": {
    "primary": {
      "provider": "Aetna",
      "memberId": "AET123456789",
      "groupNumber": "GRP987654"
    }
  }
}
```

Response:

```json
{
  "id": "PAT-54321",
  "mrn": "MRN-98765",
  "firstName": "Jane",
  "lastName": "Smith",
  "dateOfBirth": "1975-08-22",
  "gender": "F",
  "contactInfo": {
    "email": "jane.smith@example.com",
    "phone": "555-987-6543",
    "address": {
      "line1": "456 Oak Ave",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62702",
      "country": "USA"
    }
  },
  "insurance": {
    "primary": {
      "provider": "Aetna",
      "memberId": "AET123456789",
      "groupNumber": "GRP987654"
    }
  },
  "created": "2023-03-01T10:15:00Z",
  "updated": "2023-03-01T10:15:00Z",
  "_links": {
    "self": {"href": "/api/v1/patients/PAT-54321"},
    "appointments": {"href": "/api/v1/patients/PAT-54321/appointments"},
    "records": {"href": "/api/v1/patients/PAT-54321/records"}
  }
}
```

### Update Patient

```
PUT /api/v1/patients/{patient_id}
Content-Type: application/json
```

Path Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | string | Practice Studio patient ID |

Request Body: (Include only fields to update)

```json
{
  "contactInfo": {
    "phone": "555-111-3333",
    "address": {
      "line1": "789 Maple Dr",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62703",
      "country": "USA"
    }
  },
  "insurance": {
    "primary": {
      "provider": "United Healthcare",
      "memberId": "UHC87654321",
      "groupNumber": "UHG123456"
    }
  }
}
```

Response: Full patient object with updated fields

## Appointment Endpoints

### Get Appointments

```
GET /api/v1/appointments
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `start_date` | date | Start date for appointments (YYYY-MM-DD) |
| `end_date` | date | End date for appointments (YYYY-MM-DD) |
| `provider_id` | string | Filter by provider ID |
| `patient_id` | string | Filter by patient ID |
| `status` | string | Filter by status (scheduled, completed, cancelled) |
| `limit` | integer | Number of results (default: 20, max: 100) |
| `offset` | integer | Pagination offset |

Response:

```json
{
  "total": 25,
  "limit": 20,
  "offset": 0,
  "appointments": [
    {
      "id": "APPT-12345",
      "patientId": "PAT-12345",
      "providerId": "PROV-54321",
      "startTime": "2023-04-15T10:00:00Z",
      "endTime": "2023-04-15T10:30:00Z",
      "type": "Follow-up",
      "status": "scheduled",
      "reason": "Diabetes follow-up",
      "notes": "Patient requested morning appointment",
      "location": {
        "id": "LOC-789",
        "name": "Main Clinic",
        "address": {
          "line1": "100 Health Way",
          "city": "Springfield",
          "state": "IL",
          "postalCode": "62704"
        }
      },
      "created": "2023-03-01T14:30:00Z",
      "updated": "2023-03-01T14:30:00Z",
      "_links": {
        "self": {"href": "/api/v1/appointments/APPT-12345"},
        "patient": {"href": "/api/v1/patients/PAT-12345"},
        "provider": {"href": "/api/v1/providers/PROV-54321"}
      }
    },
    // Additional appointments...
  ]
}
```

### Create Appointment

```
POST /api/v1/appointments
Content-Type: application/json
```

Request Body:

```json
{
  "patientId": "PAT-12345",
  "providerId": "PROV-54321",
  "startTime": "2023-05-10T14:00:00Z",
  "endTime": "2023-05-10T14:30:00Z",
  "type": "New Patient",
  "reason": "Annual physical",
  "notes": "Patient is new to practice",
  "locationId": "LOC-789"
}
```

Response: Newly created appointment object

## Provider Endpoints

### Get Providers

```
GET /api/v1/providers
```

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `specialty` | string | Filter by specialty |
| `location_id` | string | Filter by location |
| `available` | boolean | Filter by availability |
| `limit` | integer | Number of results (default: 20, max: 100) |
| `offset` | integer | Pagination offset |

Response:

```json
{
  "total": 15,
  "limit": 20,
  "offset": 0,
  "providers": [
    {
      "id": "PROV-54321",
      "npi": "1234567890",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "credentials": "MD",
      "specialty": "Family Medicine",
      "email": "sarah.johnson@example.com",
      "phone": "555-444-3333",
      "active": true,
      "locations": [
        {
          "id": "LOC-789",
          "name": "Main Clinic"
        },
        {
          "id": "LOC-456",
          "name": "North Clinic"
        }
      ],
      "schedule": {
        "monday": {"start": "08:00", "end": "17:00"},
        "tuesday": {"start": "08:00", "end": "17:00"},
        "wednesday": {"start": "08:00", "end": "17:00"},
        "thursday": {"start": "08:00", "end": "17:00"},
        "friday": {"start": "08:00", "end": "12:00"}
      },
      "_links": {
        "self": {"href": "/api/v1/providers/PROV-54321"},
        "appointments": {"href": "/api/v1/providers/PROV-54321/appointments"}
      }
    },
    // Additional providers...
  ]
}
```

## Medical Records Endpoints

### Get Patient Records

```
GET /api/v1/patients/{patient_id}/records
```

Path Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | string | Practice Studio patient ID |

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by record type |
| `from_date` | date | Records from this date |
| `to_date` | date | Records until this date |
| `limit` | integer | Number of results (default: 20, max: 100) |
| `offset` | integer | Pagination offset |

Response:

```json
{
  "total": 8,
  "limit": 20,
  "offset": 0,
  "records": [
    {
      "id": "REC-12345",
      "patientId": "PAT-12345",
      "providerId": "PROV-54321",
      "type": "Progress Note",
      "date": "2023-02-15T09:30:00Z",
      "title": "Follow-up Visit",
      "content": {
        "subjective": "Patient reports improvement in symptoms...",
        "objective": "BP 120/80, Pulse 72, Temp 98.6F...",
        "assessment": "Hypertension, well-controlled...",
        "plan": "Continue current medications..."
      },
      "attachments": [
        {
          "id": "ATT-987",
          "filename": "lab_results.pdf",
          "contentType": "application/pdf",
          "size": 245789,
          "uploadedAt": "2023-02-15T10:15:00Z",
          "_links": {
            "download": {"href": "/api/v1/attachments/ATT-987/download"}
          }
        }
      ],
      "_links": {
        "self": {"href": "/api/v1/records/REC-12345"},
        "patient": {"href": "/api/v1/patients/PAT-12345"},
        "provider": {"href": "/api/v1/providers/PROV-54321"}
      }
    },
    // Additional records...
  ]
}
```

## Billing Endpoints

### Get Patient Invoices

```
GET /api/v1/patients/{patient_id}/invoices
```

Path Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `patient_id` | string | Practice Studio patient ID |

Query Parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (open, paid, overdue) |
| `from_date` | date | Invoices from this date |
| `to_date` | date | Invoices until this date |
| `limit` | integer | Number of results (default: 20, max: 100) |
| `offset` | integer | Pagination offset |

Response:

```json
{
  "total": 3,
  "limit": 20,
  "offset": 0,
  "invoices": [
    {
      "id": "INV-12345",
      "patientId": "PAT-12345",
      "date": "2023-01-15",
      "dueDate": "2023-02-15",
      "status": "paid",
      "amount": 150.00,
      "paidAmount": 150.00,
      "items": [
        {
          "code": "99213",
          "description": "Office visit, established patient",
          "unitPrice": 120.00,
          "quantity": 1,
          "total": 120.00
        },
        {
          "code": "85025",
          "description": "Complete CBC",
          "unitPrice": 30.00,
          "quantity": 1,
          "total": 30.00
        }
      ],
      "payments": [
        {
          "date": "2023-01-20",
          "method": "Insurance",
          "amount": 120.00,
          "reference": "INS-REF-456789"
        },
        {
          "date": "2023-01-25",
          "method": "Credit Card",
          "amount": 30.00,
          "reference": "CC-AUTH-123456"
        }
      ],
      "_links": {
        "self": {"href": "/api/v1/invoices/INV-12345"},
        "patient": {"href": "/api/v1/patients/PAT-12345"},
        "pdf": {"href": "/api/v1/invoices/INV-12345/pdf"}
      }
    },
    // Additional invoices...
  ]
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Validation failed for one or more fields",
    "details": [
      {
        "field": "dateOfBirth",
        "issue": "must be a valid date in the past"
      },
      {
        "field": "email",
        "issue": "must be a valid email address"
      }
    ],
    "request_id": "req-abc-123-xyz-789"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_request` | Request validation failed |
| 401 | `unauthorized` | Authentication required |
| 403 | `forbidden` | Permission denied |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Resource conflict (e.g., duplicate) |
| 422 | `unprocessable_entity` | Request semantically incorrect |
| 429 | `too_many_requests` | Rate limit exceeded |
| 500 | `server_error` | Internal server error |
| 503 | `service_unavailable` | Service temporarily unavailable |

## Webhooks

Practice Studio can send webhook notifications for important events:

### Webhook Events

| Event Type | Description |
|------------|-------------|
| `patient.created` | New patient created |
| `patient.updated` | Patient information updated |
| `appointment.created` | New appointment scheduled |
| `appointment.updated` | Appointment details updated |
| `appointment.canceled` | Appointment canceled |
| `appointment.completed` | Appointment marked as completed |
| `record.created` | New medical record created |
| `invoice.created` | New invoice generated |
| `invoice.paid` | Invoice marked as paid |

### Webhook Payload

```json
{
  "event": "appointment.created",
  "timestamp": "2023-03-15T14:30:00Z",
  "data": {
    "id": "APPT-12345",
    "patientId": "PAT-12345",
    "providerId": "PROV-54321",
    "startTime": "2023-04-15T10:00:00Z",
    "endTime": "2023-04-15T10:30:00Z",
    "type": "Follow-up",
    "status": "scheduled"
  }
}
```

### Webhook Authentication

Webhooks include a signature header for verification:

```
X-PracticeStudio-Signature: t=1614556800,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

The signature is an HMAC-SHA256 of the payload using your webhook secret.

## FHIR API

Practice Studio also provides a FHIR-compliant API for healthcare interoperability:

```
Base URL: https://api.practicestudio.com/fhir/r4
```

See the [FHIR Integration Guide](./fhir-integration.md) for detailed documentation.

## Changelog

### v1 (Current)
- Initial stable API release

### v2 (Beta)
- Added support for bulk operations
- Enhanced search capabilities
- Improved error responses
- Added FHIR R4 support
