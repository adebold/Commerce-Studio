# Cloud Run Deployment Process Diagrams

This document provides visual representations of the deployment processes using Mermaid diagrams.

## Current Deployment Process

```mermaid
flowchart TD
    A[Developer] -->|Run deploy script| B[Authentication]
    B --> C[Set GCP Project]
    C --> D[Build Docker Image]
    D --> E[Configure Docker for GCR]
    E --> F[Tag Image]
    F --> G[Push Image to GCR]
    G --> H[Deploy to Cloud Run]
    H --> I[Get Service URL]
    I --> J[Test Deployment]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bbf,stroke:#333,stroke-width:2px
    style H fill:#bbf,stroke:#333,stroke-width:2px
    style J fill:#bfb,stroke:#333,stroke-width:2px
```

## Single Command Deployment Process

```mermaid
flowchart TD
    A[Developer] -->|Run single command| B[Authentication]
    B --> C[Set GCP Project]
    C --> D[gcloud run deploy --source]
    D -->|Cloud Build| E[Build Container]
    E --> F[Push to Artifact Registry]
    F --> G[Deploy to Cloud Run]
    G --> H[Get Service URL]
    H --> I[Test Deployment]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#ddd,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style F fill:#ddd,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style G fill:#bbf,stroke:#333,stroke-width:2px
    style I fill:#bfb,stroke:#333,stroke-width:2px
    
    subgraph "Handled by Cloud Build"
        E
        F
    end
```

## GitHub Actions CI/CD Process

```mermaid
flowchart TD
    A[Developer] -->|Push to Repository| B[GitHub Repository]
    B -->|Trigger Workflow| C[GitHub Actions]
    C --> D[Checkout Code]
    D --> E[Setup Google Cloud SDK]
    E --> F[gcloud run deploy --source]
    F -->|Cloud Build| G[Build Container]
    G --> H[Push to Artifact Registry]
    H --> I[Deploy to Cloud Run]
    I --> J[Get Service URL]
    J --> K[Test Deployment]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#ddd,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style H fill:#ddd,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style I fill:#bbf,stroke:#333,stroke-width:2px
    style K fill:#bfb,stroke:#333,stroke-width:2px
    
    subgraph "Handled by Cloud Build"
        G
        H
    end
    
    subgraph "Automated in GitHub Actions"
        D
        E
        F
        I
        J
        K
    end
```

## Deployment Architecture

```mermaid
flowchart LR
    A[Source Code] --> B[GitHub Repository]
    
    B -->|Manual Deploy| C[Single Command Deployment]
    B -->|Auto Deploy| D[GitHub Actions]
    
    C --> E[Cloud Build]
    D --> E
    
    E --> F[Artifact Registry]
    F --> G[Cloud Run]
    
    G --> H[API Service]
    G --> I[Frontend Service]
    
    H --> J[MongoDB Atlas]
    H --> K[Google Cloud Storage]
    
    I --> H
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bbf,stroke:#333,stroke-width:2px
    style H fill:#bfb,stroke:#333,stroke-width:2px
    style I fill:#bfb,stroke:#333,stroke-width:2px
```

## Deployment Decision Tree

```mermaid
flowchart TD
    A[Need to Deploy] --> B{Production Deploy?}
    B -->|Yes| C[Use GitHub Actions]
    B -->|No| D{Quick Test?}
    
    D -->|Yes| E[Use Single Command]
    D -->|No| F{Need CI/CD?}
    
    F -->|Yes| C
    F -->|No| E
    
    C --> G[Push to Repository]
    G --> H[Automatic Deployment]
    
    E --> I[Run gcloud Command]
    I --> J[Manual Deployment]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style H fill:#bfb,stroke:#333,stroke-width:2px
    style J fill:#bfb,stroke:#333,stroke-width:2px
```

## Implementation Timeline

```mermaid
gantt
    title Cloud Run Deployment Implementation
    dateFormat  YYYY-MM-DD
    section Single Command
    Set up script           :a1, 2025-04-17, 2h
    Test deployment         :a2, after a1, 1h
    Document process        :a3, after a2, 1h
    
    section GitHub Actions
    Create service account  :b1, 2025-04-18, 1h
    Set up GitHub Secrets   :b2, after b1, 30m
    Create workflow file    :b3, after b2, 1h
    Test workflow           :b4, after b3, 1h
    Document CI/CD process  :b5, after b4, 1h
    
    section Training
    Team training           :c1, 2025-04-19, 2h
```

These diagrams provide a visual representation of:
1. The current deployment process
2. The new single command deployment process
3. The GitHub Actions CI/CD process
4. The overall deployment architecture
5. A decision tree for choosing the right deployment method
6. An implementation timeline

Use these diagrams to help communicate the new deployment processes to your team.