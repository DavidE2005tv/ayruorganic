export const CANALES_VENTA = ['Venta directa', 'Feria', 'Mayorista', 'Taller / experiencia', 'Otro'] as const
export type CanalVenta = (typeof CANALES_VENTA)[number]

export const CONCEPTOS_COSTO = [
  'Empaque',
  'Etiqueta',
  'Consumibles',
  'Mano de obra',
  'Servicios',
  'Transporte / prorrateo',
  'Comisiones',
  'Otros',
] as const
export type ConceptoCosto = (typeof CONCEPTOS_COSTO)[number]

export const UNIDADES_SUGERIDAS = ['gr', 'ml', 'unidad', 'sachet'] as const

export const LIMITES = {
  productos: 30,
  insumos: 100,
  ingredientesPorProducto: 20,
  otrosCostos: 240,
} as const

export const MARGEN_MAXIMO = 0.95
export const MARGEN_POR_DEFECTO = 0.4

export interface Insumo {
  id: string
  codigo: string
  nombre: string
  unidad: string
  cantidadComprada: number
  precioCompra: number
  proveedor: string
  fechaActualizacion: string
  ejemplo?: boolean
}

export interface Producto {
  id: string
  codigo: string
  nombre: string
  unidadesLote: number
  pesoLote: number
  /** null = usar el sugerido (peso lote ÷ unidades) */
  pesoUnidad: number | null
  canal: CanalVenta
  precioActual: number
  /** Fracción: 0.6 = 60 % */
  margenDeseado: number
  ejemplo?: boolean
}

export interface LineaReceta {
  id: string
  productoId: string
  insumoId: string
  cantidad: number
  observacion: string
}

export interface OtroCosto {
  id: string
  productoId: string
  concepto: ConceptoCosto
  detalle: string
  costoUnidad: number
  cantidadFactor: number
  sumar: boolean
  /** Fracción: 0.1 = 10 % sobre ventas (solo aplica a Comisiones) */
  porcentajeVentas: number
  observaciones: string
}

export interface ParametrosSimulador {
  productoId: string | null
  /** null = usar el precio sugerido */
  precioAProbar: number | null
  unidades: number
  /** null = precio sugerido × 0,85 */
  precioMayorista: number | null
  unidadesMayoristas: number
}

export interface ParametrosConversiones {
  gramos: number
  gramosPorCucharada: number
  gotas: number
  gotasPorMl: number
  ml: number
  pesoFormula: number
  porcentaje: number
}

export interface ReferenciaCucharada {
  id: string
  ingrediente: string
  gramosPorCucharada: number
  fecha: string
  observacion: string
}

export interface MetaLibro {
  onboarded: boolean
  ultimoCambio: string | null
  ultimoRespaldo: string | null
}

export interface Libro {
  insumos: Insumo[]
  productos: Producto[]
  recetas: LineaReceta[]
  otrosCostos: OtroCosto[]
  simulador: ParametrosSimulador
  conversiones: ParametrosConversiones
  tablaCucharadas: ReferenciaCucharada[]
  meta: MetaLibro
}

export type EstadoProducto = 'Sin precio' | 'Revisar: bajo costo' | 'Por debajo del sugerido' | 'OK'

export interface ResultadoProducto {
  productoId: string
  costoMateriasPrimas: number
  otrosCostos: number
  costoTotalLote: number
  costoUnitario: number
  precioSugerido: number
  precioComercial: number
  utilidadSobreCosto: number
  utilidadPorUnidad: number
  margenActual: number
  diferenciaPrecio: number
  estado: EstadoProducto
}
