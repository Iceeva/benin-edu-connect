// test/smoke.js - test de fumée : appelle le routeur directement (sans serveur) et vérifie les règles clés
const { handle } = require('../lib/router');
const call = (method, url, role = 'ministere', user = '*', body) => new Promise((ok) => {
  const res = { code: 200, status(c) { this.code = c; return this; }, setHeader() {}, json(b) { ok({ code: this.code, b }); }, send(b) { ok({ code: this.code, b }); } };
  handle({ method, url: '/api' + url, headers: { 'x-role': role, 'x-user': user }, body }, res);
});
let fails = 0;
const t = (name, cond) => { console.log((cond ? '✅ ' : '❌ ') + name); if (!cond) fails++; };
(async () => {
  const E = 'BJ-EDU-1001';
  t('stats accessibles', (await call('GET', '/stats')).code === 200);
  t('RBAC : un élève ne voit pas le dossier d’un autre', (await call('GET', '/students/BJ-EDU-1002/grades', 'eleve', E)).code === 403);
  t('RBAC : le public ne voit aucun apprenant', (await call('GET', '/students', 'public', '')).b.length === 0);
  t('bulletin bloqué tant que non payé (402)', (await call('GET', `/students/${E}/bulletin`, 'eleve', E)).code === 402);
  t('paiement refusé (simulation, tél. en 00)', (await call('POST', '/pay', 'eleve', E, { studentId: E, code: 'BUL', method: 'mtn', phone: '97000000' })).code === 422);
  t('paiement accepté', (await call('POST', '/pay', 'eleve', E, { studentId: E, code: 'BUL', method: 'mtn', phone: '97000001' })).code === 200);
  const b = await call('GET', `/students/${E}/bulletin`, 'eleve', E);
  t('bulletin délivré après paiement', b.code === 200);
  t('vérification publique du bulletin', (await call('GET', '/verify/' + b.b.doc.ref, 'public', '')).b.valid === true);
  const ab = (await call('GET', `/students/${E}/absences`, 'eleve', E)).b.find((a) => a.status === 'non_justifiee');
  if (ab) {
    t('justification puis décision de l’école', (await call('POST', `/absences/${ab.id}/justify`, 'eleve', E, { motif: 'Maladie' })).code === 200 && (await call('POST', `/absences/${ab.id}/decide`, 'ecole', 'S2', { accept: true })).b.status === 'justifiee');
  }
  const slot = (await call('GET', '/slots?school=S2')).b[0].id;
  t('rendez-vous réservé', (await call('POST', '/appointments', 'eleve', E, { slotId: slot, studentId: E })).code === 200);
  t('conflit de créneau détecté (409)', (await call('POST', '/appointments', 'ecole', 'S2', { slotId: slot, studentId: 'BJ-EDU-1007' })).code === 409);
  t('alertes de qualité de données détectées', (await call('GET', '/alerts?type=donnees')).b.length > 0);
  t('score de risque calculé', (await call('GET', `/students/${E}/risk`, 'ecole', 'S2')).b.score >= 0);
  t('recherche globale', Object.keys((await call('GET', '/search?q=calavi')).b).length === 4);
  t('export CSV réservé au personnel', (await call('GET', '/export/students', 'eleve', E)).code === 403);
  const au = await call('GET', '/audit');
  t('journal d’audit intact et non vide', au.b.intact === true && au.b.total > 0);
  console.log(fails ? `\n${fails} test(s) en échec` : '\nTous les tests passent'); process.exit(fails ? 1 : 0);
})();
