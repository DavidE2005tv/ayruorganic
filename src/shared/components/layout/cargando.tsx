import { LogoAyru } from './marca'

export function Cargando() {
  return (
    <div className="grid min-h-dvh place-items-center" role="status" aria-label="Cargando tu calculadora">
      <div className="flex flex-col items-center gap-4">
        <LogoAyru className="w-40 animate-pulse" prioridad />
        <p className="text-sm text-tinta-suave">Abriendo tu calculadora…</p>
      </div>
    </div>
  )
}
