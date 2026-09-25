import { nuevoId } from '../lib/codigos'
import {
  INSUMOS_EJEMPLO,
  OTROS_COSTOS_EJEMPLO,
  PRODUCTOS_EJEMPLO,
  RECETAS_EJEMPLO,
} from '../data/ejemplo-ayru'
import type { Libro } from '../types'
import { libroVacio } from './libro-inicial'
import { conCambio, type AccionesLibro, type GetLibro, type SetLibro } from './tipos'

/** Producto que el Excel trae seleccionado en el SIMULADOR (Jabón de Miel y Avena) */
const PRODUCTO_SIMULADOR_EJEMPLO = 'ej-p02'

function quitarDatosEjemplo(s: Libro): Partial<Libro> {
  const productosFuera = new Set(s.productos.filter((p) => p.ejemplo).map((p) => p.id))
  const recetas = s.recetas.filter((l) => !productosFuera.has(l.productoId))
  const insumosEnUso = new Set(recetas.map((l) => l.insumoId))
  return {
    productos: s.productos.filter((p) => !productosFuera.has(p.id)),
    recetas,
    otrosCostos: s.otrosCostos.filter((c) => !productosFuera.has(c.productoId)),
    insumos: s.insumos.filter((i) => !i.ejemplo || insumosEnUso.has(i.id)),
    simulador:
      s.simulador.productoId && productosFuera.has(s.simulador.productoId)
        ? { ...s.simulador, productoId: null }
        : s.simulador,
  }
}

export function crearAccionesLibro(set: SetLibro, get: GetLibro): AccionesLibro {
  return {
    actualizarSimulador: (cambios) => set((s) => ({ simulador: { ...s.simulador, ...cambios } })),

    actualizarConversiones: (cambios) => set((s) => ({ conversiones: { ...s.conversiones, ...cambios } })),

    guardarCucharada: (fila, id) =>
      set((s) =>
        conCambio(s, {
          tablaCucharadas: id
            ? s.tablaCucharadas.map((c) => (c.id === id ? { ...fila, id } : c))
            : [...s.tablaCucharadas, { ...fila, id: nuevoId() }],
        }),
      ),

    eliminarCucharada: (id) =>
      set((s) => conCambio(s, { tablaCucharadas: s.tablaCucharadas.filter((c) => c.id !== id) })),

    empezarEnBlanco: () => set((s) => ({ meta: { ...s.meta, onboarded: true } })),

    cargarEjemplo: () => {
      const { insumos, productos } = get()
      if (insumos.length > 0 || productos.length > 0) {
        return { ok: false, error: 'El ejemplo solo se puede cargar con la calculadora vacía' }
      }
      set((s) => ({
        ...conCambio(s, {
          insumos: INSUMOS_EJEMPLO.map((i) => ({ ...i })),
          productos: PRODUCTOS_EJEMPLO.map((p) => ({ ...p })),
          recetas: RECETAS_EJEMPLO.map((l) => ({ ...l })),
          otrosCostos: OTROS_COSTOS_EJEMPLO.map((c) => ({ ...c })),
          simulador: { ...s.simulador, productoId: PRODUCTO_SIMULADOR_EJEMPLO },
        }),
        meta: { ...s.meta, onboarded: true, ultimoCambio: new Date().toISOString() },
      }))
      return { ok: true, id: PRODUCTO_SIMULADOR_EJEMPLO }
    },

    quitarEjemplo: () => set((s) => conCambio(s, quitarDatosEjemplo(s))),

    reemplazarLibro: (libro) =>
      set(() => ({
        ...libro,
        meta: { ...libro.meta, onboarded: true, ultimoCambio: new Date().toISOString() },
      })),

    marcarRespaldo: () => set((s) => ({ meta: { ...s.meta, ultimoRespaldo: new Date().toISOString() } })),

    borrarTodo: () => set(() => ({ ...libroVacio(), meta: { ...libroVacio().meta, onboarded: true } })),
  }
}
