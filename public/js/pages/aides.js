import { h, api, table, act, state } from '../core.js';
export default async (root) => {
  const list = await api('/aides'), mine = ['eleve', 'parent'].includes(state.role), boss = ['direction', 'ministere'].includes(state.role);
  root.append(h('h1', {}, 'Aides sociales et scolaires'));
  if (mine) root.append(h('p', {}, 'Faire une demande : '), ...[['bourse', '🎓 Bourse'], ['cantine', '🍲 Cantine'], ['transport', '🚌 Transport']].map(([k, t]) => act(t, '/aides', { studentId: state.user, kind: k })));
  root.append(table([['Apprenant', (a) => a.studentId], ['Aide', (a) => a.kind], ['Statut', (a) => a.status], ['Remarque', (a) => a.why || (a.payout ? `${a.payout.amount} FCFA (décaissement simulé)` : '')],
    ['Décision', (a) => boss && a.status === 'en_instruction' ? h('span', {}, act('Accorder', `/aides/${a.id}/decide`, { accept: true }), act('Refuser', `/aides/${a.id}/decide`, { accept: false })) : '']], list));
};
