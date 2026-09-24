const db = require('../db');
const detect = require('../detect');
const { need, scope } = require('../auth');
module.exports = (add) => {
  // Alertes calculées à la volée, limitées au périmètre du profil, filtrables
  add('GET', '/alerts', (ctx) => {
    need(ctx, 'ecole', 'direction', 'ministere');
    const ids = new Set(scope(ctx, db.students).map((s) => s.id)), { type, severity, state } = ctx.query;
    return detect().filter((a) => ids.has(a.studentId)).map((a) => ({ ...a, state: db.acks.includes(a.id) ? 'traitee' : 'ouverte' }))
      .filter((a) => (!type || a.type === type) && (!severity || a.severity === severity) && (!state || a.state === state));
  });
  add('POST', '/alerts/:id/ack', (ctx) => { need(ctx, 'ecole', 'direction', 'ministere'); if (!db.acks.includes(ctx.params.id)) db.acks.push(ctx.params.id); return { id: ctx.params.id, state: 'traitee' }; });
};
