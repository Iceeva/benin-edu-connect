const crypto = require('crypto');
const db = require('../db');
const { need, err, getStudent } = require('../auth');
module.exports = (add) => {
  add('GET', '/fees', () => db.fees);
  // Paiement SIMULÉ : aucun argent réel ne circule. Un numéro finissant par "00" provoque un échec de démonstration.
  add('POST', '/pay', (ctx) => {
    need(ctx, 'eleve', 'parent');
    const { studentId, code, method, phone } = ctx.body;
    getStudent(ctx, studentId);
    const fee = db.fees.find((f) => f.code === code);
    if (!fee) throw err(404, 'Frais inconnus');
    if (!['mtn', 'moov', 'carte'].includes(method)) throw err(422, 'Moyen de paiement invalide');
    if (String(phone || '').endsWith('00')) throw err(422, 'Paiement refusé (simulation : solde insuffisant)');
    const payment = { id: 'TX-' + crypto.randomBytes(4).toString('hex').toUpperCase(), studentId, code, amount: fee.amount, method, date: new Date().toISOString(), status: 'confirme' };
    db.payments.push(payment);
    return { payment, receipt: `Reçu ${payment.id} : ${fee.amount} FCFA - ${fee.label}` };
  });
  add('GET', '/students/:id/payments', (ctx) => { getStudent(ctx, ctx.params.id); return db.payments.filter((p) => p.studentId === ctx.params.id); });
};
