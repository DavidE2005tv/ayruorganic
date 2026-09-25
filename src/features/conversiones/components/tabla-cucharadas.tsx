'use client'

import { useState } from 'react'
import { NotebookPen, Plus, Trash2 } from 'lucide-react'
import { hoyISO } from '@/features/calculadora/lib/codigos'
import { fechaCorta, formatoNumero } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import { Boton } from '@/shared/components/ui/boton'
import { CampoNumero, CampoTexto } from '@/shared/components/ui/campos'
import { notificar } from '@/shared/components/ui/notificaciones'
import { EncabezadoTarjeta, Tarjeta } from '@/shared/components/ui/tarjeta'

export function TablaCucharadas() {
  const filas = useLibro((s) => s.tablaCucharadas)
  const guardar = useLibro((s) => s.guardarCucharada)
  const eliminar = useLibro((s) => s.eliminarCucharada)
  const actualizarConversiones = useLibro((s) => s.actualizarConversiones)
  const [ingrediente, setIngrediente] = useState('')
  const [gramos, setGramos] = useState<number | null>(null)
  const [observacion, setObservacion] = useState('')

  const agregar = () => {
    if (!ingrediente.trim() || gramos === null || gramos <= 0) {
      notificar('Escribe el ingrediente y cuántos gramos pesa una cucharada', 'error')
      return
    }
    guardar({ ingrediente: ingrediente.trim().slice(0, 80), gramosPorCucharada: gramos, fecha: hoyISO(), observacion: observacion.slice(0, 120) })
    setIngrediente('')
    setGramos(null)
    setObservacion('')
    notificar('Guardado en tu tabla personal')
  }

  return (
    <Tarjeta>
      <EncabezadoTarjeta
        icono={<NotebookPen className="size-5" />}
        titulo="Mi tabla de cucharadas"
        descripcion="Pesa una cucharada rasa de tus arcillas, harinas y polvos, y guarda el dato para no volver a medir."
      />
      <div className="grid gap-3 p-5 sm:grid-cols-[1.4fr_1fr_1.4fr_auto] sm:items-end">
        <CampoTexto etiqueta="Ingrediente" placeholder="Ej: Arcilla verde" valor={ingrediente} alCambiar={setIngrediente} />
        <CampoNumero etiqueta="1 cucharada pesa" sufijo="g" valor={gramos} alCambiar={setGramos} placeholder="8" />
        <CampoTexto etiqueta="Observación" placeholder="Opcional" valor={observacion} alCambiar={setObservacion} />
        <Boton onClick={agregar} className="h-12">
          <Plus aria-hidden /> Guardar
        </Boton>
      </div>
      {filas.length > 0 && (
        <ul className="divide-y divide-linea/60 border-t border-linea/70">
          {filas.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{f.ingrediente}</p>
                <p className="text-xs text-tinta-suave">
                  Medido el {fechaCorta(f.fecha)}
                  {f.observacion && ` · ${f.observacion}`}
                </p>
              </div>
              <span className="cifra rounded-lg bg-salvia px-2.5 py-1 font-semibold text-bosque">{formatoNumero(f.gramosPorCucharada)} g</span>
              <Boton
                variante="secundario"
                tamano="sm"
                onClick={() => {
                  actualizarConversiones({ gramosPorCucharada: f.gramosPorCucharada })
                  notificar(`Usando ${formatoNumero(f.gramosPorCucharada)} g por cucharada (${f.ingrediente})`)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Usar
              </Boton>
              <Boton variante="fantasma" tamano="sm" aria-label={`Eliminar ${f.ingrediente}`} onClick={() => eliminar(f.id)} className="text-arcilla">
                <Trash2 aria-hidden />
              </Boton>
            </li>
          ))}
        </ul>
      )}
    </Tarjeta>
  )
}
