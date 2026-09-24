import { h, api, qs, table, state } from '../core.js';
import payform from '../payform.js';
export default async (root) => {
  const id = qs().get('id') || state.user;
  root.append(h('h1', {}, 'Paiements (simulés)'));
  if (!id.startsWith('BJ-')) return root.append(h('p', {}, 'Choisissez le profil Élève ou Parent pour payer.'));
  const fees = await api('/fees');
  const select = h('select', { 'aria-label': 'Frais à payer' }, ...fees.map((f) => h('option', { value: f.code }, `${f.label} - ${f.amount} FCFA`)));
  const box = h('div');
  const draw = () => box.replaceChildren(payform(id, select.value, () => location.reload()));
  select.onchange = draw; draw();
  const pays = await api(`/students/${id}/payments`);
  root.append(select, box, h('h2', {}, 'Historique'), table([['Reçu', (p) => p.id], ['Code', (p) => p.code], ['Montant', (p) => p.amount + ' FCFA'], ['Moyen', (p) => p.method], ['Date', (p) => p.date.slice(0, 16).replace('T', ' ')]], pays));
};
