'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, BookOpenText, FlaskConical, Plus } from 'lucide-react'
import { formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import { useResumen, type ProductoConResultado } from '@/features/calculadora/store/selectores'
import { LIMITES } from '@/features/calculadora/types'
import { EncabezadoPagina } from '@/shared/components/layout/encabezado-pagina'
import { Aviso } from '@/shared/components/ui/aviso'
import { Boton, claseBoton } from '@/shared/components/ui/boton'
import { EstadoBadge } from '@/shared/components/ui/estado-badge'
import { Vacio } from '@/shared/components/ui/vacio'
import { FormularioProducto } from './formulario-producto'

function TarjetaProducto({ item, indice }: { item: ProductoConResultado; indice: number }) {
  const { producto: p, resultado: r } = item
  const sinCostos = r.costoTotalLote === 0
  return (
    <li className="animate-brotar" style={{ animationDelay: `${Math.min(indice, 8) * 40}ms` }}>
      <Link
        href={`/productos/${p.id}`}
        className="group flex h-full flex-col rounded-2xl border border-linea/70 bg-papel p-5 shadow-hoja transition-all hover:-translate-y-0.5 hover:border-kraft"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-tinta-suave">
              {p.codigo} · {p.canal}
            </p>
            <h3 className="mt-1 text-xl font-semibold leading-tight">{p.nombre}</h3>
          </div>
          <ArrowUpRight className="size-5 shrink-0 text-tinta-suave transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </div>
        <div className="mt-3">
          <EstadoBadge estado={r.estado} />
        </div>
        {sinCostos ? (
          <p className="mt-4 rounded-xl bg-kraft/35 px-3 py-2.5 text-sm text-tinta">Falta armar la receta y los otros costos.</p>
        ) : (
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { t: 'Costo c/u', v: formatoPesos(r.costoUnitario) },
              { t: 'Vendes a', v: p.precioActual > 0 ? formatoPesos(p.precioActual) : '—' },
              { t: 'Sugerido', v: formatoPesos(r.precioSugerido) },
            ].map((d) => (
              <div key={d.t} className="rounded-xl bg-salvia/60 px-1 py-2">
                <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-oliva">{d.t}</dt>
                <dd className="cifra mt-0.5 text-[0.95rem] font-bold text-bosque">{d.v}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="mt-auto pt-4 text-sm text-tinta-suave">
          {p.unidadesLote > 0 ? `${p.unidadesLote} unidades por lote` : 'Sin lote definido'} · margen deseado{' '}
          {formatoPorcentaje(p.margenDeseado)}
        </p>
      </Link>
    </li>
  )
}

export function PaginaProductos() {
  const resumen = useResumen()
  const hayInsumos = useLibro((s) => s.insumos.length > 0)
  const [creando, setCreando] = useState(false)
  const lleno = resumen.length >= LIMITES.productos

  const crear = (
    <Boton onClick={() => setCreando(true)} disabled={lleno}>
      <Plus aria-hidden /> Nuevo producto
    </Boton>
  )

  return (
    <>
      <EncabezadoPagina
        paso="Paso 2 de 3"
        titulo="Productos y recetas"
        descripcion="Crea cada producto, arma su receta con tus insumos y suma empaque, mano de obra y demás gastos. El precio sugerido aparece solo."
        acciones={crear}
      />
      {!hayInsumos && (
        <Aviso tono="consejo" className="mb-5">
          Primero registra tus <Link href="/insumos" className="font-semibold underline">materias primas</Link>: las necesitarás para armar las recetas.
        </Aviso>
      )}
      {resumen.length === 0 ? (
        <Vacio
          icono={<BookOpenText />}
          titulo="Aún no tienes productos"
          accion={
            hayInsumos ? (
              crear
            ) : (
              <Link href="/insumos" className={claseBoton('primario')}>
                <FlaskConical aria-hidden /> Ir a materias primas
              </Link>
            )
          }
        >
          Crea tu primer jabón: cuántas unidades salen por lote, a qué precio lo vendes y qué margen quieres ganar.
        </Vacio>
      ) : (
        <>
          <p className="cifra mb-3 text-sm text-tinta-suave">
            {resumen.length} de {LIMITES.productos} productos
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resumen.map((item, i) => (
              <TarjetaProducto key={item.producto.id} item={item} indice={i} />
            ))}
          </ul>
        </>
      )}
      {creando && <FormularioProducto alCerrar={() => setCreando(false)} />}
    </>
  )
}
