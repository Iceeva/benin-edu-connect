// bell.js - cloche de notifications ; une NOUVELLE notification déclenche une alerte visuelle (toast)
import { h, api, toast } from './core.js';
const box = document.getElementById('bell'); let last = null;
async function refresh() {
  try {
    const n = (await api('/notifications')).filter((x) => !x.read).length;
    if (last !== null && n > last) toast('🔔 Nouvelle notification');
    last = n;
    box.replaceChildren(h('a', { href: '#notifications', 'aria-label': `${n} notification(s) non lue(s)` }, '🔔 ' + n));
  } catch { box.replaceChildren(); }
}
addEventListener('hashchange', refresh); refresh();
