const db = require('../db');
const { scope } = require('../auth');
// Établissement d'un apprenant (valeur par défaut sûre si les données sont incohérentes)
const school = (id) => db.schools.find((s) => s.id === id) || { name: '- aucun -', level: '', dept: '' };
const enrich = (s) => ({ ...s, schoolName: school(s.school).name, level: school(s.school).level, dept: school(s.school).dept });
module.exports = (add) => {
  add('GET', '/stats', () => ({
    Établissements: db.schools.length, Apprenants: db.students.length,
    Filles: db.students.filter((s) => s.sex === 'F').length, Garçons: db.students.filter((s) => s.sex === 'M').length,
  }));
  // Listes pour alimenter les filtres du front
  add('GET', '/meta', () => ({ depts: [...new Set(db.schools.map((s) => s.dept))], levels: ['primaire', 'secondaire', 'supérieur'], schools: db.schools }));
  add('GET', '/schools', ({ query: q }) => db.schools.filter((s) => (!q.dept || s.dept === q.dept) && (!q.level || s.level === q.level) && (!q.type || s.type === q.type)));
  // Recherche par filtres combinables : texte, établissement, niveau, département, classe, sexe
  add('GET', '/students', (ctx) => {
    const { q, school: sc, level, dept, cls, sex } = ctx.query;
    return scope(ctx, db.students).map(enrich).filter((s) =>
      (!q || (s.name + s.id).toLowerCase().includes(q.toLowerCase())) && (!sc || s.school === sc) && (!level || s.level === level) &&
      (!dept || s.dept === dept) && (!cls || s.cls === cls) && (!sex || s.sex === sex));
  });
};
