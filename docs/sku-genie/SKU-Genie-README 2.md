# SKU-Genie

SKU-Genie is a comprehensive data quality management system for the eyewear-ml platform. It handles data from multiple sources, fixes quality issues, and maintains data integrity on an ongoing basis.

## Overview

SKU-Genie addresses the following key challenges:

1. **Data Quality Issues**: Fixes missing required fields, invalid values, and inconsistencies in product data
2. **Multi-Source Integration**: Handles data from Apify imports, manual uploads, Shopify, and client APIs
3. **Client Onboarding**: Improves data hygiene when new clients connect to the platform
4. **Ongoing Maintenance**: Ensures data quality is maintained over time through scheduled audits and fixes
5. **Billing and Updates**: Manages client billing, usage tracking, and over-the-air updates

## Documentation

- [Project Plan](./SKU-Genie-Project-Plan.md) - High-level overview of the project, including objectives, requirements, and architecture
- [Technical Specification](./SKU-Genie-Technical-Specification.md) - Detailed technical specifications, including interfaces, data models, and implementation details
- [Implementation Roadmap](./SKU-Genie-Implementation-Roadmap.md) - Timeline, milestones, and task breakdown for the development process
- [Billing and Updates](./SKU-Genie-Billing-and-Updates.md) - Billing system, client reporting, and update management features
- [Integration with Existing Systems](./SKU-Genie-Integration-with-Existing-Systems.md) - How SKU-Genie integrates with existing analytics, monitoring, and other platform systems

## Architecture

SKU-Genie consists of the following core components:

1. **Data Source Adapters**: Interface with various data sources and standardize input formats
   - Apify Adapter
   - Manual Upload Adapter
   - Shopify Adapter
   - Client API Adapter

2. **Data Quality Engine**: Ensures data meets quality standards regardless of source
   - Field Validator
   - Schema Validator
   - Field Fixer
   - Value Normalizer

3. **Synchronization Manager**: Handles data merging and conflict resolution
   - Conflict Detector
   - Conflict Resolver
   - Batch Processor

4. **Maintenance Module**: Maintains data quality over time
   - Scheduler
   - Audit Runner
   - Report Generator

5. **API Module**: Provides interfaces for interacting with SKU-Genie
   - REST API
   - CLI Interface

6. **Billing and Updates System**: Manages client billing and updates
   - Usage Tracking
   - Subscription Management
   - Client Reporting
   - Update Notification

## Getting Started

### Prerequisites

- Python 3.10+
- MongoDB Atlas account
- Access to the eyewear-ml repository

### Development Setup

1. Clone the eyewear-ml repository:
   ```bash
   git clone https://github.com/your-org/eyewear-ml.git
   cd eyewear-ml
   ```

2. Create a new branch for SKU-Genie:
   ```bash
   git checkout -b feature/sku-genie
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB Atlas credentials
   ```

5. Run the development server:
   ```bash
   python -m eyewear_ml.server
   ```

### Project Structure

```
eyewear-ml/
├── src/
│   ├── sku_genie/
│   │   ├── __init__.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── models.py
│   │   │   └── utils.py
│   │   ├── data_sources/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── apify.py
│   │   │   ├── manual.py
│   │   │   └── shopify.py
│   │   ├── quality/
│   │   │   ├── __init__.py
│   │   │   ├── validator.py
│   │   │   ├── fixer.py
│   │   │   └── normalizer.py
│   │   ├── sync/
│   │   │   ├── __init__.py
│   │   │   ├── conflict.py
│   │   │   └── batch.py
│   │   ├── maintenance/
│   │   │   ├── __init__.py
│   │   │   ├── scheduler.py
│   │   │   └── audit.py
│   │   ├── billing/
│   │   │   ├── __init__.py
│   │   │   ├── usage.py
│   │   │   ├── subscription.py
│   │   │   └── reporting.py
│   │   ├── updates/
│   │   │   ├── __init__.py
│   │   │   ├── notification.py
│   │   │   ├── package.py
│   │   │   └── cloud_functions.py
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── rest.py
│   │       └── cli.py
│   └── eyewear_ml/
│       └── ... (existing code)
├── tests/
│   └── sku_genie/
│       ├── test_data_sources.py
│       ├── test_quality.py
│       ├── test_sync.py
│       ├── test_maintenance.py
│       ├── test_billing.py
│       └── test_updates.py
└── docs/
    ├── SKU-Genie-README.md
    ├── SKU-Genie-Project-Plan.md
    ├── SKU-Genie-Technical-Specification.md
    ├── SKU-Genie-Implementation-Roadmap.md
    ├── SKU-Genie-Billing-and-Updates.md
    └── SKU-Genie-Integration-with-Existing-Systems.md
```

## Development Workflow

1. **Feature Development**:
   - Create a feature branch from the `feature/sku-genie` branch
   - Implement the feature with tests
   - Submit a pull request to the `feature/sku-genie` branch

2. **Code Review**:
   - All pull requests require at least one review
   - CI/CD pipeline must pass
   - Code must follow project style guidelines

3. **Testing**:
   - Write unit tests for all new code
   - Add integration tests for component interactions
   - Ensure test coverage meets project standards

4. **Documentation**:
   - Update documentation for new features
   - Add docstrings to all public functions and classes
   - Keep the README up to date

## CLI Usage

Once implemented, SKU-Genie will provide a command-line interface:

```bash
# Client management
sku-genie client create --name "Acme Eyewear"
sku-genie client list

# Data source management
sku-genie source add --client-id acme-eyewear --type shopify --shop-url "https://acme-eyewear.myshopify.com"
sku-genie source list --client-id acme-eyewear

# Data import and processing
sku-genie import --client-id acme-eyewear --source-id shopify-1
sku-genie validate --client-id acme-eyewear
sku-genie fix --client-id acme-eyewear

# Maintenance
sku-genie maintenance schedule --client-id acme-eyewear --frequency "0 0 * * *"
sku-genie report --client-id acme-eyewear

# Billing and Subscriptions
sku-genie subscription create --client-id acme-eyewear --plan premium
sku-genie billing report --client-id acme-eyewear --month 2025-04

# Updates
sku-genie update check --client-id acme-eyewear
sku-genie update apply --client-id acme-eyewear --update-id update-123
```

## API Usage

SKU-Genie will also provide a REST API:

```python
import requests

# Create a client
response = requests.post(
    "http://localhost:8000/api/clients/",
    json={"name": "Acme Eyewear"}
)
client_id = response.json()["client_id"]

# Add a data source
response = requests.post(
    f"http://localhost:8000/api/clients/{client_id}/data-sources/",
    json={
        "source_type": "shopify",
        "connection_details": {
            "shop_url": "https://acme-eyewear.myshopify.com",
            "api_key": "...",
            "api_password": "..."
        }
    }
)
source_id = response.json()["source_id"]

# Import data
response = requests.post(
    f"http://localhost:8000/api/clients/{client_id}/import/",
    json={
        "source_id": source_id,
        "options": {
            "validate": True,
            "fix": True
        }
    }
)
job_id = response.json()["job_id"]

# Get import status
response = requests.get(
    f"http://localhost:8000/api/jobs/{job_id}"
)
status = response.json()["status"]

# Create subscription
response = requests.post(
    f"http://localhost:8000/api/clients/{client_id}/subscriptions/",
    json={
        "plan_type": "premium",
        "auto_update": True,
        "update_frequency": "daily"
    }
)
subscription = response.json()
```

## Commerce Studio Integration

SKU-Genie integrates with Commerce Studio to provide:

1. **Embedded Reports**
   - Data quality metrics
   - Job execution history
   - Billing and usage information

2. **Subscription Management**
   - Plan selection and modification
   - Update preferences
   - Billing history

3. **Update Notifications**
   - New update alerts
   - Update approval workflow
   - Update history

## Integration with Existing Systems

SKU-Genie integrates with several existing systems in the eyewear-ml platform:

1. **Analytics System**
   - Extends the existing analytics system for usage tracking
   - Adds data quality metrics
   - Provides client-facing reports

2. **Monitoring System**
   - Leverages the existing monitoring system for system health
   - Adds data quality monitoring
   - Implements alerts for quality issues

3. **Commerce Studio**
   - Embeds reports in the Commerce Studio dashboard
   - Provides subscription management interface
   - Implements update notification and approval workflow

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.