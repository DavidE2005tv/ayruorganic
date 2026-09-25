import type { Metadata } from 'next'
import { PaginaSimulador } from '@/features/simulador/components/pagina-simulador'

export const metadata: Metadata = { title: 'Simulador · Calculadora AYRU' }

export default async function SimuladorPage({ searchParams }: { searchParams: Promise<{ producto?: string | string[] }> }) {
  const { producto } = await searchParams
  return <PaginaSimulador productoInicial={typeof producto === 'string' ? producto : undefined} />
}
