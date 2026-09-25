'use client'

import { useActionState } from 'react'
import { ArrowRight, Loader2, Mail, MessageCircle } from 'lucide-react'
import { iniciarSesion, type EstadoLogin } from '../actions'
import { SOPORTE } from '@/shared/components/layout/marca'
import { Aviso } from '@/shared/components/ui/aviso'
import { Boton } from '@/shared/components/ui/boton'

const inicial: EstadoLogin = { error: null, correo: '' }

function NoAutorizado() {
  return (
    <Aviso tono="consejo">
      <p className="font-semibold">Este correo todavía no tiene acceso.</p>
      <p className="mt-1">
        Revisa que sea el mismo correo con el que compraste la calculadora. Si necesitas ayuda, escríbenos:
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={SOPORTE.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-bosque px-3 py-2 text-sm font-semibold text-papel"
        >
          <MessageCircle className="size-4" aria-hidden /> WhatsApp {SOPORTE.whatsapp}
        </a>
        <a href={`mailto:${SOPORTE.correo}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-bosque underline">
          {SOPORTE.correo}
        </a>
      </div>
    </Aviso>
  )
}

export function LoginForm() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, inicial)
  const errorCampo = estado.error && estado.error !== 'no-autorizado' ? estado.error : null

  return (
    <form action={accion} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="correo" className="text-base font-semibold">
          Tu correo electrónico
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-tinta-suave" aria-hidden />
          <input
            id="correo"
            name="correo"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            defaultValue={estado.correo}
            placeholder="nombre@gmail.com"
            aria-invalid={Boolean(errorCampo)}
            aria-describedby="correo-ayuda"
            className="h-14 w-full rounded-2xl border border-linea bg-[#FFFDF8] pl-12 pr-4 text-lg shadow-[inset_0_1px_0_rgb(0_0_0/0.03)] placeholder:text-tinta-suave/50 focus:border-canela focus:outline-none focus:ring-4 focus:ring-kraft/50 aria-[invalid=true]:border-arcilla"
          />
        </div>
        <p id="correo-ayuda" className={errorCampo ? 'text-sm font-medium text-arcilla' : 'text-sm text-tinta-suave'}>
          {errorCampo ?? 'Usa el correo con el que adquiriste la calculadora. No necesitas contraseña.'}
        </p>
      </div>

      {estado.error === 'no-autorizado' && <NoAutorizado />}

      <Boton type="submit" tamano="lg" disabled={enviando} className="w-full">
        {enviando ? <Loader2 className="animate-spin" aria-hidden /> : null}
        {enviando ? 'Verificando…' : 'Entrar a mi calculadora'}
        {!enviando && <ArrowRight aria-hidden />}
      </Boton>
    </form>
  )
}
