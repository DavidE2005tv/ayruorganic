import { z } from 'zod'
import { CANALES_VENTA, CONCEPTOS_COSTO, LIMITES, MARGEN_MAXIMO } from '../types'

const numero = (mensaje: string) => z.number({ error: mensaje }).finite(mensaje)
const noNegativo = (campo: string) => numero(`${campo}: escribe un número`).min(0, `${campo} no puede ser negativo`)
const texto = (max: number) => z.string().trim().max(max)

export const esquemaInsumo = z.object({
  nombre: texto(80).min(1, 'Escribe el nombre del insumo'),
  unidad: texto(20).min(1, 'Indica la unidad de compra (gr, ml, unidad…)'),
  cantidadComprada: noNegativo('Cantidad comprada'),
  precioCompra: noNegativo('Precio de compra'),
  proveedor: texto(80),
  fechaActualizacion: texto(10),
})
export type EntradaInsumo = z.infer<typeof esquemaInsumo>

export const esquemaProducto = z.object({
  nombre: texto(80).min(1, 'Escribe el nombre del producto'),
  unidadesLote: noNegativo('Unidades por lote'),
  pesoLote: noNegativo('Peso del lote'),
  pesoUnidad: noNegativo('Peso por unidad').nullable(),
  canal: z.enum(CANALES_VENTA),
  precioActual: noNegativo('Precio actual'),
  margenDeseado: numero('Margen deseado: escribe un número')
    .min(0, 'El margen no puede ser negativo')
    .max(MARGEN_MAXIMO, 'El margen debe ser menor o igual a 95 %'),
})
export type EntradaProducto = z.infer<typeof esquemaProducto>

export const esquemaLineaReceta = z.object({
  insumoId: z.string().min(1, 'Elige un insumo'),
  cantidad: noNegativo('Cantidad usada'),
  observacion: texto(120),
})
export type EntradaLineaReceta = z.infer<typeof esquemaLineaReceta>

export const esquemaOtroCosto = z.object({
  concepto: z.enum(CONCEPTOS_COSTO),
  detalle: texto(80),
  costoUnidad: noNegativo('Costo por unidad'),
  cantidadFactor: noNegativo('Cantidad o factor'),
  sumar: z.boolean(),
  porcentajeVentas: numero('Porcentaje: escribe un número').min(0).max(1, 'El porcentaje debe ser máximo 100 %'),
  observaciones: texto(120),
})
export type EntradaOtroCosto = z.infer<typeof esquemaOtroCosto>

/* ---------- Respaldo (.json) ---------- */

const id = z.string().min(1).max(64)
const ejemplo = z.boolean().optional()

const esquemaLibro = z.object({
  insumos: z.array(esquemaInsumo.extend({ id, codigo: z.string().max(10), ejemplo })).max(LIMITES.insumos),
  productos: z.array(esquemaProducto.extend({ id, codigo: z.string().max(10), ejemplo })).max(LIMITES.productos),
  recetas: z
    .array(esquemaLineaReceta.extend({ id, productoId: id }))
    .max(LIMITES.productos * LIMITES.ingredientesPorProducto),
  otrosCostos: z.array(esquemaOtroCosto.extend({ id, productoId: id })).max(LIMITES.otrosCostos),
  simulador: z.object({
    productoId: z.string().nullable(),
    precioAProbar: noNegativo('Precio a probar').nullable(),
    unidades: noNegativo('Unidades'),
    precioMayorista: noNegativo('Precio mayorista').nullable(),
    unidadesMayoristas: noNegativo('Unidades mayoristas'),
  }),
  conversiones: z.object({
    gramos: noNegativo('Gramos'),
    gramosPorCucharada: noNegativo('Gramos por cucharada'),
    gotas: noNegativo('Gotas'),
    gotasPorMl: noNegativo('Gotas por ml'),
    ml: noNegativo('ml'),
    pesoFormula: noNegativo('Peso de la fórmula'),
    porcentaje: noNegativo('Porcentaje'),
  }),
  tablaCucharadas: z
    .array(
      z.object({
        id,
        ingrediente: texto(80),
        gramosPorCucharada: noNegativo('Gramos por cucharada'),
        fecha: texto(10),
        observacion: texto(120),
      }),
    )
    .max(200),
  meta: z.object({
    onboarded: z.boolean(),
    ultimoCambio: z.string().nullable(),
    ultimoRespaldo: z.string().nullable(),
  }),
})

export const esquemaRespaldo = z.object({
  app: z.literal('ayru-calculadora'),
  version: z.literal(1),
  exportadoEn: z.string(),
  libro: esquemaLibro,
})
export type Respaldo = z.infer<typeof esquemaRespaldo>

export function primerError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Revisa los datos ingresados'
}
