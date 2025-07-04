# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the VARAi platform. ADRs are documents that capture important architectural decisions made along with their context and consequences.

## What is an ADR?

An Architecture Decision Record is a document that captures an important architectural decision made along with its context and consequences.

An ADR has the following sections:

- **Title**: Short phrase describing the decision
- **Status**: Proposed, Accepted, Deprecated, or Superseded
- **Context**: The forces at play, including technological, business, and team constraints
- **Decision**: The decision that was made
- **Consequences**: The resulting context after applying the decision
- **Compliance**: How the implementation complies with the decision
- **Notes**: Additional notes or references

## ADR List

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-0001](./adr-0001-microservices-architecture.md) | Adopt Microservices Architecture | Accepted | 2024-01-15 |
| [ADR-0002](./adr-0002-mongodb-as-primary-database.md) | Use MongoDB as Primary Database | Accepted | 2024-01-20 |
| [ADR-0003](./adr-0003-react-typescript-frontend.md) | React with TypeScript for Frontend | Accepted | 2024-01-25 |
| [ADR-0004](./adr-0004-fastapi-for-backend-services.md) | FastAPI for Backend Services | Accepted | 2024-02-01 |
| [ADR-0005](./adr-0005-kubernetes-for-deployment.md) | Kubernetes for Deployment | Accepted | 2024-02-10 |
| [ADR-0006](./adr-0006-multi-tenant-architecture.md) | Multi-tenant Architecture | Accepted | 2024-02-15 |
| [ADR-0007](./adr-0007-event-driven-architecture.md) | Event-Driven Architecture for Analytics | Accepted | 2024-02-20 |
| [ADR-0008](./adr-0008-tensorflow-for-ml-models.md) | TensorFlow for ML Models | Accepted | 2024-03-01 |
| [ADR-0009](./adr-0009-oauth2-for-authentication.md) | OAuth 2.0 for Authentication | Accepted | 2024-03-10 |
| [ADR-0010](./adr-0010-platform-adapters-for-integrations.md) | Platform Adapters for E-commerce Integrations | Accepted | 2024-03-15 |

## Creating a New ADR

To create a new ADR:

1. Copy the [ADR template](./adr-template.md) to a new file named `adr-NNNN-title.md` where `NNNN` is the next available ADR number and `title` is a short hyphenated title.
2. Fill in the ADR with the relevant information.
3. Update this index file with a link to the new ADR.
4. Submit a pull request for review.

## ADR Lifecycle

ADRs go through the following lifecycle:

1. **Proposed**: The ADR is proposed and under discussion.
2. **Accepted**: The ADR has been accepted and is being implemented.
3. **Deprecated**: The ADR is no longer relevant but has not been explicitly superseded.
4. **Superseded**: The ADR has been explicitly superseded by another ADR.