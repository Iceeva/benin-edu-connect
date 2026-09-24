// core.js - outils partagés par toutes les pages
// h() : mini "hyperscript" pour créer des éléments DOM sans framework
export const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) k.startsWith('on') ? el.addEventListener(k.slice(2), v) : el.setAttribute(k, v);
  el.append(...kids.flat().filter((k) => k != null));
  return el;
};
// Profil de démonstration courant (modifié par session.js)
export const state = { role: 'ministere', user: '*' };
// api() : appelle /api/... en envoyant le profil simulé dans des en-têtes
export async function api(path, opts = {}) {
  const r = await fetch('/api' + path, { method: opts.method || 'GET', headers: { 'content-type': 'application/json', 'x-role': state.role, 'x-user': state.user }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const j = await r.json();
  if (!r.ok) throw Object.assign(new Error(j.error || 'Erreur'), { status: r.status, data: j });
  return j;
}
// Paramètres de la partie "#page?a=b" de l'URL
export const qs = () => new URLSearchParams(location.hash.split('?')[1] || '');
// table() : colonnes = [[titre, (ligne) => texte|nœud]]
export const table = (cols, rows) => h('table', {}, h('thead', {}, h('tr', {}, ...cols.map((c) => h('th', { scope: 'col' }, c[0])))), h('tbody', {}, ...rows.map((r) => h('tr', {}, ...cols.map((c) => h('td', {}, c[1](r)))))));
// act() : bouton qui envoie une action POST puis recharge la page
export const act = (label, path, body) => h('button', { onclick: async () => { try { await api(path, { method: 'POST', body }); location.reload(); } catch (e) { alert(e.message); } } }, label);
// sel() : liste déroulante étiquetée ; query() : formulaire -> paramètres d'URL sans valeurs vides
export const sel = (name, label, opts) => h('label', {}, label + ' ', h('select', { name }, h('option', { value: '' }, 'Tous'), ...opts.map((o) => h('option', { value: o.v ?? o }, o.t ?? o))));
export const query = (form) => { const p = new URLSearchParams(new FormData(form)); [...p].forEach(([k, v]) => !v && p.delete(k)); return p; };
