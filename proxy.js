const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const PORT = 8082;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  proxy.web(req, res, { target: 'https://rtiapi.roofze.in', changeOrigin: true });
}).listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));