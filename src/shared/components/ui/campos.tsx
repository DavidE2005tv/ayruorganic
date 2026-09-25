'use client'

import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { leerNumero, numeroParaCampo } from '@/features/calculadora/lib/format'
import { cn } from '@/shared/lib/cn'

const claseEntrada =
  'h-12 w-full rounded-xl border border-linea bg-[#FFFDF8] px-3.5 text-base text-tinta shadow-[inset_0_1px_0_rgb(0_0_0/0.03)] ' +
  'placeholder:text-tinta-suave/60 transition-colors hover:border-kraft focus:border-canela focus:outline-none focus:ring-4 focus:ring-kraft/50 ' +
  'aria-[invalid=true]:border-arcilla'

interface EnvolturaProps {
  etiqueta: ReactNode
  ayuda?: ReactNode
  error?: string | null
  className?: string
  children: (id: string, describedBy: string | undefined) => ReactNode
}

export function Campo({ etiqueta, ayuda, error, className, children }: EnvolturaProps) {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const describedBy = error || ayuda ? idAyuda : undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-tinta">
        {etiqueta}
      </label>
      {children(id, describedBy)}
      {(error || ayuda) && (
        <p id={idAyuda} className={cn('text-[0.8rem] leading-snug', error ? 'font-medium text-arcilla' : 'text-tinta-suave')}>
          {error ?? ayuda}
        </p>
      )}
    </div>
  )
}

type PropsTexto = Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> & {
  etiqueta: ReactNode
  ayuda?: ReactNode
  error?: string | null
  valor: string
  alCambiar: (valor: string) => void
}

export function CampoTexto({ etiqueta, ayuda, error, valor, alCambiar, className, ...props }: PropsTexto) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} error={error} className={className}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={claseEntrada}
          value={valor}
          onChange={(e) => alCambiar(e.target.value)}
          {...props}
        />
      )}
    </Campo>
  )
}

type ModoNumero = 'numero' | 'pesos' | 'porcentaje'

type PropsNumero = {
  etiqueta: ReactNode
  ayuda?: ReactNode
  error?: string | null
  valor: number | null
  alCambiar: (valor: number | null) => void
  modo?: ModoNumero
  sufijo?: string
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

function aTexto(valor: number | null, modo: ModoNumero): string {
  if (valor === null) return ''
  if (modo === 'porcentaje') return numeroParaCampo(Math.round(valor * 1e8) / 1e6)
  return numeroParaCampo(valor, modo === 'pesos' ? 2 : 4)
}

/** Campo numérico amable: acepta "18.000", "1,5", "$ 12.500" y muestra el valor formateado. */
export function CampoNumero({ etiqueta, ayuda, error, valor, alCambiar, modo = 'numero', sufijo, className, ...resto }: PropsNumero) {
  const [texto, setTexto] = useState(() => aTexto(valor, modo))
  const [enfocado, setEnfocado] = useState(false)
  const visible = enfocado ? texto : aTexto(valor, modo)
  const prefijo = modo === 'pesos' ? '$' : null
  const fin = modo === 'porcentaje' ? '%' : sufijo

  const cambiar = (nuevo: string) => {
    setTexto(nuevo)
    const n = leerNumero(nuevo)
    alCambiar(n === null ? null : modo === 'porcentaje' ? n / 100 : n)
  }

  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} error={error} className={className}>
      {(id, describedBy) => (
        <div className="relative">
          {prefijo && (
            <span className="pointer-events-none absolute inset-y-0 left-3.5 grid place-items-center text-tinta-suave">{prefijo}</span>
          )}
          <input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            className={cn(claseEntrada, 'cifra', prefijo && 'pl-8', fin && 'pr-14')}
            value={visible}
            onFocus={() => {
              setTexto(aTexto(valor, modo))
              setEnfocado(true)
            }}
            onBlur={() => setEnfocado(false)}
            onChange={(e) => cambiar(e.target.value)}
            {...resto}
          />
          {fin && (
            <span className="pointer-events-none absolute inset-y-0 right-3.5 grid place-items-center text-sm text-tinta-suave">{fin}</span>
          )}
        </div>
      )}
    </Campo>
  )
}

type PropsSelect = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> & {
  etiqueta: ReactNode
  ayuda?: ReactNode
  error?: string | null
  valor: string
  alCambiar: (valor: string) => void
  opciones: readonly { valor: string; texto: string }[]
  vacio?: string
}

export function CampoSelect({ etiqueta, ayuda, error, valor, alCambiar, opciones, vacio, className, ...props }: PropsSelect) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda} error={error} className={className}>
      {(id, describedBy) => (
        <div className="relative">
          <select
            id={id}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error)}
            className={cn(claseEntrada, 'appearance-none pr-10')}
            value={valor}
            onChange={(e) => alCambiar(e.target.value)}
            {...props}
          >
            {vacio !== undefined && <option value="">{vacio}</option>}
            {opciones.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.texto}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-tinta-suave" />
        </div>
      )}
    </Campo>
  )
}

/** Selector Sí / No grande y táctil (reemplaza la lista "Sí,No" del Excel) */
export function CampoSiNo({ etiqueta, ayuda, valor, alCambiar }: { etiqueta: ReactNode; ayuda?: ReactNode; valor: boolean; alCambiar: (v: boolean) => void }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <span id={id} className="text-sm font-semibold text-tinta">
        {etiqueta}
      </span>
      <div role="radiogroup" aria-labelledby={id} className="grid h-12 grid-cols-2 gap-1 rounded-xl border border-linea bg-lino p-1">
        {[
          { v: true, t: 'Sí, sumar' },
          { v: false, t: 'No, solo referencia' },
        ].map((op) => (
          <button
            key={op.t}
            type="button"
            role="radio"
            aria-checked={valor === op.v}
            onClick={() => alCambiar(op.v)}
            className={cn(
              'rounded-lg text-sm font-semibold transition-colors',
              valor === op.v ? (op.v ? 'bg-bosque text-papel shadow-sm' : 'bg-papel text-tinta shadow-sm') : 'text-tinta-suave hover:text-tinta',
            )}
          >
            {op.t}
          </button>
        ))}
      </div>
      {ayuda && <p className="text-[0.8rem] leading-snug text-tinta-suave">{ayuda}</p>}
    </div>
  )
}
