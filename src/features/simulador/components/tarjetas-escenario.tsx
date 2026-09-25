'use client'

import { RotateCcw, SlidersHorizontal, Store } from 'lucide-react'
import { formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import { Boton } from '@/shared/components/ui/boton'
import { CampoNumero } from '@/shared/components/ui/campos'
import { Cifra } from '@/shared/components/ui/cifra'
import { EncabezadoTarjeta, Tarjeta } from '@/shared/components/ui/tarjeta'
import type { CalculoSimulador } from './use-calculo-simulador'

export function TarjetaEscenario({ calculo }: { calculo: CalculoSimulador }) {
  const sim = useLibro((s) => s.simulador)
  const actualizar = useLibro((s) => s.actualizarSimulador)
  const { r } = calculo
  return (
    <Tarjeta className="h-fit">
      <EncabezadoTarjeta icono={<SlidersHorizontal className="size-5" />} titulo="Tu escenario" />
      <div className="flex flex-col gap-4 p-5">
        <CampoNumero
          etiqueta="Precio a probar"
          modo="pesos"
          valor={calculo.entrada.precioAProbar}
          alCambiar={(v) => actualizar({ precioAProbar: v ?? 0 })}
          ayuda="Empieza en el precio sugerido."
        />
        {sim.precioAProbar !== null && (
          <Boton variante="fantasma" tamano="sm" className="-mt-2 w-fit" onClick={() => actualizar({ precioAProbar: null })}>
            <RotateCcw aria-hidden /> Volver al sugerido
          </Boton>
        )}
        <CampoNumero etiqueta="Unidades que esperas vender" valor={sim.unidades} alCambiar={(v) => actualizar({ unidades: v ?? 0 })} />
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Cifra etiqueta="Ingresos" valor={formatoPesos(r.ingresos)} />
          <Cifra etiqueta="Costo estimado" valor={formatoPesos(r.costoEstimado)} />
          <Cifra etiqueta="Utilidad estimada" valor={formatoPesos(r.utilidadEstimada)} destacado className="col-span-2" />
          <Cifra etiqueta="Por unidad" valor={formatoPesos(r.utilidadPorUnidad)} tono={r.utilidadPorUnidad < 0 ? 'alerta' : 'normal'} />
          <Cifra etiqueta="Margen" valor={formatoPorcentaje(r.margenEscenario)} tono={r.margenEscenario < 0 ? 'alerta' : 'normal'} />
          <Cifra etiqueta="Diferencia vs. precio actual" valor={formatoPesos(r.diferenciaVsActual)} className="col-span-2" />
        </div>
      </div>
    </Tarjeta>
  )
}

export function TarjetaMayorista({ calculo }: { calculo: CalculoSimulador }) {
  const unidades = useLibro((s) => s.simulador.unidadesMayoristas)
  const actualizar = useLibro((s) => s.actualizarSimulador)
  const { r } = calculo
  return (
    <Tarjeta>
      <EncabezadoTarjeta
        icono={<Store className="size-5" />}
        titulo="Escenario mayorista"
        descripcion="Prueba ventas por cantidad sin modificar tu precio actual. Empieza en el sugerido −15 %."
      />
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <CampoNumero etiqueta="Precio mayorista" modo="pesos" valor={calculo.entrada.precioMayorista} alCambiar={(v) => actualizar({ precioMayorista: v ?? 0 })} />
        <CampoNumero etiqueta="Unidades mayoristas" valor={unidades} alCambiar={(v) => actualizar({ unidadesMayoristas: v ?? 0 })} />
        <Cifra etiqueta="Ingreso mayorista" valor={formatoPesos(r.ingresoMayorista)} />
        <Cifra
          etiqueta="Utilidad mayorista"
          valor={formatoPesos(r.utilidadMayorista)}
          destacado={r.utilidadMayorista >= 0}
          tono={r.utilidadMayorista < 0 ? 'alerta' : 'normal'}
        />
      </div>
    </Tarjeta>
  )
}
