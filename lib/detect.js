// detect.js - moteur de règles : décrochage, difficultés scolaires, qualité des données
const crypto = require('crypto');
const db = require('./db');
const { avg } = require('./util');
module.exports = () => {
  const out = [];
  // id stable (hash du texte) pour pouvoir marquer une alerte comme traitée
  const A = (type, severity, text, studentId) => out.push({ id: type + '-' + crypto.createHash('sha1').update(text).digest('hex').slice(0, 8), type, severity, text, studentId, schoolId: (db.students.find((s) => s.id === studentId) || {}).school });
  const seen = {};
  for (const st of db.students) {
    const unj = db.absences.filter((a) => a.studentId === st.id && a.kind === 'absence' && a.status === 'non_justifiee').length;
    if (unj >= 5) A('decrochage', 'haute', `${st.name} : ${unj} absences non justifiées`, st.id);
    const m = avg(db.grades.filter((g) => g.studentId === st.id));
    if (m !== null && m < 8) A('difficulte', 'moyenne', `${st.name} : moyenne ${m}/20`, st.id);
    if (!db.schools.some((s) => s.id === st.school)) A('donnees', 'haute', `${st.id} n'a aucun établissement valide`, st.id);
    const k = st.name + st.school + st.cls;
    if (seen[k]) A('donnees', 'moyenne', `Doublon probable : ${st.id} et ${seen[k]}`, st.id); else seen[k] = st.id;
  }
  for (const g of db.grades) if (g.score < 0 || g.score > 20) A('donnees', 'haute', `Note impossible (${g.score}/20) - ${g.id}`, g.studentId);
  for (const d of db.diplomas) if (!d.ref) A('donnees', 'haute', `Diplôme sans référence pour ${d.studentId}`, d.studentId);
  return out;
};
