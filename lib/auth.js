// auth.js - RBAC (droits par rôle) + périmètre (chacun ne voit que "son" monde).
// ctx.user = identifiant du périmètre : n° d'élève, id d'école, nom de département, ou '*'.
const db = require('./db');
const err = (status, msg) => Object.assign(new Error(msg), { status });
const dept = (st) => (db.schools.find((s) => s.id === st.school) || {}).dept;
// Un rôle a-t-il le droit de voir cet apprenant ?
const canSee = (ctx, st) => ({
  ministere: true, direction: dept(st) === ctx.user,
  ecole: st.school === ctx.user, enseignant: st.school === ctx.user,
  eleve: st.id === ctx.user, parent: st.id === ctx.user,
})[ctx.role] === true;
// Refuse l'accès (403) si le rôle n'est pas dans la liste autorisée
const need = (ctx, ...roles) => { if (!roles.includes(ctx.role)) throw err(403, `Le profil « ${ctx.role} » n'a pas accès à cette action`); };
const scope = (ctx, list) => list.filter((s) => canSee(ctx, s));
const getStudent = (ctx, id) => {
  const s = db.students.find((x) => x.id === id);
  if (!s) throw err(404, 'Apprenant introuvable');
  if (!canSee(ctx, s)) throw err(403, 'Ce dossier ne fait pas partie de votre périmètre');
  return s;
};
module.exports = { err, need, canSee, scope, getStudent };
