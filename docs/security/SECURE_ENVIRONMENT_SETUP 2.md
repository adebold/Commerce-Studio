# Secure Environment Setup Guide
## Commerce Studio - Security-First Configuration

### 🔒 Security Principles

This guide ensures your Commerce Studio environment is configured securely while resolving the "Internal server error" issue.

---

## 🛡️ Security Checklist

### Before You Start
- [ ] Ensure you're on a secure, private network
- [ ] Verify no one can see your screen during setup
- [ ] Have a secure password manager ready
- [ ] Ensure your local machine is encrypted

---

## 🔐 Step 1: Secure Service Account Creation

### Create a Dedicated Service Account (Recommended)
```bash
# Set your project ID securely
export PROJECT_ID="eyewearml-conversational-ai"

# Create a dedicated service account for Commerce Studio
gcloud iam service-accounts create commerce-studio-dev \
    --display-name="Commerce Studio Development" \
    --description="Dedicated service account for Commerce Studio development environment"

# Grant minimal required permissions (principle of least privilege)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:commerce-studio-dev@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/dialogflow.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:commerce-studio-dev@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"
```

### Generate Secure Service Account Key
```bash
# Create a secure directory for credentials
mkdir -p ~/.config/commerce-studio/credentials
chmod 700 ~/.config/commerce-studio/credentials

# Generate service account key in secure location
gcloud iam service-accounts keys create \
    ~/.config/commerce-studio/credentials/service-account-key.json \
    --iam-account=commerce-studio-dev@$PROJECT_ID.iam.gserviceaccount.com

# Secure the key file
chmod 600 ~/.config/commerce-studio/credentials/service-account-key.json
```

---

## 🔑 Step 2: Secure Environment Variable Setup

### Option A: Using Secure Environment File (Recommended)
```bash
# Create secure .env file
cat > .env.secure << 'EOF'
# Commerce Studio Secure Environment Configuration
# This file contains sensitive information - never commit to version control

# Google Cloud Authentication (secure path)
GOOGLE_APPLICATION_CREDENTIALS="${HOME}/.config/commerce-studio/credentials/service-account-key.json"

# Dialogflow Configuration (replace with your actual agent ID)
DIALOGFLOW_AGENT_ID="REPLACE_WITH_YOUR_AGENT_ID"

# Security tokens (generate secure random values)
JWT_SECRET="$(openssl rand -base64 32)"
SESSION_SECRET="$(openssl rand -base64 32)"
ENCRYPTION_KEY="$(openssl rand -base64 32)"

# Environment
NODE_ENV="development"
LOG_LEVEL="info"
EOF

# Secure the environment file
chmod 600 .env.secure

# Add to .gitignore to prevent accidental commits
echo ".env.secure" >> .gitignore
echo ".env" >> .gitignore
echo "*.key" >> .gitignore
echo "credentials/" >> .gitignore
```

### Option B: Using System Environment Variables (Most Secure)
```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
# These will persist across sessions but won't be in your project directory

echo 'export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/commerce-studio/credentials/service-account-key.json"' >> ~/.bashrc
echo 'export DIALOGFLOW_AGENT_ID="your-actual-agent-id-here"' >> ~/.bashrc
echo 'export JWT_SECRET="'$(openssl rand -base64 32)'"' >> ~/.bashrc
echo 'export SESSION_SECRET="'$(openssl rand -base64 32)'"' >> ~/.bashrc
echo 'export ENCRYPTION_KEY="'$(openssl rand -base64 32)'"' >> ~/.bashrc

# Reload your shell
source ~/.bashrc
```

---

## 🔍 Step 3: Secure Validation

### Validate Security Setup
```bash
# Check file permissions
ls -la ~/.config/commerce-studio/credentials/
# Should show: -rw------- (600 permissions)

# Validate service account key without exposing content
if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "✅ Service account key file exists"
    echo "📏 File size: $(stat -f%z "$GOOGLE_APPLICATION_CREDENTIALS" 2>/dev/null || stat -c%s "$GOOGLE_APPLICATION_CREDENTIALS") bytes"
    
    # Validate JSON structure without showing content
    if python3 -m json.tool "$GOOGLE_APPLICATION_CREDENTIALS" > /dev/null 2>&1; then
        echo "✅ Service account key is valid JSON"
    else
        echo "❌ Service account key is not valid JSON"
    fi
else
    echo "❌ Service account key file not found"
fi

# Test authentication without exposing tokens
if gcloud auth application-default print-access-token > /dev/null 2>&1; then
    echo "✅ Google Cloud authentication working"
else
    echo "❌ Google Cloud authentication failed"
fi
```

---

## 🚀 Step 4: Secure Application Startup

### Create Secure Startup Script
```bash
# Create secure startup script
cat > scripts/secure-start.sh << 'EOF'
#!/bin/bash

# Commerce Studio Secure Startup Script

echo "🔒 Starting Commerce Studio with security checks..."

# Check for required environment variables
required_vars=("GOOGLE_APPLICATION_CREDENTIALS" "DIALOGFLOW_AGENT_ID")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables: ${missing_vars[*]}"
    echo "Please run the secure setup first."
    exit 1
fi

# Validate credentials file exists and is secure
if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "❌ Credentials file not found: $GOOGLE_APPLICATION_CREDENTIALS"
    exit 1
fi

# Check file permissions
perms=$(stat -c "%a" "$GOOGLE_APPLICATION_CREDENTIALS" 2>/dev/null || stat -f "%A" "$GOOGLE_APPLICATION_CREDENTIALS")
if [ "$perms" != "600" ]; then
    echo "⚠️  Warning: Credentials file permissions are not secure ($perms)"
    echo "Fixing permissions..."
    chmod 600 "$GOOGLE_APPLICATION_CREDENTIALS"
fi

# Load environment from secure file if it exists
if [ -f ".env.secure" ]; then
    echo "📋 Loading secure environment configuration..."
    set -a  # automatically export all variables
    source .env.secure
    set +a
fi

echo "✅ Security checks passed"
echo "🚀 Starting application..."

# Start your application here
npm start
EOF

chmod +x scripts/secure-start.sh
```

---

## 🛡️ Step 5: Security Best Practices

### Ongoing Security Measures

1. **Credential Rotation**
   ```bash
   # Rotate service account keys every 90 days
   # Set a calendar reminder to run this:
   gcloud iam service-accounts keys create new-key.json \
       --iam-account=commerce-studio-dev@$PROJECT_ID.iam.gserviceaccount.com
   
   # After testing, delete the old key
   gcloud iam service-accounts keys delete OLD_KEY_ID \
       --iam-account=commerce-studio-dev@$PROJECT_ID.iam.gserviceaccount.com
   ```

2. **Environment Isolation**
   ```bash
   # Never use production credentials in development
   # Use separate service accounts for each environment
   # development: commerce-studio-dev
   # staging: commerce-studio-staging  
   # production: commerce-studio-prod
   ```

3. **Access Monitoring**
   ```bash
   # Monitor service account usage
   gcloud logging read "protoPayload.authenticationInfo.principalEmail:commerce-studio-dev@$PROJECT_ID.iam.gserviceaccount.com" \
       --limit=10 --format="table(timestamp,protoPayload.methodName,protoPayload.resourceName)"
   ```

---

## 🚨 Security Incident Response

### If Credentials Are Compromised
```bash
# Immediately disable the compromised key
gcloud iam service-accounts keys delete COMPROMISED_KEY_ID \
    --iam-account=commerce-studio-dev@$PROJECT_ID.iam.gserviceaccount.com

# Generate new key
gcloud iam service-accounts keys create new-emergency-key.json \
    --iam-account=commerce-studio-dev@$PROJECT_ID.iam.gserviceaccount.com

# Update environment variables
export GOOGLE_APPLICATION_CREDENTIALS="./new-emergency-key.json"

# Restart application
./scripts/secure-start.sh
```

---

## ✅ Security Validation Checklist

Before going to production:
- [ ] Service account uses minimal required permissions
- [ ] Credentials file has 600 permissions
- [ ] No credentials in version control (.gitignore configured)
- [ ] Environment variables are not logged
- [ ] Separate service accounts for each environment
- [ ] Credential rotation schedule established
- [ ] Security monitoring enabled
- [ ] Incident response plan documented

---

## 🎯 Final Security Test

Run this command to verify your secure setup:
```bash
# Test the secure configuration
node scripts/diagnose-centralized-config.js

# Should show:
# ✅ All configuration files exist
# ✅ Essential environment variables set
# ✅ Credentials file exists and is secure
```

Your "Internal server error" will be resolved while maintaining enterprise-grade security.