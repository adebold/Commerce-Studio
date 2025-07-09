const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  const response = {
    status: 'OK',
    message: 'Minimal tenant management service is running',
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method,
    port: port,
    env: process.env.NODE_ENV || 'unknown'
  };
  
  res.end(JSON.stringify(response, null, 2));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on port ${port}`);
  console.log(`🌍 Listening on 0.0.0.0:${port}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  server.close(() => {
    console.log('🔚 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received');
  server.close(() => {
    console.log('🔚 Server closed');
    process.exit(0);
  });
});