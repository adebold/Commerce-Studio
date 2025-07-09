# Commerce Studio - Google Cloud Platform Deployment Guide

This guide provides step-by-step instructions for deploying the entire Commerce Studio platform to Google Cloud Platform (GCP).

## 1. Prerequisites

-   A Google Cloud Platform account with billing enabled.
-   The `gcloud` CLI installed and authenticated.
-   A local clone of the Commerce Studio repository.

## 2. Cloud Infrastructure Setup

### 2.1. Create a New GCP Project

1.  Go to the [GCP Console](https://console.cloud.google.com/).
2.  Create a new project and note the **Project ID**.

### 2.2. Enable APIs

Enable the following APIs for your project:

-   Cloud Build API
-   Cloud Run API
-   Secret Manager API
-   Cloud SQL Admin API
-   Redis API

You can enable them with the following `gcloud` commands:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
```

### 2.3. Provision PostgreSQL Database

1.  Go to the [Cloud SQL instances page](https://console.cloud.google.com/sql/instances).
2.  Create a new PostgreSQL instance.
3.  Set a strong password for the `postgres` user.
4.  Create a new database named `commercestudio`.
5.  Note the **Connection name** of the instance.

### 2.4. Provision Redis Instance

1.  Go to the [Memorystore for Redis instances page](https://console.cloud.google.com/memorystore/redis/instances).
2.  Create a new Redis instance.
3.  Note the **Host** and **Port** of the instance.

### 2.5. Create GCS Bucket

1.  Go to the [Cloud Storage browser](https://console.cloud.google.com/storage/browser).
2.  Create a new bucket for storing the generated storefronts.
3.  Note the **Bucket name**.

## 3. Environment Variable Configuration

### 3.1. Create `.env` Files

Create a `.env` file in each of the following service directories:

-   `services/tenant-management`
-   `services/store-provisioning`
-   `services/ecommerce-integration`

Populate these files with the production values for the environment variables defined in the `.env.example` files.

### 3.2. Store Secrets in Secret Manager

Store all sensitive data (API keys, database passwords, etc.) in Google Secret Manager.

1.  Go to the [Secret Manager page](https://console.cloud.google.com/security/secret-manager).
2.  Create secrets for the following:
    -   `DATABASE_URL`
    -   `REDIS_HOST`
    -   `REDIS_PORT`
    -   `ADMIN_API_KEY`

## 4. Deploy the Platform

### 4.1. Update `cloudbuild.yaml`

Update the `cloudbuild.yaml` file at the root of the project to reference the secrets you created in Secret Manager.

### 4.2. Run the Deployment

Run the following command from the root of the project:

```bash
gcloud builds submit --config cloudbuild.yaml .
```

This will trigger a Cloud Build job that will:

1.  Build a Docker image for each microservice.
2.  Push the images to Google Container Registry.
3.  Deploy each service to Google Cloud Run.

## 5. Post-Deployment Steps

### 5.1. Set Up Demo Tenant

Once the deployment is complete, you can set up a demo tenant by running the `setup-demo-tenant.js` script.

1.  Get the URLs of the deployed services from the Cloud Run dashboard.
2.  Update the `TENANT_API_URL` and other service URLs in the script.
3.  Run the script:
    ```bash
    node scripts/setup-demo-tenant.js
    ```

### 5.2. Monitor the Platform

-   Use the **Management Portal** to manage tenants and monitor analytics.
-   Use the **Bull Board** at `/admin/queues` on the Store Provisioning Service to monitor provisioning jobs.
-   Use **Google Cloud's operations suite** (formerly Stackdriver) to monitor the health and performance of your services.

This guide provides a comprehensive overview of the deployment process. For more detailed information on any of these steps, please refer to the official Google Cloud documentation.