import { h } from '../core.js';
export default async (root) => root.append(h('h1', {}, 'Aide'),
  h('p', {}, 'Choisissez un profil de démonstration en haut de page (élève, parent, école, ministère…).'),
  h('h2', {}, 'Accessibilité'), h('ul', {}, h('li', {}, 'A+ / A− : taille du texte ; ◐ : contraste élevé ; Aa : police dyslexie.'), h('li', {}, '🔊 lit la page à voix haute ; 🧩 active les pictogrammes et les gros boutons.'), h('li', {}, 'Les alertes sont visuelles et vibrantes, jamais seulement sonores.')),
  h('h2', {}, 'Astuces de démonstration'), h('ul', {}, h('li', {}, 'Paiement : un numéro finissant par 00 simule un échec.'), h('li', {}, 'Vérification : BJ-DIP-2000 est un diplôme valide.'), h('li', {}, 'Les données sont fictives et se réinitialisent régulièrement.')));
