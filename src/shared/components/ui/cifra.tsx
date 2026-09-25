import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** Valor calculado automáticamente (equivale a las "celdas verdes" del Excel) */
export function Cifra({
  etiqueta,
  valor,
  detalle,
  destacado,
  tono = 'normal',
  className,
}: {
  etiqueta: ReactNode
  valor: ReactNode
  detalle?: ReactNode
  destacado?: boolean
  tono?: 'normal' | 'alerta' | 'aviso'
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl px-4 py-3',
        destacado ? 'bg-bosque text-papel' : 'bg-salvia/70',
        tono === 'alerta' && !destacado && 'bg-arcilla/10',
        tono === 'aviso' && !destacado && 'bg-kraft/45',
        className,
      )}
    >
      <p className={cn('text-xs font-semibold uppercase tracking-wide', destacado ? 'text-papel/75' : 'text-oliva')}>{etiqueta}</p>
      <p
        className={cn(
          'cifra mt-1 whitespace-nowrap font-display text-[clamp(1.2rem,5.2vw,1.5rem)] font-semibold leading-none',
          destacado ? 'text-papel' : 'text-bosque',
          tono === 'alerta' && !destacado && 'text-arcilla',
        )}
      >
        {valor}
      </p>
      {detalle && <p className={cn('mt-1.5 text-xs', destacado ? 'text-papel/75' : 'text-tinta-suave')}>{detalle}</p>}
    </div>
  )
}
