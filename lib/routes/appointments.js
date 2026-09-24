const db = require('../db');
const { need, err, getStudent, scope } = require('../auth');
const live = () => db.appointments.filter((a) => a.status !== 'annule');
const book = (st, slot, reason, by, status) => {
  // Détection de conflits : créneau déjà pris OU apprenant déjà occupé à la même heure
  if (live().some((a) => a.slotId === slot.id)) throw err(409, 'Créneau déjà réservé');
  if (live().some((a) => a.studentId === st.id && a.date === slot.date && a.time === slot.time)) throw err(409, 'Cet apprenant a déjà un rendez-vous à cette heure');
  const ap = { id: 'RV-' + (db.appointments.length + 1), slotId: slot.id, studentId: st.id, schoolId: slot.schoolId, date: slot.date, time: slot.time, reason: reason || 'Non précisé', status, by };
  db.appointments.push(ap); return ap;
};
module.exports = (add) => {
  add('GET', '/slots', ({ query: q }) => db.slots.filter((s) => (!q.school || s.schoolId === q.school) && (!q.date || s.date === q.date) && !live().some((a) => a.slotId === s.id)));
  add('POST', '/appointments', (ctx) => {
    need(ctx, 'eleve', 'parent', 'ecole', 'direction');
    const st = getStudent(ctx, ctx.body.studentId), slot = db.slots.find((s) => s.id === ctx.body.slotId);
    if (!slot) throw err(404, 'Créneau inconnu');
    if (slot.schoolId !== st.school) throw err(422, "Ce créneau n'appartient pas à l'établissement de l'apprenant");
    return book(st, slot, ctx.body.reason, ctx.role, 'demande');
  });
  // Convocation automatique (ex. depuis une alerte de décrochage) : premier créneau libre de l'établissement
  add('POST', '/appointments/summon', (ctx) => {
    need(ctx, 'ecole', 'direction');
    const st = getStudent(ctx, ctx.body.studentId), slot = db.slots.find((s) => s.schoolId === st.school && !live().some((a) => a.slotId === s.id));
    if (!slot) throw err(409, 'Aucun créneau libre');
    return book(st, slot, 'Convocation : ' + (ctx.body.reason || ''), ctx.role, 'confirme');
  });
  add('GET', '/appointments', (ctx) => { const ids = new Set(scope(ctx, db.students).map((s) => s.id)); return db.appointments.filter((a) => ids.has(a.studentId)); });
  add('POST', '/appointments/:id/status', (ctx) => {
    const a = db.appointments.find((x) => x.id === ctx.params.id); if (!a) throw err(404, 'Rendez-vous inconnu');
    getStudent(ctx, a.studentId);
    const s = ctx.body.status;
    if (!['confirme', 'refuse', 'annule'].includes(s)) throw err(422, 'Statut invalide');
    if (s !== 'annule') need(ctx, 'ecole', 'direction'); // seuls l'école/direction confirment ou refusent
    a.status = s; return a;
  });
};
