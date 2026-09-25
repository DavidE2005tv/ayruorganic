import { createStore, type StoreApi } from 'zustand/vanilla'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import type { Libro } from '../types'
import { crearAccionesCatalogo } from './acciones-catalogo'
import { crearAccionesDetalle } from './acciones-detalle'
import { crearAccionesLibro } from './acciones-libro'
import { libroVacio } from './libro-inicial'
import { extraerLibro, type LibroStore } from './tipos'

export const VERSION_ALMACEN = 1

export function claveAlmacen(correo: string): string {
  return `ayru-calc:v${VERSION_ALMACEN}:${correo.toLowerCase()}`
}

/** Almacenamiento en memoria cuando el navegador bloquea localStorage (modo privado, etc.) */
function almacenMemoria(): StateStorage {
  const datos = new Map<string, string>()
  return {
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => void datos.set(k, v),
    removeItem: (k) => void datos.delete(k),
  }
}

export function almacenamientoDisponible(): boolean {
  try {
    const prueba = '__ayru_prueba__'
    window.localStorage.setItem(prueba, '1')
    window.localStorage.removeItem(prueba)
    return true
  } catch {
    return false
  }
}

export function crearLibroStore(correo: string): StoreApi<LibroStore> {
  const almacen = typeof window !== 'undefined' && almacenamientoDisponible() ? window.localStorage : almacenMemoria()
  return createStore<LibroStore>()(
    persist(
      (set, get) => ({
        ...libroVacio(),
        ...crearAccionesCatalogo(set, get),
        ...crearAccionesDetalle(set, get),
        ...crearAccionesLibro(set, get),
      }),
      {
        name: claveAlmacen(correo),
        version: VERSION_ALMACEN,
        storage: createJSONStorage(() => almacen),
        partialize: (s): Libro => extraerLibro(s),
        merge: (guardado, actual) => ({ ...actual, ...(guardado as Partial<Libro>) }),
      },
    ),
  )
}
