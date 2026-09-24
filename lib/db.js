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

// --- Commit 5 : absences et retards simulés ---
db.absences = [];
db.students.forEach((st) => { for (let i = 0, n = int(0, 5); i < n; i++) db.absences.push({ id: 'A-' + db.absences.length, studentId: st.id, date: `2026-09-${String(int(1, 22)).padStart(2, '0')}`, kind: rnd() < 0.7 ? 'absence' : 'retard', minutes: int(5, 45), status: 'non_justifiee', motif: '' }); });

// --- Commit 8 : registre des documents officiels émis (bulletins…) ---
db.documents = [];

// --- Commit 9 : catalogue de frais (fixés par l'école ou le ministère) et paiements SIMULÉS ---
db.fees = [
  { code: 'BUL', label: 'Bulletin officiel', amount: 500, issuer: 'ecole' },
  { code: 'REL', label: 'Relevé de notes', amount: 1000, issuer: 'ecole' },
  { code: 'DUP', label: 'Duplicata de diplôme', amount: 2500, issuer: 'ministere' },
];
db.payments = [];

// --- Commit 11 : diplômes simulés ---
db.diplomas = db.students.filter((s) => ['CM2', '3e', 'Tle', 'L3', 'M1'].includes(s.cls)).map((s, i) => ({ ref: 'BJ-DIP-' + (2000 + i), studentId: s.id, title: { CM2: 'CEP', '3e': 'BEPC', Tle: 'BAC', L3: 'Licence', M1: 'Master' }[s.cls], year: 2025, status: 'valide' }));

// --- Commit 13 : anomalies volontairement injectées pour tester la détection ---
db.students.push({ ...db.students[3], id: 'BJ-EDU-9001' });                                   // doublon d'identité
db.students.push({ id: 'BJ-EDU-9002', name: 'Élève Orphelin', sex: 'F', school: 'S0', cls: '3e' }); // établissement inexistant
db.grades.push({ id: 'G-BAD', studentId: 'BJ-EDU-1002', subject: 'Français', coef: 4, score: 25, year: '2025-2026' }); // note impossible
db.diplomas.push({ ref: '', studentId: 'BJ-EDU-1005', title: 'BAC', year: 2025, status: 'valide' }); // diplôme sans référence
for (let i = 0; i < 5; i++) db.absences.push({ id: 'A-X' + i, studentId: 'BJ-EDU-1004', date: `2026-09-${10 + i}`, kind: 'absence', minutes: 0, status: 'non_justifiee', motif: '' }); // décrochage probable
db.acks = []; // alertes marquées "traitées"

// --- Commit 14 : créneaux de rendez-vous (direction de chaque établissement), 5 prochains jours ouvrés ---
db.slots = []; db.appointments = [];
{
  const d = new Date(); let n = 0;
  while (n < 5) {
    d.setDate(d.getDate() + 1); if ([0, 6].includes(d.getDay())) continue; n++;
    const day = d.toISOString().slice(0, 10);
    for (const sc of db.schools) for (const t of ['09:00', '10:00', '11:00', '15:00']) db.slots.push({ id: `SL-${sc.id}-${day}-${t}`, schoolId: sc.id, date: day, time: t, with: 'Direction - ' + sc.name });
  }
}

// --- Commit 15 : notifications ---
db.notifications = [];

// --- Commit 16 : historique de parcours et transferts ---
db.transfers = [];
db.students.forEach((s) => { s.history = [{ school: s.school, from: '2025-09-01', to: null }]; });

// --- Commit 17 : journal d'audit ---
db.audit = [];

// --- Commit 18 : demandes de correction de notes ---
db.corrections = [];
