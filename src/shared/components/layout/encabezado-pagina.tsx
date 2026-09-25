import type { ReactNode } from 'react'

export function EncabezadoPagina({
  paso,
  titulo,
  descripcion,
  acciones,
}: {
  paso?: string
  titulo: string
  descripcion?: ReactNode
  acciones?: ReactNode
}) {
  return (
    <header className="mb-6 flex animate-brotar flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="max-w-2xl">
        {paso && <p className="text-xs font-bold uppercase tracking-[0.2em] text-canela">{paso}</p>}
        <h1 className="mt-1 text-[2rem] font-semibold leading-[1.05] sm:text-[2.6rem]">{titulo}</h1>
        {descripcion && <p className="mt-2 text-[0.98rem] leading-relaxed text-tinta-suave">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </header>
  )
}
