import { h, api, table, act, state } from '../core.js';
export default async (root) => {
  const fixed = state.user.startsWith('BJ-') ? state.user : '';   // élève/parent : apprenant imposé
  const students = fixed ? [] : await api('/students');
  const who = h('select', { 'aria-label': 'Apprenant' }, ...students.map((s) => h('option', { value: s.id }, s.name + ' - ' + s.id)));
  const slot = h('select', { 'aria-label': 'Créneau' });
  const reason = h('input', { placeholder: 'Motif du rendez-vous', 'aria-label': 'Motif' });
  const load = async () => { const id = fixed || who.value; if (!id) return; const { student } = await api('/students/' + id); const slots = await api('/slots?school=' + student.school); slot.replaceChildren(...slots.slice(0, 20).map((s) => h('option', { value: s.id }, `${s.date} à ${s.time} - ${s.with}`))); };
  who.onchange = load; load();
  const staff = ['ecole', 'direction'].includes(state.role);
  const list = await api('/appointments');
  const book = async () => { try { await api('/appointments', { method: 'POST', body: { slotId: slot.value, studentId: fixed || who.value, reason: reason.value } }); location.reload(); } catch (e) { alert(e.message); } };
  root.append(h('h1', {}, 'Rendez-vous'),
    ...(['eleve', 'parent', 'ecole', 'direction'].includes(state.role) ? [h('h2', {}, 'Prendre rendez-vous'), fixed ? '' : who, slot, reason, h('button', { onclick: book }, 'Réserver')] : []),
    table([['Date', (a) => a.date + ' ' + a.time], ['Apprenant', (a) => a.studentId], ['Motif', (a) => a.reason], ['Statut', (a) => a.status],
      ['Actions', (a) => h('span', {}, ...(staff && a.status === 'demande' ? [act('Confirmer', `/appointments/${a.id}/status`, { status: 'confirme' }), act('Refuser', `/appointments/${a.id}/status`, { status: 'refuse' })] : []), a.status !== 'annule' ? act('Annuler', `/appointments/${a.id}/status`, { status: 'annule' }) : '')]], list));
};
