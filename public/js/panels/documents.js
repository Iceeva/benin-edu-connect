import { h } from '../core.js';
export default async (root, { student }) => root.append(h('h2', {}, 'Documents officiels'), h('p', {}, h('a', { href: '#bulletin?id=' + student.id }, '📄 Bulletin annuel')));
