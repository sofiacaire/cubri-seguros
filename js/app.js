import { solicitud, actualizar, reiniciarSolicitud } from './estado.js';
import { leerImporte, formatearMoneda } from './cotizador.js';
import { validarCampo, validarGrupo } from './validaciones.js';
import { simularPago, generarPoliza } from './pago.js';
import { render } from './render.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

async function iniciar() {
  try {
    const respuesta = await fetch('./data/planes.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar planes.json');
    solicitud.planes = await respuesta.json();
  } catch (error) {
    console.error(error);
    mostrarAvisoCarga('No se pudieron cargar los planes. Abrí el proyecto con Live Server o un servidor local, no con file://.');
  }
  enlazarEventos();
  render();
}

function mostrarAvisoCarga(mensaje) {
  const aviso = document.createElement('div');
  aviso.className = 'alert error-alert';
  aviso.setAttribute('role', 'alert');
  aviso.textContent = mensaje;
  $('.page-shell').prepend(aviso);
}

function enlazarEventos() {
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-action]');
    if (!boton) return;
    const accion = boton.dataset.action;
    if (accion === 'start') irAPaso(1);
    if (accion === 'back') irAPaso(Math.max(1, solicitud.paso - 1));
    if (accion === 'restart') {
      reiniciarSolicitud();
      limpiarFormularios();
      render();
    }
    if (accion === 'retry' || accion === 'change-payment') irAPaso(4);
    if (accion === 'terms') {
      evento.preventDefault();
      $('#terms-dialog').showModal();
    }
    if (accion === 'close-terms') $('#terms-dialog').close();
    if (accion === 'copy-policy') {
      const numero = solicitud.poliza;
      if (numero && navigator.clipboard?.writeText) navigator.clipboard.writeText(numero).then(() => { boton.textContent = 'Copiado'; }).catch(() => { boton.textContent = numero; });
      else boton.textContent = numero || 'Sin número';
    }
  });

  $('#equipo-form').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const valores = leerEquipoForm();
    const errores = validarGrupo(valores);
    mostrarErrores(errores);
    if (Object.keys(errores).length) { enfocarPrimerError(errores); return; }
    solicitud.equipo = { ...valores, valor: Number(valores.valor) };
    if (!solicitud.planes.length) {
      mostrarAvisoCarga('No hay planes disponibles. Revisá que el servidor local esté funcionando.');
      return;
    }
    if (!solicitud.planes.some((p) => p.id === solicitud.plan)) solicitud.plan = 'plus';
    render();
    irAPaso(2);
  });

  $('#equipo-form').addEventListener('input', actualizarEstadoEquipo);
  $('#equipo-form').addEventListener('change', actualizarEstadoEquipo);
  $('#equipo-form').addEventListener('blur', (evento) => {
    const campo = evento.target.name;
    if (!['marca', 'modelo', 'valor', 'antiguedad'].includes(campo)) return;
    const valores = leerEquipoForm();
    mostrarErrores({ [campo]: validarCampo(campo, valores[campo]) });
  }, true);

  $('#plan-form').addEventListener('change', (evento) => {
    if (evento.target.name === 'plan') {
      solicitud.plan = evento.target.value;
      render();
    }
  });
  $('#plan-form').addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!solicitud.plan || !solicitud.planes.some((p) => p.id === solicitud.plan)) {
      $('#plan-error').textContent = 'Elegí un plan para continuar.';
      return;
    }
    $('#plan-error').textContent = '';
    irAPaso(3);
  });

  $('#titular-form').addEventListener('input', actualizarEstadoTitular);
  $('#titular-form').addEventListener('change', actualizarEstadoTitular);
  $('#titular-form').addEventListener('blur', (evento) => {
    const campo = evento.target.name;
    if (!['nombre', 'apellido', 'dni', 'nacimiento', 'email', 'celular', 'terminos'].includes(campo)) return;
    const valores = leerTitularForm();
    mostrarErrores({ [campo]: validarCampo(campo, valores[campo]) });
  }, true);
  $('#titular-form').addEventListener('submit', (evento) => {
    evento.preventDefault();
    const valores = leerTitularForm();
    const errores = validarGrupo(valores);
    mostrarErrores(errores);
    if (Object.keys(errores).length) { enfocarPrimerError(errores); return; }
    solicitud.titular = valores;
    irAPaso(4);
  });

  $('#pago-form').addEventListener('input', actualizarEstadoPago);
  $('#pago-form').addEventListener('change', actualizarEstadoPago);
  $('#pago-form').addEventListener('blur', (evento) => {
    const campo = evento.target.name === 'titularPago' ? 'titularPago' : evento.target.name;
    if (!['tarjeta', 'vencimiento', 'cvv', 'titularPago'].includes(campo)) return;
    const valores = leerPagoForm();
    mostrarErrores({ [campo]: validarCampo(campo, valores[campo]) });
  }, true);
  $('#pago-form').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (solicitud.procesando) return;
    const valores = leerPagoForm();
    const errores = validarGrupo(valores);
    mostrarErrores(errores);
    if (Object.keys(errores).length) { enfocarPrimerError(errores); return; }
    solicitud.pago = valores;
    solicitud.procesando = true;
    render();
    const resultado = await simularPago(valores.tarjeta);
    solicitud.procesando = false;
    if (resultado.ok) {
      solicitud.poliza = generarPoliza();
      irAPaso(5);
    } else {
      irAPaso(6);
    }
  });
}

function leerEquipoForm() {
  const form = $('#equipo-form');
  const datos = new FormData(form);
  return {
    marca: String(datos.get('marca') || ''),
    modelo: String(datos.get('modelo') || '').trim(),
    valor: leerImporte(datos.get('valor')),
    antiguedad: String(datos.get('antiguedad') || '')
  };
}
function leerTitularForm() {
  const datos = new FormData($('#titular-form'));
  return {
    nombre: String(datos.get('nombre') || '').trim(), apellido: String(datos.get('apellido') || '').trim(),
    dni: String(datos.get('dni') || '').trim(), nacimiento: String(datos.get('nacimiento') || ''),
    email: String(datos.get('email') || '').trim(), celular: String(datos.get('celular') || '').trim(),
    terminos: datos.get('terminos') === 'on'
  };
}
function leerPagoForm() {
  const datos = new FormData($('#pago-form'));
  return {
    metodo: String(datos.get('metodo') || 'credito'), tarjeta: String(datos.get('tarjeta') || '').replace(/\s/g, ''),
    vencimiento: String(datos.get('vencimiento') || '').trim(), cvv: String(datos.get('cvv') || '').trim(),
    titularPago: String(datos.get('titularPago') || '').trim()
  };
}

function actualizarEstadoEquipo() {
  const valores = leerEquipoForm();
  const errores = validarGrupo(valores);
  $('#ver-planes').disabled = Object.keys(errores).length > 0;
  if (valores.marca) solicitud.equipo.marca = valores.marca;
  if (valores.modelo) solicitud.equipo.modelo = valores.modelo;
  solicitud.equipo.valor = valores.valor;
  if (valores.antiguedad) solicitud.equipo.antiguedad = valores.antiguedad;
}
function actualizarEstadoTitular() {
  const valores = leerTitularForm();
  solicitud.titular = valores;
  $('#continuar-pago').disabled = Object.keys(validarGrupo(valores)).length > 0;
}
function actualizarEstadoPago() {
  const valores = leerPagoForm();
  solicitud.pago = valores;
  const form = $('#pago-form');
  const errores = validarGrupo(valores);
  const btn = $('#pagar');
  if (btn && !solicitud.procesando) btn.disabled = Object.keys(errores).length > 0;
  const total = document.querySelector('[data-pay-total]');
  if (total) total.textContent = formatearMoneda(cuotaActual());
  // Formateo visual de tarjeta y vencimiento, sin almacenar espacios en el estado.
  const tarjeta = $('#tarjeta');
  if (document.activeElement === tarjeta) {
    const limpio = tarjeta.value.replace(/\D/g, '').slice(0, 16);
    tarjeta.value = limpio.replace(/(.{4})/g, '$1 ').trim();
  }
  const vencimiento = $('#vencimiento');
  if (document.activeElement === vencimiento) {
    const limpio = vencimiento.value.replace(/\D/g, '').slice(0, 4);
    vencimiento.value = limpio.length > 2 ? `${limpio.slice(0, 2)}/${limpio.slice(2)}` : limpio;
  }
}
function cuotaActual() {
  const plan = solicitud.planes.find((p) => p.id === solicitud.plan);
  if (!plan) return 0;
  return Math.round(solicitud.equipo.valor * plan.tasaAnual / 12 * ({ menos1: 1, '1a2': 1.1, mas2: 1.25 }[solicitud.equipo.antiguedad] || 1));
}
function mostrarErrores(errores) {
  for (const [campo, mensaje] of Object.entries(errores)) {
    const input = document.querySelector(`[name="${campo}"]`);
    const error = document.querySelector(`#${campo}-error`);
    if (!input || !error) continue;
    const field = input.closest('.field');
    if (mensaje) {
      error.textContent = mensaje;
      field?.setAttribute('data-invalid', '');
      if (input.type !== 'radio' && input.type !== 'checkbox') input.setAttribute('aria-invalid', 'true');
    } else {
      error.textContent = '';
      field?.removeAttribute('data-invalid');
      input.removeAttribute('aria-invalid');
    }
  }
}
function enfocarPrimerError(errores) {
  const primerCampo = Object.keys(errores)[0];
  document.querySelector(`[name="${primerCampo}"]`)?.focus();
}
function irAPaso(numero) {
  solicitud.paso = numero;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (numero === 2) actualizarEstadoEquipo();
  if (numero === 3) actualizarEstadoTitular();
  if (numero === 4) actualizarEstadoPago();
}
function limpiarFormularios() {
  ['#equipo-form', '#titular-form', '#pago-form'].forEach((selector) => $(selector)?.reset());
  $$('.field-error').forEach((el) => { el.textContent = ''; });
  $$('.field[data-invalid]').forEach((el) => el.removeAttribute('data-invalid'));
  $$('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  $('#ver-planes').disabled = true;
  $('#continuar-pago').disabled = true;
}

iniciar();
