import type { Metadata } from 'next'
import { PaginaInsumos } from '@/features/insumos/components/pagina-insumos'

export const metadata: Metadata = { title: 'Materias primas · Calculadora AYRU' }

export default function InsumosPage() {
  return <PaginaInsumos />
}
