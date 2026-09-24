import { h, api, table, act } from '../core.js';
export default async (root) => {
  const rows = await api('/notifications');
  root.append(h('h1', {}, 'Notifications'), table([['Date', (n) => n.date.slice(0, 16).replace('T', ' ')], ['Message', (n) => n.text], ['', (n) => n.read ? '' : act('Marquer lu', `/notifications/${n.id}/read`, {})]], rows));
};
