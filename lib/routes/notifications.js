const db = require('../db');
const push = (key, text) => db.notifications.push({ id: 'N-' + (db.notifications.length + 1), key, text, read: false, date: new Date().toISOString() });
// Clé du destinataire selon le profil courant
const keyOf = (ctx) => ({ eleve: 'stu:' + ctx.user, parent: 'stu:' + ctx.user, ecole: 'sch:' + ctx.user, enseignant: 'sch:' + ctx.user, direction: 'dep:' + ctx.user, ministere: 'min' })[ctx.role];
module.exports = (add, onDone) => {
  add('GET', '/notifications', (ctx) => db.notifications.filter((n) => n.key === keyOf(ctx)).reverse());
  add('POST', '/notifications/:id/read', (ctx) => { const n = db.notifications.find((x) => x.id === ctx.params.id && x.key === keyOf(ctx)); if (n) n.read = true; return n || {}; });
  // Hook : après certaines actions réussies, on prévient les personnes concernées
  onDone(({ method, path, out }) => {
    if (method !== 'POST') return;
    if (path === '/pay') return push('stu:' + out.payment.studentId, `Paiement de ${out.payment.amount} FCFA confirmé (${out.payment.id})`);
    if (/^\/absences\/.+\/justify$/.test(path)) return push('sch:' + (db.students.find((s) => s.id === out.studentId) || {}).school, `Nouveau justificatif à traiter (${out.studentId})`);
    if (/^\/absences\/.+\/decide$/.test(path)) return push('stu:' + out.studentId, `Votre justificatif a été ${out.status === 'justifiee' ? 'accepté' : 'refusé'}`);
    if (path === '/appointments' || path === '/appointments/summon') { push('stu:' + out.studentId, `Rendez-vous le ${out.date} à ${out.time} : ${out.status}`); return push('sch:' + out.schoolId, `Nouveau rendez-vous ${out.id}`); }
    if (/^\/appointments\/.+\/status$/.test(path)) return push('stu:' + out.studentId, `Rendez-vous ${out.id} : ${out.status}`);
    if (path === '/transfers') return push('sch:' + out.to, `Demande de transfert ${out.id} pour ${out.studentId}`);
    if (/^\/transfers\/.+\/decide$/.test(path)) return push('sch:' + out.from, `Transfert ${out.id} : ${out.status}`);
    if (/^\/corrections\/.+\/decide$/.test(path)) return push('sch:' + out.by, `Correction ${out.id} (${out.subject}) : ${out.status}`);
    // {{RULES}}
  });
};
