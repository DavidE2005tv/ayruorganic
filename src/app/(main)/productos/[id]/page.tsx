import type { Metadata } from 'next'
import { FichaProducto } from '@/features/productos/components/ficha-producto'

export const metadata: Metadata = { title: 'Ficha de producto · Calculadora AYRU' }

export default async function FichaProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FichaProducto id={id} />
}
