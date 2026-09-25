import { hoyISO, nuevoId, siguienteCodigo } from '../lib/codigos'
import { esquemaInsumo, esquemaProducto, primerError } from '../lib/schemas'
import { LIMITES, type Insumo, type Producto } from '../types'
import { conCambio, type AccionesCatalogo, type GetLibro, type SetLibro } from './tipos'

const mismoNombre = (a: string, b: string) => a.trim().toLocaleLowerCase('es') === b.trim().toLocaleLowerCase('es')

function nombreRepetido(lista: { id: string; nombre: string }[], nombre: string, excepto?: string): boolean {
  return lista.some((x) => x.id !== excepto && mismoNombre(x.nombre, nombre))
}

export function crearAccionesCatalogo(set: SetLibro, get: GetLibro): AccionesCatalogo {
  return {
    agregarInsumo: (entrada) => {
      const v = esquemaInsumo.safeParse(entrada)
      if (!v.success) return { ok: false, error: primerError(v.error) }
      const { insumos } = get()
      if (insumos.length >= LIMITES.insumos) {
        return { ok: false, error: `Llegaste al máximo de ${LIMITES.insumos} insumos de la versión PRO 1.0` }
      }
      if (nombreRepetido(insumos, v.data.nombre)) {
        return { ok: false, error: `Ya tienes un insumo llamado “${v.data.nombre}”` }
      }
      const codigo = siguienteCodigo('MP', insumos.map((i) => i.codigo), 3, LIMITES.insumos) ?? 'MP---'
      const insumo: Insumo = { ...v.data, id: nuevoId(), codigo, fechaActualizacion: v.data.fechaActualizacion || hoyISO() }
      set((s) => conCambio(s, { insumos: [...s.insumos, insumo] }))
      return { ok: true, id: insumo.id }
    },

    actualizarInsumo: (id, entrada) => {
      const v = esquemaInsumo.safeParse(entrada)
      if (!v.success) return { ok: false, error: primerError(v.error) }
      if (nombreRepetido(get().insumos, v.data.nombre, id)) {
        return { ok: false, error: `Ya tienes otro insumo llamado “${v.data.nombre}”` }
      }
      set((s) => conCambio(s, { insumos: s.insumos.map((i) => (i.id === id ? { ...i, ...v.data } : i)) }))
      return { ok: true, id }
    },

    eliminarInsumo: (id) => {
      const usos = get().recetas.filter((l) => l.insumoId === id).length
      if (usos > 0) {
        return { ok: false, error: 'Este insumo se usa en recetas. Quítalo de esas recetas antes de eliminarlo.' }
      }
      set((s) => conCambio(s, { insumos: s.insumos.filter((i) => i.id !== id) }))
      return { ok: true, id }
    },

    agregarProducto: (entrada) => {
      const v = esquemaProducto.safeParse(entrada)
      if (!v.success) return { ok: false, error: primerError(v.error) }
      const { productos } = get()
      if (productos.length >= LIMITES.productos) {
        return { ok: false, error: `Llegaste al máximo de ${LIMITES.productos} productos de la versión PRO 1.0` }
      }
      if (nombreRepetido(productos, v.data.nombre)) {
        return { ok: false, error: `Ya tienes un producto llamado “${v.data.nombre}”` }
      }
      const codigo = siguienteCodigo('P', productos.map((p) => p.codigo), 2, LIMITES.productos) ?? 'P--'
      const producto: Producto = { ...v.data, id: nuevoId(), codigo }
      set((s) => conCambio(s, { productos: [...s.productos, producto] }))
      return { ok: true, id: producto.id }
    },

    actualizarProducto: (id, entrada) => {
      const v = esquemaProducto.safeParse(entrada)
      if (!v.success) return { ok: false, error: primerError(v.error) }
      if (nombreRepetido(get().productos, v.data.nombre, id)) {
        return { ok: false, error: `Ya tienes otro producto llamado “${v.data.nombre}”` }
      }
      set((s) => conCambio(s, { productos: s.productos.map((p) => (p.id === id ? { ...p, ...v.data } : p)) }))
      return { ok: true, id }
    },

    duplicarProducto: (id) => duplicar(set, get, id),

    eliminarProducto: (id) => {
      set((s) =>
        conCambio(s, {
          productos: s.productos.filter((p) => p.id !== id),
          recetas: s.recetas.filter((l) => l.productoId !== id),
          otrosCostos: s.otrosCostos.filter((c) => c.productoId !== id),
          simulador: s.simulador.productoId === id ? { ...s.simulador, productoId: null } : s.simulador,
        }),
      )
    },
  }
}

function nombreCopia(productos: Producto[], base: string): string {
  let n = 1
  let nombre = `${base} (copia)`
  while (nombreRepetido(productos, nombre)) {
    n += 1
    nombre = `${base} (copia ${n})`
  }
  return nombre
}

function duplicar(set: SetLibro, get: GetLibro, id: string): ReturnType<AccionesCatalogo['duplicarProducto']> {
  const { productos, recetas, otrosCostos } = get()
  const original = productos.find((p) => p.id === id)
  if (!original) return { ok: false, error: 'No encontramos ese producto' }
  if (productos.length >= LIMITES.productos) {
    return { ok: false, error: `Llegaste al máximo de ${LIMITES.productos} productos de la versión PRO 1.0` }
  }
  const codigo = siguienteCodigo('P', productos.map((p) => p.codigo), 2, LIMITES.productos) ?? 'P--'
  const copia: Producto = { ...original, id: nuevoId(), codigo, nombre: nombreCopia(productos, original.nombre), ejemplo: false }
  const lineas = recetas.filter((l) => l.productoId === id).map((l) => ({ ...l, id: nuevoId(), productoId: copia.id }))
  const costos = otrosCostos
    .filter((c) => c.productoId === id)
    .map((c) => ({ ...c, id: nuevoId(), productoId: copia.id }))
  if (otrosCostos.length + costos.length > LIMITES.otrosCostos) {
    return { ok: false, error: 'No hay espacio para copiar los otros costos de este producto' }
  }
  set((s) =>
    conCambio(s, {
      productos: [...s.productos, copia],
      recetas: [...s.recetas, ...lineas],
      otrosCostos: [...s.otrosCostos, ...costos],
    }),
  )
  return { ok: true, id: copia.id }
}
