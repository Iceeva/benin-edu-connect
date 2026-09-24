import { h, api, qs } from '../core.js';
export default async (root) => {
  const input = h('input', { id: 'ref', value: qs().get('ref') || '', placeholder: 'BJ-DIP-2000' });
  const out = h('div', { role: 'status' });
  const run = async () => {
    if (!input.value.trim()) return;
    const r = await api('/verify/' + encodeURIComponent(input.value.trim()));
    out.replaceChildren(r.valid ? h('p', { class: 'ok' }, `✅ Authentique - ${r.type} (${r.year}) - titulaire ${r.holder} - ${r.school}`) : h('p', { class: 'bad' }, r.status ? '⚠️ Document ' + r.status : '❌ Référence inconnue'));
  };
  root.append(h('h1', {}, 'Vérifier un diplôme ou un bulletin'), h('label', { for: 'ref' }, 'Référence '), input, h('button', { onclick: run }, 'Vérifier'), h('p', {}, 'Exemple de démonstration : BJ-DIP-2000'), out);
  run();
};
