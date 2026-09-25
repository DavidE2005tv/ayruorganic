'use client'

import { useMemo } from 'react'
import { calcularPanel, calcularProducto, costoUnitarioInsumo, type PanelGeneral } from '../lib/calc'
import type { Insumo, Producto, ResultadoProducto } from '../types'
import { useLibro } from './provider'

export interface ProductoConResultado {
  producto: Producto
  resultado: ResultadoProducto
}

/** Resultados calculados de todos los productos (RESUMEN PRODUCTOS) */
export function useResumen(): ProductoConResultado[] {
  const productos = useLibro((s) => s.productos)
  const insumos = useLibro((s) => s.insumos)
  const recetas = useLibro((s) => s.recetas)
  const otrosCostos = useLibro((s) => s.otrosCostos)

  return useMemo(() => {
    const datos = { insumos, recetas, otrosCostos }
    return productos.map((producto) => ({ producto, resultado: calcularProducto(producto, datos) }))
  }, [productos, insumos, recetas, otrosCostos])
}

export function usePanel(): PanelGeneral {
  const resumen = useResumen()
  return useMemo(
    () =>
      calcularPanel(
        resumen.map((r) => r.producto),
        resumen.map((r) => r.resultado),
      ),
    [resumen],
  )
}

export function useProductoConResultado(id: string): ProductoConResultado | undefined {
  const resumen = useResumen()
  return useMemo(() => resumen.find((r) => r.producto.id === id), [resumen, id])
}

/** Insumos ordenados alfabéticamente con su costo unitario y número de recetas donde se usan */
export interface InsumoConCosto {
  insumo: Insumo
  costoUnitario: number
  usos: number
}

export function useInsumosConCosto(): InsumoConCosto[] {
  const insumos = useLibro((s) => s.insumos)
  const recetas = useLibro((s) => s.recetas)
  return useMemo(() => {
    const usos = new Map<string, number>()
    recetas.forEach((l) => usos.set(l.insumoId, (usos.get(l.insumoId) ?? 0) + 1))
    return [...insumos]
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
      .map((insumo) => ({ insumo, costoUnitario: costoUnitarioInsumo(insumo), usos: usos.get(insumo.id) ?? 0 }))
  }, [insumos, recetas])
}

export function useTieneEjemplo(): boolean {
  const productos = useLibro((s) => s.productos)
  const insumos = useLibro((s) => s.insumos)
  return productos.some((p) => p.ejemplo) || insumos.some((i) => i.ejemplo)
}
