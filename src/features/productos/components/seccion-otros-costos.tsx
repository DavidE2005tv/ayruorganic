'use client'

import { useMemo, useState } from 'react'
import { Copy, Package, Pencil, Plus } from 'lucide-react'
import { costoTotalOtro } from '@/features/calculadora/lib/calc'
import { formatoNumero, formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import type { OtroCosto, Producto } from '@/features/calculadora/types'
import { Boton } from '@/shared/components/ui/boton'
import { CampoSelect } from '@/shared/components/ui/campos'
import { Dialogo } from '@/shared/components/ui/dialogo'
import { notificar } from '@/shared/components/ui/notificaciones'
import { EncabezadoTarjeta, Tarjeta } from '@/shared/components/ui/tarjeta'
import { FormularioOtroCosto } from './formulario-otro-costo'

function explicacion(c: OtroCosto): string {
  if (c.concepto === 'Comisiones' && c.porcentajeVentas > 0) return `${formatoPorcentaje(c.porcentajeVentas)} de las ventas del lote`
  return `${formatoPesos(c.costoUnidad)} × ${formatoNumero(c.cantidadFactor)}`
}

function CopiarDeOtro({ producto, alCerrar }: { producto: Producto; alCerrar: () => void }) {
  const productos = useLibro((s) => s.productos)
  const otros = useLibro((s) => s.otrosCostos)
  const copiar = useLibro((s) => s.copiarOtrosCostos)
  const opciones = productos
    .filter((p) => p.id !== producto.id && otros.some((c) => c.productoId === p.id))
    .map((p) => ({ valor: p.id, texto: `${p.nombre} (${otros.filter((c) => c.productoId === p.id).length} costos)` }))
  const [desde, setDesde] = useState(opciones[0]?.valor ?? '')

  return (
    <Dialogo
      abierto
      alCerrar={alCerrar}
      titulo="Copiar otros costos"
      descripcion="Trae el empaque, etiquetas, mano de obra… de otro producto. Luego puedes ajustarlos."
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton
            disabled={!desde}
            onClick={() => {
              const r = copiar(desde, producto.id)
              notificar(r.ok ? 'Costos copiados' : r.error, r.ok ? 'exito' : 'error')
              alCerrar()
            }}
          >
            <Copy aria-hidden /> Copiar
          </Boton>
        </>
      }
    >
      {opciones.length === 0 ? (
        <p className="text-tinta-suave">Ningún otro producto tiene costos registrados todavía.</p>
      ) : (
        <CampoSelect etiqueta="Copiar desde" valor={desde} alCambiar={setDesde} opciones={opciones} />
      )}
    </Dialogo>
  )
}

export function SeccionOtrosCostos({ producto }: { producto: Producto }) {
  const todos = useLibro((s) => s.otrosCostos)
  const [edicion, setEdicion] = useState<{ costo?: OtroCosto } | null>(null)
  const [copiando, setCopiando] = useState(false)

  const costos = useMemo(
    () => todos.filter((c) => c.productoId === producto.id).map((c) => ({ c, total: costoTotalOtro(c, producto) })),
    [todos, producto],
  )
  const total = costos.reduce((s, x) => s + x.total, 0)

  return (
    <Tarjeta>
      <EncabezadoTarjeta
        icono={<Package className="size-5" />}
        titulo="Otros costos"
        descripcion="Empaque, etiquetas, mano de obra, servicios, comisiones…"
        accion={
          <Boton tamano="sm" variante="suave" onClick={() => setEdicion({})}>
            <Plus aria-hidden /> <span className="hidden sm:inline">Costo</span>
          </Boton>
        }
      />
      <div className="px-2 pb-2 pt-3 sm:px-3">
        {costos.length === 0 ? (
          <div className="m-2 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setEdicion({})}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-kraft bg-lino/60 px-4 py-6 font-semibold text-bosque hover:bg-kraft/25"
            >
              <Plus className="size-5" aria-hidden /> Agregar un costo
            </button>
            <button
              type="button"
              onClick={() => setCopiando(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-linea px-4 py-6 font-semibold text-tinta-suave hover:bg-salvia/40"
            >
              <Copy className="size-5" aria-hidden /> Copiar de otro producto
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-linea/60">
            {costos.map(({ c, total: t }) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setEdicion({ costo: c })}
                  className="group grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 rounded-xl px-3 py-3 text-left hover:bg-salvia/40"
                >
                  <span className="min-w-0 truncate font-semibold">
                    {c.concepto}
                    {c.detalle && <span className="font-normal text-tinta-suave"> · {c.detalle}</span>}
                  </span>
                  <span className={`cifra text-right font-semibold ${c.sumar ? 'text-bosque' : 'text-tinta-suave line-through'}`}>
                    {formatoPesos(c.sumar ? t : c.costoUnidad * c.cantidadFactor)}
                  </span>
                  <span className="cifra text-sm text-tinta-suave">
                    {explicacion(c)}
                    {!c.sumar && <span className="ml-1.5 rounded-full bg-kraft/60 px-2 py-0.5 text-xs font-semibold text-tinta">No suma</span>}
                  </span>
                  <Pencil className="size-3.5 justify-self-end text-tinta-suave opacity-60 group-hover:opacity-100" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {costos.length > 0 && (
        <div className="flex items-center justify-between rounded-b-2xl border-t border-linea/70 bg-salvia/50 px-5 py-3">
          <span className="text-sm font-semibold text-oliva">Total otros costos</span>
          <span className="cifra font-display text-xl font-semibold text-bosque">{formatoPesos(total)}</span>
        </div>
      )}
      {edicion && <FormularioOtroCosto producto={producto} costo={edicion.costo} alCerrar={() => setEdicion(null)} />}
      {copiando && <CopiarDeOtro producto={producto} alCerrar={() => setCopiando(false)} />}
    </Tarjeta>
  )
}
