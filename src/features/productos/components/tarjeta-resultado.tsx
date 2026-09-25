import Link from 'next/link'
import { SlidersHorizontal, Sparkles } from 'lucide-react'
import { formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import type { Producto, ResultadoProducto } from '@/features/calculadora/types'
import { claseBoton } from '@/shared/components/ui/boton'
import { EstadoBadge } from '@/shared/components/ui/estado-badge'
import { Tarjeta } from '@/shared/components/ui/tarjeta'
import { cn } from '@/shared/lib/cn'

function mensajeEstado(p: Producto, r: ResultadoProducto): string {
  switch (r.estado) {
    case 'OK':
      return 'Tu precio actual cubre el costo y deja al menos el margen que deseas.'
    case 'Por debajo del sugerido':
      return `Tu precio cubre el costo, pero te deja ${formatoPorcentaje(r.margenActual)} de margen y tú deseas ${formatoPorcentaje(p.margenDeseado)}.`
    case 'Revisar: bajo costo':
      return `Estás vendiendo por debajo de lo que te cuesta producir: pierdes ${formatoPesos(Math.abs(r.utilidadPorUnidad))} por unidad.`
    default:
      return 'Escribe tu precio actual en los datos del producto para compararlo.'
  }
}

function Linea({ t, v, fuerte, negativo }: { t: string; v: string; fuerte?: boolean; negativo?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className={cn('text-sm', fuerte ? 'font-semibold text-tinta' : 'text-tinta-suave')}>{t}</dt>
      <dd className={cn('cifra font-semibold', negativo ? 'text-arcilla' : 'text-tinta', fuerte && 'text-base')}>{v}</dd>
    </div>
  )
}

export function TarjetaResultado({ producto: p, resultado: r }: { producto: Producto; resultado: ResultadoProducto }) {
  const sinCostos = r.costoTotalLote === 0
  return (
    <Tarjeta className="overflow-hidden">
      <div className="grano bg-bosque px-5 pb-5 pt-5 text-papel">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kraft">Resultado automático</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-papel/75">Te cuesta cada unidad</p>
            <p className="cifra font-display text-3xl font-semibold">{formatoPesos(r.costoUnitario)}</p>
          </div>
          <div>
            <p className="text-sm text-papel/75">Precio sugerido</p>
            <p className="cifra font-display text-3xl font-semibold">{formatoPesos(r.precioSugerido)}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-papel/10 px-4 py-3">
          <Sparkles className="size-5 shrink-0 text-kraft" aria-hidden />
          <p className="text-sm leading-snug">
            Precio comercial: <strong className="cifra text-lg">{formatoPesos(r.precioComercial)}</strong>
            <span className="block text-xs text-papel/70">El sugerido redondeado al siguiente múltiplo de $500. Es una referencia.</span>
          </p>
        </div>
      </div>

      <div className="px-5 py-4">
        {sinCostos ? (
          <p className="rounded-xl bg-kraft/30 px-4 py-3 text-sm">
            Agrega los ingredientes de la receta y los otros costos para ver cuánto te cuesta y a qué precio venderlo.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2 rounded-xl bg-lino/70 p-3">
              <EstadoBadge estado={r.estado} className="w-fit" />
              <p className="text-sm leading-relaxed">{mensajeEstado(p, r)}</p>
            </div>
            <dl className="mt-3 divide-y divide-linea/60">
              <div className="pb-2">
                <Linea t="Materias primas" v={formatoPesos(r.costoMateriasPrimas)} />
                <Linea t="Otros costos" v={formatoPesos(r.otrosCostos)} />
                <Linea t="Costo total del lote" v={formatoPesos(r.costoTotalLote)} fuerte />
              </div>
              <div className="pt-2">
                <Linea t="Precio actual" v={p.precioActual > 0 ? formatoPesos(p.precioActual) : '—'} />
                <Linea t="Utilidad por unidad" v={formatoPesos(r.utilidadPorUnidad)} negativo={r.utilidadPorUnidad < 0} />
                <Linea t="Margen actual" v={formatoPorcentaje(r.margenActual)} negativo={r.margenActual < 0} />
                <Linea t="Margen deseado" v={formatoPorcentaje(p.margenDeseado)} />
                <Linea t="Utilidad sobre costo" v={formatoPorcentaje(r.utilidadSobreCosto)} negativo={r.utilidadSobreCosto < 0} />
                <Linea t="Diferencia vs. sugerido" v={formatoPesos(r.diferenciaPrecio)} negativo={r.diferenciaPrecio < 0} />
              </div>
            </dl>
          </>
        )}
        <Link href={`/simulador?producto=${p.id}`} className={claseBoton('secundario', 'md', 'mt-4 w-full')}>
          <SlidersHorizontal aria-hidden /> Probar precios en el simulador
        </Link>
      </div>
    </Tarjeta>
  )
}
