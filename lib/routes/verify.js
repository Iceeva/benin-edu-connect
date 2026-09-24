const db = require('../db');
const { need, err, getStudent } = require('../auth');
module.exports = (add) => {
  // Route PUBLIQUE : ne renvoie que le strict nécessaire (initiales du titulaire, aucune note)
  add('GET', '/verify/:ref', ({ params }) => {
    const x = db.diplomas.find((d) => d.ref === params.ref) || db.documents.find((d) => d.ref === params.ref);
    if (!x) return { valid: false };
    const st = db.students.find((s) => s.id === x.studentId) || { name: '?', school: '' };
    return { valid: x.status === 'valide', status: x.status, type: x.title || x.label, year: x.year, holder: st.name.split(' ').map((p) => p[0] + '.').join(' '), school: (db.schools.find((s) => s.id === st.school) || {}).name };
  });
  add('GET', '/students/:id/diplomas', (ctx) => { getStudent(ctx, ctx.params.id); return db.diplomas.filter((d) => d.studentId === ctx.params.id); });
  // Seul le ministère peut révoquer un diplôme
  add('POST', '/diplomas/:ref/revoke', (ctx) => { need(ctx, 'ministere'); const d = db.diplomas.find((x) => x.ref === ctx.params.ref); if (!d) throw err(404, 'Diplôme inconnu'); d.status = 'revoque'; return d; });
};
