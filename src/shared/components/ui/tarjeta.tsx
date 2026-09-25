import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Tarjeta({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-linea/70 bg-papel shadow-hoja', className)} {...props} />
}

export function EncabezadoTarjeta({
  titulo,
  descripcion,
  accion,
  icono,
}: {
  titulo: ReactNode
  descripcion?: ReactNode
  accion?: ReactNode
  icono?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5">
      <div className="flex min-w-0 items-start gap-3">
        {icono && <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-salvia text-bosque">{icono}</span>}
        <div className="min-w-0">
          <h2 className="text-xl font-semibold leading-tight">{titulo}</h2>
          {descripcion && <p className="mt-1 text-sm text-tinta-suave">{descripcion}</p>}
        </div>
      </div>
      {accion}
    </div>
  )
}
