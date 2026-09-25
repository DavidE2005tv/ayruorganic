'use client'

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react'
import { useStore, type StoreApi } from 'zustand'
import { almacenamientoDisponible, crearLibroStore } from './crear-store'
import type { LibroStore } from './tipos'

interface ContextoLibro {
  store: StoreApi<LibroStore>
  correo: string
  almacenamientoOk: boolean
}

const Contexto = createContext<ContextoLibro | null>(null)

type StoreConPersist = StoreApi<LibroStore> & {
  persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void }
}

const sinSuscripcion = () => () => {}
let almacenamientoCache: boolean | null = null
const leerAlmacenamiento = () => (almacenamientoCache ??= almacenamientoDisponible())

export function LibroProvider({ correo, children, cargando }: { correo: string; children: ReactNode; cargando: ReactNode }) {
  const [store] = useState(() => crearLibroStore(correo) as StoreConPersist)
  const hidratado = useSyncExternalStore(
    (avisar) => store.persist.onFinishHydration(avisar),
    () => store.persist.hasHydrated(),
    () => false,
  )
  const almacenamientoOk = useSyncExternalStore(sinSuscripcion, leerAlmacenamiento, () => true)

  return (
    <Contexto.Provider value={{ store, correo, almacenamientoOk }}>{hidratado ? children : cargando}</Contexto.Provider>
  )
}

function useContexto(): ContextoLibro {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useLibro debe usarse dentro de <LibroProvider>')
  return ctx
}

export function useLibro<T>(selector: (s: LibroStore) => T): T {
  return useStore(useContexto().store, selector)
}

export function useLibroApi(): StoreApi<LibroStore> {
  return useContexto().store
}

export function useSesion(): { correo: string; almacenamientoOk: boolean } {
  const { correo, almacenamientoOk } = useContexto()
  return { correo, almacenamientoOk }
}
