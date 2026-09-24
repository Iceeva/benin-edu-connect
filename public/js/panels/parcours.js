import { h, table } from '../core.js';
export default async (root, { student }) => root.append(h('h2', {}, 'Parcours (établissements successifs)'), table([['Établissement', (p) => p.school], ['Depuis', (p) => p.from], ['Jusqu’au', (p) => p.to || 'en cours']], student.history || []));
