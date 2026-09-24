import { h, api, table, sel, query } from '../core.js';
export default async (root) => {
  const form = h('form', {}, sel('level', 'Niveau', ['primaire', 'secondaire', 'supérieur']), sel('type', 'Statut', ['public', 'privé']));
  const out = h('div', { 'aria-live': 'polite' });
  const run = async () => {
    const rows = await api('/dashboard?' + query(form)), max = Math.max(1, ...rows.map((r) => r.students));
    // Barres décoratives + tableau : l'information reste accessible sans la vue
    out.replaceChildren(...rows.map((r) => h('div', {}, `${r.dept} : ${r.students} apprenants`, h('div', { 'aria-hidden': 'true', style: `background:var(--ac);height:.8rem;width:${r.students / max * 100}%` }))),
      table([['Département', (r) => r.dept], ['Établissements', (r) => r.schools], ['Apprenants', (r) => r.students], ['Moyenne', (r) => r.average], ['Abs. non justifiées / élève', (r) => r.absPerStudent]], rows));
  };
  form.onchange = run; root.append(h('h1', {}, 'Pilotage par département'), form, out); run();
};
