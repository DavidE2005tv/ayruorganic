import { redirect } from 'next/navigation'
import { usuarioActual } from '@/features/auth/services/current-user'
import { LibroProvider } from '@/features/calculadora/store/provider'
import { AppShell } from '@/shared/components/layout/app-shell'
import { Cargando } from '@/shared/components/layout/cargando'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const correo = await usuarioActual()
  if (!correo) redirect('/login')

  return (
    <LibroProvider correo={correo} cargando={<Cargando />}>
      <AppShell>{children}</AppShell>
    </LibroProvider>
  )
}
