import { h, api, table, sel, query, state } from '../core.js';
export default async (root) => {
  const meta = await api('/meta');
  const form = h('form', { role: 'search' }, h('label', {}, 'Mot-clé ', h('input', { name: 'q', type: 'search' })),
    sel('types', 'Chercher dans', ['students', 'schools', 'diplomas', 'appointments']), sel('dept', 'Département', meta.depts), sel('level', 'Niveau', meta.levels),
    sel('status', 'Statut', ['valide', 'revoque', 'demande', 'confirme', 'annule']), h('label', {}, 'Page ', h('input', { name: 'page', type: 'number', min: 1, value: 1 })));
  const out = h('div', { 'aria-live': 'polite' });
  const run = async (e) => {
    e?.preventDefault();
    const r = await api('/search?' + query(form));
    // Tableau générique : une colonne par champ simple du premier résultat
    out.replaceChildren(...Object.entries(r).map(([k, v]) => h('section', {}, h('h2', {}, `${k} (${v.total})`), table(Object.keys(v.items[0] || {}).filter((c) => typeof v.items[0][c] !== 'object').map((c) => [c, (x) => x[c]]), v.items))));
  };
  const exportCsv = async () => { const r = await fetch('/api/export/students', { headers: { 'x-role': state.role, 'x-user': state.user } }); if (!r.ok) return alert((await r.json()).error); const a = h('a', { href: URL.createObjectURL(await r.blob()), download: 'apprenants.csv' }); a.click(); };
  form.addEventListener('submit', run); form.addEventListener('change', run);
  root.append(h('h1', {}, 'Recherche globale'), form, h('button', { onclick: exportCsv }, '⬇️ Exporter les apprenants (CSV)'), out); run();
};
