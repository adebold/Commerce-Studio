const express = require('express');
const httpProxy = require('http-proxy');
const app = express();
const proxy = httpProxy.createProxyServer({});

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_ORG_ID = process.env.NVIDIA_ORG_ID;

const services = {
  '/v1/avatar/': 'https://api.omniverse.nvidia.com',
  '/v1/speech/': 'https://api.riva.nvidia.com',
  '/v1/conversation/': 'https://api.merlin.nvidia.com'
};

app.use((req, res, next) => {
  req.headers['Authorization'] = `Bearer ${NVIDIA_API_KEY}`;
  req.headers['X-NVIDIA-Org-ID'] = NVIDIA_ORG_ID;
  next();
});

Object.keys(services).forEach(path => {
  app.all(`${path}*`, (req, res) => {
    const target = services[path];
    proxy.web(req, res, { target, changeOrigin: true }, (err) => {
      console.error('Proxy Error:', err);
      res.status(502).send('Bad Gateway');
    });
  });
});

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`NVIDIA Proxy Service listening on port ${port}`);
});