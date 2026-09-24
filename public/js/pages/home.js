import { h, api, table } from '../core.js';
export default async (root) => {
  const s = await api('/stats');
  root.append(h('h1', {}, 'Tableau de bord'), h('div', { class: 'cards' }, ...Object.entries(s).map(([k, v]) => h('div', { class: 'card' }, h('strong', {}, String(v)), h('div', {}, k)))));
  const list = await api('/students');
  root.append(h('h2', {}, 'Apprenants'), table([['Identifiant', (r) => r.id], ['Nom', (r) => r.name], ['Établissement', (r) => r.schoolName], ['Classe', (r) => r.cls]], list));
};
