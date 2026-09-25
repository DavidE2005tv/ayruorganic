import { estaAutorizado } from './allowlist'

export const COOKIE_SESION = 'ayru_session'
export const DURACION_SESION_SEG = 60 * 60 * 24 * 30

interface PayloadSesion {
  e: string
  exp: number
}

const codificador = new TextEncoder()

function obtenerSecreto(): string {
  const secreto = process.env.SESSION_SECRET ?? ''
  if (secreto.length < 32) {
    throw new Error('SESSION_SECRET debe tener al menos 32 caracteres')
  }
  return secreto
}

function aBase64Url(bytes: Uint8Array): string {
  let binario = ''
  bytes.forEach((b) => {
    binario += String.fromCharCode(b)
  })
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function desdeBase64Url(texto: string): Uint8Array<ArrayBuffer> {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/')
  const relleno = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binario = atob(relleno)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i)
  return bytes
}

async function clave(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    codificador.encode(obtenerSecreto()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function crearToken(correo: string): Promise<string> {
  const payload: PayloadSesion = {
    e: correo,
    exp: Math.floor(Date.now() / 1000) + DURACION_SESION_SEG,
  }
  const cuerpo = aBase64Url(codificador.encode(JSON.stringify(payload)))
  const firma = await crypto.subtle.sign('HMAC', await clave(), codificador.encode(cuerpo))
  return `${cuerpo}.${aBase64Url(new Uint8Array(firma))}`
}

function esPayload(valor: unknown): valor is PayloadSesion {
  if (typeof valor !== 'object' || valor === null) return false
  const v = valor as Record<string, unknown>
  return typeof v.e === 'string' && typeof v.exp === 'number'
}

/** Devuelve el correo si el token es válido, no expiró y el correo sigue autorizado. */
export async function verificarToken(token: string | undefined): Promise<string | null> {
  if (!token) return null
  const [cuerpo, firma] = token.split('.')
  if (!cuerpo || !firma) return null
  try {
    const valida = await crypto.subtle.verify(
      'HMAC',
      await clave(),
      desdeBase64Url(firma),
      codificador.encode(cuerpo),
    )
    if (!valida) return null
    const payload: unknown = JSON.parse(new TextDecoder().decode(desdeBase64Url(cuerpo)))
    if (!esPayload(payload)) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return estaAutorizado(payload.e) ? payload.e : null
  } catch {
    return null
  }
}
