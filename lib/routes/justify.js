const db = require('../db');
const { need, err, getStudent, scope } = require('../auth');
const find = (id) => { const a = db.absences.find((x) => x.id === id); if (!a) throw err(404, 'Absence introuvable'); return a; };
module.exports = (add) => {
  // L'élève ou le parent dépose un motif (le justificatif est simulé par un simple nom de pièce)
  add('POST', '/absences/:id/justify', (ctx) => {
    need(ctx, 'eleve', 'parent'); const a = find(ctx.params.id); getStudent(ctx, a.studentId);
    if (!['non_justifiee', 'refusee'].includes(a.status)) throw err(409, 'Absence déjà traitée');
    if (!ctx.body.motif) throw err(422, 'Le motif est obligatoire');
    Object.assign(a, { status: 'en_attente', motif: ctx.body.motif, piece: ctx.body.piece || '' });
    return a;
  });
  // Seule l'école de l'élève décide
  add('POST', '/absences/:id/decide', (ctx) => {
    need(ctx, 'ecole'); const a = find(ctx.params.id); getStudent(ctx, a.studentId);
    if (a.status !== 'en_attente') throw err(409, 'Rien à traiter');
    Object.assign(a, { status: ctx.body.accept ? 'justifiee' : 'refusee', comment: ctx.body.comment || '' });
    return a;
  });
  add('GET', '/justifications', (ctx) => { need(ctx, 'ecole', 'direction', 'ministere'); const ids = new Set(scope(ctx, db.students).map((s) => s.id)); return db.absences.filter((a) => a.status === 'en_attente' && ids.has(a.studentId)); });
};
