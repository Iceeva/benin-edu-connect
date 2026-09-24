import { h, api, table, state } from '../core.js';
export default async (root, { student }) => {
  const { grades, average } = await api(`/students/${student.id}/grades`);
  // L'enseignant ne modifie pas directement : il envoie une demande validée ensuite par l'école
  const fix = (g) => state.role !== 'enseignant' ? '' : h('button', { onclick: async () => {
    const v = prompt('Nouvelle note /20 ?'), reason = v && prompt('Motif de la correction ?');
    if (!reason) return;
    try { await api(`/grades/${g.id}/correction`, { method: 'POST', body: { newScore: v, reason } }); alert('Demande envoyée à la direction'); } catch (e) { alert(e.message); }
  } }, 'Corriger');
  root.append(h('h2', {}, 'Notes'), table([['Matière', (g) => g.subject], ['Coef.', (g) => g.coef], ['Note /20', (g) => g.score + (g.history ? ' (corrigée)' : '')], ['', fix]], grades), h('p', {}, h('strong', {}, 'Moyenne : ' + average + '/20')));
};
