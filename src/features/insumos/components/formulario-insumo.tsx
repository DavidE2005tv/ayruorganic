'use client'

import { useState } from 'react'
import { costoUnitarioInsumo } from '@/features/calculadora/lib/calc'
import { hoyISO } from '@/features/calculadora/lib/codigos'
import { formatoNumero, formatoPesos, formatoPesosDetalle } from '@/features/calculadora/lib/format'
import type { EntradaInsumo } from '@/features/calculadora/lib/schemas'
import { useLibro } from '@/features/calculadora/store/provider'
import { UNIDADES_SUGERIDAS, type Insumo } from '@/features/calculadora/types'
import { Aviso } from '@/shared/components/ui/aviso'
import { PieFormulario } from '@/shared/components/ui/pie-formulario'
import { CampoNumero, CampoTexto } from '@/shared/components/ui/campos'
import { Dialogo } from '@/shared/components/ui/dialogo'
import { notificar } from '@/shared/components/ui/notificaciones'
import { SelectorChips } from '@/shared/components/ui/selector-chips'

type OpcionUnidad = (typeof UNIDADES_SUGERIDAS)[number] | 'otra'

const OPCIONES_UNIDAD: { valor: OpcionUnidad; texto: string }[] = [
  { valor: 'gr', texto: 'Gramos (gr)' },
  { valor: 'ml', texto: 'Mililitros (ml)' },
  { valor: 'unidad', texto: 'Unidades' },
  { valor: 'sachet', texto: 'Sachet' },
  { valor: 'otra', texto: 'Otra' },
]

function opcionDe(unidad: string): OpcionUnidad {
  return (UNIDADES_SUGERIDAS as readonly string[]).includes(unidad) ? (unidad as OpcionUnidad) : 'otra'
}

function entradaInicial(insumo?: Insumo): EntradaInsumo {
  return {
    nombre: insumo?.nombre ?? '',
    unidad: insumo?.unidad ?? 'gr',
    cantidadComprada: insumo?.cantidadComprada ?? 0,
    precioCompra: insumo?.precioCompra ?? 0,
    proveedor: insumo?.proveedor ?? '',
    fechaActualizacion: insumo?.fechaActualizacion ?? hoyISO(),
  }
}

function CostoAutomatico({ cantidad, precio, unidad }: { cantidad: number | null; precio: number | null; unidad: string }) {
  const costo = costoUnitarioInsumo({ precioCompra: precio ?? 0, cantidadComprada: cantidad ?? 0 })
  return (
    <div className="rounded-xl bg-salvia/80 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-oliva">Costo automático</p>
      <p className="cifra mt-1 font-display text-2xl font-semibold text-bosque">
        {formatoPesosDetalle(costo)} <span className="text-base font-medium text-oliva">por {unidad}</span>
      </p>
      {cantidad !== null && precio !== null && cantidad > 0 && (
        <p className="mt-1 text-xs text-tinta-suave">
          {formatoPesos(precio)} ÷ {formatoNumero(cantidad)} {unidad}
        </p>
      )}
    </div>
  )
}

interface Props {
  abierto: boolean
  alCerrar: () => void
  insumo?: Insumo
  productosQueLoUsan: string[]
}

export function FormularioInsumo({ abierto, alCerrar, insumo, productosQueLoUsan }: Props) {
  const agregar = useLibro((s) => s.agregarInsumo)
  const actualizar = useLibro((s) => s.actualizarInsumo)
  const eliminar = useLibro((s) => s.eliminarInsumo)
  const [datos, setDatos] = useState<EntradaInsumo>(() => entradaInicial(insumo))
  const [opcion, setOpcion] = useState<OpcionUnidad>(() => opcionDe(insumo?.unidad ?? 'gr'))
  const [cantidad, setCantidad] = useState<number | null>(insumo ? insumo.cantidadComprada : null)
  const [precio, setPrecio] = useState<number | null>(insumo ? insumo.precioCompra : null)
  const [error, setError] = useState<string | null>(null)

  const cambiar = (c: Partial<EntradaInsumo>) => setDatos((d) => ({ ...d, ...c }))
  const unidad = datos.unidad || 'unidad'

  const guardar = () => {
    if (cantidad === null || precio === null) {
      setError('Escribe la cantidad comprada y el precio que pagaste')
      return
    }
    const entrada = { ...datos, cantidadComprada: cantidad, precioCompra: precio, fechaActualizacion: hoyISO() }
    const r = insumo ? actualizar(insumo.id, entrada) : agregar(entrada)
    if (!r.ok) return setError(r.error)
    notificar(insumo ? 'Insumo actualizado. Tus recetas ya tienen el nuevo costo.' : 'Insumo guardado')
    alCerrar()
  }

  const borrar = () => {
    if (!insumo) return
    const r = eliminar(insumo.id)
    if (!r.ok) return setError(r.error)
    notificar('Insumo eliminado')
    alCerrar()
  }

  return (
    <Dialogo
      abierto={abierto}
      alCerrar={alCerrar}
      titulo={insumo ? 'Editar insumo' : 'Nuevo insumo'}
      descripcion={insumo ? `Código ${insumo.codigo}` : 'Registra la presentación tal como la compras.'}
      pie={
        <PieFormulario
          textoGuardar={insumo ? 'Guardar cambios' : 'Guardar insumo'}
          alGuardar={guardar}
          alCancelar={alCerrar}
          alEliminar={insumo ? borrar : undefined}
          eliminarDeshabilitado={productosQueLoUsan.length > 0}
        />
      }
    >
      <div className="flex flex-col gap-5">
        <CampoTexto
          etiqueta="Nombre del insumo"
          placeholder="Ej: Base de glicerina transparente"
          valor={datos.nombre}
          alCambiar={(nombre) => cambiar({ nombre })}
          ayuda="Usa un nombre claro y siempre igual."
          autoFocus={!insumo}
        />
        <SelectorChips
          etiqueta="¿En qué unidad lo compras?"
          opciones={OPCIONES_UNIDAD}
          valor={opcion}
          alCambiar={(v) => {
            setOpcion(v)
            cambiar({ unidad: v === 'otra' ? '' : v })
          }}
          ayuda="En las recetas escribirás las cantidades en esta misma unidad."
        />
        {opcion === 'otra' && (
          <CampoTexto etiqueta="Escribe la unidad" placeholder="Ej: onza, frasco" valor={datos.unidad} alCambiar={(u) => cambiar({ unidad: u })} />
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoNumero etiqueta="Cantidad que trae" valor={cantidad} alCambiar={setCantidad} sufijo={unidad} placeholder="1.000" />
          <CampoNumero etiqueta="Precio que pagaste" modo="pesos" valor={precio} alCambiar={setPrecio} placeholder="18.000" />
        </div>
        <CostoAutomatico cantidad={cantidad} precio={precio} unidad={unidad} />
        <CampoTexto
          etiqueta="Proveedor o referencia (opcional)"
          placeholder="Ej: Distribuidora La Esencia"
          valor={datos.proveedor}
          alCambiar={(proveedor) => cambiar({ proveedor })}
        />
        {productosQueLoUsan.length > 0 && (
          <Aviso tono="info">
            Se usa en: <strong>{productosQueLoUsan.join(', ')}</strong>. Si cambias el precio, esos productos se recalculan solos.
          </Aviso>
        )}
        {error && <Aviso tono="alerta">{error}</Aviso>}
      </div>
    </Dialogo>
  )
}
