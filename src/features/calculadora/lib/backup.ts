import type { Libro } from '../types'
import { esquemaRespaldo, primerError, type Respaldo } from './schemas'

export function crearRespaldo(libro: Libro): Respaldo {
  return {
    app: 'ayru-calculadora',
    version: 1,
    exportadoEn: new Date().toISOString(),
    libro,
  }
}

export function nombreArchivo(base: string, extension: string): string {
  const d = new Date()
  const fecha = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `${base}-${fecha}.${extension}`
}

export function descargarArchivo(contenido: Blob, nombre: string): void {
  const url = URL.createObjectURL(contenido)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function descargarRespaldo(libro: Libro): void {
  const json = JSON.stringify(crearRespaldo(libro), null, 2)
  descargarArchivo(new Blob([json], { type: 'application/json' }), nombreArchivo('respaldo-calculadora-ayru', 'json'))
}

export type LecturaRespaldo = { ok: true; respaldo: Respaldo } | { ok: false; error: string }

const TAMANO_MAXIMO = 5 * 1024 * 1024

function referenciasValidas(libro: Respaldo['libro']): boolean {
  const productos = new Set(libro.productos.map((p) => p.id))
  const insumos = new Set(libro.insumos.map((i) => i.id))
  return (
    libro.recetas.every((l) => productos.has(l.productoId) && insumos.has(l.insumoId)) &&
    libro.otrosCostos.every((c) => productos.has(c.productoId))
  )
}

export async function leerRespaldo(archivo: File): Promise<LecturaRespaldo> {
  if (archivo.size > TAMANO_MAXIMO) return { ok: false, error: 'El archivo es demasiado grande para ser un respaldo' }
  let datos: unknown
  try {
    datos = JSON.parse(await archivo.text())
  } catch {
    return { ok: false, error: 'Este archivo no es un respaldo de la calculadora (.json)' }
  }
  const v = esquemaRespaldo.safeParse(datos)
  if (!v.success) return { ok: false, error: `El respaldo tiene datos que no reconocemos: ${primerError(v.error)}` }
  if (!referenciasValidas(v.data.libro)) {
    return { ok: false, error: 'El respaldo está incompleto: hay recetas o costos de productos o insumos que no existen' }
  }
  return { ok: true, respaldo: v.data }
}
