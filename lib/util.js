// Moyenne pondérée par les coefficients, arrondie à 2 décimales (null s'il n'y a pas de note)
exports.avg = (gs) => gs.length ? Math.round(gs.reduce((a, g) => a + g.score * g.coef, 0) / gs.reduce((a, g) => a + g.coef, 0) * 100) / 100 : null;
