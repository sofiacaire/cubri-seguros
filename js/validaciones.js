export function validarCampo(campo, valor) {
  const v = String(valor ?? '').trim();
  switch (campo) {
    case 'marca': return v ? null : 'Elegí una marca';
    case 'modelo': return v.length >= 2 && v.length <= 40 ? null : 'Ingresá el modelo del equipo (2 a 40 caracteres)';
    case 'valor': return Number(valor) >= 100000 && Number(valor) <= 2500000 ? null : 'El valor debe estar entre $100.000 y $2.500.000';
    case 'antiguedad': return v ? null : 'Indicá la antigüedad';
    case 'nombre': return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{2,}$/.test(v) ? null : 'Ingresá tu nombre';
    case 'apellido': return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{2,}$/.test(v) ? null : 'Ingresá tu apellido';
    case 'dni': return /^\d{7,8}$/.test(v) ? null : 'El DNI debe tener 7 u 8 números';
    case 'nacimiento': {
      if (!v) return 'Ingresá tu fecha de nacimiento';
      const fecha = new Date(`${v}T00:00:00`);
      if (Number.isNaN(fecha.getTime())) return 'Ingresá una fecha válida';
      const hoy = new Date();
      let edad = hoy.getFullYear() - fecha.getFullYear();
      const cumple = new Date(hoy.getFullYear(), fecha.getMonth(), fecha.getDate());
      if (cumple > hoy) edad--;
      return edad >= 18 && fecha <= hoy ? null : 'Tenés que ser mayor de edad';
    }
    case 'email': return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Ingresá un email válido';
    case 'celular': return /^\d{10}$/.test(v.replace(/[\s-]/g, '')) && !/^0/.test(v.replace(/[\s-]/g, '')) && !/^15/.test(v.replace(/[\s-]/g, '')) ? null : 'Ingresá 10 dígitos sin 0 ni 15 inicial (ej.: 11 5555-1234)';
    case 'terminos': return valor ? null : 'Tenés que aceptar los términos';
    case 'tarjeta': return /^\d{16}$/.test(v.replace(/\s/g, '')) ? null : 'Número de tarjeta inválido';
    case 'vencimiento': {
      if (!/^\d{2}\/\d{2}$/.test(v)) return 'Usá el formato MM/AA';
      const [mm, aa] = v.split('/').map(Number);
      if (mm < 1 || mm > 12) return 'Vencimiento inválido';
      const finMes = new Date(2000 + aa, mm, 0, 23, 59, 59);
      const ahora = new Date();
      return finMes >= new Date(ahora.getFullYear(), ahora.getMonth(), 1) ? null : 'La tarjeta está vencida';
    }
    case 'cvv': return /^\d{3}$/.test(v) ? null : 'CVV inválido';
    case 'titularPago': return v.length >= 2 ? null : 'Ingresá el nombre del titular';
    default: return null;
  }
}

export function validarGrupo(campos) {
  const errores = {};
  for (const [campo, valor] of Object.entries(campos)) {
    const error = validarCampo(campo, valor);
    if (error) errores[campo] = error;
  }
  return errores;
}
