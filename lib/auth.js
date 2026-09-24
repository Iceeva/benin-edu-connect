// auth.js - accès aux données. Version 1 : tout est visible (durci au commit 6).
const db = require('./db');
const err = (status, msg) => Object.assign(new Error(msg), { status });
const scope = (ctx, list) => list;
const getStudent = (ctx, id) => { const s = db.students.find((x) => x.id === id); if (!s) throw err(404, 'Apprenant introuvable'); return s; };
module.exports = { err, scope, getStudent };
