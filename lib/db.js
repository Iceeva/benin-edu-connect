// db.js - données SIMULÉES, générées de façon déterministe (aucune donnée réelle).
// Elles vivent en mémoire : sur Vercel elles sont réinitialisées à chaque démarrage à froid.
let seed = 42;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; // aléatoire reproductible
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));

const schools = [
  { id: 'S1', name: 'EPP Cotonou Centre', dept: 'Littoral', level: 'primaire', type: 'public', classes: ['CM1', 'CM2'] },
  { id: 'S2', name: 'CEG Calavi', dept: 'Atlantique', level: 'secondaire', type: 'public', classes: ['3e', '2nde'] },
  { id: 'S3', name: 'Lycée Technique de Parakou', dept: 'Borgou', level: 'secondaire', type: 'public', classes: ['1ere', 'Tle'] },
  { id: 'S4', name: 'Collège Privé Sainte-Marie', dept: 'Ouémé', level: 'secondaire', type: 'privé', classes: ['4e', '3e'] },
  { id: 'S5', name: "Université d'Abomey-Calavi", dept: 'Atlantique', level: 'supérieur', type: 'public', classes: ['L1', 'L3'] },
  { id: 'S6', name: 'Université de Parakou', dept: 'Borgou', level: 'supérieur', type: 'public', classes: ['L2', 'M1'] },
];
const first = ['Elie', 'Fatou', 'Koffi', 'Aïcha', 'Rodrigue', 'Gisèle', 'Baba', 'Sènami', 'Ismaël', 'Pélagie'];
const last = ['Rodrique', 'Agbodjan', 'Houessou', 'Dossou', 'Adjovi', 'Tchibozo', 'Zannou', 'Gbaguidi'];
const students = Array.from({ length: 60 }, (_, i) => {
  const sc = schools[i % schools.length];
  return { id: 'BJ-EDU-' + (1000 + i), name: pick(first) + ' ' + pick(last), sex: rnd() < 0.5 ? 'F' : 'M', school: sc.id, cls: pick(sc.classes) };
});
const subjects = ['Mathématiques', 'Français', 'Anglais', 'Informatique', 'Physique'];

const db = { schools, students, subjects };
module.exports = db;

// --- Commit 4 : notes simulées (une note par matière et par apprenant) ---
db.grades = db.students.flatMap((st) => db.subjects.map((subject, i) => ({ id: 'G-' + st.id + '-' + i, studentId: st.id, subject, coef: [4, 4, 2, 3, 3][i], score: int(4, 19), year: '2025-2026' })));
