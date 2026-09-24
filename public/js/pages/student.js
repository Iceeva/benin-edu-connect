// Fiche apprenant : chaque bloc (panel) est un module indépendant de js/panels/
import { h, api, qs } from '../core.js';
import p_grades from '../panels/grades.js';
// {{IMPORTS}}
export default async (root) => {
  const { student, school } = await api('/students/' + qs().get('id'));
  root.append(h('h1', {}, student.name), h('p', {}, `${student.id} - ${school.name || 'sans établissement'} (${student.cls})`));
  await p_grades(root, { student });
  // {{PANELS}}
};
