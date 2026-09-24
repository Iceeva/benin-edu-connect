import { h, api, table } from '../core.js';
export default async (root) => {
  const classes = await api('/classes');
  const cls = h('select', { 'aria-label': 'Classe' }, ...classes.map((c) => h('option', {}, c)));
  const date = h('input', { type: 'date', value: new Date().toISOString().slice(0, 10), 'aria-label': 'Date de l’appel' });
  const subject = h('input', { placeholder: 'Matière (ex. SVT)', 'aria-label': 'Matière' });
  const out = h('div');
  const load = async () => {
    const rows = await api('/classes/' + cls.value + '/students');
    const mark = (s) => h('select', { 'data-id': s.id, 'aria-label': 'Présence de ' + s.name }, h('option', { value: '' }, 'Présent'), h('option', { value: 'absence' }, 'Absent'), h('option', { value: 'retard' }, 'Retard'));
    const note = (s) => h('input', { type: 'number', min: 0, max: 20, step: 0.25, 'data-note': s.id, 'aria-label': 'Note de ' + s.name });
    out.replaceChildren(table([['Apprenant', (s) => s.name], ['Appel', mark], ['Note /20', note]], rows));
  };
  cls.onchange = load; load();
  const post = async (path, body) => { try { const r = await api(path, { method: 'POST', body }); alert('Enregistré : ' + r.saved); } catch (e) { alert(e.message); } };
  const appel = () => post('/attendance/bulk', { date: date.value, entries: [...out.querySelectorAll('[data-id]')].filter((s) => s.value).map((s) => ({ studentId: s.dataset.id, kind: s.value })) });
  const notes = () => post('/grades/bulk', { subject: subject.value.trim(), coef: 2, entries: [...out.querySelectorAll('[data-note]')].filter((i) => i.value !== '').map((i) => ({ studentId: i.dataset.note, score: Number(i.value) })) });
  root.append(h('h1', {}, 'Ma classe'), cls, date, out, h('button', { onclick: appel }, 'Enregistrer l’appel'), h('p', {}), subject, h('button', { onclick: notes }, 'Enregistrer les notes'));
};
