// Point d'entrée UNIQUE de l'API (le plan gratuit Vercel limite le nombre de fonctions) :
// tout /api/* est redirigé ici par vercel.json puis dispatché par lib/router.js
const { handle } = require('../lib/router');
module.exports = (req, res) => handle(req, res);
