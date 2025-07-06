# Region-Specific Data Storage Architecture

## Overview

This document describes the implementation of region-specific data storage in the EyewearML platform, designed to ensure compliance with data residency requirements like GDPR (EU) while optimizing performance for users worldwide.

## Rationale

Different regions across the world have specific data residency requirements:

- **European Union (GDPR)**: Requires personal data of EU citizens to be stored within EU borders
- **Other regions**: May have similar requirements or restrictions

Additionally, storing data closer to users provides performance benefits:

- Reduced latency for data retrieval operations
- Better user experience for region-specific customers
- More efficient use of network resources

## Architecture

### Key Components

Our region-specific data storage implementation consists of:

1. **Region Configuration** (`src/config/region_config.py`):
   - Defines supported regions (EU, NA)
   - Provides region determination logic
   - Contains region-specific database configuration

2. **Database Configuration** (`src/config/database_config.py`):
   - Region-aware database connection functions
   - Compatibility layer for existing code

3. **API Layer Integration**:
   - Region detection middleware
   - Region-specific data routing
   - User region preference management

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌────────────────┐
│  Client     │────▶│  FastAPI    │────▶│ Region         │
│  Request    │     │  Backend    │     │ Determination  │
└─────────────┘     └─────────────┘     └────────────────┘
                                               │
                                               ▼
┌─────────────┐     ┌─────────────┐     ┌────────────────┐
│  Database   │◀────│  Database   │◀────│ Route to       │
│  EU Region  │     │  Access     │     │ Region DB      │
└─────────────┘     └─────────────┘     └────────────────┘
                          ▲
                          │
                    ┌────────────────┐
                    │  Database      │
                    │  NA Region     │
                    └────────────────┘
```

## Region Determination Logic

The system determines the appropriate region for data storage using a priority-based approach:

1. **Explicit region header**: `X-Data-Region` header in the request
2. **User preferences**: Region stored in the user's profile
3. **IP-based geolocation**: Determine region based on client IP address
4. **Default region**: Fall back to North America (NA)

## Configuration

Region-specific database configurations are defined in environment variables with region prefixes:

```
# EU Region
EU_POSTGRES_HOST=postgres.eu-west-1.varai.ai
EU_MONGODB_URL=mongodb://mongodb.eu-west-1:27017

# NA Region
NA_POSTGRES_HOST=postgres.us-east-1.varai.ai
NA_MONGODB_URL=mongodb://mongodb.us-east-1:27017
```

See `src/config/.env.region-example` for a complete list of configuration variables.

## Staging Environment

For the staging environment, all data is stored in a single datastore in North America:

- Simpler configuration for testing and development
- Region field is still maintained in the data model
- Region routing logic still functions but points to the same database

## Implementation Examples

### Fast API Usage

```python
from fastapi import FastAPI, Request, Depends
from src.config.region_config import get_region_from_request
from src.config.database_config import get_region_postgres_config

@app.get("/api/frames/")
async def get_frames(request: Request):
    # Get the appropriate region
    region = get_region_from_request(request)
    
    # Get region-specific database config
    db_config = get_region_postgres_config(request)
    
    # Use the config to connect to the right database
    # ...
```

See `src/examples/region_aware_api_example.py` for a complete working example.

## Testing Region-Specific Behavior

For testing region-specific routing:

1. **Setting region header**:
   ```bash
   curl -H "X-Data-Region: eu" https://api.eyewearml.com/frames
   ```

2. **Testing user preferences**:
   ```bash
   # First set preference
   curl -X POST https://api.eyewearml.com/api/users/region-preference -d '{"preference": "eu"}'
   
   # Then make regular requests
   curl https://api.eyewearml.com/api/frames/
   ```

3. **IP-based routing** is handled automatically based on the client's IP address.

## Adding New Regions

To add support for a new region:

1. Update `Region` enum in `src/config/region_config.py`
2. Add region-specific database configuration to `REGION_DB_CONFIG`
3. Add environment variables for the new region
4. Update IP detection logic if needed

## Compliance Considerations

When using region-specific data storage:

- Ensure all personal data is stored in the appropriate region
- Configure backups to remain within regional boundaries
- Consider legal implications of cross-region data transfers
- Document data flow for compliance audits

## Performance Monitoring

The system includes monitoring endpoints to verify region-specific behavior:

- `/api/system/region-status` - Shows connection status for all regional databases
- Database metrics should be aggregated by region for performance dashboards

## References

- [GDPR Article 44-50](https://gdpr-info.eu/chapter-5/) - International transfers of personal data
- [Cloud Provider Region Documentation](https://cloud.google.com/about/locations)
