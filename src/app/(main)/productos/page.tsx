import type { Metadata } from 'next'
import { PaginaProductos } from '@/features/productos/components/pagina-productos'

export const metadata: Metadata = { title: 'Productos y recetas · Calculadora AYRU' }

export default function ProductosPage() {
  return <PaginaProductos />
}
