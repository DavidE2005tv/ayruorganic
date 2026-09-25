import type { EstadoProducto } from '@/features/calculadora/types'
import { cn } from '@/shared/lib/cn'

const estilos: Record<EstadoProducto, { clase: string; texto: string }> = {
  OK: { clase: 'bg-salvia text-bosque ring-bosque/15', texto: 'Precio OK' },
  'Por debajo del sugerido': { clase: 'bg-kraft/60 text-[#6E4222] ring-canela/30', texto: 'Por debajo del sugerido' },
  'Revisar: bajo costo': { clase: 'bg-arcilla/12 text-arcilla ring-arcilla/25', texto: 'Revisar: bajo costo' },
  'Sin precio': { clase: 'bg-linea/50 text-tinta-suave ring-linea', texto: 'Sin precio' },
}

export function EstadoBadge({ estado, className }: { estado: EstadoProducto; className?: string }) {
  const e = estilos[estado]
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1', e.clase, className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {e.texto}
    </span>
  )
}
