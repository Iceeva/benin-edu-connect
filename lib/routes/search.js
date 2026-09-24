const db = require('../db');
const { need, scope } = require('../auth');
const sc = (id) => db.schools.find((s) => s.id === id) || {};
// Pagination : limit (max 100) et page
const page = (list, q) => { const n = Math.min(100, +q.limit || 20), p = Math.max(1, +q.page || 1); return { total: list.length, page: p, items: list.slice((p - 1) * n, p * n) }; };
module.exports = (add) => {
  // Recherche transversale : chaque entité est filtrée selon le PÉRIMÈTRE du profil
  add('GET', '/search', (ctx) => {
    const q = ctx.query, kw = (q.q || '').toLowerCase(), T = (q.types || 'students,schools,diplomas,appointments').split(','), out = {};
    const has = (...v) => !kw || v.join(' ').toLowerCase().includes(kw);
    const mine = scope(ctx, db.students), ids = new Set(mine.map((s) => s.id));
    const okSchool = (s) => (!q.dept || s.dept === q.dept) && (!q.level || s.level === q.level);
    if (T.includes('students')) out.students = page(mine.filter((s) => has(s.id, s.name) && okSchool(sc(s.school))).map((s) => ({ id: s.id, name: s.name, cls: s.cls, school: sc(s.school).name })), q);
    if (T.includes('schools')) out.schools = page(db.schools.filter((s) => has(s.name) && okSchool(s)), q);
    if (T.includes('diplomas')) out.diplomas = page(db.diplomas.filter((d) => ids.has(d.studentId) && has(d.ref, d.title) && (!q.status || d.status === q.status)), q);
    if (T.includes('appointments')) out.appointments = page(db.appointments.filter((a) => ids.has(a.studentId) && has(a.reason, a.studentId) && (!q.status || a.status === q.status)), q);
    return out;
  });
  add('GET', '/export/students', (ctx) => {
    need(ctx, 'ecole', 'direction', 'ministere');
    const rows = scope(ctx, db.students).map((s) => [s.id, s.name, s.sex, s.cls, sc(s.school).name].join(';'));
    return { _raw: { type: 'text/csv; charset=utf-8', body: '\ufeffid;nom;sexe;classe;etablissement\n' + rows.join('\n') } };
  });
};
