/** Espacio que no se parte: mantiene "$" y "%" en la misma línea que la cifra */
export const ESPACIO_FIJO = ' '

const moneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const monedaDetalle = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2 })
const porcentaje = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** $ 12.000 — sin decimales (como el formato del Excel) */
export function formatoPesos(valor: number): string {
  return moneda.format(Number.isFinite(valor) ? valor : 0).replace(/\s/g, ESPACIO_FIJO)
}

/** Para costos pequeños por gramo: $ 73,11 */
export function formatoPesosDetalle(valor: number): string {
  const v = Number.isFinite(valor) ? valor : 0
  return (Math.abs(v) < 1000 ? monedaDetalle : moneda).format(v).replace(/\s/g, ESPACIO_FIJO)
}

export function formatoNumero(valor: number): string {
  return numero.format(Number.isFinite(valor) ? valor : 0)
}

/** 0.643 → 64,3 % */
export function formatoPorcentaje(fraccion: number): string {
  return `${porcentaje.format(Number.isFinite(fraccion) ? fraccion * 100 : 0)}${ESPACIO_FIJO}%`
}

/**
 * Convierte lo que escribe una persona en Colombia a número:
 * "18.000" → 18000 · "1,5" → 1.5 · "$ 12.500" → 12500 · "1.5" → 1.5
 */
export function leerNumero(texto: string): number | null {
  const limpio = texto.replace(/[\s$%]/g, '')
  if (limpio === '') return null
  let normal = limpio
  if (limpio.includes(',')) {
    normal = limpio.replace(/\./g, '').replace(',', '.')
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(limpio)) {
    normal = limpio.replace(/\./g, '')
  }
  if (!/^-?\d*\.?\d*$/.test(normal) || normal === '.' || normal === '-') return null
  const valor = Number(normal)
  return Number.isFinite(valor) ? valor : null
}

/** Número para mostrar dentro de un campo editable: 18000 → "18.000", 1.5 → "1,5" */
export function numeroParaCampo(valor: number | null, decimales = 4): string {
  if (valor === null || !Number.isFinite(valor)) return ''
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: decimales }).format(valor)
}

export function fechaCorta(iso: string | null): string {
  if (!iso) return ''
  const fecha = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }).format(fecha)
}

export function haceCuanto(iso: string | null): string {
  if (!iso) return 'nunca'
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (dias <= 0) return 'hoy'
  if (dias === 1) return 'ayer'
  return `hace ${dias} días`
}
