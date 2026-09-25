'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import { useResumen } from '@/features/calculadora/store/selectores'
import { EncabezadoPagina } from '@/shared/components/layout/encabezado-pagina'
import { Aviso } from '@/shared/components/ui/aviso'
import { claseBoton } from '@/shared/components/ui/boton'
import { CampoSelect } from '@/shared/components/ui/campos'
import { Cifra } from '@/shared/components/ui/cifra'
import { Vacio } from '@/shared/components/ui/vacio'
import { Comparador } from './comparador'
import { TarjetaEscenario, TarjetaMayorista } from './tarjetas-escenario'
import { useCalculoSimulador } from './use-calculo-simulador'

const ENCABEZADO = { paso: 'Paso 3 de 3', titulo: 'Simulador de precios' }

function SelectorProducto() {
  const resumen = useResumen()
  const productoId = useLibro((s) => s.simulador.productoId)
  const actualizar = useLibro((s) => s.actualizarSimulador)
  return (
    <div className="mb-6 rounded-2xl border-2 border-canela/40 bg-kraft/30 p-4 sm:p-5">
      <CampoSelect
        etiqueta="¿Qué producto quieres simular?"
        valor={productoId ?? ''}
        alCambiar={(id) => actualizar({ productoId: id || null, precioAProbar: null, precioMayorista: null })}
        opciones={resumen.map((r) => ({ valor: r.producto.id, texto: r.producto.nombre }))}
        vacio="Elige un producto…"
      />
    </div>
  )
}

export function PaginaSimulador({ productoInicial }: { productoInicial?: string }) {
  const resumen = useResumen()
  const actualizar = useLibro((s) => s.actualizarSimulador)
  const calculo = useCalculoSimulador()

  useEffect(() => {
    if (productoInicial && resumen.some((r) => r.producto.id === productoInicial)) {
      actualizar({ productoId: productoInicial, precioAProbar: null, precioMayorista: null })
    }
    // Solo al llegar desde la ficha de un producto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoInicial])

  if (resumen.length === 0) {
    return (
      <>
        <EncabezadoPagina {...ENCABEZADO} />
        <Vacio icono={<SlidersHorizontal />} titulo="Primero crea un producto" accion={<Link href="/productos" className={claseBoton('primario')}>Ir a productos</Link>}>
          El simulador usa el costo de tus productos para probar precios y cantidades.
        </Vacio>
      </>
    )
  }

  return (
    <>
      <EncabezadoPagina {...ENCABEZADO} descripcion="Prueba precios y cantidades sin cambiar el precio registrado de tu producto." />
      <SelectorProducto />
      {!calculo ? (
        <p className="text-tinta-suave">Elige un producto para ver sus números.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <section aria-label="Datos del producto" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <Cifra etiqueta="Costo unitario" valor={formatoPesos(calculo.base.costoUnitario)} />
            <Cifra etiqueta="Precio actual" valor={formatoPesos(calculo.base.precioActual)} />
            <Cifra etiqueta="Margen actual" valor={formatoPorcentaje(calculo.r.margenActual)} />
            <Cifra etiqueta="Margen deseado" valor={formatoPorcentaje(calculo.base.margenDeseado)} />
            <Cifra etiqueta="Precio sugerido" valor={formatoPesos(calculo.base.precioSugerido)} destacado className="col-span-2 lg:col-span-1" />
          </section>
          <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
            <TarjetaEscenario calculo={calculo} />
            <Comparador filas={calculo.r.comparador} />
          </div>
          <TarjetaMayorista calculo={calculo} />
          <Aviso tono="consejo">
            El simulador sirve para comparar escenarios. La decisión final de precio depende de tus costos, tu mercado, el canal de
            venta y tu estrategia comercial.
          </Aviso>
        </div>
      )}
    </>
  )
}
