/** SIMULADOR — réplica de la hoja 6 del Excel PRO 1.0 */
import { dividir } from './calc'

export const UNIDADES_SIMULADOR_DEFECTO = 50
export const UNIDADES_MAYORISTA_DEFECTO = 12
export const FACTOR_MAYORISTA = 0.85

export interface BaseSimulador {
  costoUnitario: number
  precioActual: number
  margenDeseado: number
  precioSugerido: number
}

export interface EntradaSimulador {
  precioAProbar: number
  unidades: number
  precioMayorista: number
  unidadesMayoristas: number
}

export interface FilaEscenario {
  escenario: string
  precio: number
  costoUnitario: number
  utilidadPorUnidad: number
  margen: number
  unidades: number
  ingresos: number
  utilidadTotal: number
}

export interface ResultadoSimulador {
  margenActual: number
  ingresos: number
  costoEstimado: number
  utilidadEstimada: number
  utilidadPorUnidad: number
  margenEscenario: number
  diferenciaVsActual: number
  comparador: FilaEscenario[]
  ingresoMayorista: number
  utilidadMayorista: number
}

function fila(escenario: string, precio: number, costoUnitario: number, unidades: number): FilaEscenario {
  const utilidadPorUnidad = precio - costoUnitario
  return {
    escenario,
    precio,
    costoUnitario,
    utilidadPorUnidad,
    margen: dividir(utilidadPorUnidad, precio),
    unidades,
    ingresos: precio * unidades,
    utilidadTotal: utilidadPorUnidad * unidades,
  }
}

export function precioMayoristaPorDefecto(precioSugerido: number): number {
  return precioSugerido * FACTOR_MAYORISTA
}

export function simular(base: BaseSimulador, entrada: EntradaSimulador): ResultadoSimulador {
  const { costoUnitario, precioActual, precioSugerido } = base
  const { precioAProbar, unidades } = entrada
  const ingresos = precioAProbar * unidades
  const costoEstimado = costoUnitario * unidades
  const utilidadPorUnidad = precioAProbar - costoUnitario

  return {
    margenActual: dividir(precioActual - costoUnitario, precioActual),
    ingresos,
    costoEstimado,
    utilidadEstimada: ingresos - costoEstimado,
    utilidadPorUnidad,
    margenEscenario: dividir(utilidadPorUnidad, precioAProbar),
    diferenciaVsActual: precioAProbar - precioActual,
    comparador: [
      fila('Precio actual', precioActual, costoUnitario, unidades),
      fila('−5 % del actual', precioActual * 0.95, costoUnitario, unidades),
      fila('Precio a probar', precioAProbar, costoUnitario, unidades),
      fila('+5 % de la prueba', precioAProbar * 1.05, costoUnitario, unidades),
      fila('Precio sugerido', precioSugerido, costoUnitario, unidades),
    ],
    ingresoMayorista: entrada.precioMayorista * entrada.unidadesMayoristas,
    utilidadMayorista: (entrada.precioMayorista - costoUnitario) * entrada.unidadesMayoristas,
  }
}
