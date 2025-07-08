# Client Portal API

This directory contains the client portal API for the EyewearML platform. The client portal allows clients to manage their platform accounts, view reports, and access metrics.

## Overview

The client portal API is built using FastAPI and provides the following functionality:

- Client management
- Platform account management
- Report management
- Scheduled report management
- Metrics and dashboard data

## API Structure

The API is structured as follows:

- **Routers**: API endpoints are defined in the `src/api/routers/client_portal.py` file.
- **Models**: Data models are defined in the `src/api/models/client_portal.py` file.
- **Services**: Business logic is implemented in the `src/api/services/` directory.
- **Database**: Database models are defined in the `src/api/models/db_models.py` file.
- **Authentication**: Authentication is handled by the `src/api/dependencies/auth.py` file.

## Endpoints

### Client Management

- `POST /client-portal/clients`: Create a new client
- `GET /client-portal/clients`: Get a list of clients
- `GET /client-portal/clients/{client_id}`: Get a specific client
- `PUT /client-portal/clients/{client_id}`: Update a client
- `DELETE /client-portal/clients/{client_id}`: Delete a client (mark as inactive)

### Platform Account Management

- `POST /client-portal/platform-accounts`: Create a new platform account
- `GET /client-portal/platform-accounts`: Get a list of platform accounts
- `GET /client-portal/platform-accounts/{account_id}`: Get a specific platform account
- `PUT /client-portal/platform-accounts/{account_id}`: Update a platform account
- `DELETE /client-portal/platform-accounts/{account_id}`: Delete a platform account

### Report Management

- `POST /client-portal/reports`: Create a new report
- `GET /client-portal/reports`: Get a list of reports
- `GET /client-portal/reports/{report_id}`: Get a specific report
- `PUT /client-portal/reports/{report_id}`: Update a report
- `DELETE /client-portal/reports/{report_id}`: Delete a report
- `POST /client-portal/reports/{report_id}/run`: Run a report and return the results

### Scheduled Report Management

- `POST /client-portal/scheduled-reports`: Create a new scheduled report
- `GET /client-portal/scheduled-reports`: Get a list of scheduled reports
- `GET /client-portal/scheduled-reports/{scheduled_report_id}`: Get a specific scheduled report
- `PUT /client-portal/scheduled-reports/{scheduled_report_id}`: Update a scheduled report
- `DELETE /client-portal/scheduled-reports/{scheduled_report_id}`: Delete a scheduled report

### Metrics

- `POST /client-portal/metrics`: Get metrics data based on the request parameters
- `GET /client-portal/metrics/dashboard`: Get metrics data for the dashboard

## Authentication

The API uses JWT-based authentication. To access the API, you need to include an `Authorization` header with a valid JWT token:

```
Authorization: Bearer <token>
```

You can obtain a token by logging in with the `/auth/login` endpoint.

## Running the API

To run the API, use the following command:

```bash
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

This will start the API server on port 8000 with auto-reload enabled.

## Testing the API

A test script is provided in `src/api/tests/test_client_portal_api.py` to test the API endpoints. To run the tests, first start the API server, then run the test script:

```bash
python src/api/tests/test_client_portal_api.py
```

The test script will make requests to the API endpoints and print the responses. It uses a mock JWT token for authentication, so you don't need to log in first.

## Development

### Adding a New Endpoint

To add a new endpoint to the API, follow these steps:

1. Define the data models in `src/api/models/client_portal.py`.
2. Implement the business logic in a service class in the `src/api/services/` directory.
3. Add the endpoint to the router in `src/api/routers/client_portal.py`.
4. Update the tests in `src/api/tests/test_client_portal_api.py`.

### Database Models

The API uses SQLAlchemy for database operations. Database models are defined in `src/api/models/db_models.py`. The following models are available:

- `Client`: Client information
- `PlatformAccount`: Platform account information
- `Report`: Report configuration
- `ScheduledReport`: Scheduled report configuration
- `ReportData`: Report data
- `MetricsCache`: Cached metrics data
- `Notification`: Notification information

### Authentication and Authorization

Authentication is handled by the `src/api/dependencies/auth.py` file. The `get_current_active_user` dependency is used to authenticate requests and get the current user's information.

Authorization is handled at the endpoint level. Each endpoint checks if the user has permission to access the requested resource.

## Future Improvements

- Implement database migrations
- Add unit tests
- Add integration tests
- Add API documentation with Swagger/OpenAPI
- Implement rate limiting
- Implement caching
- Add support for multiple authentication methods
- Add support for role-based access control
