import { h, api, table, act, state } from '../core.js';
export default async (root) => {
  const rows = await api('/corrections');
  root.append(h('h1', {}, 'Corrections de notes'), table([['Apprenant', (c) => c.studentId], ['Matière', (c) => c.subject], ['Ancienne', (c) => c.oldScore], ['Nouvelle', (c) => c.newScore], ['Motif', (c) => c.reason], ['Statut', (c) => c.status],
    ['Décision', (c) => state.role === 'ecole' && c.status === 'en_attente' ? h('span', {}, act('Appliquer', `/corrections/${c.id}/decide`, { accept: true }), act('Refuser', `/corrections/${c.id}/decide`, { accept: false })) : '']], rows));
};
