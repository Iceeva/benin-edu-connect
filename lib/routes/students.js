const db = require('../db');
module.exports = (add) => {
  // Statistiques globales simples
  add('GET', '/stats', () => ({
    Établissements: db.schools.length, Apprenants: db.students.length,
    Filles: db.students.filter((s) => s.sex === 'F').length, Garçons: db.students.filter((s) => s.sex === 'M').length,
  }));
  add('GET', '/students', () => db.students.map((s) => ({ ...s, schoolName: db.schools.find((x) => x.id === s.school).name })));
};
