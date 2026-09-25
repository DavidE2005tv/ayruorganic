/** Asigna el menor código libre: P01…P30, MP001…MP100 (como las filas fijas del Excel). */
export function siguienteCodigo(prefijo: string, usados: string[], digitos: number, maximo: number): string | null {
  const ocupados = new Set(usados)
  for (let n = 1; n <= maximo; n++) {
    const codigo = `${prefijo}${String(n).padStart(digitos, '0')}`
    if (!ocupados.has(codigo)) return codigo
  }
  return null
}

export function nuevoId(): string {
  return crypto.randomUUID()
}

export function hoyISO(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}
