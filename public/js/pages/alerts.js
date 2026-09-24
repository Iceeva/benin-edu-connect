import { h, api, table, act, sel, query, state } from '../core.js';
export default async (root) => {
  const form = h('form', {}, sel('type', 'Type', ['decrochage', 'difficulte', 'donnees']), sel('severity', 'Gravité', ['haute', 'moyenne']), sel('state', 'État', ['ouverte', 'traitee']));
  const out = h('div', { 'aria-live': 'polite' });
  const buttons = (a) => {
    const box = h('span');
    if (a.state === 'ouverte') box.append(act('Traiter', `/alerts/${a.id}/ack`, {}));
    // Depuis une alerte, l'école/direction peut convoquer l'apprenant : le premier créneau libre est réservé
    if (a.studentId && ['ecole', 'direction'].includes(state.role)) box.append(act('Convoquer', '/appointments/summon', { studentId: a.studentId, reason: a.text }));
  // {{ACT}}
    return box;
  };
  const run = async () => {
    const rows = await api('/alerts?' + query(form));
    out.replaceChildren(h('p', {}, rows.length + ' alerte(s)'), table([['Gravité', (a) => a.severity], ['Type', (a) => a.type], ['Détail', (a) => a.text], ['Actions', buttons]], rows));
  };
  form.onchange = run; root.append(h('h1', {}, 'Alertes automatiques'), form, out); run();
};
