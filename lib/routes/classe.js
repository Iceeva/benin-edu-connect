const crypto = require('crypto');
const db = require('../db');
const { need, err, getStudent, scope } = require('../auth');
module.exports = (add) => {
  add('GET', '/classes', (ctx) => { need(ctx, 'enseignant', 'ecole'); return (db.schools.find((s) => s.id === ctx.user) || { classes: [] }).classes; });
  add('GET', '/classes/:cls/students', (ctx) => { need(ctx, 'enseignant', 'ecole'); return scope(ctx, db.students).filter((s) => s.cls === ctx.params.cls); });
  // Appel de toute la classe en une requête (économe en données)
  add('POST', '/attendance/bulk', (ctx) => {
    need(ctx, 'enseignant', 'ecole');
    const { date, entries = [] } = ctx.body;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) throw err(422, 'Date invalide');
    entries.forEach((e) => { getStudent(ctx, e.studentId); if (!['absence', 'retard'].includes(e.kind)) throw err(422, 'Type invalide'); });
    entries.forEach((e) => db.absences.push({ id: 'A-' + crypto.randomBytes(3).toString('hex'), studentId: e.studentId, date, kind: e.kind, minutes: e.kind === 'retard' ? 10 : 0, status: 'non_justifiee', motif: '' }));
    return { saved: entries.length };
  });
  // Saisie groupée de notes : tout est validé AVANT d'écrire (tout ou rien)
  add('POST', '/grades/bulk', (ctx) => {
    need(ctx, 'enseignant', 'ecole');
    const { subject, coef = 2, entries = [] } = ctx.body;
    if (!subject) throw err(422, 'Matière obligatoire');
    entries.forEach((e) => {
      getStudent(ctx, e.studentId);
      if (!(e.score >= 0 && e.score <= 20)) throw err(422, `Note invalide pour ${e.studentId}`);
      if (db.grades.some((g) => g.studentId === e.studentId && g.subject === subject)) throw err(409, `Note déjà saisie pour ${e.studentId} : utilisez une correction`);
    });
    entries.forEach((e) => db.grades.push({ id: `G-${e.studentId}-${subject.replace(/\W/g, '')}`, studentId: e.studentId, subject, coef: Number(coef), score: Number(e.score), year: '2025-2026' }));
    return { saved: entries.length };
  });
};
