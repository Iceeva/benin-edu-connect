import { h, api, table, act, state } from '../core.js';
export default async (root) => {
  const list = await api('/transfers'), me = state.user;
  root.append(h('h1', {}, 'Transferts entre établissements'));
  if (state.role === 'ecole') {
    const students = await api('/students'), schools = await api('/schools');
    const who = h('select', { 'aria-label': 'Apprenant' }, ...students.map((s) => h('option', { value: s.id }, s.name)));
    const to = h('select', { 'aria-label': 'Établissement d’accueil' }, ...schools.filter((s) => s.id !== me).map((s) => h('option', { value: s.id }, s.name)));
    const go = async () => { try { await api('/transfers', { method: 'POST', body: { studentId: who.value, toSchool: to.value, reason: 'Déménagement' } }); location.reload(); } catch (e) { alert(e.message); } };
    root.append(who, to, h('button', { onclick: go }, 'Demander le transfert'));
  }
  root.append(table([['Apprenant', (t) => t.studentId], ['De', (t) => t.from], ['Vers', (t) => t.to], ['Statut', (t) => t.status],
    ['Décision', (t) => state.role === 'ecole' && t.to === me && t.status === 'en_attente' ? h('span', {}, act('Accepter', `/transfers/${t.id}/decide`, { accept: true }), act('Refuser', `/transfers/${t.id}/decide`, { accept: false })) : '']], list));
};
