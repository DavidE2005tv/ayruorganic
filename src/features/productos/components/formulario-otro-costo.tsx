'use client'

import { useState } from 'react'
import { costoTotalOtro } from '@/features/calculadora/lib/calc'
import { formatoPesos } from '@/features/calculadora/lib/format'
import type { EntradaOtroCosto } from '@/features/calculadora/lib/schemas'
import { useLibro } from '@/features/calculadora/store/provider'
import { CONCEPTOS_COSTO, type ConceptoCosto, type OtroCosto, type Producto } from '@/features/calculadora/types'
import { Aviso } from '@/shared/components/ui/aviso'
import { PieFormulario } from '@/shared/components/ui/pie-formulario'
import { CampoNumero, CampoSiNo, CampoTexto } from '@/shared/components/ui/campos'
import { Dialogo } from '@/shared/components/ui/dialogo'
import { notificar } from '@/shared/components/ui/notificaciones'
import { SelectorChips } from '@/shared/components/ui/selector-chips'

const AYUDA_CONCEPTO: Record<ConceptoCosto, string> = {
  Empaque: 'Ej: papel film a $12 × 24 unidades.',
  Etiqueta: 'Ej: 2 etiquetas por jabón → $60 × 24.',
  Consumibles: 'Alcohol, guantes, cinta… lo que se gasta en el lote.',
  'Mano de obra': 'Tu tiempo también cuesta: valor por hora × horas utilizadas.',
  Servicios: 'Agua, luz, gas: la parte que le corresponde a este lote.',
  'Transporte / prorrateo': 'Envíos o compras de insumos repartidos en el lote.',
  Comisiones: 'Si la plataforma o vendedor cobra un %, escríbelo abajo y se calcula solo.',
  Otros: 'Cualquier otro gasto asociado al producto.',
}

interface Borrador {
  concepto: ConceptoCosto
  detalle: string
  costoUnidad: number | null
  cantidadFactor: number | null
  sumar: boolean
  porcentajeVentas: number | null
  observaciones: string
}

function borradorDe(c?: OtroCosto): Borrador {
  return {
    concepto: c?.concepto ?? 'Empaque',
    detalle: c?.detalle ?? '',
    costoUnidad: c ? c.costoUnidad : null,
    cantidadFactor: c ? c.cantidadFactor : null,
    sumar: c?.sumar ?? true,
    porcentajeVentas: c && c.porcentajeVentas > 0 ? c.porcentajeVentas : null,
    observaciones: c?.observaciones ?? '',
  }
}

function aEntrada(b: Borrador): EntradaOtroCosto {
  return {
    concepto: b.concepto,
    detalle: b.detalle,
    costoUnidad: b.costoUnidad ?? 0,
    cantidadFactor: b.cantidadFactor ?? 0,
    sumar: b.sumar,
    porcentajeVentas: b.concepto === 'Comisiones' ? (b.porcentajeVentas ?? 0) : 0,
    observaciones: b.observaciones,
  }
}

export function FormularioOtroCosto({ producto, costo, alCerrar }: { producto: Producto; costo?: OtroCosto; alCerrar: () => void }) {
  const agregar = useLibro((s) => s.agregarOtroCosto)
  const actualizar = useLibro((s) => s.actualizarOtroCosto)
  const eliminar = useLibro((s) => s.eliminarOtroCosto)
  const [b, setB] = useState<Borrador>(() => borradorDe(costo))
  const [error, setError] = useState<string | null>(null)
  const cambiar = (c: Partial<Borrador>) => setB((x) => ({ ...x, ...c }))

  const entrada = aEntrada(b)
  const total = costoTotalOtro(entrada, producto)
  const esComisionPorcentual = b.concepto === 'Comisiones' && entrada.porcentajeVentas > 0

  const guardar = () => {
    const r = costo ? actualizar(costo.id, entrada) : agregar(producto.id, entrada)
    if (!r.ok) return setError(r.error)
    notificar(costo ? 'Costo actualizado' : 'Costo agregado')
    alCerrar()
  }

  const borrar = () => {
    if (!costo) return
    eliminar(costo.id)
    notificar('Costo eliminado')
    alCerrar()
  }

  return (
    <Dialogo
      abierto
      alCerrar={alCerrar}
      ancho="lg"
      titulo={costo ? 'Editar otro costo' : 'Agregar otro costo'}
      descripcion={`${producto.nombre} · costos para todo el lote`}
      pie={
        <PieFormulario
          textoGuardar={costo ? 'Guardar' : 'Agregar'}
          alGuardar={guardar}
          alCancelar={alCerrar}
          alEliminar={costo ? borrar : undefined}
        />
      }
    >
      <div className="flex flex-col gap-5">
        <SelectorChips
          etiqueta="¿Qué tipo de costo es?"
          opciones={CONCEPTOS_COSTO.map((c) => ({ valor: c, texto: c }))}
          valor={b.concepto}
          alCambiar={(concepto) => cambiar({ concepto })}
          ayuda={AYUDA_CONCEPTO[b.concepto]}
        />
        <CampoTexto etiqueta="Detalle" placeholder="Ej: Papel film" valor={b.detalle} alCambiar={(detalle) => cambiar({ detalle })} />
        {b.concepto === 'Comisiones' && (
          <CampoNumero
            etiqueta="% que cobran sobre la venta"
            modo="porcentaje"
            valor={b.porcentajeVentas}
            alCambiar={(porcentajeVentas) => cambiar({ porcentajeVentas })}
            placeholder="10"
            ayuda="Se calcula: % × precio actual × unidades del lote. Déjalo en blanco para usar costo × cantidad."
          />
        )}
        {!esComisionPorcentual && (
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero etiqueta="Costo por unidad o base" modo="pesos" valor={b.costoUnidad} alCambiar={(costoUnidad) => cambiar({ costoUnidad })} placeholder="12" />
            <CampoNumero
              etiqueta={b.concepto === 'Mano de obra' ? 'Horas utilizadas' : 'Cantidad o factor'}
              valor={b.cantidadFactor}
              alCambiar={(cantidadFactor) => cambiar({ cantidadFactor })}
              placeholder="24"
            />
          </div>
        )}
        <CampoSiNo
          etiqueta="¿Sumar al costo del producto?"
          valor={b.sumar}
          alCambiar={(sumar) => cambiar({ sumar })}
          ayuda="Elige “No” si solo quieres guardarlo como referencia."
        />
        <div className="flex items-center justify-between rounded-xl bg-salvia/80 px-4 py-3">
          <span className="text-sm font-semibold text-oliva">Costo total para el lote</span>
          <span className="cifra font-display text-2xl font-semibold text-bosque">{formatoPesos(total)}</span>
        </div>
        <CampoTexto
          etiqueta="Observaciones (opcional)"
          valor={b.observaciones}
          alCambiar={(observaciones) => cambiar({ observaciones })}
        />
        {error && <Aviso tono="alerta">{error}</Aviso>}
      </div>
    </Dialogo>
  )
}
