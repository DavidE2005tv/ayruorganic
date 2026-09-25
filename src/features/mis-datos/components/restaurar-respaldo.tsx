'use client'

import { useRef, useState } from 'react'
import { FileUp, Loader2 } from 'lucide-react'
import { leerRespaldo } from '@/features/calculadora/lib/backup'
import { fechaCorta } from '@/features/calculadora/lib/format'
import type { Respaldo } from '@/features/calculadora/lib/schemas'
import { useLibro } from '@/features/calculadora/store/provider'
import { Aviso } from '@/shared/components/ui/aviso'
import { Boton } from '@/shared/components/ui/boton'
import { Dialogo } from '@/shared/components/ui/dialogo'
import { notificar } from '@/shared/components/ui/notificaciones'

export function RestaurarRespaldo() {
  const reemplazar = useLibro((s) => s.reemplazarLibro)
  const entrada = useRef<HTMLInputElement>(null)
  const [leyendo, setLeyendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [respaldo, setRespaldo] = useState<Respaldo | null>(null)

  const elegir = async (archivo: File | undefined) => {
    if (!archivo) return
    setLeyendo(true)
    setError(null)
    const r = await leerRespaldo(archivo)
    setLeyendo(false)
    if (entrada.current) entrada.current.value = ''
    if (!r.ok) return setError(r.error)
    setRespaldo(r.respaldo)
  }

  const confirmar = () => {
    if (!respaldo) return
    reemplazar(respaldo.libro)
    setRespaldo(null)
    notificar('Listo, tus datos fueron restaurados')
  }

  const l = respaldo?.libro
  return (
    <div className="flex flex-col gap-3">
      <input
        ref={entrada}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        id="archivo-respaldo"
        onChange={(e) => void elegir(e.target.files?.[0])}
      />
      <Boton variante="secundario" onClick={() => entrada.current?.click()} disabled={leyendo} className="w-full sm:w-fit">
        {leyendo ? <Loader2 className="animate-spin" aria-hidden /> : <FileUp aria-hidden />}
        Cargar archivo de respaldo
      </Boton>
      {error && <Aviso tono="alerta">{error}</Aviso>}

      <Dialogo
        abierto={respaldo !== null}
        alCerrar={() => setRespaldo(null)}
        titulo="¿Restaurar este respaldo?"
        descripcion={respaldo ? `Creado el ${fechaCorta(respaldo.exportadoEn)}` : undefined}
        pie={
          <>
            <Boton variante="secundario" onClick={() => setRespaldo(null)}>
              Cancelar
            </Boton>
            <Boton onClick={confirmar}>Reemplazar mis datos</Boton>
          </>
        }
      >
        {l && (
          <div className="flex flex-col gap-4">
            <ul className="grid grid-cols-2 gap-2 text-center">
              {[
                { t: 'Insumos', v: l.insumos.length },
                { t: 'Productos', v: l.productos.length },
                { t: 'Ingredientes en recetas', v: l.recetas.length },
                { t: 'Otros costos', v: l.otrosCostos.length },
              ].map((x) => (
                <li key={x.t} className="rounded-xl bg-salvia/70 px-3 py-3">
                  <p className="cifra font-display text-2xl font-semibold text-bosque">{x.v}</p>
                  <p className="text-xs font-semibold text-oliva">{x.t}</p>
                </li>
              ))}
            </ul>
            <Aviso tono="alerta">Lo que tienes ahora en esta calculadora será reemplazado por el contenido del respaldo.</Aviso>
          </div>
        )}
      </Dialogo>
    </div>
  )
}
