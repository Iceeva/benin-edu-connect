import { h, api, table } from '../core.js';
export default async (root, { student }) => {
  const { grades, average } = await api(`/students/${student.id}/grades`);
  root.append(h('h2', {}, 'Notes'), table([['Matière', (g) => g.subject], ['Coef.', (g) => g.coef], ['Note /20', (g) => g.score]], grades), h('p', {}, h('strong', {}, 'Moyenne : ' + average + '/20')));
};
