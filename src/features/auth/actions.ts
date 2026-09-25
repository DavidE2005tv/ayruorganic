'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { estaAutorizado, normalizarCorreo } from './services/allowlist'
import { COOKIE_SESION, DURACION_SESION_SEG, crearToken } from './services/session'

export interface EstadoLogin {
  error: string | null
  correo: string
}

const esquemaCorreo = z.string().trim().max(254).pipe(z.email())

export async function iniciarSesion(_previo: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const crudo = String(formData.get('correo') ?? '')
  const resultado = esquemaCorreo.safeParse(crudo)

  if (!resultado.success) {
    return { error: 'Escribe un correo válido, por ejemplo: nombre@gmail.com', correo: crudo }
  }

  const correo = normalizarCorreo(resultado.data)
  if (!estaAutorizado(correo)) {
    return {
      error: 'no-autorizado',
      correo: crudo,
    }
  }

  const almacen = await cookies()
  almacen.set(COOKIE_SESION, await crearToken(correo), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DURACION_SESION_SEG,
  })
  redirect('/')
}

export async function cerrarSesion(): Promise<void> {
  const almacen = await cookies()
  almacen.delete(COOKIE_SESION)
  redirect('/login')
}
