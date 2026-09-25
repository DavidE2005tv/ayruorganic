import { nuevoId } from '../lib/codigos'
import { esquemaLineaReceta, esquemaOtroCosto, primerError } from '../lib/schemas'
import { LIMITES, type LineaReceta, type OtroCosto } from '../types'
import { conCambio, type AccionesDetalle, type GetLibro, type SetLibro } from './tipos'

const LIMITE_OTROS = `Llegaste al máximo de ${LIMITES.otrosCostos} otros costos de la versión PRO 1.0`

export function crearAccionesDetalle(set: SetLibro, get: GetLibro): AccionesDetalle {
  return {
    agregarLinea: (productoId, entrada) => {
      const v = esquemaLineaReceta.safeParse(entrada)
      if (!v.success) return { ok: false, error: primerError(v.error) }
      const { recetas, insumos } = get()
      if (recetas.filter((l) => l.productoId === productoId).length >= LIMITES.ingredientesPorProducto) {
        return { ok: false, error: `Cada receta admite máximo ${LIMITES.ingredientesPorProducto} ingredientes` }
      }
      if (!insumos.some((i) => i.id === v.data.insumoId)) return { ok: false, error: 'Elige un insumo de la lista' }
      const linea: LineaReceta = { ...v.data, id: nuevoId(), productoId }
      set((s) => conCambio(s, { recetas: [...s.recetas, linea] }))
      return { ok: true, id: linea.id }
    },

    actualizarLinea: (id, entrada) => {
      const v = esquemaLineaReceta.safeParse(entrada)
      if (!v.success) return { ok: false, error: primerError(v.error) }
      set((s) => conCambio(s, { recetas: s.recetas.map((l) => (l.id === id ? { ...l, ...v.data } : l)) }))
      return { ok: true, id }
    },

    eliminarLinea: (id) => {
      set((s) => conCambio(s, { recetas: s.recetas.filter((l) => l.id !== id) }))
    },

    agregarOtroCosto: (productoId, entrada) => {
      const v = esquemaOtroCosto.safeParse(entrada)
      if (!v.success) return { ok: false, error: primerError(v.error) }
      if (get().otrosCostos.length >= LIMITES.otrosCostos) return { ok: false, error: LIMITE_OTROS }
      const costo: OtroCosto = { ...v.data, id: nuevoId(), productoId }
      set((s) => conCambio(s, { otrosCostos: [...s.otrosCostos, costo] }))
      return { ok: true, id: costo.id }
    },

    actualizarOtroCosto: (id, entrada) => {
      const v = esquemaOtroCosto.safeParse(entrada)
      if (!v.success) return { ok: false, error: primerError(v.error) }
      set((s) => conCambio(s, { otrosCostos: s.otrosCostos.map((c) => (c.id === id ? { ...c, ...v.data } : c)) }))
      return { ok: true, id }
    },

    eliminarOtroCosto: (id) => {
      set((s) => conCambio(s, { otrosCostos: s.otrosCostos.filter((c) => c.id !== id) }))
    },

    copiarOtrosCostos: (desdeProductoId, haciaProductoId) => {
      const { otrosCostos } = get()
      const copias = otrosCostos
        .filter((c) => c.productoId === desdeProductoId)
        .map((c) => ({ ...c, id: nuevoId(), productoId: haciaProductoId }))
      if (copias.length === 0) return { ok: false, error: 'Ese producto no tiene otros costos para copiar' }
      if (otrosCostos.length + copias.length > LIMITES.otrosCostos) return { ok: false, error: LIMITE_OTROS }
      set((s) => conCambio(s, { otrosCostos: [...s.otrosCostos, ...copias] }))
      return { ok: true, id: haciaProductoId }
    },
  }
}
