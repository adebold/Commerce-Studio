#!/bin/bash

# Simple deployment script for VisionCraft Eyewear Store
# This script creates a simple static hosting solution

echo "🚀 Deploying VisionCraft Eyewear Store..."

# Create a simple Python HTTP server for testing
echo "📦 Creating deployment package..."

# Create a simple deployment directory
mkdir -p deploy
cp -r * deploy/ 2>/dev/null || true

# Create a simple server script
cat > deploy/server.py << 'EOF'
#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

PORT = int(os.environ.get('PORT', 8080))

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
    print(f"🌐 VisionCraft Eyewear Store serving at http://localhost:{PORT}")
    print("📱 Store is ready for customers!")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Store closed. Thank you!")
        httpd.shutdown()
EOF

chmod +x deploy/server.py

echo "✅ VisionCraft Eyewear Store deployment package created!"
echo ""
echo "🎯 To run the store locally:"
echo "   cd deploy && python3 server.py"
echo ""
echo "🌐 To deploy to cloud platforms:"
echo "   - Netlify: Drag and drop the deploy folder"
echo "   - Vercel: vercel deploy deploy/"
echo "   - GitHub Pages: Push deploy/ contents to gh-pages branch"
echo ""
echo "🏪 Your VisionCraft Eyewear Store is ready!"