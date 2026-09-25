import type { ReactNode } from 'react'

/** Estado vacío que explica qué hacer (pensado para personas no técnicas) */
export function Vacio({ icono, titulo, children, accion }: { icono: ReactNode; titulo: string; children: ReactNode; accion?: ReactNode }) {
  return (
    <div className="grano flex flex-col items-center rounded-2xl border border-dashed border-kraft bg-papel/70 px-6 py-10 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-salvia text-bosque [&_svg]:size-7">{icono}</span>
      <h3 className="mt-4 text-xl font-semibold">{titulo}</h3>
      <div className="mt-2 max-w-sm text-[0.95rem] leading-relaxed text-tinta-suave">{children}</div>
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
