const crypto = require('crypto');
const db = require('../db');
const { need } = require('../auth');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
// Vérifie que la chaîne n'a pas été altérée : chaque hash dépend du précédent
const intact = () => db.audit.every((e, i) => { const { hash, ...rest } = e; return hash === sha((i ? db.audit[i - 1].hash : 'GENESIS') + JSON.stringify(rest)); });
module.exports = (add, onDone) => {
  // Toute action d'écriture réussie est journalisée (qui, quoi, quand) - le téléphone est masqué
  onDone(({ method, path, ctx }) => {
    if (method === 'GET') return;
    const e = { n: db.audit.length + 1, date: new Date().toISOString(), role: ctx.role, user: ctx.user, action: method + ' ' + path, detail: JSON.stringify({ ...ctx.body, phone: undefined }).slice(0, 200) };
    e.hash = sha((db.audit.length ? db.audit[db.audit.length - 1].hash : 'GENESIS') + JSON.stringify(e));
    db.audit.push(e);
  });
  add('GET', '/audit', (ctx) => {
    need(ctx, 'ministere');
    const { role, q } = ctx.query;
    return { intact: intact(), total: db.audit.length, entries: db.audit.filter((e) => (!role || e.role === role) && (!q || (e.action + e.detail).includes(q))).reverse().slice(0, 200) };
  });
};
