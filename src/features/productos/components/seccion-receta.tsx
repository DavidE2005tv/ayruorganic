'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { FlaskConical, Pencil, Plus } from 'lucide-react'
import { costoLineaReceta, porcentajeDelLote } from '@/features/calculadora/lib/calc'
import { formatoNumero, formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import { LIMITES, type LineaReceta, type Producto } from '@/features/calculadora/types'
import { Boton, claseBoton } from '@/shared/components/ui/boton'
import { EncabezadoTarjeta, Tarjeta } from '@/shared/components/ui/tarjeta'
import { FormularioLinea } from './formulario-linea'

type Edicion = { linea?: LineaReceta } | null

export function SeccionReceta({ producto }: { producto: Producto }) {
  const todas = useLibro((s) => s.recetas)
  const insumos = useLibro((s) => s.insumos)
  const [edicion, setEdicion] = useState<Edicion>(null)

  const lineas = useMemo(() => {
    const porId = new Map(insumos.map((i) => [i.id, i]))
    return todas
      .filter((l) => l.productoId === producto.id)
      .map((linea) => {
        const insumo = porId.get(linea.insumoId)
        return { linea, insumo, costo: costoLineaReceta(linea, insumo), porcentaje: porcentajeDelLote(linea, producto) }
      })
  }, [todas, insumos, producto])

  const total = lineas.reduce((s, l) => s + l.costo, 0)
  const lleno = lineas.length >= LIMITES.ingredientesPorProducto

  return (
    <Tarjeta>
      <EncabezadoTarjeta
        icono={<FlaskConical className="size-5" />}
        titulo="Receta"
        descripcion={`Ingredientes para un lote de ${formatoNumero(producto.unidadesLote)} unidades · ${lineas.length} de ${LIMITES.ingredientesPorProducto}`}
        accion={
          insumos.length > 0 && (
            <Boton tamano="sm" variante="suave" onClick={() => setEdicion({})} disabled={lleno}>
              <Plus aria-hidden /> <span className="hidden sm:inline">Ingrediente</span>
            </Boton>
          )
        }
      />
      <div className="px-2 pb-2 pt-3 sm:px-3">
        {insumos.length === 0 ? (
          <div className="m-2 rounded-xl bg-kraft/30 p-4 text-sm">
            Para armar la receta primero registra tus insumos.
            <Link href="/insumos" className={claseBoton('primario', 'sm', 'mt-3 flex w-fit')}>
              Ir a materias primas
            </Link>
          </div>
        ) : lineas.length === 0 ? (
          <button
            type="button"
            onClick={() => setEdicion({})}
            className="m-2 flex w-[calc(100%-1rem)] items-center justify-center gap-2 rounded-xl border border-dashed border-kraft bg-lino/60 px-4 py-6 font-semibold text-bosque hover:bg-kraft/25"
          >
            <Plus className="size-5" aria-hidden /> Agrega el primer ingrediente
          </button>
        ) : (
          <ul className="divide-y divide-linea/60">
            {lineas.map(({ linea, insumo, costo, porcentaje }) => (
              <li key={linea.id}>
                <button
                  type="button"
                  onClick={() => setEdicion({ linea })}
                  className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 rounded-xl px-3 py-3 text-left hover:bg-salvia/40"
                >
                  <span className="min-w-0 truncate font-semibold">{insumo?.nombre ?? 'Insumo eliminado'}</span>
                  <span className="cifra text-right font-semibold text-bosque">{formatoPesos(costo)}</span>
                  <span className="cifra text-sm text-tinta-suave">
                    {formatoNumero(linea.cantidad)} {insumo?.unidad} · {formatoPorcentaje(porcentaje)} del lote
                    {linea.observacion && ` · ${linea.observacion}`}
                  </span>
                  <Pencil className="size-3.5 justify-self-end text-tinta-suave opacity-60 group-hover:opacity-100" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {lineas.length > 0 && (
        <div className="flex items-center justify-between rounded-b-2xl border-t border-linea/70 bg-salvia/50 px-5 py-3">
          <span className="text-sm font-semibold text-oliva">Costo de materias primas</span>
          <span className="cifra font-display text-xl font-semibold text-bosque">{formatoPesos(total)}</span>
        </div>
      )}
      {edicion && <FormularioLinea producto={producto} linea={edicion.linea} alCerrar={() => setEdicion(null)} />}
    </Tarjeta>
  )
}
