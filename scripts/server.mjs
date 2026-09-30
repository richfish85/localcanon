import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, extname, sep } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain; charset=utf-8' };
const allowedRoots = ['src', 'docs', 'assets'];
export function resolvePublicPath(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded.includes('\\') || decoded.includes('\0')) return null;
  if (decoded === '/' || decoded === '/index.html') return resolve(root, 'index.html');
  const relative = decoded.replace(/^\/+/, '');
  if (!allowedRoots.some(prefix => relative.startsWith(`${prefix}/`))) return null;
  const file = resolve(root, relative);
  if (!allowedRoots.some(prefix => file.startsWith(resolve(root, prefix) + sep))) return null;
  if (relative.split('/').some(part => part.startsWith('.'))) return null;
  return file;
}

export function createAppServer() {
  return createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
    let pathname;
    try { pathname = new URL(req.url, 'http://localhost').pathname; } catch { res.writeHead(400); return res.end(); }
    const file = resolvePublicPath(pathname);
    if (!file) { res.writeHead(404); return res.end('Not found'); }
    try {
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = createAppServer();
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`LocalCanon: http://127.0.0.1:${port}`));
}
