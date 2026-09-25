'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Boton } from './boton'

interface DialogoProps {
  abierto: boolean
  alCerrar: () => void
  titulo: ReactNode
  descripcion?: ReactNode
  children?: ReactNode
  pie?: ReactNode
  ancho?: 'md' | 'lg'
}

/** Diálogo nativo: en celular aparece como hoja inferior, en escritorio centrado. */
export function Dialogo({ abierto, alCerrar, titulo, descripcion, children, pie, ancho = 'md' }: DialogoProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierto && !dialogo.open) dialogo.showModal()
    if (!abierto && dialogo.open) dialogo.close()
  }, [abierto])

  return (
    <dialog
      ref={ref}
      onClose={alCerrar}
      onCancel={(e) => {
        e.preventDefault()
        alCerrar()
      }}
      onClick={(e) => {
        if (e.target === ref.current) alCerrar()
      }}
      className={cn(
        'm-0 mt-auto max-h-[92dvh] w-full max-w-none rounded-t-3xl border border-linea bg-papel p-0 text-tinta shadow-2xl',
        'backdrop:bg-bosque-900/40 backdrop:backdrop-blur-[2px]',
        'sm:m-auto sm:rounded-3xl',
        ancho === 'md' ? 'sm:max-w-lg' : 'sm:max-w-2xl',
        'open:animate-brotar',
      )}
    >
      {abierto && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-linea/70 px-5 pb-4 pt-5">
            <div>
              <h2 className="text-2xl font-semibold leading-tight">{titulo}</h2>
              {descripcion && <p className="mt-1 text-sm text-tinta-suave">{descripcion}</p>}
            </div>
            <Boton variante="fantasma" tamano="sm" aria-label="Cerrar" onClick={alCerrar} className="-mr-2 size-10 p-0">
              <X />
            </Boton>
          </div>
          {children && <div className="overflow-y-auto px-5 py-5">{children}</div>}
          {pie && (
            <div className="flex flex-col-reverse gap-2 border-t border-linea/70 bg-lino/60 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:justify-end">
              {pie}
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}

interface ConfirmarProps {
  abierto: boolean
  alCerrar: () => void
  alConfirmar: () => void
  titulo: string
  mensaje: ReactNode
  textoConfirmar: string
  peligro?: boolean
}

export function Confirmar({ abierto, alCerrar, alConfirmar, titulo, mensaje, textoConfirmar, peligro }: ConfirmarProps) {
  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={titulo}
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton
            variante={peligro ? 'peligro' : 'primario'}
            onClick={() => {
              alConfirmar()
              alCerrar()
            }}
          >
            {textoConfirmar}
          </Boton>
        </>
      }
    >
      <div className="text-[0.95rem] leading-relaxed text-tinta">{mensaje}</div>
    </Dialogo>
  )
}
