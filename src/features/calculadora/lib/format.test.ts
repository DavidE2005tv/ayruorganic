import { describe, expect, it } from 'vitest'
import { formatoPesos, formatoPesosDetalle, formatoPorcentaje, leerNumero, numeroParaCampo } from './format'

describe('leerNumero (formato colombiano)', () => {
  it.each([
    ['18.000', 18000],
    ['1.000.000', 1000000],
    ['1,5', 1.5],
    ['1.234,56', 1234.56],
    ['$ 12.500', 12500],
    ['1.5', 1.5],
    ['60', 60],
    ['0,015', 0.015],
    ['', null],
    ['abc', null],
  ])('%s → %s', (texto, esperado) => {
    expect(leerNumero(texto)).toBe(esperado)
  })
})

describe('formatos', () => {
  it('pesos sin decimales', () => {
    expect(formatoPesos(11597.8)).toBe('$\u00a011.598')
  })
  it('el signo nunca queda separado de la cifra (espacio fijo)', () => {
    expect(formatoPesos(526590)).not.toMatch(/ /)
    expect(formatoPesosDetalle(73.11)).not.toMatch(/ /)
    expect(formatoPorcentaje(0.6)).not.toMatch(/ /)
  })
  it('porcentaje con 1 decimal', () => {
    expect(formatoPorcentaje(0.6431)).toBe('64,3\u00a0%')
  })
  it('número para campo es reversible', () => {
    expect(leerNumero(numeroParaCampo(1234.5))).toBe(1234.5)
    expect(leerNumero(numeroParaCampo(18000))).toBe(18000)
  })
})
