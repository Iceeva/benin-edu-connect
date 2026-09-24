import { h, api, table, sel, query } from '../core.js';
export default async (root) => {
  const form = h('form', {}, sel('role', 'Rôle', ['eleve', 'parent', 'ecole', 'direction', 'ministere']), h('label', {}, 'Texte ', h('input', { name: 'q' })));
  const out = h('div', { 'aria-live': 'polite' });
  const run = async () => { const r = await api('/audit?' + query(form)); out.replaceChildren(h('p', { class: r.intact ? 'ok' : 'bad' }, r.intact ? '🔒 Chaîne d’audit intacte' : '⚠️ Chaîne altérée !'), table([['#', (e) => e.n], ['Date', (e) => e.date.slice(0, 19).replace('T', ' ')], ['Rôle', (e) => e.role], ['Action', (e) => e.action], ['Détail', (e) => e.detail]], r.entries)); };
  form.onchange = run; root.append(h('h1', {}, 'Journal d’audit'), form, out); run();
};
