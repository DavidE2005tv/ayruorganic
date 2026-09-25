import { cookies } from 'next/headers'
import { COOKIE_SESION, verificarToken } from './session'

/** Correo del usuario con sesión válida, o null. Úsalo solo en el servidor. */
export async function usuarioActual(): Promise<string | null> {
  const almacen = await cookies()
  return verificarToken(almacen.get(COOKIE_SESION)?.value)
}
