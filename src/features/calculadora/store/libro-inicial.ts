import type { Libro, ParametrosConversiones, ParametrosSimulador } from '../types'
import { UNIDADES_MAYORISTA_DEFECTO, UNIDADES_SIMULADOR_DEFECTO } from '../lib/simulador'

export const SIMULADOR_INICIAL: ParametrosSimulador = {
  productoId: null,
  precioAProbar: null,
  unidades: UNIDADES_SIMULADOR_DEFECTO,
  precioMayorista: null,
  unidadesMayoristas: UNIDADES_MAYORISTA_DEFECTO,
}

/** Valores iniciales de la hoja CONVERSIONES del Excel */
export const CONVERSIONES_INICIALES: ParametrosConversiones = {
  gramos: 10,
  gramosPorCucharada: 15,
  gotas: 20,
  gotasPorMl: 20,
  ml: 1,
  pesoFormula: 500,
  porcentaje: 0.015,
}

export function libroVacio(): Libro {
  return {
    insumos: [],
    productos: [],
    recetas: [],
    otrosCostos: [],
    simulador: { ...SIMULADOR_INICIAL },
    conversiones: { ...CONVERSIONES_INICIALES },
    tablaCucharadas: [],
    meta: { onboarded: false, ultimoCambio: null, ultimoRespaldo: null },
  }
}
