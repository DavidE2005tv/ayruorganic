'use client'

import type { ReactNode } from 'react'
import { Droplets, Percent, Soup } from 'lucide-react'
import { calcularConversiones } from '@/features/calculadora/lib/calc'
import { formatoNumero } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import type { ParametrosConversiones } from '@/features/calculadora/types'
import { EncabezadoPagina } from '@/shared/components/layout/encabezado-pagina'
import { Aviso } from '@/shared/components/ui/aviso'
import { CampoNumero } from '@/shared/components/ui/campos'
import { Cifra } from '@/shared/components/ui/cifra'
import { EncabezadoTarjeta, Tarjeta } from '@/shared/components/ui/tarjeta'
import { TablaCucharadas } from './tabla-cucharadas'

function Conversor({ icono, titulo, descripcion, children }: { icono: ReactNode; titulo: string; descripcion: string; children: ReactNode }) {
  return (
    <Tarjeta className="flex flex-col">
      <EncabezadoTarjeta icono={icono} titulo={titulo} descripcion={descripcion} />
      <div className="flex flex-1 flex-col gap-4 p-5">{children}</div>
    </Tarjeta>
  )
}

export function PaginaConversiones() {
  const p = useLibro((s) => s.conversiones)
  const actualizar = useLibro((s) => s.actualizarConversiones)
  const r = calcularConversiones(p)
  const campo = (k: keyof ParametrosConversiones) => (v: number | null) => actualizar({ [k]: v ?? 0 })

  return (
    <>
      <EncabezadoPagina
        paso="Herramientas"
        titulo="Conversiones"
        descripcion="Cálculos rápidos para formular: gramos a cucharadas, gotas a mililitros y porcentajes."
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Conversor icono={<Soup className="size-5" />} titulo="Gramos → cucharadas" descripcion="Depende de cuánto pesa una cucharada de tu ingrediente.">
          <CampoNumero etiqueta="Gramos a convertir" sufijo="g" valor={p.gramos} alCambiar={campo('gramos')} />
          <CampoNumero etiqueta="Gramos que pesa 1 cucharada" sufijo="g" valor={p.gramosPorCucharada} alCambiar={campo('gramosPorCucharada')} />
          <div className="mt-auto grid grid-cols-2 gap-2">
            <Cifra etiqueta="Cucharadas" valor={formatoNumero(r.cucharadas)} destacado />
            <Cifra etiqueta="Cucharaditas" valor={formatoNumero(r.cucharaditas)} detalle="aproximado" />
          </div>
        </Conversor>

        <Conversor icono={<Droplets className="size-5" />} titulo="Gotas ↔ mililitros" descripcion="Referencia inicial: 20 gotas = 1 ml. Ajústala a tu gotero.">
          <CampoNumero etiqueta="Gotas por 1 ml" valor={p.gotasPorMl} alCambiar={campo('gotasPorMl')} ayuda="Cambia según el gotero, la viscosidad y el líquido." />
          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <CampoNumero etiqueta="Gotas a convertir" valor={p.gotas} alCambiar={campo('gotas')} />
            <Cifra etiqueta="ml" valor={formatoNumero(r.mlDesdeGotas)} className="min-w-24" />
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-2">
            <CampoNumero etiqueta="ml a convertir" sufijo="ml" valor={p.ml} alCambiar={campo('ml')} />
            <Cifra etiqueta="Gotas" valor={formatoNumero(r.gotasDesdeMl)} className="min-w-24" />
          </div>
        </Conversor>

        <Conversor icono={<Percent className="size-5" />} titulo="Porcentajes de fórmula" descripcion="Cuántos gramos corresponden a un % de tu fórmula.">
          <CampoNumero etiqueta="Peso total de la fórmula" sufijo="g" valor={p.pesoFormula} alCambiar={campo('pesoFormula')} />
          <CampoNumero etiqueta="Porcentaje a calcular" modo="porcentaje" valor={p.porcentaje} alCambiar={campo('porcentaje')} />
          <Cifra
            etiqueta="Cantidad resultante"
            valor={`${formatoNumero(r.cantidadPorcentaje)} g`}
            detalle="Ejemplo: 1,5 % de 500 g = 7,5 g"
            destacado
            className="mt-auto"
          />
        </Conversor>
      </div>

      <Aviso tono="consejo" className="my-6">
        No existe una equivalencia universal entre gramos y cucharadas: depende de la densidad de cada ingrediente. Para mayor precisión,
        pesa una cucharada rasa de tu propio ingrediente y guárdala abajo.
      </Aviso>

      <TablaCucharadas />
    </>
  )
}
