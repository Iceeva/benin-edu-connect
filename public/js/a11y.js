// a11y.js - barre d'accessibilité : taille du texte, contraste (d'autres options s'ajoutent plus tard)
import { h } from './core.js';
const prefs = JSON.parse(localStorage.getItem('prefs') || '{}');
// Chaque préférence devient un attribut data-* sur <html> que le CSS exploite
function apply() {
  const d = document.documentElement;
  d.style.fontSize = (prefs.size || 100) + '%';
  for (const k of ['contrast', 'easy', 'dys']) d.dataset[k] = prefs[k] ? 'true' : '';
  localStorage.setItem('prefs', JSON.stringify(prefs));
}
export const getPref = (k) => prefs[k];
export const setPref = (k, v) => { prefs[k] = v; apply(); };
const size = (delta) => () => setPref('size', Math.min(160, Math.max(80, (prefs.size || 100) + delta)));
document.getElementById('a11y').append(
  h('button', { onclick: size(10), 'aria-label': 'Agrandir le texte' }, 'A+'),
  h('button', { onclick: size(-10), 'aria-label': 'Réduire le texte' }, 'A−'),
  h('button', { onclick: () => setPref('contrast', !prefs.contrast), 'aria-label': 'Contraste élevé' }, '◐'));
apply();

// --- Commit 20 ---
// Lecture à voix haute avec la synthèse vocale du navigateur (aide les personnes malvoyantes ou peu lectrices)
const speak = () => { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(document.getElementById('app').innerText); u.lang = document.documentElement.lang === 'en' ? 'en-US' : 'fr-FR'; speechSynthesis.speak(u); };
document.getElementById('a11y').append(
  h('button', { onclick: speak, 'aria-label': 'Lire la page à voix haute' }, '🔊'),
  h('button', { onclick: () => speechSynthesis.cancel(), 'aria-label': 'Arrêter la lecture' }, '⏹'),
  h('button', { onclick: () => setPref('easy', !prefs.easy), 'aria-label': 'Mode facile : pictogrammes et gros boutons' }, '🧩'),
  h('button', { onclick: () => setPref('dys', !prefs.dys), 'aria-label': 'Police adaptée à la dyslexie' }, 'Aa'));
