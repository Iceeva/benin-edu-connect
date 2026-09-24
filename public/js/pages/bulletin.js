import { h, api, qs, table, fakeQR } from '../core.js';
export default async (root) => {
  const id = qs().get('id'); let b;
  try { b = await api(`/students/${id}/bulletin`); } catch (e) {
    // {{ERR}}
    return root.append(h('p', { role: 'alert', class: 'bad' }, e.message));
  }
  root.append(h('h1', {}, 'Bulletin ' + b.doc.year), h('p', {}, `${b.student.name} - ${b.school.name} - ${b.student.cls}`),
    table([['Matière', (g) => g.subject], ['Coef.', (g) => g.coef], ['Note /20', (g) => g.score]], b.grades),
    h('p', {}, `Moyenne : ${b.average}/20 - ${b.mention} - ${b.decision}`),
    h('p', {}, 'Référence : ', h('code', {}, b.doc.ref), ' - ', h('a', { href: '#verify?ref=' + b.doc.ref }, 'vérifier ce document')),
    fakeQR(b.doc.ref), h('button', { onclick: () => print() }, '🖨️ Imprimer / enregistrer en PDF'));
};
