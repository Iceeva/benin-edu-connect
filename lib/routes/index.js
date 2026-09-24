// Liste des modules de routes : chaque module est (add, onDone) => { ... }
module.exports = [
  require('./students'),
  require('./grades'),
  require('./absences'),
  require('./justify'),
  require('./bulletin'),
  require('./payments'),
  require('./verify'),
  require('./stats'),
  require('./alerts'),
  require('./appointments'),
  require('./notifications'),
];
