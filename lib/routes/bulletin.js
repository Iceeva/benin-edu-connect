const db = require('../db');
const { getStudent } = require('../auth');
const { avg } = require('../util');
const { issue } = require('../docs');
module.exports = (add) => {
  add('GET', '/students/:id/bulletin', (ctx) => {
    const st = getStudent(ctx, ctx.params.id);
    // Règle métier : l'élève/parent doit avoir payé les frais du bulletin (école et ministère y accèdent librement)
    const fee = db.fees.find((f) => f.code === 'BUL');
    const paid = db.payments.some((p) => p.studentId === st.id && p.code === 'BUL');
    if (['eleve', 'parent'].includes(ctx.role) && !paid) throw Object.assign(require('../auth').err(402, 'Paiement requis pour obtenir le bulletin'), { data: { fee } });
    // {{GATE}}
    const grades = db.grades.filter((g) => g.studentId === st.id), average = avg(grades);
    const doc = issue('BUL', st.id, '2025-2026', 'Bulletin annuel');
    const mention = average >= 16 ? 'Très bien' : average >= 14 ? 'Bien' : average >= 12 ? 'Assez bien' : average >= 10 ? 'Passable' : 'Insuffisant';
    return { doc, student: st, school: db.schools.find((s) => s.id === st.school) || {}, grades, average, mention, decision: average >= 10 ? 'Admis' : 'Redouble' };
  });
};
