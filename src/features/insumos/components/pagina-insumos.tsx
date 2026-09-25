'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, FlaskConical, Plus, Search } from 'lucide-react'
import { fechaCorta, formatoNumero, formatoPesos, formatoPesosDetalle } from '@/features/calculadora/lib/format'
import { useInsumosConCosto, type InsumoConCosto } from '@/features/calculadora/store/selectores'
import { useLibro } from '@/features/calculadora/store/provider'
import { LIMITES, type Insumo } from '@/features/calculadora/types'
import { EncabezadoPagina } from '@/shared/components/layout/encabezado-pagina'
import { Aviso } from '@/shared/components/ui/aviso'
import { Boton } from '@/shared/components/ui/boton'
import { Vacio } from '@/shared/components/ui/vacio'
import { FormularioInsumo } from './formulario-insumo'

type Edicion = { modo: 'nuevo' } | { modo: 'editar'; insumo: Insumo } | null

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function FilaInsumo({ item, alAbrir }: { item: InsumoConCosto; alAbrir: () => void }) {
  const { insumo, costoUnitario, usos } = item
  return (
    <li>
      <button
        type="button"
        onClick={alAbrir}
        className="group grid w-full grid-cols-[1fr_auto] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-salvia/40 sm:grid-cols-[1.6fr_1fr_1fr_auto] sm:px-5"
      >
        <span className="min-w-0">
          <span className="block truncate font-semibold text-tinta">{insumo.nombre}</span>
          <span className="mt-0.5 block text-xs text-tinta-suave">
            {insumo.codigo} · {usos > 0 ? `En ${usos} ${usos === 1 ? 'receta' : 'recetas'}` : 'Sin usar aún'}
            {insumo.ejemplo && ' · ejemplo'}
          </span>
        </span>
        <span className="hidden text-sm text-tinta-suave sm:block">
          <span className="cifra">
            {formatoNumero(insumo.cantidadComprada)} {insumo.unidad}
          </span>{' '}
          por <span className="cifra font-medium text-tinta">{formatoPesos(insumo.precioCompra)}</span>
          <span className="block text-xs">{fechaCorta(insumo.fechaActualizacion)}</span>
        </span>
        <span className="flex items-center gap-2 justify-self-end sm:justify-self-start">
          <span className="cifra rounded-lg bg-salvia px-2.5 py-1.5 text-sm font-semibold text-bosque">
            {formatoPesosDetalle(costoUnitario)}
            <span className="font-normal text-oliva"> / {insumo.unidad}</span>
          </span>
        </span>
        <ChevronRight className="hidden size-5 text-tinta-suave transition-transform group-hover:translate-x-0.5 sm:block" aria-hidden />
      </button>
    </li>
  )
}

export function PaginaInsumos() {
  const lista = useInsumosConCosto()
  const recetas = useLibro((s) => s.recetas)
  const productos = useLibro((s) => s.productos)
  const [busqueda, setBusqueda] = useState('')
  const [edicion, setEdicion] = useState<Edicion>(null)
  const lleno = lista.length >= LIMITES.insumos

  const filtrados = useMemo(() => {
    const q = normalizar(busqueda.trim())
    return q ? lista.filter((i) => normalizar(`${i.insumo.nombre} ${i.insumo.codigo} ${i.insumo.proveedor}`).includes(q)) : lista
  }, [lista, busqueda])

  const productosQueUsan = (insumoId: string): string[] => {
    const ids = new Set(recetas.filter((l) => l.insumoId === insumoId).map((l) => l.productoId))
    return productos.filter((p) => ids.has(p.id)).map((p) => p.nombre)
  }

  const agregar = (
    <Boton onClick={() => setEdicion({ modo: 'nuevo' })} disabled={lleno}>
      <Plus aria-hidden /> Agregar insumo
    </Boton>
  )

  return (
    <>
      <EncabezadoPagina
        paso="Paso 1 de 3"
        titulo="Materias primas"
        descripcion="Tu lista maestra de precios. Registra cada insumo una sola vez: si cambia su precio, todas tus recetas se actualizan solas."
        acciones={agregar}
      />

      {lista.length === 0 ? (
        <Vacio icono={<FlaskConical />} titulo="Aún no tienes insumos" accion={agregar}>
          Empieza por lo que más usas: tu base de glicerina, aceites, fragancias. Ejemplo: si compras 1.000 g de base por $18.000,
          la calculadora sabrá que cada gramo cuesta $18.
        </Vacio>
      ) : (
        <div className="animate-brotar [animation-delay:80ms]">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block sm:w-80">
              <span className="sr-only">Buscar insumo</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-tinta-suave" aria-hidden />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar insumo…"
                className="h-12 w-full rounded-xl border border-linea bg-papel pl-11 pr-3 focus:border-canela focus:outline-none focus:ring-4 focus:ring-kraft/50"
              />
            </label>
            <p className="cifra text-sm text-tinta-suave">
              {lista.length} de {LIMITES.insumos} insumos
            </p>
          </div>
          {lleno && (
            <Aviso tono="consejo" className="mb-3">
              Llegaste al máximo de {LIMITES.insumos} insumos de la versión PRO 1.0.
            </Aviso>
          )}
          <div className="overflow-hidden rounded-2xl border border-linea/70 bg-papel shadow-hoja">
            <div className="hidden grid-cols-[1.6fr_1fr_1fr_auto] gap-3 border-b border-linea/70 bg-lino/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-tinta-suave sm:grid">
              <span>Insumo</span>
              <span>Compra</span>
              <span>Costo automático</span>
              <span className="w-5" />
            </div>
            <ul className="divide-y divide-linea/60">
              {filtrados.map((item) => (
                <FilaInsumo key={item.insumo.id} item={item} alAbrir={() => setEdicion({ modo: 'editar', insumo: item.insumo })} />
              ))}
            </ul>
            {filtrados.length === 0 && <p className="px-5 py-8 text-center text-tinta-suave">No encontramos “{busqueda}”.</p>}
          </div>
        </div>
      )}

      {edicion && (
        <FormularioInsumo
          abierto
          alCerrar={() => setEdicion(null)}
          insumo={edicion.modo === 'editar' ? edicion.insumo : undefined}
          productosQueLoUsan={edicion.modo === 'editar' ? productosQueUsan(edicion.insumo.id) : []}
        />
      )}
    </>
  )
}
