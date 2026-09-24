import { h, api, table, state } from '../core.js';
const LABEL = { non_justifiee: '❌ Non justifiée', en_attente: '⏳ En attente', justifiee: '✅ Justifiée', refusee: '🚫 Refusée' };
export default async (root, { student }) => {
  const rows = await api(`/students/${student.id}/absences`);
  // Bouton visible seulement pour l'élève/parent et pour les absences encore justifiables
  const btn = (a) => ['eleve', 'parent'].includes(state.role) && ['non_justifiee', 'refusee'].includes(a.status)
    ? h('button', { onclick: async () => { const motif = prompt('Motif de l’absence ?'); if (motif) { await api(`/absences/${a.id}/justify`, { method: 'POST', body: { motif } }); location.reload(); } } }, 'Justifier') : '';
  root.append(h('h2', {}, 'Absences et retards'), table([['Date', (a) => a.date], ['Type', (a) => a.kind === 'retard' ? `Retard (${a.minutes} min)` : 'Absence'], ['Statut', (a) => LABEL[a.status]], ['Action', btn]], rows));
};
