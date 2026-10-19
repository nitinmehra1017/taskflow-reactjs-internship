const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '../dist');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.map': 'application/json',
};
const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  let file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep) && file !== root) {
    res.writeHead(403).end();
    return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (path.extname(pathname)) {
      res.writeHead(404).end('Not found');
      return;
    }
    file = path.join(root, 'index.html');
  }
  const content = fs.readFileSync(file);
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.setHeader(
    'Cache-Control',
    /\.[a-f0-9]{8}\./.test(file) ? 'public, max-age=31536000, immutable' : 'no-cache',
  );
  res.setHeader('Vary', 'Accept-Encoding');
  if (
    /\bgzip\b/.test(req.headers['accept-encoding'] || '') &&
    /\.(html|js|css|svg|json|map)$/.test(file)
  ) {
    res.setHeader('Content-Encoding', 'gzip');
    res.end(zlib.gzipSync(content));
  } else res.end(content);
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () =>
  console.log('TaskFlow production preview: http://localhost:' + server.address().port),
);
