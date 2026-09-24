const db = require('../db');
const { getStudent } = require('../auth');
module.exports = (add) => {
  add('GET', '/students/:id/absences', (ctx) => { getStudent(ctx, ctx.params.id); return db.absences.filter((a) => a.studentId === ctx.params.id); });
};
