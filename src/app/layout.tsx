import type { Metadata, Viewport } from 'next'
import { Figtree, Fraunces } from 'next/font/google'
import './globals.css'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['SOFT', 'opsz'],
  display: 'swap',
})

const body = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Calculadora de Costos · AYRU ORGANIC',
  description: 'Costea · Define tu precio · Simula · Decide. Calculadora PRO para emprendedores de jabonería artesanal.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#1C4618',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
