import type { ReactNode } from 'react'
import { AlertTriangle, Info, Leaf } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

type Tono = 'info' | 'consejo' | 'alerta'

const tonos: Record<Tono, { clase: string; icono: ReactNode }> = {
  info: { clase: 'bg-salvia/70 text-bosque border-bosque/15', icono: <Info aria-hidden /> },
  consejo: { clase: 'bg-kraft/40 text-tinta border-canela/25', icono: <Leaf aria-hidden className="text-oliva" /> },
  alerta: { clase: 'bg-arcilla/10 text-arcilla border-arcilla/25', icono: <AlertTriangle aria-hidden /> },
}

export function Aviso({ tono = 'info', children, className }: { tono?: Tono; children: ReactNode; className?: string }) {
  const t = tonos[tono]
  return (
    <div
      role={tono === 'alerta' ? 'alert' : 'note'}
      className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm leading-relaxed [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0', t.clase, className)}
    >
      {t.icono}
      <div className="min-w-0">{children}</div>
    </div>
  )
}
