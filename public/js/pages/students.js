import { h, api, table, sel, query } from '../core.js';
export default async (root) => {
  const meta = await api('/meta');
  const form = h('form', { role: 'search', 'aria-label': 'Filtres' },
    h('label', {}, 'Recherche ', h('input', { name: 'q', type: 'search', placeholder: 'Nom ou identifiant' })),
    sel('dept', 'Département', meta.depts), sel('level', 'Niveau', meta.levels),
    sel('school', 'Établissement', meta.schools.map((s) => ({ v: s.id, t: s.name }))), sel('sex', 'Sexe', ['F', 'M']));
  const out = h('div', { 'aria-live': 'polite' }); // annoncé par les lecteurs d'écran à chaque mise à jour
  const run = async (e) => {
    e?.preventDefault();
    const rows = await api('/students?' + query(form));
    out.replaceChildren(h('p', {}, rows.length + ' résultat(s)'), table([['Identifiant', (r) => r.id], ['Nom', (r) => h('a', { href: '#student?id=' + r.id }, r.name)], ['Établissement', (r) => r.schoolName], ['Classe', (r) => r.cls]], rows));
  };
  form.addEventListener('submit', run); form.addEventListener('change', run);
  root.append(h('h1', {}, 'Recherche d’apprenants'), form, out); run();
};
