'use client'

import { useId, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface Props<T extends string> {
  etiqueta: ReactNode
  opciones: readonly { valor: T; texto: string }[]
  valor: T
  alCambiar: (v: T) => void
  ayuda?: ReactNode
}

/** Opciones grandes tipo "chip": más fáciles que una lista desplegable para personas no técnicas */
export function SelectorChips<T extends string>({ etiqueta, opciones, valor, alCambiar, ayuda }: Props<T>) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="text-sm font-semibold text-tinta">
        {etiqueta}
      </span>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activo = o.valor === valor
          return (
            <button
              key={o.valor}
              type="button"
              role="radio"
              aria-checked={activo}
              onClick={() => alCambiar(o.valor)}
              className={cn(
                'h-11 rounded-full border px-4 text-sm font-semibold transition-colors',
                activo ? 'border-bosque bg-bosque text-papel' : 'border-linea bg-[#FFFDF8] text-tinta hover:border-kraft hover:bg-kraft/25',
              )}
            >
              {o.texto}
            </button>
          )
        })}
      </div>
      {ayuda && <p className="text-[0.8rem] leading-snug text-tinta-suave">{ayuda}</p>}
    </div>
  )
}
