// Formulaire de paiement SIMULÉ. Astuce démo : un téléphone finissant par 00 = échec.
import { h, api } from './core.js';
export default (studentId, code, onDone) => {
  const method = h('select', { id: 'pm' }, ...[['mtn', 'MTN MoMo'], ['moov', 'Moov Money'], ['carte', 'Carte bancaire']].map(([v, t]) => h('option', { value: v }, t)));
  const phone = h('input', { id: 'ph', value: '97000001', inputmode: 'tel' });
  const msg = h('p', { role: 'status' });
  const pay = async () => {
    try { const r = await api('/pay', { method: 'POST', body: { studentId, code, method: method.value, phone: phone.value } }); msg.className = 'ok'; msg.textContent = '✅ ' + r.receipt; if (onDone) setTimeout(onDone, 1200); }
    catch (e) { msg.className = 'bad'; msg.textContent = '❌ ' + e.message; }
  };
  return h('div', {}, h('label', { for: 'pm' }, 'Moyen'), method, h('label', { for: 'ph' }, 'Téléphone'), phone, h('button', { onclick: pay }, 'Payer (simulation)'), msg);
};
