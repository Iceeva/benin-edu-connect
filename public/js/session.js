// session.js - sélecteur de profil de DÉMONSTRATION (remplace une vraie authentification)
import { h, state } from './core.js';
// profil -> identifiant de périmètre par défaut
const DEMO = { eleve: 'BJ-EDU-1001', parent: 'BJ-EDU-1001', enseignant: 'S2', ecole: 'S2', direction: 'Atlantique', ministere: '*', entreprise: '*', public: '*' };
const LABEL = { eleve: 'Élève', parent: 'Parent', enseignant: 'Enseignant', ecole: 'Directeur d’école', direction: 'Direction départementale', ministere: 'Ministère', entreprise: 'Entreprise', public: 'Public' };
Object.assign(state, JSON.parse(localStorage.getItem('session') || '{}'));
const select = h('select', { 'aria-label': 'Changer de profil de démonstration' }, ...Object.keys(DEMO).map((r) => h('option', { value: r }, LABEL[r])));
select.value = state.role;
select.onchange = () => { state.role = select.value; state.user = DEMO[select.value]; localStorage.setItem('session', JSON.stringify(state)); location.hash = ''; dispatchEvent(new Event('hashchange')); };
document.getElementById('session').append(h('label', {}, 'Profil : ', select));
