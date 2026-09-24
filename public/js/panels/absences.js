import { h, api, table } from '../core.js';
export default async (root, { student }) => {
  const rows = await api(`/students/${student.id}/absences`);
  root.append(h('h2', {}, 'Absences et retards'), table([['Date', (a) => a.date], ['Type', (a) => a.kind === 'retard' ? `Retard (${a.minutes} min)` : 'Absence'], ['Statut', (a) => a.status]], rows));
};
