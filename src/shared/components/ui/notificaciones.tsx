'use client'

import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { create } from 'zustand'
import { cn } from '@/shared/lib/cn'

interface Notificacion {
  id: number
  texto: string
  tipo: 'exito' | 'error'
}

interface EstadoNotificaciones {
  lista: Notificacion[]
  mostrar: (texto: string, tipo?: Notificacion['tipo']) => void
  quitar: (id: number) => void
}

let contador = 0

export const useNotificaciones = create<EstadoNotificaciones>((set, get) => ({
  lista: [],
  mostrar: (texto, tipo = 'exito') => {
    const id = ++contador
    set((s) => ({ lista: [...s.lista.slice(-2), { id, texto, tipo }] }))
    setTimeout(() => get().quitar(id), tipo === 'error' ? 6000 : 3200)
  },
  quitar: (id) => set((s) => ({ lista: s.lista.filter((n) => n.id !== id) })),
}))

export function notificar(texto: string, tipo: Notificacion['tipo'] = 'exito'): void {
  useNotificaciones.getState().mostrar(texto, tipo)
}

export function Notificaciones() {
  const lista = useNotificaciones((s) => s.lista)
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-auto lg:right-6 lg:items-end"
    >
      {lista.map((n) => (
        <div
          key={n.id}
          role="status"
          className={cn(
            'pointer-events-auto flex max-w-md animate-brotar items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-hoja',
            n.tipo === 'exito' ? 'bg-bosque text-papel' : 'bg-arcilla text-papel',
          )}
        >
          {n.tipo === 'exito' ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
          {n.texto}
        </div>
      ))}
    </div>
  )
}
