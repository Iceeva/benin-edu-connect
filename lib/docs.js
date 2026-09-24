// docs.js - émission de documents officiels avec référence unique + empreinte SHA-256
const crypto = require('crypto');
const db = require('./db');
exports.issue = (type, studentId, year, label) => {
  let d = db.documents.find((x) => x.type === type && x.studentId === studentId && x.year === year);
  if (!d) { // idempotent : un même document garde toujours la même référence
    const hash = crypto.createHash('sha256').update(type + studentId + year + 'sel-demo').digest('hex');
    d = { ref: `BJ-${type}-${hash.slice(0, 8).toUpperCase()}`, type, studentId, year, label, hash, status: 'valide', issuedAt: new Date().toISOString() };
    db.documents.push(d);
  }
  return d;
};
