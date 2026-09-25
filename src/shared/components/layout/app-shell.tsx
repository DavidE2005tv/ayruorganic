'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { CloudAlert, LogOut, Menu, ShieldCheck } from 'lucide-react'
import { cerrarSesion } from '@/features/auth/actions'
import { haceCuanto } from '@/features/calculadora/lib/format'
import { useLibro, useSesion } from '@/features/calculadora/store/provider'
import { Aviso } from '@/shared/components/ui/aviso'
import { Dialogo } from '@/shared/components/ui/dialogo'
import { Notificaciones } from '@/shared/components/ui/notificaciones'
import { cn } from '@/shared/lib/cn'
import { LogoAyru } from './marca'
import { NAV_HERRAMIENTAS, NAV_PRINCIPAL, estaActivo, type ItemNavegacion } from './navegacion'

function useRespaldoPendiente(): { pendiente: boolean; ultimo: string | null } {
  const meta = useLibro((s) => s.meta)
  const hayDatos = useLibro((s) => s.insumos.length + s.productos.length > 0)
  const pendiente =
    hayDatos && meta.ultimoCambio !== null && (meta.ultimoRespaldo === null || meta.ultimoRespaldo < meta.ultimoCambio)
  return { pendiente, ultimo: meta.ultimoRespaldo }
}

function EnlaceLateral({ item, pathname }: { item: ItemNavegacion; pathname: string }) {
  const activo = estaActivo(pathname, item.href)
  const Icono = item.icono
  return (
    <Link
      href={item.href}
      aria-current={activo ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium transition-colors',
        activo ? 'bg-bosque text-papel shadow-hoja' : 'text-tinta hover:bg-salvia/80',
      )}
    >
      <Icono className={cn('size-5', activo ? 'text-papel' : 'text-oliva')} aria-hidden />
      <span className="flex-1">{item.titulo}</span>
      {item.paso && (
        <span className={cn('cifra grid size-6 place-items-center rounded-full text-xs font-bold', activo ? 'bg-papel/20' : 'bg-kraft/60 text-tinta')}>
          {item.paso}
        </span>
      )}
    </Link>
  )
}

function EstadoRespaldo({ compacto }: { compacto?: boolean }) {
  const { pendiente, ultimo } = useRespaldoPendiente()
  return (
    <Link
      href="/mis-datos"
      className={cn(
        'flex items-center gap-2 rounded-xl text-sm font-medium transition-colors',
        compacto ? 'size-10 justify-center' : 'px-3 py-2.5',
        pendiente ? 'bg-kraft/60 text-[#6E4222] hover:bg-kraft' : 'text-tinta-suave hover:bg-salvia/70',
      )}
      aria-label={pendiente ? 'Tienes cambios sin respaldo' : `Último respaldo: ${haceCuanto(ultimo)}`}
    >
      {pendiente ? <CloudAlert className="size-5" aria-hidden /> : <ShieldCheck className="size-5 text-oliva" aria-hidden />}
      {!compacto && <span>{pendiente ? 'Descarga tu respaldo' : `Respaldo: ${haceCuanto(ultimo)}`}</span>}
    </Link>
  )
}

function BarraLateral({ pathname, correo }: { pathname: string; correo: string }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-linea/80 bg-papel/85 px-4 py-6 backdrop-blur lg:flex">
      <Link href="/" className="px-3">
        <LogoAyru className="w-36" prioridad />
      </Link>
      <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-canela">Calculadora PRO 1.0</p>
      <nav aria-label="Principal" className="mt-8 flex flex-col gap-1">
        {NAV_PRINCIPAL.map((item) => (
          <EnlaceLateral key={item.href} item={item} pathname={pathname} />
        ))}
        <p className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-tinta-suave">Herramientas</p>
        {NAV_HERRAMIENTAS.map((item) => (
          <EnlaceLateral key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-linea/80 pt-4">
        <EstadoRespaldo />
        <form action={cerrarSesion} className="flex items-center justify-between gap-2 px-3">
          <span className="truncate text-xs text-tinta-suave" title={correo}>
            {correo}
          </span>
          <button type="submit" className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-bosque hover:bg-salvia">
            <LogOut className="size-3.5" aria-hidden /> Salir
          </button>
        </form>
      </div>
    </aside>
  )
}

function BarraInferior({ pathname, correo }: { pathname: string; correo: string }) {
  const [masAbierto, setMasAbierto] = useState(false)
  const enHerramientas = NAV_HERRAMIENTAS.some((i) => estaActivo(pathname, i.href))
  return (
    <>
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-linea bg-papel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_PRINCIPAL.map((item) => {
            const activo = estaActivo(pathname, item.href)
            const Icono = item.icono
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={activo ? 'page' : undefined}
                  className={cn('flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold', activo ? 'text-bosque' : 'text-tinta-suave')}
                >
                  <span className={cn('grid h-7 w-12 place-items-center rounded-full transition-colors', activo && 'bg-salvia')}>
                    <Icono className="size-5" aria-hidden />
                  </span>
                  {item.corto}
                </Link>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={() => setMasAbierto(true)}
              className={cn('flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold', enHerramientas ? 'text-bosque' : 'text-tinta-suave')}
            >
              <span className={cn('grid h-7 w-12 place-items-center rounded-full', enHerramientas && 'bg-salvia')}>
                <Menu className="size-5" aria-hidden />
              </span>
              Más
            </button>
          </li>
        </ul>
      </nav>
      <Dialogo abierto={masAbierto} alCerrar={() => setMasAbierto(false)} titulo="Más herramientas">
        <div className="flex flex-col gap-1" onClick={() => setMasAbierto(false)}>
          {NAV_HERRAMIENTAS.map((item) => (
            <EnlaceLateral key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
        <form action={cerrarSesion} className="mt-6 flex items-center justify-between gap-3 border-t border-linea pt-4">
          <span className="truncate text-sm text-tinta-suave">{correo}</span>
          <button type="submit" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-bosque hover:bg-salvia">
            <LogOut className="size-4" aria-hidden /> Salir
          </button>
        </form>
      </Dialogo>
    </>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { correo, almacenamientoOk } = useSesion()

  return (
    <div className="min-h-dvh">
      <BarraLateral pathname={pathname} correo={correo} />
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-linea/70 bg-lino/90 px-4 py-2 backdrop-blur lg:hidden">
        <Link href="/" aria-label="Inicio">
          <LogoAyru className="w-24" prioridad />
        </Link>
        <EstadoRespaldo compacto />
      </header>
      <div className="pb-seguro lg:pb-12 lg:pl-72">
        <main className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 lg:px-10 lg:pt-10">
          {!almacenamientoOk && (
            <Aviso tono="alerta" className="mb-5">
              Tu navegador no está guardando datos (quizás estás en modo incógnito). Todo lo que registres se perderá al cerrar
              la página. Usa <Link href="/mis-datos" className="font-semibold underline">Mis datos</Link> para descargar un respaldo.
            </Aviso>
          )}
          {children}
        </main>
      </div>
      <BarraInferior pathname={pathname} correo={correo} />
      <Notificaciones />
    </div>
  )
}
