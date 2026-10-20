/* RencanaMampu — server statis untuk pengembangan lokal (`npm run dev`).
   Hanya modul bawaan Node; tidak perlu `npm install`. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '127.0.0.1';
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.sql': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2'
};

const server = http.createServer(function (req, res) {
  let rel;
  try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (err) { res.writeHead(400).end('Bad request'); return; }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, rel);
  // Tolak path traversal dan file tersembunyi (.git, .env).
  if (!file.startsWith(ROOT + path.sep) || rel.split('/').some(function (s) { return s.startsWith('.'); })) {
    res.writeHead(404).end('Not found'); return;
  }
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(data);
  });
});

server.listen(PORT, HOST, function () {
  console.log('RencanaMampu berjalan di http://' + (HOST === '127.0.0.1' ? 'localhost' : HOST) + ':' + PORT);
  console.log('Uji aturan: http://localhost:' + PORT + '/tests.html · Hentikan: Ctrl+C');
});
