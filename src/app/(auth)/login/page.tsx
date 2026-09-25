import type { Metadata } from 'next'
import { LoginForm } from '@/features/auth/components/login-form'
import { LogoAyru, SOPORTE } from '@/shared/components/layout/marca'

export const metadata: Metadata = { title: 'Entrar · Calculadora AYRU ORGANIC' }

const PASOS = ['Registra tus materias primas', 'Arma tus recetas y costos', 'Descubre tu precio ideal']

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="grano relative hidden overflow-hidden bg-bosque px-14 py-12 text-papel lg:flex lg:flex-col">
        <div aria-hidden className="absolute -right-24 -top-24 size-[28rem] rounded-full bg-oliva/40 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-20 size-[26rem] rounded-full bg-canela/25 blur-3xl" />
        <LogoAyru claro className="relative w-44" prioridad />
        <div className="relative mt-auto max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-kraft">Calculadora de costos PRO 1.0</p>
          <h1 className="mt-4 font-display text-[3.4rem] font-semibold leading-[1.02] text-papel">
            Costea · Define tu precio · Simula · Decide
          </h1>
          <ol className="mt-10 flex flex-col gap-4">
            {PASOS.map((paso, i) => (
              <li key={paso} className="flex items-center gap-4 text-lg text-papel/90">
                <span className="cifra grid size-9 place-items-center rounded-full border border-papel/30 font-display text-lg">{i + 1}</span>
                {paso}
              </li>
            ))}
          </ol>
        </div>
        <blockquote className="relative mt-14 border-l-2 border-kraft/60 pl-5 font-display text-xl italic text-papel/85">
          “Conocer tus costos transforma una receta en una decisión de negocio.”
        </blockquote>
      </section>

      <section className="flex flex-col px-5 py-8 sm:px-10 lg:justify-center lg:px-16">
        <div className="mx-auto w-full max-w-md animate-brotar">
          <LogoAyru className="mx-auto w-44 lg:hidden" prioridad />
          <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.22em] text-canela lg:mt-0 lg:text-left">
            Te damos la bienvenida
          </p>
          <h2 className="mt-2 text-center text-[2.1rem] font-semibold leading-tight lg:text-left">Entra a tu calculadora</h2>
          <p className="mb-8 mt-2 text-center text-tinta-suave lg:text-left">
            Descubre cuánto te cuesta cada jabón y a qué precio venderlo, sin fórmulas complicadas.
          </p>
          <LoginForm />
          <p className="mt-10 text-center text-sm text-tinta-suave">
            ¿Necesitas ayuda? WhatsApp{' '}
            <a className="font-semibold text-bosque underline" href={SOPORTE.whatsappUrl} target="_blank" rel="noopener noreferrer">
              {SOPORTE.whatsapp}
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
