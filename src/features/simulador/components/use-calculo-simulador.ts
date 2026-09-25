'use client'

import { useMemo } from 'react'
import {
  precioMayoristaPorDefecto,
  simular,
  type BaseSimulador,
  type EntradaSimulador,
  type ResultadoSimulador,
} from '@/features/calculadora/lib/simulador'
import { useLibro } from '@/features/calculadora/store/provider'
import { useResumen } from '@/features/calculadora/store/selectores'

export interface CalculoSimulador {
  base: BaseSimulador
  entrada: EntradaSimulador
  r: ResultadoSimulador
}

/** Une el producto elegido con los parámetros del simulador (valores por defecto como en el Excel) */
export function useCalculoSimulador(): CalculoSimulador | null {
  const resumen = useResumen()
  const sim = useLibro((s) => s.simulador)

  return useMemo(() => {
    const item = resumen.find((r) => r.producto.id === sim.productoId)
    if (!item) return null
    const base: BaseSimulador = {
      costoUnitario: item.resultado.costoUnitario,
      precioActual: item.producto.precioActual,
      margenDeseado: item.producto.margenDeseado,
      precioSugerido: item.resultado.precioSugerido,
    }
    const entrada: EntradaSimulador = {
      precioAProbar: sim.precioAProbar ?? base.precioSugerido,
      unidades: sim.unidades,
      precioMayorista: sim.precioMayorista ?? precioMayoristaPorDefecto(base.precioSugerido),
      unidadesMayoristas: sim.unidadesMayoristas,
    }
    return { base, entrada, r: simular(base, entrada) }
  }, [resumen, sim])
}
