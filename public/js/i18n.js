// i18n.js - traduction FR -> EN par dictionnaire (textes exacts). Pour ajouter une langue (fon, yoruba…) : ajouter un dictionnaire.
import { h } from './core.js';
import { getPref, setPref } from './a11y.js';
const EN = { 'Accueil': 'Home', 'Apprenants': 'Learners', 'Justificatifs': 'Excuses', 'Paiements': 'Payments', 'Vérifier': 'Verify', 'Pilotage': 'Steering', 'Alertes': 'Alerts',
  'Rendez-vous': 'Appointments', 'Transferts': 'Transfers', 'Audit': 'Audit', 'Corrections': 'Corrections', 'Profil :': 'Profile:', 'Notes': 'Grades', 'Diplômes': 'Diplomas',
  'Absences et retards': 'Absences and lateness', 'Documents officiels': 'Official documents', 'Justifier': 'Justify', 'Réserver': 'Book', 'Annuler': 'Cancel', 'Confirmer': 'Confirm',
  'Refuser': 'Reject', 'Accepter': 'Accept', 'Traiter': 'Handle', 'Convoquer': 'Summon', 'Tous': 'All', 'Aller au contenu': 'Skip to content', 'Historique': 'History',
  'Payer (simulation)': 'Pay (simulation)', 'Bienvenue': 'Welcome', 'Notifications': 'Notifications', 'Aides': 'Aid', 'Classe': 'Class', 'Recherche': 'Search', 'Aide': 'Help' };
export const lang = () => getPref('lang') || 'fr';
// Remplace les nœuds texte dont le contenu exact figure dans le dictionnaire
export function translate(root) {
  if (lang() === 'fr') return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode());) { const t = n.nodeValue.trim(); if (EN[t]) n.nodeValue = n.nodeValue.replace(t, EN[t]); }
}
document.documentElement.lang = lang();
const s = h('select', { 'aria-label': 'Langue / Language' }, h('option', { value: 'fr' }, 'FR'), h('option', { value: 'en' }, 'EN'));
s.value = lang();
s.onchange = () => { setPref('lang', s.value); document.documentElement.lang = s.value; dispatchEvent(new Event('hashchange')); };
document.getElementById('a11y').append(s);
