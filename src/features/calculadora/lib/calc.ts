/**
 * Motor de cálculo — réplica exacta de las fórmulas de la
 * Calculadora de Costos AYRU ORGANIC PRO 1.0 (Excel).
 * Toda división sigue la semántica IFERROR(...;0): divisor 0 → resultado 0.
 */
import type {
  EstadoProducto,
  Insumo,
  LineaReceta,
  OtroCosto,
  ParametrosConversiones,
  Producto,
  ResultadoProducto,
} from '../types'

export function dividir(numerador: number, divisor: number): number {
  if (!Number.isFinite(numerador) || !Number.isFinite(divisor) || divisor === 0) return 0
  return numerador / divisor
}

/** MATERIAS PRIMAS!F = IFERROR(E/D;0) */
export function costoUnitarioInsumo(insumo: Pick<Insumo, 'precioCompra' | 'cantidadComprada'>): number {
  return dividir(insumo.precioCompra, insumo.cantidadComprada)
}

/** RECETAS!G = IFERROR(D*F;0) */
export function costoLineaReceta(linea: Pick<LineaReceta, 'cantidad'>, insumo: Insumo | undefined): number {
  if (!insumo) return 0
  return linea.cantidad * costoUnitarioInsumo(insumo)
}

/** RECETAS!H = IFERROR(D / peso lote;0) */
export function porcentajeDelLote(linea: Pick<LineaReceta, 'cantidad'>, producto: Pick<Producto, 'pesoLote'>): number {
  return dividir(linea.cantidad, producto.pesoLote)
}

/** OTROS COSTOS!K — comisión automática sobre las ventas del lote */
export function costoComisionAutomatica(
  costo: Pick<OtroCosto, 'concepto' | 'sumar' | 'porcentajeVentas'>,
  producto: Pick<Producto, 'precioActual' | 'unidadesLote'> | undefined,
): number {
  if (costo.concepto !== 'Comisiones' || !costo.sumar || !producto) return 0
  return costo.porcentajeVentas * producto.precioActual * producto.unidadesLote
}

/** OTROS COSTOS!G */
export function costoTotalOtro(
  costo: Pick<OtroCosto, 'concepto' | 'sumar' | 'porcentajeVentas' | 'costoUnidad' | 'cantidadFactor'>,
  producto: Pick<Producto, 'precioActual' | 'unidadesLote'> | undefined,
): number {
  if (!costo.sumar) return 0
  if (costo.concepto === 'Comisiones' && costo.porcentajeVentas > 0) {
    return costoComisionAutomatica(costo, producto)
  }
  return costo.costoUnidad * costo.cantidadFactor
}

/** PRODUCTOS!M = IFERROR(L/(1-H);0) */
export function precioSugerido(costoUnitario: number, margenDeseado: number): number {
  return dividir(costoUnitario, 1 - margenDeseado)
}

/** PRODUCTOS!O = ROUNDUP(M/500;0)*500 — siguiente múltiplo de $500 */
export function precioComercial(sugerido: number): number {
  if (!Number.isFinite(sugerido) || sugerido === 0) return 0
  const pasos = sugerido / 500
  const redondeado = pasos > 0 ? Math.ceil(pasos - 1e-9) : Math.floor(pasos + 1e-9)
  return redondeado * 500
}

/** RESUMEN PRODUCTOS!K */
export function estadoProducto(precioActual: number, costoUnitario: number, sugerido: number): EstadoProducto {
  if (precioActual === 0) return 'Sin precio'
  if (precioActual < costoUnitario) return 'Revisar: bajo costo'
  if (precioActual < sugerido) return 'Por debajo del sugerido'
  return 'OK'
}

export interface DatosCalculo {
  insumos: Insumo[]
  recetas: LineaReceta[]
  otrosCostos: OtroCosto[]
}

export function calcularProducto(producto: Producto, datos: DatosCalculo): ResultadoProducto {
  const insumosPorId = new Map(datos.insumos.map((i) => [i.id, i]))

  const costoMateriasPrimas = datos.recetas
    .filter((l) => l.productoId === producto.id)
    .reduce((suma, l) => suma + costoLineaReceta(l, insumosPorId.get(l.insumoId)), 0)

  const otrosCostos = datos.otrosCostos
    .filter((c) => c.productoId === producto.id)
    .reduce((suma, c) => suma + costoTotalOtro(c, producto), 0)

  const costoTotalLote = costoMateriasPrimas + otrosCostos
  const costoUnitario = dividir(costoTotalLote, producto.unidadesLote)
  const sugerido = precioSugerido(costoUnitario, producto.margenDeseado)
  const utilidadPorUnidad = producto.precioActual - costoUnitario

  return {
    productoId: producto.id,
    costoMateriasPrimas,
    otrosCostos,
    costoTotalLote,
    costoUnitario,
    precioSugerido: sugerido,
    precioComercial: precioComercial(sugerido),
    utilidadSobreCosto: dividir(utilidadPorUnidad, costoUnitario),
    utilidadPorUnidad,
    margenActual: dividir(utilidadPorUnidad, producto.precioActual),
    diferenciaPrecio: producto.precioActual - sugerido,
    estado: estadoProducto(producto.precioActual, costoUnitario, sugerido),
  }
}

export interface PanelGeneral {
  registrados: number
  conPrecio: number
  bajoCosto: number
  bajoSugerido: number
}

/** PANEL GENERAL */
export function calcularPanel(productos: Producto[], resultados: ResultadoProducto[]): PanelGeneral {
  return {
    registrados: productos.filter((p) => p.nombre.trim() !== '').length,
    conPrecio: productos.filter((p) => p.precioActual > 0).length,
    bajoCosto: resultados.filter((r) => r.estado === 'Revisar: bajo costo').length,
    bajoSugerido: resultados.filter((r) => r.estado === 'Por debajo del sugerido').length,
  }
}

/** Peso por unidad sugerido (mejora web; no afecta cálculos) */
export function pesoUnidadSugerido(producto: Pick<Producto, 'pesoLote' | 'unidadesLote'>): number {
  return dividir(producto.pesoLote, producto.unidadesLote)
}

export interface ResultadoConversiones {
  cucharadas: number
  cucharaditas: number
  mlDesdeGotas: number
  gotasDesdeMl: number
  cantidadPorcentaje: number
}

/** CONVERSIONES */
export function calcularConversiones(p: ParametrosConversiones): ResultadoConversiones {
  const cucharadas = dividir(p.gramos, p.gramosPorCucharada)
  return {
    cucharadas,
    cucharaditas: cucharadas * 3,
    mlDesdeGotas: dividir(p.gotas, p.gotasPorMl),
    gotasDesdeMl: p.ml * p.gotasPorMl,
    cantidadPorcentaje: p.pesoFormula * p.porcentaje,
  }
}
