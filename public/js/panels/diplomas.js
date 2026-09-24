import { h, api, table, act, state } from '../core.js';
export default async (root, { student }) => {
  const rows = await api(`/students/${student.id}/diplomas`);
  root.append(h('h2', {}, 'Diplômes'), table([['Titre', (d) => d.title], ['Année', (d) => d.year], ['Référence', (d) => h('a', { href: '#verify?ref=' + d.ref }, d.ref || '-')], ['Statut', (d) => d.status],
    ['', (d) => state.role === 'ministere' && d.ref && d.status === 'valide' ? act('Révoquer', `/diplomas/${d.ref}/revoke`, {}) : '']], rows));
};
