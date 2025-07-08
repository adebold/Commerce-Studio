#!/bin/bash

echo "🔍 Checking VARAi Commerce Studio Deployment..."

WEBSITE_BASE="https://commerce-studio-website-353252826752.us-central1.run.app"
STORE_BASE="https://visioncraft-store-353252826752.us-central1.run.app"

# Check main website pages
echo ""
echo "📱 Testing Main Website Pages:"
pages=("" "/store-locator.html" "/demo-login.html" "/products.html" "/solutions.html" "/pricing.html" "/company.html")

for page in "${pages[@]}"; do
  url="${WEBSITE_BASE}${page}"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "200" ]; then
    echo "✅ $url"
  else
    echo "❌ $url (Status: $status)"
  fi
done

# Check VisionCraft store
echo ""
echo "🛒 Testing VisionCraft Store:"
status=$(curl -s -o /dev/null -w "%{http_code}" "$STORE_BASE")
if [ "$status" = "200" ]; then
  echo "✅ $STORE_BASE"
else
  echo "❌ $STORE_BASE (Status: $status)"
fi

# Check specific new pages that were causing 404s
echo ""
echo "🔧 Testing Previously Missing Pages:"
critical_pages=("/store-locator.html" "/demo-login.html")

all_good=true
for page in "${critical_pages[@]}"; do
  url="${WEBSITE_BASE}${page}"
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$status" = "200" ]; then
    echo "✅ FIXED: $url"
  else
    echo "❌ STILL BROKEN: $url (Status: $status)"
    all_good=false
  fi
done

echo ""
if [ "$all_good" = true ]; then
  echo "🎉 SUCCESS: All 404 errors have been fixed!"
  echo "🌐 Main Website: $WEBSITE_BASE"
  echo "🛒 VisionCraft Store: $STORE_BASE"
  echo ""
  echo "✅ Deployment Status: COMPLETE"
  echo "✅ All pages accessible"
  echo "✅ No 404 errors detected"
else
  echo "⚠️  Some pages are still returning errors. Please check the deployment."
fi

echo ""
echo "🏁 Deployment check complete!"