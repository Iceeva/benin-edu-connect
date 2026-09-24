import { h, api, table, act } from '../core.js';
export default async (root) => {
  const rows = await api('/justifications');
  root.append(h('h1', {}, 'Justificatifs à traiter'), table([['Apprenant', (a) => a.studentId], ['Date', (a) => a.date], ['Motif', (a) => a.motif],
    ['Décision', (a) => h('span', {}, act('Accepter', `/absences/${a.id}/decide`, { accept: true }), act('Refuser', `/absences/${a.id}/decide`, { accept: false, comment: 'Justificatif insuffisant' }))]], rows));
};
