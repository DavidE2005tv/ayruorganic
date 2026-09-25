import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_SESION, verificarToken } from '@/features/auth/services/session'

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const correo = await verificarToken(request.cookies.get(COOKIE_SESION)?.value)

  if (pathname === '/login') {
    return correo ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next()
  }

  if (!correo) {
    const respuesta = NextResponse.redirect(new URL('/login', request.url))
    respuesta.cookies.delete(COOKIE_SESION)
    return respuesta
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|brand/|icon.png|apple-icon.png|favicon.ico).*)'],
}
