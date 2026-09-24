import { h, api, state } from '../core.js';
// Visible uniquement pour le personnel (enseignant, école, direction, ministère)
export default async (root, { student }) => {
  if (!['enseignant', 'ecole', 'direction', 'ministere'].includes(state.role)) return;
  const r = await api(`/students/${student.id}/risk`);
  root.append(h('h2', {}, 'Risque de décrochage'), h('p', {}, h('strong', {}, `${r.score}/100 - niveau ${r.level}`)), h('ul', {}, ...r.factors.map((f) => h('li', {}, f))));
};
