# Complete Setup Steps - Commerce Studio Secure Configuration

## 🎯 Current Status
✅ Secure environment file created (`.env.secure`)  
✅ Credentials directory created (`~/.config/commerce-studio/credentials`)  
✅ Proper file permissions set  
✅ Security validation tools ready  

## 🔧 Next Steps to Complete Setup

### Step 1: Refresh Google Cloud Authentication
```bash
# Re-authenticate with Google Cloud
gcloud auth login

# Set the correct project (based on your existing setup)
gcloud config set project ml-datadriven-recos

# Verify authentication
gcloud auth list
```

### Step 2: Create/Download Service Account Key
```bash
# Option A: If you already have a service account key file, copy it:
cp /path/to/your/existing/service-account-key.json ~/.config/commerce-studio/credentials/service-account-key.json

# Option B: Create a new service account key for the avatar-demo-service:
gcloud iam service-accounts keys create ~/.config/commerce-studio/credentials/service-account-key.json \
    --iam-account=avatar-demo-service@ml-datadriven-recos.iam.gserviceaccount.com

# Secure the key file
chmod 600 ~/.config/commerce-studio/credentials/service-account-key.json
```

### Step 3: Get Your Dialogflow Agent ID
```bash
# List available Dialogflow agents
gcloud dialogflow agents list --location=us-central1

# The output will show your agent ID - copy it for the next step
```

### Step 4: Update Environment Configuration
```bash
# Edit the .env.secure file to add your actual Dialogflow Agent ID
# Replace "REPLACE_WITH_YOUR_ACTUAL_AGENT_ID" with your actual agent ID from step 3
```

### Step 5: Validate Security Setup
```bash
# Run security validation
./scripts/validate-security.sh

# Should show:
# ✅ No critical security issues found!
```

### Step 6: Start Your Application Securely
```bash
# Start with security checks
./scripts/secure-start.sh

# Your "Internal server error" should now be resolved!
```

## 🧪 Test Your API
Once started, test your API endpoint:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, I need help finding glasses","sessionId":"test-123"}'

# Should return a successful response instead of "Internal server error"
```

## 🔒 Security Notes
- ✅ Your `.env.secure` file is protected (600 permissions)
- ✅ Credentials directory is secure (700 permissions)
- ✅ All sensitive files are in `.gitignore`
- ✅ Service account follows principle of least privilege

## 🚨 If You Encounter Issues

### Issue: "GOOGLE_APPLICATION_CREDENTIALS not set"
**Solution**: Ensure you've completed Step 2 and the file exists at the expected path

### Issue: "DIALOGFLOW_AGENT_ID not set"
**Solution**: Complete Step 4 to update the .env.secure file with your actual agent ID

### Issue: "Credentials file not found"
**Solution**: Verify the service account key file is at `~/.config/commerce-studio/credentials/service-account-key.json`

### Issue: Authentication still fails
**Solution**: 
1. Run `gcloud auth application-default login`
2. Verify project: `gcloud config get-value project`
3. Check service account permissions in Google Cloud Console

## 📞 Quick Commands Reference
```bash
# Check current setup
./scripts/validate-security.sh

# Start securely
./scripts/secure-start.sh

# Diagnose issues
node scripts/diagnose-centralized-config.js

# Re-run setup if needed
./scripts/setup-environment.sh
```

## ✅ Success Indicators
When everything is working correctly, you should see:
1. Security validation passes
2. Application starts without errors
3. API endpoints respond successfully (no more "Internal server error")
4. Google Cloud authentication working
5. Dialogflow integration functional

Your Commerce Studio platform will be running securely with your centralized configuration architecture intact!