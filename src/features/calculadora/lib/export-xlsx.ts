import type { Cell, Row, Sheet } from 'write-excel-file/browser'
import type { Libro } from '../types'
import { calcularProducto, costoLineaReceta, costoTotalOtro, costoUnitarioInsumo, porcentajeDelLote } from './calc'
import { nombreArchivo } from './backup'

/** Mismo tipo que `FileContent` de write-excel-file/browser (solo afecta imágenes, que no usamos) */
type Hoja = Sheet<File | Blob | ArrayBuffer>

const PESOS = '$ #,##0'
const PESOS_DETALLE = '$ #,##0.00'
const PORCENTAJE = '0.0%'

const encabezado = (titulos: string[]): Row =>
  titulos.map((value) => ({
    value,
    fontWeight: 'bold',
    textColor: '#FFFFFF',
    backgroundColor: '#1C4618',
    wrap: true,
    alignVertical: 'center',
  }))

const n = (value: number, format?: string): Cell => ({ value, type: Number, format })
const t = (value: string): Cell => ({ value, type: String })

function hojaResumen(libro: Libro): Row[] {
  const datos = { insumos: libro.insumos, recetas: libro.recetas, otrosCostos: libro.otrosCostos }
  const filas = libro.productos.map((p): Row => {
    const r = calcularProducto(p, datos)
    return [
      t(p.codigo), t(p.nombre), n(r.costoTotalLote, PESOS), n(p.unidadesLote), n(r.costoUnitario, PESOS),
      n(p.precioActual, PESOS), n(r.utilidadPorUnidad, PESOS), n(r.margenActual, PORCENTAJE),
      n(r.precioSugerido, PESOS), n(r.diferenciaPrecio, PESOS), t(r.estado), n(r.utilidadSobreCosto, PORCENTAJE),
      n(r.precioComercial, PESOS),
    ]
  })
  return [
    encabezado(['Código', 'Producto', 'Costo lote', 'Unidades', 'Costo unitario', 'Precio actual', 'Utilidad/unidad',
      'Margen actual', 'Precio sugerido', 'Diferencia precio', 'Estado', 'Utilidad sobre costo', 'Precio comercial']),
    ...filas,
  ]
}

function hojaProductos(libro: Libro): Row[] {
  const datos = { insumos: libro.insumos, recetas: libro.recetas, otrosCostos: libro.otrosCostos }
  return [
    encabezado(['Código', 'Producto', 'Unidades/lote', 'Peso lote (g)', 'Peso/unidad (g)', 'Canal de venta', 'Precio actual',
      'Margen deseado', 'Costo materias primas', 'Otros costos', 'Costo total lote', 'Costo unitario', 'Precio sugerido']),
    ...libro.productos.map((p): Row => {
      const r = calcularProducto(p, datos)
      return [
        t(p.codigo), t(p.nombre), n(p.unidadesLote), n(p.pesoLote), n(p.pesoUnidad ?? 0), t(p.canal),
        n(p.precioActual, PESOS), n(p.margenDeseado, PORCENTAJE), n(r.costoMateriasPrimas, PESOS),
        n(r.otrosCostos, PESOS), n(r.costoTotalLote, PESOS), n(r.costoUnitario, PESOS), n(r.precioSugerido, PESOS),
      ]
    }),
  ]
}

function hojaInsumos(libro: Libro): Row[] {
  return [
    encabezado(['Código insumo', 'Insumo', 'Unidad compra', 'Cantidad comprada', 'Precio compra',
      'Costo por g/ml/unidad', 'Proveedor / referencia', 'Fecha actualización']),
    ...libro.insumos.map((i): Row => [
      t(i.codigo), t(i.nombre), t(i.unidad), n(i.cantidadComprada), n(i.precioCompra, PESOS),
      n(costoUnitarioInsumo(i), PESOS_DETALLE), t(i.proveedor), t(i.fechaActualizacion),
    ]),
  ]
}

function hojaRecetas(libro: Libro): Row[] {
  const productos = new Map(libro.productos.map((p) => [p.id, p]))
  const insumos = new Map(libro.insumos.map((i) => [i.id, i]))
  return [
    encabezado(['Código producto', 'Producto', 'Insumo', 'Cantidad usada', 'Unidad', 'Costo unitario insumo',
      'Costo utilizado', '% del lote', 'Función / observación']),
    ...libro.recetas.map((l): Row => {
      const p = productos.get(l.productoId)
      const i = insumos.get(l.insumoId)
      return [
        t(p?.codigo ?? ''), t(p?.nombre ?? ''), t(i?.nombre ?? ''), n(l.cantidad), t(i?.unidad ?? ''),
        n(i ? costoUnitarioInsumo(i) : 0, PESOS_DETALLE), n(costoLineaReceta(l, i), PESOS),
        n(p ? porcentajeDelLote(l, p) : 0, PORCENTAJE), t(l.observacion),
      ]
    }),
  ]
}

function hojaOtrosCostos(libro: Libro): Row[] {
  const productos = new Map(libro.productos.map((p) => [p.id, p]))
  return [
    encabezado(['Código producto', 'Producto', 'Concepto', 'Detalle', 'Costo por unidad/base', 'Cantidad o factor',
      'Costo total', '¿Sumar al costo?', '% sobre ventas', 'Observaciones']),
    ...libro.otrosCostos.map((c): Row => {
      const p = productos.get(c.productoId)
      return [
        t(p?.codigo ?? ''), t(p?.nombre ?? ''), t(c.concepto), t(c.detalle), n(c.costoUnidad, PESOS),
        n(c.cantidadFactor), n(costoTotalOtro(c, p), PESOS), t(c.sumar ? 'Sí' : 'No'),
        n(c.porcentajeVentas, PORCENTAJE), t(c.observaciones),
      ]
    }),
  ]
}

const ancho = (cols: number[]) => cols.map((width) => ({ width }))

export async function exportarExcel(libro: Libro): Promise<void> {
  const { default: writeXlsxFile } = await import('write-excel-file/browser')
  const hojas: Hoja[] = [
    { sheet: 'Resumen', data: hojaResumen(libro), stickyRowsCount: 1, columns: ancho([9, 30, 14, 10, 14, 14, 14, 12, 14, 14, 22, 14, 14]) },
    { sheet: 'Productos', data: hojaProductos(libro), stickyRowsCount: 1, columns: ancho([9, 30, 12, 12, 12, 18, 14, 12, 16, 14, 14, 14, 14]) },
    { sheet: 'Materias primas', data: hojaInsumos(libro), stickyRowsCount: 1, columns: ancho([10, 32, 12, 14, 14, 16, 24, 14]) },
    { sheet: 'Recetas', data: hojaRecetas(libro), stickyRowsCount: 1, columns: ancho([10, 28, 32, 12, 10, 14, 14, 10, 28]) },
    { sheet: 'Otros costos', data: hojaOtrosCostos(libro), stickyRowsCount: 1, columns: ancho([10, 28, 20, 26, 14, 12, 14, 12, 12, 28]) },
  ]
  await writeXlsxFile(hojas).toFile(nombreArchivo('calculadora-ayru', 'xlsx'))
}
