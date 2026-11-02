const FACTORES_ANTIGUEDAD = { menos1: 1, '1a2': 1.1, mas2: 1.25 };

export function calcularCuota(valor, tasaAnual, antiguedad) {
  const factor = FACTORES_ANTIGUEDAD[antiguedad];
  if (!Number.isFinite(Number(valor)) || !Number.isFinite(Number(tasaAnual)) || factor == null) return 0;
  return Math.round(Number(valor) * Number(tasaAnual) / 12 * factor);
}

export function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(valor) || 0);
}

export function leerImporte(texto) {
  const limpio = String(texto ?? '').replace(/\D/g, '');
  return limpio ? Number(limpio) : 0;
}
