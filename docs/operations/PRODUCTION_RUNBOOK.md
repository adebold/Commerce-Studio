# Production Operations Runbook

## 🚀 Overview

This runbook provides standard operating procedures (SOPs) for managing the Commerce Studio production environment. It is intended for DevOps and operations teams responsible for deployment, monitoring, and maintenance.

## 1. Production Deployment

### Prerequisites

-   Access to the Google Cloud Platform (GCP) project.
-   `gcloud` CLI authenticated with appropriate permissions.
-   `kubectl` configured to connect to the production GKE cluster.

### Deployment Steps

1.  **Build and Push Docker Images**:
    ```bash
    gcloud builds submit --config cloudbuild.yaml .
    ```

2.  **Deploy to Google Cloud Run**:
    The `cloudbuild.yaml` configuration handles deployment to Cloud Run. Monitor the build process in the GCP console.

3.  **Verify Deployment**:
    -   Check the status of the Cloud Run services.
    -   Access the production API and demo store URLs to ensure they are live.
    -   Run production health checks:
        ```bash
        curl https://commerce-studio-api-ddtojwjn7a-uc.a.run.app/api/v1/health
        ```

## 2. Monitoring and Alerting

### Key Metrics to Monitor

-   **API Latency**: Response times for all production endpoints.
-   **Error Rates**: HTTP 5xx errors from the API and ML services.
-   **CPU/Memory Utilization**: Resource usage for all Cloud Run services.
-   **Recommendation Accuracy**: Monitor the performance of the ML models.

### Dashboards

-   **GCP Monitoring**: Use the built-in dashboards in the GCP console to monitor Cloud Run services.
-   **Custom Dashboards**: Access custom Grafana dashboards for in-depth analytics on recommendation performance and user engagement.

### Alerting

Alerts are configured in GCP Monitoring to notify the on-call team for:

-   High API latency (>1s for 5 minutes).
-   Spikes in 5xx error rates.
-   High resource utilization.

## 3. Troubleshooting

### Common Issues

-   **API Unresponsive**:
    1.  Check the status of the Cloud Run service in the GCP console.
    2.  Review the logs for any errors.
    3.  If necessary, roll back to a previous stable revision.

-   **High Latency**:
    1.  Investigate the logs for the affected service to identify bottlenecks.
    2.  Check the performance of downstream services (e.g., database, ML models).
    3.  Consider scaling up the number of instances for the service.

-   **Incorrect Recommendations**:
    1.  Notify the data science team with the `recommendationId` and user context.
    2.  Review the ML model performance dashboards.
    3.  Check the health of the FastAPI ML services.

## 4. Security and Compliance

-   **Access Control**: Access to the production GCP project is restricted to authorized personnel via IAM roles.
-   **Data Privacy**: All user data is encrypted at rest and in transit.
-   **Regular Audits**: Perform regular security audits of the production environment.

---

**Last Updated**: July 2025
**Version**: 1.0.0