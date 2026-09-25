import type { Metadata } from 'next'
import { PaginaMisDatos } from '@/features/mis-datos/components/pagina-mis-datos'

export const metadata: Metadata = { title: 'Mis datos · Calculadora AYRU' }

export default function MisDatosPage() {
  return <PaginaMisDatos />
}
