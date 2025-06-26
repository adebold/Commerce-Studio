# Production Environment Variables for VARAi Commerce Studio

# GCP Configuration
gcp_project_id = "varai-commerce-studio"
gcp_region     = "us-central1"
gcp_zone       = "us-central1-a"
gcp_alternative_zone = "us-central1-b"

# Domain Configuration
domain_name = "commerce-studio.varai.com"

# Network Configuration
subnet_cidr = ["10.0.0.0/24"]

# MongoDB Atlas Configuration
mongodb_atlas_org_id = "YOUR_MONGODB_ATLAS_ORG_ID"
mongodb_atlas_region = "US_CENTRAL"
mongodb_username = "varai_admin"
mongodb_password = "YOUR_MONGODB_PASSWORD"

# Kubernetes Configuration
kubernetes_config_path = "~/.kube/config"
image_prefix = "varai/commerce-studio"
image_tag = "latest"

# Security Configuration
secret_key = "YOUR_SECRET_KEY"
auth_secret = "YOUR_AUTH_SECRET"
auth_issuer = "https://commerce-studio.varai.com"
auth_audience = "varai-commerce-studio"

# API Keys
deepseek_api_key = "YOUR_DEEPSEEK_API_KEY"
mongodb_atlas_public_key = "YOUR_MONGODB_ATLAS_PUBLIC_KEY"
mongodb_atlas_private_key = "YOUR_MONGODB_ATLAS_PRIVATE_KEY"

# Stripe Configuration
stripe_publishable_key = "pk_live_51OjQqsFRqSlo4PSXdkemMl6hFHfsyr9C2AhXqnHOwpT01wp9Bp8RDag6H5DGwsIw3jiiUfrDPX3tEPe1owj37Vmo002g091T5o"
stripe_secret_key = "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"

# Monitoring Configuration
notification_channels = [
  "projects/varai-commerce-studio/notificationChannels/YOUR_NOTIFICATION_CHANNEL_ID"
]
alert_email = "alerts@varai.com"

# Encryption Configuration
gcp_service_account_key = "YOUR_GCP_SERVICE_ACCOUNT_KEY"
gcp_kms_key_version_id = "YOUR_KMS_KEY_VERSION_ID"

# SLO Configuration
slo_availability_goal = 0.9995
slo_latency_goal = 0.99
slo_latency_threshold = 0.5