import type { StoreApi } from 'zustand'
import type { EntradaInsumo, EntradaLineaReceta, EntradaOtroCosto, EntradaProducto } from '../lib/schemas'
import type {
  Libro,
  ParametrosConversiones,
  ParametrosSimulador,
  ReferenciaCucharada,
} from '../types'

export type Resultado = { ok: true; id: string } | { ok: false; error: string }

export interface AccionesCatalogo {
  agregarInsumo: (entrada: EntradaInsumo) => Resultado
  actualizarInsumo: (id: string, entrada: EntradaInsumo) => Resultado
  eliminarInsumo: (id: string) => Resultado
  agregarProducto: (entrada: EntradaProducto) => Resultado
  actualizarProducto: (id: string, entrada: EntradaProducto) => Resultado
  duplicarProducto: (id: string) => Resultado
  eliminarProducto: (id: string) => void
}

export interface AccionesDetalle {
  agregarLinea: (productoId: string, entrada: EntradaLineaReceta) => Resultado
  actualizarLinea: (id: string, entrada: EntradaLineaReceta) => Resultado
  eliminarLinea: (id: string) => void
  agregarOtroCosto: (productoId: string, entrada: EntradaOtroCosto) => Resultado
  actualizarOtroCosto: (id: string, entrada: EntradaOtroCosto) => Resultado
  eliminarOtroCosto: (id: string) => void
  copiarOtrosCostos: (desdeProductoId: string, haciaProductoId: string) => Resultado
}

export interface AccionesLibro {
  actualizarSimulador: (cambios: Partial<ParametrosSimulador>) => void
  actualizarConversiones: (cambios: Partial<ParametrosConversiones>) => void
  guardarCucharada: (fila: Omit<ReferenciaCucharada, 'id'>, id?: string) => void
  eliminarCucharada: (id: string) => void
  empezarEnBlanco: () => void
  cargarEjemplo: () => Resultado
  quitarEjemplo: () => void
  reemplazarLibro: (libro: Libro) => void
  marcarRespaldo: () => void
  borrarTodo: () => void
}

export type LibroStore = Libro & AccionesCatalogo & AccionesDetalle & AccionesLibro

export type SetLibro = StoreApi<LibroStore>['setState']
export type GetLibro = StoreApi<LibroStore>['getState']

/** Actualiza "último cambio" junto con cualquier mutación de datos */
export function conCambio(estado: Libro, cambios: Partial<Libro>): Partial<Libro> {
  return { ...cambios, meta: { ...estado.meta, ultimoCambio: new Date().toISOString() } }
}

/** Solo los datos (sin acciones), listos para respaldar o exportar */
export function extraerLibro(s: LibroStore): Libro {
  return {
    insumos: s.insumos,
    productos: s.productos,
    recetas: s.recetas,
    otrosCostos: s.otrosCostos,
    simulador: s.simulador,
    conversiones: s.conversiones,
    tablaCucharadas: s.tablaCucharadas,
    meta: s.meta,
  }
}
