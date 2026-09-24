const db = require('../db');
const { need, err, getStudent } = require('../auth');
const dep = (id) => (db.schools.find((s) => s.id === id) || {}).dept;
module.exports = (add) => {
  // L'école d'origine demande le transfert : le dossier n'est jamais supprimé
  add('POST', '/transfers', (ctx) => {
    need(ctx, 'ecole');
    const st = getStudent(ctx, ctx.body.studentId), to = db.schools.find((s) => s.id === ctx.body.toSchool), from = db.schools.find((s) => s.id === st.school);
    if (!to || !from) throw err(404, 'Établissement inconnu');
    if (to.id === from.id) throw err(422, 'Même établissement');
    if (to.level !== from.level) throw err(422, 'Transfert impossible entre niveaux différents');
    if (db.transfers.some((t) => t.studentId === st.id && t.status === 'en_attente')) throw err(409, 'Transfert déjà en cours');
    const t = { id: 'T-' + (db.transfers.length + 1), studentId: st.id, from: from.id, to: to.id, reason: ctx.body.reason || '', status: 'en_attente' };
    db.transfers.push(t); return t;
  });
  add('GET', '/transfers', (ctx) => {
    need(ctx, 'ecole', 'direction', 'ministere');
    return db.transfers.filter((t) => ctx.role === 'ministere' || (ctx.role === 'ecole' ? [t.from, t.to].includes(ctx.user) : [dep(t.from), dep(t.to)].includes(ctx.user)));
  });
  // L'école d'ACCUEIL décide ; si accepté, l'historique de parcours est mis à jour
  add('POST', '/transfers/:id/decide', (ctx) => {
    need(ctx, 'ecole');
    const t = db.transfers.find((x) => x.id === ctx.params.id); if (!t) throw err(404, 'Transfert inconnu');
    if (t.to !== ctx.user) throw err(403, "Seule l'école d'accueil peut décider");
    if (t.status !== 'en_attente') throw err(409, 'Déjà traité');
    t.status = ctx.body.accept ? 'accepte' : 'refuse';
    if (ctx.body.accept) {
      const st = db.students.find((s) => s.id === t.studentId), today = new Date().toISOString().slice(0, 10);
      st.history[st.history.length - 1].to = today;
      st.school = t.to; st.cls = db.schools.find((s) => s.id === t.to).classes[0];
      st.history.push({ school: t.to, from: today, to: null });
    }
    return t;
  });
};
