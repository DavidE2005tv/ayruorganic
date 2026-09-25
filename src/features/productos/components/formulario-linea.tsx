'use client'

import { useMemo, useState } from 'react'
import { costoUnitarioInsumo, porcentajeDelLote } from '@/features/calculadora/lib/calc'
import { formatoPesos, formatoPesosDetalle, formatoPorcentaje } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import type { LineaReceta, Producto } from '@/features/calculadora/types'
import { Aviso } from '@/shared/components/ui/aviso'
import { PieFormulario } from '@/shared/components/ui/pie-formulario'
import { CampoNumero, CampoSelect, CampoTexto } from '@/shared/components/ui/campos'
import { Dialogo } from '@/shared/components/ui/dialogo'
import { notificar } from '@/shared/components/ui/notificaciones'

interface VistaPrevia {
  unidad: string
  costoUnitario: number
  costoLinea: number
  porcentaje: number
}

function VistaPreviaLinea({ unidad, costoUnitario, costoLinea, porcentaje }: VistaPrevia) {
  const datos = [
    { t: `Costo por ${unidad}`, v: formatoPesosDetalle(costoUnitario) },
    { t: 'Costo usado', v: formatoPesos(costoLinea) },
    { t: '% del lote', v: formatoPorcentaje(porcentaje) },
  ]
  return (
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-salvia/80 p-3 text-center">
      {datos.map((d) => (
        <div key={d.t}>
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-oliva">{d.t}</p>
          <p className="cifra mt-1 whitespace-nowrap font-bold text-bosque">{d.v}</p>
        </div>
      ))}
    </div>
  )
}

interface Props {
  producto: Producto
  linea?: LineaReceta
  alCerrar: () => void
}

export function FormularioLinea({ producto, linea, alCerrar }: Props) {
  const insumos = useLibro((s) => s.insumos)
  const agregar = useLibro((s) => s.agregarLinea)
  const actualizar = useLibro((s) => s.actualizarLinea)
  const eliminar = useLibro((s) => s.eliminarLinea)
  const [insumoId, setInsumoId] = useState(linea?.insumoId ?? '')
  const [cantidad, setCantidad] = useState<number | null>(linea ? linea.cantidad : null)
  const [observacion, setObservacion] = useState(linea?.observacion ?? '')
  const [error, setError] = useState<string | null>(null)

  const opciones = useMemo(
    () =>
      [...insumos]
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
        .map((i) => ({ valor: i.id, texto: `${i.nombre} (${i.unidad})` })),
    [insumos],
  )
  const insumo = insumos.find((i) => i.id === insumoId)
  const costoUnitario = insumo ? costoUnitarioInsumo(insumo) : 0
  const costoLinea = (cantidad ?? 0) * costoUnitario

  const guardar = () => {
    if (cantidad === null) return setError('Escribe la cantidad que usas en el lote')
    const entrada = { insumoId, cantidad, observacion }
    const r = linea ? actualizar(linea.id, entrada) : agregar(producto.id, entrada)
    if (!r.ok) return setError(r.error)
    notificar(linea ? 'Ingrediente actualizado' : 'Ingrediente agregado a la receta')
    alCerrar()
  }

  const quitar = () => {
    if (!linea) return
    eliminar(linea.id)
    notificar('Ingrediente quitado de la receta')
    alCerrar()
  }

  return (
    <Dialogo
      abierto
      alCerrar={alCerrar}
      titulo={linea ? 'Editar ingrediente' : 'Agregar ingrediente'}
      descripcion={`Receta de ${producto.nombre} · cantidades para todo el lote`}
      pie={
        <PieFormulario
          textoGuardar={linea ? 'Guardar' : 'Agregar'}
          alGuardar={guardar}
          alCancelar={alCerrar}
          textoEliminar="Quitar"
          alEliminar={linea ? quitar : undefined}
        />
      }
    >
      <div className="flex flex-col gap-5">
        <CampoSelect
          etiqueta="Insumo"
          valor={insumoId}
          alCambiar={setInsumoId}
          opciones={opciones}
          vacio="Elige un insumo de tu lista…"
          autoFocus={!linea}
        />
        <CampoNumero
          etiqueta="Cantidad usada en el lote"
          valor={cantidad}
          alCambiar={setCantidad}
          sufijo={insumo?.unidad}
          placeholder="0"
          ayuda={insumo ? `Escríbela en ${insumo.unidad}, la misma unidad en que compras este insumo.` : undefined}
        />
        <VistaPreviaLinea
          unidad={insumo?.unidad ?? 'unidad'}
          costoUnitario={costoUnitario}
          costoLinea={costoLinea}
          porcentaje={porcentajeDelLote({ cantidad: cantidad ?? 0 }, producto)}
        />
        <CampoTexto
          etiqueta="Función u observación (opcional)"
          placeholder="Ej: aroma, exfoliante, color"
          valor={observacion}
          alCambiar={setObservacion}
        />
        {error && <Aviso tono="alerta">{error}</Aviso>}
      </div>
    </Dialogo>
  )
}
