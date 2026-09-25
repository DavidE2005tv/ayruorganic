'use client'

import { ArrowRight, BookOpenText, FlaskConical, Package, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useLibro } from '@/features/calculadora/store/provider'
import { LogoAyru } from '@/shared/components/layout/marca'
import { Boton } from '@/shared/components/ui/boton'
import { notificar } from '@/shared/components/ui/notificaciones'

const PASOS = [
  { icono: FlaskConical, titulo: 'Registra tus materias primas', texto: 'Cada insumo una sola vez, con lo que pagaste y la cantidad que trae.' },
  { icono: BookOpenText, titulo: 'Crea tus productos y recetas', texto: 'Unidades por lote, precio actual, margen deseado y los ingredientes que usas.' },
  { icono: Package, titulo: 'Suma los otros costos', texto: 'Empaque, etiquetas, tu mano de obra, servicios y comisiones.' },
  { icono: SlidersHorizontal, titulo: 'Decide con el simulador', texto: 'Prueba precios, cantidades y ventas por mayor antes de cambiar tu precio real.' },
]

export function Bienvenida() {
  const empezar = useLibro((s) => s.empezarEnBlanco)
  const cargarEjemplo = useLibro((s) => s.cargarEjemplo)

  return (
    <section className="grano relative animate-brotar overflow-hidden rounded-[2rem] border border-linea bg-papel px-6 py-8 shadow-hoja sm:px-10 sm:py-12">
      <div aria-hidden className="absolute -right-20 -top-24 size-80 rounded-full bg-salvia blur-3xl" />
      <div className="relative grid gap-10 xl:grid-cols-[1fr_1.1fr] xl:items-center">
        <div>
          <LogoAyru className="w-36 lg:hidden" />
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-canela lg:mt-0">Calculadora de costos PRO 1.0</p>
          <h1 className="mt-2 text-[2.3rem] font-semibold leading-[1.02] sm:text-5xl">
            Conoce lo que te cuesta cada jabón y ponle el precio justo.
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-tinta-suave">
            Sin fórmulas ni hojas de cálculo. Tú escribes tus datos; la calculadora hace las cuentas.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Boton tamano="lg" onClick={empezar}>
              Empezar con mis datos <ArrowRight aria-hidden />
            </Boton>
            <Boton
              tamano="lg"
              variante="secundario"
              onClick={() => {
                const r = cargarEjemplo()
                notificar(r.ok ? 'Cargamos el ejemplo AYRU: 43 insumos y 4 jabones' : r.error, r.ok ? 'exito' : 'error')
              }}
            >
              <Sparkles aria-hidden /> Ver con un ejemplo
            </Boton>
          </div>
          <p className="mt-3 text-sm text-tinta-suave">El ejemplo lo puedes quitar cuando quieras desde “Mis datos”.</p>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="rounded-2xl border border-linea/70 bg-[#FFFDF8] p-5" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-3">
                <span className="cifra grid size-8 place-items-center rounded-full bg-bosque font-display text-sm font-semibold text-papel">{i + 1}</span>
                <paso.icono className="size-5 text-oliva" aria-hidden />
              </div>
              <h2 className="mt-3 text-lg font-semibold leading-tight">{paso.titulo}</h2>
              <p className="mt-1 text-sm leading-relaxed text-tinta-suave">{paso.texto}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="relative mt-10 grid gap-3 border-t border-linea/70 pt-6 text-sm sm:grid-cols-2">
        <p className="flex items-center gap-3">
          <span className="h-8 w-12 shrink-0 rounded-lg border border-linea bg-[#FFFDF8]" /> Los campos claros son para escribir tus datos.
        </p>
        <p className="flex items-center gap-3">
          <span className="h-8 w-12 shrink-0 rounded-lg bg-salvia" /> Los recuadros verdes se calculan solos.
        </p>
      </div>
    </section>
  )
}
