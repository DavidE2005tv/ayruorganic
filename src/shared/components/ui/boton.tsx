import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'suave'
type Tamano = 'sm' | 'md' | 'lg'

const variantes: Record<Variante, string> = {
  primario: 'bg-bosque text-papel shadow-hoja hover:bg-bosque-900 active:translate-y-px disabled:bg-bosque/40',
  secundario: 'border border-bosque/25 bg-papel text-bosque hover:border-bosque/50 hover:bg-salvia/60',
  fantasma: 'text-bosque hover:bg-salvia/70',
  peligro: 'bg-arcilla text-papel hover:bg-arcilla/90',
  suave: 'bg-salvia text-bosque hover:bg-salvia/70',
}

const tamanos: Record<Tamano, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-[0.95rem] gap-2',
  lg: 'h-14 px-6 text-base gap-2.5',
}

export interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
}

export const Boton = forwardRef<HTMLButtonElement, BotonProps>(function Boton(
  { variante = 'primario', tamano = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition-all duration-150',
        'disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-[1.1em] [&_svg]:shrink-0',
        variantes[variante],
        tamanos[tamano],
        className,
      )}
      {...props}
    />
  )
})

export function claseBoton(variante: Variante = 'primario', tamano: Tamano = 'md', extra?: string): string {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition-all duration-150 [&_svg]:size-[1.1em]',
    variantes[variante],
    tamanos[tamano],
    extra,
  )
}
