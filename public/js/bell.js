// bell.js - cloche de notifications (rafraîchie à chaque navigation, pas de polling : économise les données)
import { h, api } from './core.js';
const box = document.getElementById('bell');
async function refresh() {
  try { const n = (await api('/notifications')).filter((x) => !x.read).length; box.replaceChildren(h('a', { href: '#notifications', 'aria-label': `${n} notification(s) non lue(s)` }, '🔔 ' + n)); }
  catch { box.replaceChildren(); }
}
addEventListener('hashchange', refresh); refresh();
