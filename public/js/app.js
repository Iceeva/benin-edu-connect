import './bell.js';
import './session.js';
import './a11y.js';
// app.js - routeur "hash" : #page?param=valeur charge js/pages/page.js
import { pages } from './registry.js';
import { h } from './core.js';
const root = document.getElementById('app');
async function show() {
  const id = location.hash.slice(1).split('?')[0].replace(/[^a-z-]/g, '') || pages[0][0];
  document.getElementById('nav').replaceChildren(...pages.map(([p, t, icon]) => h('a', { href: '#' + p, 'data-icon': icon || '', 'aria-current': p === id ? 'page' : 'false' }, t)));
  root.replaceChildren(h('p', {}, 'Chargement…'));
  try { const page = (await import('./pages/' + id + '.js')).default; root.replaceChildren(); await page(root); root.focus(); }
  catch (e) { root.replaceChildren(h('p', { role: 'alert', class: 'bad' }, 'Erreur : ' + e.message)); }
}
addEventListener('hashchange', show);
show();

// --- Commit 19 : connectivité limitée - bandeau hors-ligne + service worker ---
const banner = h('p', { role: 'status', hidden: '', style: 'margin:0;padding:.5rem;background:#b00020;color:#fff;text-align:center' }, '📴 Hors-ligne : données en cache, actions indisponibles');
document.body.prepend(banner);
const upd = () => { banner.hidden = navigator.onLine; };
addEventListener('online', upd); addEventListener('offline', upd); upd();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
