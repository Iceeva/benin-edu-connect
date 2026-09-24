const db = require('../db');
const { need, scope } = require('../auth');
const { avg } = require('../util');
module.exports = (add) => {
  // Indicateurs par département, filtrables par niveau et statut (la direction ne voit que SON département)
  add('GET', '/dashboard', (ctx) => {
    need(ctx, 'direction', 'ministere');
    const { level, type } = ctx.query, sts = scope(ctx, db.students), by = {};
    for (const sc of db.schools.filter((s) => (!level || s.level === level) && (!type || s.type === type))) {
      const ids = sts.filter((s) => s.school === sc.id).map((s) => s.id);
      if (!ids.length) continue;
      const d = by[sc.dept] = by[sc.dept] || { dept: sc.dept, schools: 0, students: 0, unjustified: 0, grades: [] };
      d.schools++; d.students += ids.length;
      d.unjustified += db.absences.filter((a) => ids.includes(a.studentId) && a.status === 'non_justifiee').length;
      d.grades.push(...db.grades.filter((g) => ids.includes(g.studentId)));
    }
    return Object.values(by).map(({ grades, ...d }) => ({ ...d, average: avg(grades), absPerStudent: +(d.unjustified / d.students).toFixed(2) }));
  });
};
