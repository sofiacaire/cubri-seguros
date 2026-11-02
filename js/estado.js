export const solicitud = {
  paso: 0,
  equipo: { marca: '', modelo: '', valor: 0, antiguedad: '' },
  plan: 'plus',
  titular: { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false },
  pago: { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titularPago: '' },
  poliza: null,
  planes: [],
  procesando: false
};

export function actualizar(ruta, valor) {
  const partes = ruta.split('.');
  let destino = solicitud;
  for (const parte of partes.slice(0, -1)) destino = destino[parte];
  destino[partes.at(-1)] = valor;
}

export function reiniciarSolicitud() {
  solicitud.paso = 0;
  solicitud.equipo = { marca: '', modelo: '', valor: 0, antiguedad: '' };
  solicitud.plan = 'plus';
  solicitud.titular = { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false };
  solicitud.pago = { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titularPago: '' };
  solicitud.poliza = null;
  solicitud.procesando = false;
}
