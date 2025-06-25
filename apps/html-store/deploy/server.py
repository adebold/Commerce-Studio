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
    print("🛍️  Features:")
    print("   - AI-powered face shape compatibility")
    print("   - Live product data from EyewearML API")
    print("   - Professional retail interface")
    print("   - Mobile-responsive design")
    print("")
    print("🔗 API Integration: https://eyewear-pipeline-api-395261412442.us-central1.run.app")
    print("")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n👋 Store closed. Thank you!")
        httpd.shutdown()