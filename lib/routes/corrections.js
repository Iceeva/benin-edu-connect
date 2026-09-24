const db = require('../db');
const { need, err, getStudent, scope } = require('../auth');
module.exports = (add) => {
  // 1) L'enseignant PROPOSE une correction (la note n'est pas modifiée tout de suite)
  add('POST', '/grades/:id/correction', (ctx) => {
    need(ctx, 'enseignant');
    const g = db.grades.find((x) => x.id === ctx.params.id); if (!g) throw err(404, 'Note inconnue');
    getStudent(ctx, g.studentId);
    const v = Number(ctx.body.newScore);
    if (!(v >= 0 && v <= 20)) throw err(422, 'La note doit être comprise entre 0 et 20');
    if (!ctx.body.reason) throw err(422, 'Le motif est obligatoire');
    const c = { id: 'C-' + (db.corrections.length + 1), gradeId: g.id, studentId: g.studentId, subject: g.subject, oldScore: g.score, newScore: v, reason: ctx.body.reason, by: ctx.user, status: 'en_attente' };
    db.corrections.push(c); return c;
  });
  add('GET', '/corrections', (ctx) => { need(ctx, 'enseignant', 'ecole', 'direction', 'ministere'); const ids = new Set(scope(ctx, db.students).map((s) => s.id)); return db.corrections.filter((c) => ids.has(c.studentId)); });
  // 2) La direction de l'école VALIDE : l'ancienne valeur est conservée dans g.history
  add('POST', '/corrections/:id/decide', (ctx) => {
    need(ctx, 'ecole');
    const c = db.corrections.find((x) => x.id === ctx.params.id); if (!c) throw err(404, 'Demande inconnue');
    getStudent(ctx, c.studentId);
    if (c.status !== 'en_attente') throw err(409, 'Déjà traitée');
    if (ctx.body.accept) { const g = db.grades.find((x) => x.id === c.gradeId); g.history = [...(g.history || []), { score: g.score, date: new Date().toISOString() }]; g.score = c.newScore; }
    c.status = ctx.body.accept ? 'appliquee' : 'refusee'; return c;
  });
};
