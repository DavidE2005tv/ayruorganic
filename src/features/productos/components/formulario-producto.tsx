'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatoNumero } from '@/features/calculadora/lib/format'
import { pesoUnidadSugerido } from '@/features/calculadora/lib/calc'
import { useLibro } from '@/features/calculadora/store/provider'
import { CANALES_VENTA, MARGEN_POR_DEFECTO, type CanalVenta, type Producto } from '@/features/calculadora/types'
import { Aviso } from '@/shared/components/ui/aviso'
import { Boton } from '@/shared/components/ui/boton'
import { CampoNumero, CampoTexto } from '@/shared/components/ui/campos'
import { Dialogo } from '@/shared/components/ui/dialogo'
import { notificar } from '@/shared/components/ui/notificaciones'
import { SelectorChips } from '@/shared/components/ui/selector-chips'

interface Borrador {
  nombre: string
  unidadesLote: number | null
  pesoLote: number | null
  pesoUnidad: number | null
  canal: CanalVenta
  precioActual: number | null
  margenDeseado: number | null
}

function borradorDe(p?: Producto): Borrador {
  return {
    nombre: p?.nombre ?? '',
    unidadesLote: p ? p.unidadesLote : null,
    pesoLote: p ? p.pesoLote : null,
    pesoUnidad: p?.pesoUnidad ?? null,
    canal: p?.canal ?? 'Venta directa',
    precioActual: p ? p.precioActual : null,
    margenDeseado: p ? p.margenDeseado : MARGEN_POR_DEFECTO,
  }
}

const OPCIONES_CANAL = CANALES_VENTA.map((c) => ({ valor: c, texto: c }))

export function FormularioProducto({ alCerrar, producto }: { alCerrar: () => void; producto?: Producto }) {
  const router = useRouter()
  const agregar = useLibro((s) => s.agregarProducto)
  const actualizar = useLibro((s) => s.actualizarProducto)
  const [b, setB] = useState<Borrador>(() => borradorDe(producto))
  const [error, setError] = useState<string | null>(null)
  const cambiar = (c: Partial<Borrador>) => setB((x) => ({ ...x, ...c }))
  const sugerido = pesoUnidadSugerido({ pesoLote: b.pesoLote ?? 0, unidadesLote: b.unidadesLote ?? 0 })

  const guardar = () => {
    if (b.margenDeseado === null) return setError('Escribe el margen que deseas, por ejemplo 60 %')
    const entrada = {
      nombre: b.nombre,
      unidadesLote: b.unidadesLote ?? 0,
      pesoLote: b.pesoLote ?? 0,
      pesoUnidad: b.pesoUnidad,
      canal: b.canal,
      precioActual: b.precioActual ?? 0,
      margenDeseado: b.margenDeseado,
    }
    if (entrada.unidadesLote <= 0) return setError('Indica cuántas unidades salen de un lote')
    const r = producto ? actualizar(producto.id, entrada) : agregar(entrada)
    if (!r.ok) return setError(r.error)
    notificar(producto ? 'Producto actualizado' : 'Producto creado. Ahora arma su receta.')
    alCerrar()
    if (!producto) router.push(`/productos/${r.id}`)
  }

  return (
    <Dialogo
      abierto
      alCerrar={alCerrar}
      ancho="lg"
      titulo={producto ? 'Datos del producto' : 'Nuevo producto'}
      descripcion={producto ? `Código ${producto.codigo}` : 'Después agregarás su receta y otros costos.'}
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton onClick={guardar}>{producto ? 'Guardar cambios' : 'Crear producto'}</Boton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <CampoTexto
          etiqueta="Nombre del producto"
          placeholder="Ej: Jabón de Café"
          valor={b.nombre}
          alCambiar={(nombre) => cambiar({ nombre })}
          autoFocus={!producto}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <CampoNumero etiqueta="Unidades por lote" valor={b.unidadesLote} alCambiar={(unidadesLote) => cambiar({ unidadesLote })} placeholder="12" ayuda="Cuántos jabones salen de una producción." />
          <CampoNumero etiqueta="Peso del lote" sufijo="g" valor={b.pesoLote} alCambiar={(pesoLote) => cambiar({ pesoLote })} placeholder="1.380" ayuda="Se usa para el % de cada ingrediente." />
          <CampoNumero
            etiqueta="Peso por unidad"
            sufijo="g"
            valor={b.pesoUnidad}
            alCambiar={(pesoUnidad) => cambiar({ pesoUnidad })}
            placeholder={sugerido > 0 ? formatoNumero(sugerido) : '115'}
            ayuda={sugerido > 0 && b.pesoUnidad === null ? `Sugerido: ${formatoNumero(sugerido)} g` : 'Peso real de cada unidad.'}
          />
        </div>
        <SelectorChips etiqueta="Canal de venta" opciones={OPCIONES_CANAL} valor={b.canal} alCambiar={(canal) => cambiar({ canal })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoNumero
            etiqueta="Precio al que vendes hoy"
            modo="pesos"
            valor={b.precioActual}
            alCambiar={(precioActual) => cambiar({ precioActual })}
            placeholder="13.000"
            ayuda="Si aún no lo vendes, déjalo en blanco."
          />
          <CampoNumero
            etiqueta="Margen que deseas"
            modo="porcentaje"
            valor={b.margenDeseado}
            alCambiar={(margenDeseado) => cambiar({ margenDeseado })}
            placeholder="60"
            ayuda="Parte del precio de venta que quieres que te quede después de cubrir el costo."
          />
        </div>
        {error && <Aviso tono="alerta">{error}</Aviso>}
      </div>
    </Dialogo>
  )
}
