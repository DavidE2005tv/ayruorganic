import { formatoNumero, formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import type { FilaEscenario } from '@/features/calculadora/lib/simulador'
import { Columns3 } from 'lucide-react'
import { EncabezadoTarjeta, Tarjeta } from '@/shared/components/ui/tarjeta'
import { cn } from '@/shared/lib/cn'

function detalles(f: FilaEscenario): { t: string; v: string }[] {
  return [
    { t: 'Por unidad', v: formatoPesos(f.utilidadPorUnidad) },
    { t: 'Margen', v: formatoPorcentaje(f.margen) },
    { t: 'Ingresos', v: formatoPesos(f.ingresos) },
    { t: 'Costo c/u', v: formatoPesos(f.costoUnitario) },
  ]
}

export function Comparador({ filas }: { filas: FilaEscenario[] }) {
  const maximo = Math.max(...filas.map((f) => Math.abs(f.utilidadTotal)), 1)
  return (
    <Tarjeta>
      <EncabezadoTarjeta
        icono={<Columns3 className="size-5" />}
        titulo="Comparador de escenarios"
        descripcion={`Con ${formatoNumero(filas[0]?.unidades ?? 0)} unidades vendidas`}
      />
      <ul className="flex flex-col gap-2 p-3 sm:p-4">
        {filas.map((f) => {
          const prueba = f.escenario === 'Precio a probar'
          const negativa = f.utilidadTotal < 0
          return (
            <li
              key={f.escenario}
              className={cn('rounded-xl border px-4 py-3', prueba ? 'border-canela/50 bg-kraft/25' : 'border-linea/60 bg-[#FFFDF8]')}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="font-semibold">
                  {f.escenario}
                  <span className="cifra ml-2 font-display text-lg text-bosque">{formatoPesos(f.precio)}</span>
                </p>
                <p className={cn('cifra text-sm', negativa ? 'text-arcilla' : 'text-tinta-suave')}>
                  Utilidad total <strong className={cn('text-base', negativa ? 'text-arcilla' : 'text-bosque')}>{formatoPesos(f.utilidadTotal)}</strong>
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-linea/50" aria-hidden>
                <div
                  className={cn('h-full rounded-full', negativa ? 'bg-arcilla' : prueba ? 'bg-canela' : 'bg-oliva')}
                  style={{ width: `${(Math.abs(f.utilidadTotal) / maximo) * 100}%` }}
                />
              </div>
              <dl className="cifra mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-tinta-suave sm:grid-cols-4">
                {detalles(f).map((d) => (
                  <div key={d.t} className="whitespace-nowrap">
                    <dt className="inline">{d.t}: </dt>
                    <dd className="inline font-semibold text-tinta">{d.v}</dd>
                  </div>
                ))}
              </dl>
            </li>
          )
        })}
      </ul>
    </Tarjeta>
  )
}
