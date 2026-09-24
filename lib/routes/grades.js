const db = require('../db');
const { getStudent } = require('../auth');
const { avg } = require('../util');
module.exports = (add) => {
  add('GET', '/students/:id', (ctx) => { const student = getStudent(ctx, ctx.params.id); return { student, school: db.schools.find((s) => s.id === student.school) || {} }; });
  add('GET', '/students/:id/grades', (ctx) => { getStudent(ctx, ctx.params.id); const grades = db.grades.filter((g) => g.studentId === ctx.params.id); return { grades, average: avg(grades) }; });
};
