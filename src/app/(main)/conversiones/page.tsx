import type { Metadata } from 'next'
import { PaginaConversiones } from '@/features/conversiones/components/pagina-conversiones'

export const metadata: Metadata = { title: 'Conversiones · Calculadora AYRU' }

export default function ConversionesPage() {
  return <PaginaConversiones />
}
