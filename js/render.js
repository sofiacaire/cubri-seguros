import { solicitud } from './estado.js';
import { calcularCuota, formatearMoneda } from './cotizador.js';

const PASOS = [{ n: 1, label: 'Equipo' }, { n: 2, label: 'Plan' }, { n: 3, label: 'Titular' }, { n: 4, label: 'Pago' }];

export function render() {
  document.querySelectorAll('[data-paso]').forEach((seccion) => {
    seccion.hidden = Number(seccion.dataset.paso) !== solicitud.paso;
  });
  renderStepper();
  renderResumen();
  renderPlanes();
  renderReciboFinal();
  renderResultado();
  const pagar = document.querySelector('#pagar');
  if (pagar) {
    pagar.disabled = solicitud.procesando;
    pagar.innerHTML = solicitud.procesando ? 'Procesando…' : `Pagar <span>${formatearMoneda(cuotaSeleccionada())}</span>`;
  }
}

function renderStepper() {
  document.querySelectorAll('[data-stepper]').forEach((stepper) => {
    stepper.innerHTML = PASOS.map(({ n, label }) => {
      const estado = solicitud.paso > n ? 'complete' : solicitud.paso === n ? 'active' : '';
      return `<div class="stepper-item ${estado}"><span class="stepper-circle">${solicitud.paso > n ? '✓' : n}</span><span class="stepper-label">${label}</span></div>`;
    }).join('');
  });
}

function cuotaSeleccionada() {
  const plan = solicitud.planes.find((p) => p.id === solicitud.plan);
  return plan ? calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad) : 0;
}

function renderResumen() {
  const e = solicitud.equipo;
  const plan = solicitud.planes.find((p) => p.id === solicitud.plan);
  const nombreEquipo = [e.marca, e.modelo].filter(Boolean).join(' ') || 'Tu celular';
  const detalleEquipo = e.valor ? formatearMoneda(e.valor) : 'Aún sin cotizar';
  const total = plan && e.valor && e.antiguedad ? formatearMoneda(cuotaSeleccionada()) : '—';
  const html = `<h3 class="summary-title">Resumen de tu seguro</h3><div class="summary-product"><div class="summary-device-icon">▯</div><div><strong>Seguro de celular</strong><small>${escapeHTML(nombreEquipo)}</small></div></div><div class="summary-lines"><div class="summary-line"><span>Valor del equipo</span><strong>${detalleEquipo}</strong></div><div class="summary-line"><span>Plan elegido</span><strong>${plan ? escapeHTML(plan.nombre) : 'Plus (recomendado)'}</strong></div><div class="summary-line"><span>Frecuencia</span><strong>Mensual</strong></div></div><div class="summary-total"><span>Cuota mensual</span><strong>${total}</strong></div><div class="summary-note"><span>ⓘ</span><span>Precio de referencia simulado. La contratación no genera cobertura real.</span></div>`;
  document.querySelectorAll('[data-summary]').forEach((el) => { el.innerHTML = html; });
  document.querySelectorAll('[data-mobile-summary]').forEach((el) => { el.innerHTML = html; });
}

function renderPlanes() {
  const contenedor = document.querySelector('#plans-list');
  if (!contenedor || !solicitud.planes.length) return;
  contenedor.innerHTML = solicitud.planes.map((plan) => {
    const cuota = calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad);
    return `<label class="plan-option"><input type="radio" name="plan" value="${plan.id}" ${solicitud.plan === plan.id ? 'checked' : ''}><span class="plan-card"><span><span class="plan-head"><span class="plan-name">${escapeHTML(plan.nombre)}</span>${plan.recomendado ? '<span class="badge">Recomendado</span>' : ''}</span><span class="plan-description">${plan.id === 'basico' ? 'Protección esencial para tu equipo.' : plan.id === 'plus' ? 'Un equilibrio ideal entre precio y cobertura.' : 'Protección más amplia para imprevistos.'}</span><span class="coverage-list">${plan.coberturas.map((c) => `<span>✓ ${escapeHTML(c)}</span>`).join('')}</span></span><span class="plan-price">${formatearMoneda(cuota)}<small>/ mes</small></span></span></label>`;
  }).join('');
}

function renderReciboFinal() {
  const contenedor = document.querySelector('[data-final-receipt]');
  if (!contenedor) return;
  const e = solicitud.equipo, t = solicitud.titular;
  const plan = solicitud.planes.find((p) => p.id === solicitud.plan);
  contenedor.innerHTML = `<h3>Resumen de contratación</h3><div class="receipt-row"><span>Seguro</span><strong>Celular</strong></div><div class="receipt-row"><span>Equipo</span><strong>${escapeHTML([e.marca, e.modelo].filter(Boolean).join(' '))}</strong></div><div class="receipt-row"><span>Plan</span><strong>${plan ? escapeHTML(plan.nombre) : '—'}</strong></div><div class="receipt-row"><span>Titular</span><strong>${escapeHTML(`${t.nombre} ${t.apellido}`.trim())}</strong></div><div class="receipt-row receipt-total"><span>Total mensual</span><strong>${formatearMoneda(cuotaSeleccionada())}</strong></div>`;
}

function renderResultado() {
  const t = solicitud.titular;
  const poliza = document.querySelector('[data-policy]');
  if (poliza) poliza.textContent = solicitud.poliza || '';
  const nombre = document.querySelector('[data-success-name]');
  if (nombre) nombre.textContent = t.nombre || '';
  const detalles = document.querySelector('[data-success-details]');
  if (detalles) {
    const e = solicitud.equipo, plan = solicitud.planes.find((p) => p.id === solicitud.plan);
    detalles.innerHTML = `<div class="detail-tile"><span>Titular</span><strong>${escapeHTML(`${t.nombre} ${t.apellido}`.trim())}</strong></div><div class="detail-tile"><span>Email</span><strong>${escapeHTML(t.email)}</strong></div><div class="detail-tile"><span>Equipo asegurado</span><strong>${escapeHTML(`${e.marca} ${e.modelo}`.trim())}</strong></div><div class="detail-tile"><span>Plan</span><strong>${plan ? escapeHTML(plan.nombre) : ''} · ${formatearMoneda(cuotaSeleccionada())}/mes</strong></div>`;
  }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
