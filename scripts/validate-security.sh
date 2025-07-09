#!/bin/bash

# Commerce Studio Security Validation Script
# Validates that all security measures are properly implemented

echo "🛡️  Commerce Studio Security Validation"
echo "======================================"

# Initialize counters
security_issues=0
warnings=0

# Function to report security issue
security_issue() {
    echo "❌ SECURITY ISSUE: $1"
    ((security_issues++))
}

# Function to report warning
security_warning() {
    echo "⚠️  WARNING: $1"
    ((warnings++))
}

# Function to report success
security_ok() {
    echo "✅ $1"
}

echo ""
echo "🔍 Checking Environment Variables..."

# Load environment variables from .env.secure if it exists
if [ -f ".env.secure" ]; then
    # Export variables from .env.secure
    set -a
    source .env.secure
    set +a
    security_ok "Environment variables loaded from .env.secure"
fi

# Check essential environment variables
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    security_issue "GOOGLE_APPLICATION_CREDENTIALS not set"
else
    security_ok "GOOGLE_APPLICATION_CREDENTIALS is set"
    
    # Check if credentials file exists
    if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        security_issue "Credentials file not found: $GOOGLE_APPLICATION_CREDENTIALS"
    else
        security_ok "Credentials file exists"
        
        # Check file permissions
        if command -v stat >/dev/null 2>&1; then
            perms=$(stat -c "%a" "$GOOGLE_APPLICATION_CREDENTIALS" 2>/dev/null || stat -f "%A" "$GOOGLE_APPLICATION_CREDENTIALS" 2>/dev/null)
            if [ -n "$perms" ]; then
                perms_decimal=$((8#$perms))
                if [ "$perms_decimal" -gt 600 ]; then
                    security_issue "Credentials file permissions too open: $perms (should be 600)"
                else
                    security_ok "Credentials file permissions are secure: $perms"
                fi
            fi
        fi
        
        # Check if file is in a secure location
        if [[ "$GOOGLE_APPLICATION_CREDENTIALS" == *"/tmp/"* ]] || [[ "$GOOGLE_APPLICATION_CREDENTIALS" == *"/var/tmp/"* ]]; then
            security_warning "Credentials file in temporary directory - consider moving to ~/.config/commerce-studio/"
        fi
    fi
fi

if [ -z "$DIALOGFLOW_AGENT_ID" ]; then
    security_issue "DIALOGFLOW_AGENT_ID not set"
else
    security_ok "DIALOGFLOW_AGENT_ID is set"
fi

echo ""
echo "🔒 Checking File Security..."

# Check .gitignore for security patterns
if [ -f ".gitignore" ]; then
    security_ok ".gitignore exists"
    
    # Check for essential security patterns
    security_patterns=(".env" "*.key" "credentials/" "service-account*.json" ".env.secure")
    for pattern in "${security_patterns[@]}"; do
        if grep -q "$pattern" .gitignore; then
            security_ok ".gitignore includes $pattern"
        else
            security_warning ".gitignore missing pattern: $pattern"
        fi
    done
else
    security_issue ".gitignore file missing"
fi

# Check for accidentally committed sensitive files
echo ""
echo "🕵️  Scanning for accidentally committed sensitive files..."

sensitive_files=(
    "*.key"
    "*.pem" 
    "*credentials*.json"
    "*service-account*.json"
    ".env"
    ".env.*"
    "*secret*"
    "*password*"
)

found_sensitive=false
for pattern in "${sensitive_files[@]}"; do
    if find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*" | grep -q .; then
        files=$(find . -name "$pattern" -not -path "./node_modules/*" -not -path "./.git/*")
        security_warning "Found potentially sensitive files: $files"
        found_sensitive=true
    fi
done

if [ "$found_sensitive" = false ]; then
    security_ok "No accidentally committed sensitive files found"
fi

echo ""
echo "📋 Checking Configuration Files..."

# Check if secure configuration files exist
config_files=(
    "config/environments/development.yaml"
    "core/config-service.js"
    "docs/security/SECURE_ENVIRONMENT_SETUP.md"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        security_ok "Configuration file exists: $file"
    else
        security_warning "Configuration file missing: $file"
    fi
done

echo ""
echo "🔧 Checking Security Scripts..."

# Check if security scripts exist and are executable
security_scripts=(
    "scripts/secure-start.sh"
    "scripts/setup-environment.sh"
    "scripts/validate-security.sh"
)

for script in "${security_scripts[@]}"; do
    if [ -f "$script" ]; then
        if [ -x "$script" ]; then
            security_ok "Security script exists and is executable: $script"
        else
            security_warning "Security script exists but not executable: $script"
        fi
    else
        security_warning "Security script missing: $script"
    fi
done

echo ""
echo "🌐 Checking Network Security..."

# Check if running on secure network (basic check)
if command -v netstat >/dev/null 2>&1; then
    open_ports=$(netstat -tuln 2>/dev/null | grep LISTEN | wc -l)
    if [ "$open_ports" -gt 20 ]; then
        security_warning "Many open ports detected ($open_ports) - ensure firewall is configured"
    else
        security_ok "Reasonable number of open ports ($open_ports)"
    fi
fi

echo ""
echo "📊 Security Validation Summary"
echo "=============================="

if [ "$security_issues" -eq 0 ]; then
    echo "✅ No critical security issues found!"
else
    echo "❌ Found $security_issues critical security issue(s)"
fi

if [ "$warnings" -eq 0 ]; then
    echo "✅ No security warnings"
else
    echo "⚠️  Found $warnings security warning(s)"
fi

echo ""
if [ "$security_issues" -eq 0 ] && [ "$warnings" -eq 0 ]; then
    echo "🎉 Security validation PASSED - Your Commerce Studio setup is secure!"
    echo ""
    echo "🚀 You can now safely start your application:"
    echo "   ./scripts/secure-start.sh"
elif [ "$security_issues" -eq 0 ]; then
    echo "✅ Security validation PASSED with warnings"
    echo "   Address the warnings above for optimal security"
    echo ""
    echo "🚀 You can start your application:"
    echo "   ./scripts/secure-start.sh"
else
    echo "❌ Security validation FAILED"
    echo "   Please address the critical issues above before starting the application"
    echo ""
    echo "🔧 For help, see: docs/security/SECURE_ENVIRONMENT_SETUP.md"
    exit 1
fi

echo ""
echo "📚 Security Resources:"
echo "   • Setup Guide: docs/security/SECURE_ENVIRONMENT_SETUP.md"
echo "   • Secure Startup: ./scripts/secure-start.sh"
echo "   • Environment Setup: ./scripts/setup-environment.sh"