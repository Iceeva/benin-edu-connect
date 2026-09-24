const db = require('../db');
const detect = require('../detect');
const { scope } = require('../auth');
module.exports = (add) => {
  // Compteurs "à traiter" adaptés au périmètre du profil (alimente la page d'accueil)
  add('GET', '/overview', (ctx) => {
    const ids = new Set(scope(ctx, db.students).map((s) => s.id)), mine = (l) => l.filter((x) => ids.has(x.studentId));
    const staff = ['ecole', 'direction', 'ministere'].includes(ctx.role);
    return {
      justificatifs: mine(db.absences).filter((a) => a.status === 'en_attente').length,
      transferts: db.transfers.filter((t) => t.status === 'en_attente' && (ctx.role === 'ministere' || [t.from, t.to].includes(ctx.user))).length,
      corrections: mine(db.corrections).filter((c) => c.status === 'en_attente').length,
      aides: mine(db.aides).filter((a) => a.status === 'en_instruction').length,
      alertes: staff ? detect().filter((a) => ids.has(a.studentId) && !db.acks.includes(a.id)).length : 0,
      rendezVous: mine(db.appointments).filter((a) => a.status !== 'annule').length,
    };
  });
};
