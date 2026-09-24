import { h, api, table, state } from '../core.js';
const LINKS = { justificatifs: ['#justifications', 'Justificatifs à traiter'], transferts: ['#transfers', 'Transferts en attente'], corrections: ['#corrections', 'Corrections de notes'], aides: ['#aides', 'Demandes d’aide'], alertes: ['#alerts', 'Alertes ouvertes'], rendezVous: ['#appointments', 'Rendez-vous'] };
export default async (root) => {
  const [stats, ov] = await Promise.all([api('/stats'), api('/overview')]);
  root.append(h('h1', {}, 'Bienvenue'), h('p', {}, 'Profil actuel : ' + state.role));
  if (state.user.startsWith('BJ-')) root.append(h('p', {}, h('a', { href: '#student?id=' + state.user }, '👤 Mon dossier'), ' · ', h('a', { href: '#payments' }, '💰 Mes paiements'), ' · ', h('a', { href: '#aides' }, '🎒 Mes aides')));
  root.append(h('h2', {}, 'À traiter / à suivre'), h('div', { class: 'cards' }, ...Object.entries(ov).map(([k, v]) => h('a', { class: 'card', href: LINKS[k][0] }, h('strong', {}, String(v)), h('div', {}, LINKS[k][1])))));
  root.append(h('h2', {}, 'Chiffres (simulés)'), h('div', { class: 'cards' }, ...Object.entries(stats).map(([k, v]) => h('div', { class: 'card' }, h('strong', {}, String(v)), h('div', {}, k)))));
  if (['ecole', 'direction', 'ministere'].includes(state.role)) {
    const top = await api('/risk/top');
    root.append(h('h2', {}, 'Apprenants les plus à risque'), table([['Apprenant', (r) => h('a', { href: '#student?id=' + r.studentId }, r.name)], ['Score', (r) => r.score + '/100'], ['Facteurs', (r) => r.factors.join(' · ')]], top));
  }
};
