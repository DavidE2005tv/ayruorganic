import Link from 'next/link'
import { LogoAyru } from '@/shared/components/layout/marca'
import { claseBoton } from '@/shared/components/ui/boton'

export default function NoEncontrado() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <LogoAyru className="mx-auto w-36" />
        <h1 className="mt-8 text-4xl font-semibold">Esta página no existe</h1>
        <p className="mt-2 text-tinta-suave">Puede que el enlace esté incompleto.</p>
        <Link href="/" className={claseBoton('primario', 'lg', 'mt-8')}>
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
