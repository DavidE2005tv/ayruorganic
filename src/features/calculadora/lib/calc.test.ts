/**
 * Paridad con el Excel PRO 1.0: valores tomados de las celdas calculadas del archivo
 * docs/referencia/CALCULADORA_COSTOS_AYRU_ORGANIC_PRO_1_0_COMERCIAL.xlsx
 */
import { describe, expect, it } from 'vitest'
import {
  INSUMOS_EJEMPLO,
  OTROS_COSTOS_EJEMPLO,
  PRODUCTOS_EJEMPLO,
  RECETAS_EJEMPLO,
} from '../data/ejemplo-ayru'
import type { OtroCosto, Producto } from '../types'
import {
  calcularConversiones,
  calcularPanel,
  calcularProducto,
  costoTotalOtro,
  costoUnitarioInsumo,
  precioComercial,
  precioSugerido,
} from './calc'
import { precioMayoristaPorDefecto, simular } from './simulador'

const datos = { insumos: INSUMOS_EJEMPLO, recetas: RECETAS_EJEMPLO, otrosCostos: OTROS_COSTOS_EJEMPLO }
const resultados = PRODUCTOS_EJEMPLO.map((p) => calcularProducto(p, datos))
const cerca = (real: number, esperado: number) => expect(real).toBeCloseTo(esperado, 2)

describe('MATERIAS PRIMAS', () => {
  it('1.000 g a $18.000 → $18 por gramo (ejemplo del manual)', () => {
    expect(costoUnitarioInsumo({ precioCompra: 18000, cantidadComprada: 1000 })).toBe(18)
  })
  it('cantidad 0 → 0 (IFERROR)', () => {
    expect(costoUnitarioInsumo({ precioCompra: 5000, cantidadComprada: 0 })).toBe(0)
  })
  it('Aceite de coco: 32.900 / 450', () => {
    cerca(costoUnitarioInsumo(INSUMOS_EJEMPLO[2]), 73.11111111)
  })
})

describe('PRODUCTOS y RESUMEN — paridad Excel', () => {
  const esperado = [
    // costoMP, otros, lote, unitario, sugerido, utilSobreCosto, comercial, utilUnidad, margen, diferencia, estado
    [34301.4771239, 21368, 55669.4771239, 4639.123093658333, 11597.807734145832, 1.8022537314801925, 12000, 8360.876906341666, 0.6431443774108974, 1402.192265854168, 'OK'],
    [29184.6666663, 21368, 50552.66667, 4212.722222, 10531.80556, 2.085890622, 11000, 8787.277778, 0.6759444444, 2468.194444, 'OK'],
    [47625.3333334, 19784, 67409.33333, 5617.444444, 14043.61111, 1.670253377, 14500, 9382.555556, 0.6255037037, 956.3888889, 'OK'],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Sin precio'],
  ] as const

  esperado.forEach((fila, i) => {
    it(`${PRODUCTOS_EJEMPLO[i].codigo} ${PRODUCTOS_EJEMPLO[i].nombre}`, () => {
      const r = resultados[i]
      cerca(r.costoMateriasPrimas, fila[0])
      cerca(r.otrosCostos, fila[1])
      cerca(r.costoTotalLote, fila[2])
      cerca(r.costoUnitario, fila[3])
      cerca(r.precioSugerido, fila[4])
      cerca(r.utilidadSobreCosto, fila[5])
      expect(r.precioComercial).toBe(fila[6])
      cerca(r.utilidadPorUnidad, fila[7])
      cerca(r.margenActual, fila[8])
      cerca(r.diferenciaPrecio, fila[9])
      expect(r.estado).toBe(fila[10])
    })
  })
})

describe('Estados del resumen', () => {
  const base: Producto = { ...PRODUCTOS_EJEMPLO[1] }
  it('precio bajo costo', () => {
    expect(calcularProducto({ ...base, precioActual: 4000 }, datos).estado).toBe('Revisar: bajo costo')
  })
  it('precio entre costo y sugerido', () => {
    expect(calcularProducto({ ...base, precioActual: 9000 }, datos).estado).toBe('Por debajo del sugerido')
  })
})

describe('PANEL GENERAL', () => {
  it('4 registrados · 3 con precio · 0 bajo costo · 0 bajo sugerido', () => {
    expect(calcularPanel(PRODUCTOS_EJEMPLO, resultados)).toEqual({
      registrados: 4,
      conPrecio: 3,
      bajoCosto: 0,
      bajoSugerido: 0,
    })
  })
})

describe('OTROS COSTOS — comisiones', () => {
  const producto = { precioActual: 13000, unidadesLote: 12 }
  const comision: OtroCosto = {
    id: 'c',
    productoId: 'p',
    concepto: 'Comisiones',
    detalle: '',
    costoUnidad: 999,
    cantidadFactor: 2,
    sumar: true,
    porcentajeVentas: 0.1,
    observaciones: '',
  }
  it('usa % × precio actual × unidades del lote', () => {
    cerca(costoTotalOtro(comision, producto), 15600)
  })
  it('sin % usa costo × cantidad', () => {
    expect(costoTotalOtro({ ...comision, porcentajeVentas: 0 }, producto)).toBe(1998)
  })
  it('¿Sumar al costo? = No → 0', () => {
    expect(costoTotalOtro({ ...comision, sumar: false }, producto)).toBe(0)
  })
  it('otro concepto ignora el %', () => {
    expect(costoTotalOtro({ ...comision, concepto: 'Empaque' }, producto)).toBe(1998)
  })
})

describe('Precio sugerido y comercial', () => {
  it('margen 100 % → 0 (IFERROR)', () => {
    expect(precioSugerido(5000, 1)).toBe(0)
  })
  it('múltiplo exacto de 500 no sube', () => {
    expect(precioComercial(11000)).toBe(11000)
  })
  it('sube al siguiente múltiplo de 500', () => {
    expect(precioComercial(11000.01)).toBe(11500)
  })
})

describe('SIMULADOR — Jabón de Miel y Avena', () => {
  const r = resultados[1]
  const base = {
    costoUnitario: r.costoUnitario,
    precioActual: 13000,
    margenDeseado: 0.6,
    precioSugerido: r.precioSugerido,
  }
  const sim = simular(base, {
    precioAProbar: r.precioSugerido,
    unidades: 50,
    precioMayorista: precioMayoristaPorDefecto(r.precioSugerido),
    unidadesMayoristas: 12,
  })

  it('resultados del escenario', () => {
    cerca(sim.margenActual, 0.6759444444615385)
    cerca(sim.ingresos, 526590.278)
    cerca(sim.costoEstimado, 210636.1111)
    cerca(sim.utilidadEstimada, 315954.1669)
    cerca(sim.utilidadPorUnidad, 6319.083338)
    cerca(sim.margenEscenario, 0.6)
    cerca(sim.diferenciaVsActual, -2468.19444)
  })

  it('comparador de 5 escenarios', () => {
    const [actual, menos5, prueba, mas5, sugerido] = sim.comparador
    cerca(actual.utilidadTotal, 439363.8889)
    cerca(menos5.precio, 12350)
    cerca(menos5.margen, 0.6588888889)
    cerca(menos5.ingresos, 617500)
    cerca(prueba.utilidadTotal, 315954.1667)
    cerca(mas5.precio, 11058.395838)
    cerca(mas5.margen, 0.619047619)
    cerca(mas5.utilidadTotal, 342283.6806)
    cerca(sugerido.ingresos, 526590.2778)
  })

  it('escenario mayorista', () => {
    cerca(precioMayoristaPorDefecto(r.precioSugerido), 8952.034726)
    cerca(sim.ingresoMayorista, 107424.416712)
    cerca(sim.utilidadMayorista, 56871.750048)
  })
})

describe('CONVERSIONES', () => {
  it('valores por defecto del Excel', () => {
    const c = calcularConversiones({
      gramos: 10,
      gramosPorCucharada: 15,
      gotas: 20,
      gotasPorMl: 20,
      ml: 1,
      pesoFormula: 500,
      porcentaje: 0.015,
    })
    cerca(c.cucharadas, 0.6667)
    cerca(c.cucharaditas, 2)
    expect(c.mlDesdeGotas).toBe(1)
    expect(c.gotasDesdeMl).toBe(20)
    cerca(c.cantidadPorcentaje, 7.5)
  })
})
