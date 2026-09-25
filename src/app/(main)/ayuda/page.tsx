import type { Metadata } from 'next'
import { PaginaAyuda } from '@/features/ayuda/components/pagina-ayuda'

export const metadata: Metadata = { title: 'Ayuda · Calculadora AYRU' }

export default function AyudaPage() {
  return <PaginaAyuda />
}
