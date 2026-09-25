/** Normaliza un correo para compararlo: sin espacios y en minúsculas. */
export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase()
}

/** Lee ALLOWED_EMAILS (separados por coma, punto y coma o salto de línea). */
export function correosAutorizados(): Set<string> {
  const crudo = process.env.ALLOWED_EMAILS ?? ''
  return new Set(
    crudo
      .split(/[,;\n]/)
      .map(normalizarCorreo)
      .filter((c) => c.length > 0),
  )
}

export function estaAutorizado(correo: string): boolean {
  return correosAutorizados().has(normalizarCorreo(correo))
}
