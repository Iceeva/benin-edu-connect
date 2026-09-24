// router.js - mini-routeur : associe (méthode, chemin) à une fonction
const routes = [], hooks = [];
// add('GET', '/students/:id', fn) : ":id" devient ctx.params.id
const add = (method, path, fn) => routes.push({ method, re: new RegExp('^' + path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn });
// onDone(fn) : fonction appelée après chaque requête réussie (notifications, audit…)
const onDone = (fn) => hooks.push(fn);
let loaded = false;
async function handle(req, res) {
  if (!loaded) { loaded = true; require('./routes').forEach((m) => m(add, onDone)); }
  const url = new URL(req.url, 'http://local');
  const path = url.pathname.replace(/^\/api/, '') || '/';
  // Contexte : le profil simulé arrive dans des en-têtes (voir README, section sécurité)
  const base = { query: Object.fromEntries(url.searchParams), role: req.headers['x-role'] || 'public', user: req.headers['x-user'] || '', body: req.body || {} };
  for (const r of routes) {
    const m = r.method === req.method && path.match(r.re);
    if (!m) continue;
    const ctx = { ...base, params: m.groups || {} };
    try {
      const out = await r.fn(ctx);
      hooks.forEach((f) => { try { f({ method: req.method, path, ctx, out }); } catch (_) { /* un hook ne doit jamais casser la requête */ } });
      if (out && out._raw) { res.setHeader('content-type', out._raw.type); return res.status(200).send(out._raw.body); }
      return res.status(200).json(out);
    } catch (e) { return res.status(e.status || 500).json({ error: e.message, ...(e.data || {}) }); }
  }
  res.status(404).json({ error: 'Route inconnue : ' + path });
}
module.exports = { handle };
