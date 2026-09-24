const db = require('../db');
const { need, err, getStudent, scope } = require('../auth');
const { avg } = require('../util');
// Règles d'éligibilité SIMULÉES par type d'aide
const RULES = {
  bourse: { level: 'supérieur', ok: (m) => m >= 12, why: 'Moyenne ≥ 12/20 requise' },
  cantine: { level: 'primaire', ok: () => true, why: '' },
  transport: { level: 'supérieur', ok: () => true, why: '' },
};
module.exports = (add) => {
  add('POST', '/aides', (ctx) => {
    need(ctx, 'eleve', 'parent');
    const st = getStudent(ctx, ctx.body.studentId), r = RULES[ctx.body.kind];
    if (!r) throw err(422, "Type d'aide inconnu");
    const sc = db.schools.find((s) => s.id === st.school) || {};
    if (sc.level !== r.level) throw err(422, `Aide réservée au niveau « ${r.level} »`);
    if (db.aides.some((a) => a.studentId === st.id && a.kind === ctx.body.kind && a.status !== 'refusee')) throw err(409, 'Demande déjà en cours ou accordée');
    const ok = r.ok(avg(db.grades.filter((g) => g.studentId === st.id)));
    const a = { id: 'AD-' + (db.aides.length + 1), studentId: st.id, kind: ctx.body.kind, status: ok ? 'en_instruction' : 'refusee', why: ok ? '' : r.why };
    db.aides.push(a); return a;
  });
  add('GET', '/aides', (ctx) => { const ids = new Set(scope(ctx, db.students).map((s) => s.id)); return db.aides.filter((a) => ids.has(a.studentId)); });
  add('POST', '/aides/:id/decide', (ctx) => {
    need(ctx, 'direction', 'ministere');
    const a = db.aides.find((x) => x.id === ctx.params.id); if (!a) throw err(404, 'Demande inconnue');
    getStudent(ctx, a.studentId);
    if (a.status !== 'en_instruction') throw err(409, 'Déjà traitée');
    a.status = ctx.body.accept ? 'accordee' : 'refusee';
    if (a.status === 'accordee' && a.kind === 'bourse') a.payout = { amount: 50000, ref: 'SIM-' + a.id }; // décaissement SIMULÉ
    return a;
  });
};
