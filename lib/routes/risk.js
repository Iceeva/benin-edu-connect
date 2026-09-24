const db = require('../db');
const { need, scope, getStudent } = require('../auth');
const { avg } = require('../util');
// Score de risque de décrochage (0-100), TOUJOURS expliqué par ses facteurs : c'est une aide à la décision, pas un verdict
const risk = (st) => {
  const ab = db.absences.filter((a) => a.studentId === st.id);
  const unj = ab.filter((a) => a.kind === 'absence' && a.status === 'non_justifiee').length, late = ab.filter((a) => a.kind === 'retard').length;
  const m = avg(db.grades.filter((g) => g.studentId === st.id)) ?? 12;
  const score = Math.round(Math.min(100, unj * 12 + late * 3 + Math.max(0, 12 - m) * 6));
  return { studentId: st.id, name: st.name, score, level: score >= 60 ? 'élevé' : score >= 30 ? 'moyen' : 'faible', factors: [`${unj} absence(s) non justifiée(s)`, `${late} retard(s)`, `moyenne ${m}/20`] };
};
module.exports = (add) => {
  add('GET', '/students/:id/risk', (ctx) => { need(ctx, 'enseignant', 'ecole', 'direction', 'ministere'); return risk(getStudent(ctx, ctx.params.id)); });
  add('GET', '/risk/top', (ctx) => { need(ctx, 'ecole', 'direction', 'ministere'); return scope(ctx, db.students).map(risk).sort((a, b) => b.score - a.score).slice(0, 8); });
};
