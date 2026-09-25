'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatoNumero, formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import type { ProductoConResultado } from '@/features/calculadora/store/selectores'
import { EstadoBadge } from '@/shared/components/ui/estado-badge'
import { cn } from '@/shared/lib/cn'

const COLUMNAS = [
  'Producto',
  'Costo lote',
  'Unid.',
  'Costo unitario',
  'Precio actual',
  'Utilidad / unidad',
  'Margen actual',
  'Precio sugerido',
  'Diferencia',
  'Utilidad s/ costo',
  'Precio comercial',
  'Estado',
]

function TablaEscritorio({ filas }: { filas: ProductoConResultado[] }) {
  const router = useRouter()
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-linea/70 bg-papel shadow-hoja lg:block">
      <table className="w-full min-w-[64rem] text-sm">
        <thead>
          <tr className="border-b border-linea/70 bg-lino/70 text-left text-[0.7rem] uppercase tracking-wide text-tinta-suave">
            {COLUMNAS.map((c, i) => (
              <th key={c} scope="col" className={cn('px-3 py-3 font-semibold', i > 0 && i < 11 && 'text-right')}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-linea/60">
          {filas.map(({ producto: p, resultado: r }) => (
            <tr key={p.id} onClick={() => router.push(`/productos/${p.id}`)} className="cursor-pointer transition-colors hover:bg-salvia/40">
              <th scope="row" className="px-3 py-3 text-left font-semibold">
                <Link href={`/productos/${p.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                  {p.nombre}
                </Link>
                <span className="block text-xs font-normal text-tinta-suave">{p.codigo}</span>
              </th>
              <td className="cifra px-3 text-right">{formatoPesos(r.costoTotalLote)}</td>
              <td className="cifra px-3 text-right">{formatoNumero(p.unidadesLote)}</td>
              <td className="cifra px-3 text-right font-semibold">{formatoPesos(r.costoUnitario)}</td>
              <td className="cifra px-3 text-right">{formatoPesos(p.precioActual)}</td>
              <td className={cn('cifra px-3 text-right', r.utilidadPorUnidad < 0 && 'text-arcilla')}>{formatoPesos(r.utilidadPorUnidad)}</td>
              <td className={cn('cifra px-3 text-right', r.margenActual < 0 && 'text-arcilla')}>{formatoPorcentaje(r.margenActual)}</td>
              <td className="cifra px-3 text-right font-semibold text-bosque">{formatoPesos(r.precioSugerido)}</td>
              <td className={cn('cifra px-3 text-right', r.diferenciaPrecio < 0 && 'text-canela')}>{formatoPesos(r.diferenciaPrecio)}</td>
              <td className="cifra px-3 text-right">{formatoPorcentaje(r.utilidadSobreCosto)}</td>
              <td className="cifra px-3 text-right">{formatoPesos(r.precioComercial)}</td>
              <td className="px-3">
                <EstadoBadge estado={r.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ListaMovil({ filas }: { filas: ProductoConResultado[] }) {
  return (
    <ul className="flex flex-col gap-3 lg:hidden">
      {filas.map(({ producto: p, resultado: r }) => (
        <li key={p.id}>
          <Link href={`/productos/${p.id}`} className="block rounded-2xl border border-linea/70 bg-papel p-4 shadow-hoja">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold leading-tight">{p.nombre}</p>
              <EstadoBadge estado={r.estado} />
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <dt className="text-tinta-suave">Costo unitario</dt>
              <dd className="cifra text-right font-semibold">{formatoPesos(r.costoUnitario)}</dd>
              <dt className="text-tinta-suave">Precio actual</dt>
              <dd className="cifra text-right">{formatoPesos(p.precioActual)}</dd>
              <dt className="text-tinta-suave">Margen actual</dt>
              <dd className={cn('cifra text-right', r.margenActual < 0 && 'text-arcilla')}>{formatoPorcentaje(r.margenActual)}</dd>
              <dt className="text-tinta-suave">Precio sugerido</dt>
              <dd className="cifra text-right font-semibold text-bosque">{formatoPesos(r.precioSugerido)}</dd>
              <dt className="text-tinta-suave">Precio comercial</dt>
              <dd className="cifra text-right">{formatoPesos(r.precioComercial)}</dd>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function TablaResumen({ filas }: { filas: ProductoConResultado[] }) {
  return (
    <>
      <TablaEscritorio filas={filas} />
      <ListaMovil filas={filas} />
    </>
  )
}
