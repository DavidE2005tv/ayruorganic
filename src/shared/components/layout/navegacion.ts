import {
  BookOpenText,
  FlaskConical,
  HardDriveDownload,
  Home,
  LifeBuoy,
  Scale,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'

export interface ItemNavegacion {
  href: string
  titulo: string
  corto: string
  icono: LucideIcon
  paso?: number
}

export const NAV_PRINCIPAL: ItemNavegacion[] = [
  { href: '/', titulo: 'Inicio y resumen', corto: 'Inicio', icono: Home },
  { href: '/insumos', titulo: 'Materias primas', corto: 'Insumos', icono: FlaskConical, paso: 1 },
  { href: '/productos', titulo: 'Productos y recetas', corto: 'Productos', icono: BookOpenText, paso: 2 },
  { href: '/simulador', titulo: 'Simulador de precios', corto: 'Simulador', icono: SlidersHorizontal, paso: 3 },
]

export const NAV_HERRAMIENTAS: ItemNavegacion[] = [
  { href: '/conversiones', titulo: 'Conversiones', corto: 'Conversiones', icono: Scale },
  { href: '/mis-datos', titulo: 'Mis datos y respaldo', corto: 'Mis datos', icono: HardDriveDownload },
  { href: '/ayuda', titulo: 'Ayuda y guía', corto: 'Ayuda', icono: LifeBuoy },
]

export function estaActivo(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
