'use client'

import { useState, type ReactNode } from 'react'
import { Download, FileSpreadsheet, Loader2, Sparkles, Trash2 } from 'lucide-react'
import { descargarRespaldo } from '@/features/calculadora/lib/backup'
import { exportarExcel } from '@/features/calculadora/lib/export-xlsx'
import { fechaCorta, haceCuanto } from '@/features/calculadora/lib/format'
import { useLibro, useLibroApi } from '@/features/calculadora/store/provider'
import { useTieneEjemplo } from '@/features/calculadora/store/selectores'
import { extraerLibro } from '@/features/calculadora/store/tipos'
import { Aviso } from '@/shared/components/ui/aviso'
import { Boton } from '@/shared/components/ui/boton'
import { Confirmar } from '@/shared/components/ui/dialogo'
import { notificar } from '@/shared/components/ui/notificaciones'
import { EncabezadoTarjeta, Tarjeta } from '@/shared/components/ui/tarjeta'

export function Bloque({ icono, titulo, descripcion, children }: { icono: ReactNode; titulo: string; descripcion: ReactNode; children: ReactNode }) {
  return (
    <Tarjeta>
      <EncabezadoTarjeta icono={icono} titulo={titulo} descripcion={descripcion} />
      <div className="p-5">{children}</div>
    </Tarjeta>
  )
}

const useVacio = () => useLibro((s) => s.insumos.length + s.productos.length === 0)

export function BloqueRespaldo() {
  const api = useLibroApi()
  const ultimo = useLibro((s) => s.meta.ultimoRespaldo)
  const marcarRespaldo = useLibro((s) => s.marcarRespaldo)
  const vacio = useVacio()
  const respaldar = () => {
    descargarRespaldo(extraerLibro(api.getState()))
    marcarRespaldo()
    notificar('Respaldo descargado. Guárdalo en un lugar seguro.')
  }
  return (
    <Bloque
      icono={<Download className="size-5" />}
      titulo="Descargar respaldo"
      descripcion={`Último respaldo: ${haceCuanto(ultimo)}${ultimo ? ` (${fechaCorta(ultimo)})` : ''}`}
    >
      <p className="mb-4 text-sm leading-relaxed text-tinta-suave">
        Un archivo con todo: insumos, productos, recetas, costos y conversiones. Guárdalo en tu correo, Drive o WhatsApp.
      </p>
      <Boton onClick={respaldar} disabled={vacio} className="w-full sm:w-fit">
        <Download aria-hidden /> Descargar respaldo (.json)
      </Boton>
    </Bloque>
  )
}

export function BloqueExcel() {
  const api = useLibroApi()
  const vacio = useVacio()
  const [exportando, setExportando] = useState(false)
  const excel = async () => {
    setExportando(true)
    try {
      await exportarExcel(extraerLibro(api.getState()))
      notificar('Excel descargado')
    } catch {
      notificar('No pudimos crear el Excel. Intenta de nuevo.', 'error')
    } finally {
      setExportando(false)
    }
  }
  return (
    <Bloque icono={<FileSpreadsheet className="size-5" />} titulo="Exportar a Excel" descripcion="Resumen, productos, materias primas, recetas y otros costos en un .xlsx.">
      <Boton variante="secundario" onClick={() => void excel()} disabled={vacio || exportando} className="w-full sm:w-fit">
        {exportando ? <Loader2 className="animate-spin" aria-hidden /> : <FileSpreadsheet aria-hidden />} Descargar Excel
      </Boton>
    </Bloque>
  )
}

export function BloqueEjemplo() {
  const vacio = useVacio()
  const tieneEjemplo = useTieneEjemplo()
  const cargarEjemplo = useLibro((s) => s.cargarEjemplo)
  const quitarEjemplo = useLibro((s) => s.quitarEjemplo)
  const [confirmando, setConfirmando] = useState(false)
  const cargar = () => {
    const r = cargarEjemplo()
    notificar(r.ok ? 'Ejemplo cargado' : r.error, r.ok ? 'exito' : 'error')
  }
  return (
    <Bloque icono={<Sparkles className="size-5" />} titulo="Datos de ejemplo" descripcion="43 insumos y 4 jabones de AYRU para aprender a usar la calculadora.">
      {tieneEjemplo ? (
        <Boton variante="secundario" onClick={() => setConfirmando(true)} className="w-full sm:w-fit">
          Quitar datos de ejemplo
        </Boton>
      ) : (
        <>
          <Boton variante="secundario" disabled={!vacio} className="w-full sm:w-fit" onClick={cargar}>
            <Sparkles aria-hidden /> Cargar ejemplo
          </Boton>
          {!vacio && <p className="mt-2 text-xs text-tinta-suave">Solo disponible con la calculadora vacía.</p>}
        </>
      )}
      <Confirmar
        abierto={confirmando}
        alCerrar={() => setConfirmando(false)}
        titulo="¿Quitar el ejemplo?"
        mensaje="Se borran los productos de ejemplo y los insumos de ejemplo que no uses en tus propias recetas. Lo que tú creaste se queda."
        textoConfirmar="Quitar ejemplo"
        alConfirmar={() => {
          quitarEjemplo()
          notificar('Datos de ejemplo quitados')
        }}
      />
    </Bloque>
  )
}

export function BloqueBorrarTodo() {
  const vacio = useVacio()
  const borrarTodo = useLibro((s) => s.borrarTodo)
  const [confirmando, setConfirmando] = useState(false)
  return (
    <Tarjeta className="mt-5 border-arcilla/25">
      <EncabezadoTarjeta icono={<Trash2 className="size-5" />} titulo="Borrar todo" descripcion="Deja la calculadora en blanco en este navegador." />
      <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <Aviso tono="alerta" className="sm:flex-1">
          Esta acción no se puede deshacer. Descarga un respaldo antes.
        </Aviso>
        <Boton variante="peligro" onClick={() => setConfirmando(true)} disabled={vacio}>
          <Trash2 aria-hidden /> Borrar todos mis datos
        </Boton>
      </div>
      <Confirmar
        abierto={confirmando}
        alCerrar={() => setConfirmando(false)}
        titulo="¿Borrar todos tus datos?"
        mensaje="Se eliminarán tus insumos, productos, recetas, costos y tu tabla de cucharadas de este navegador."
        textoConfirmar="Sí, borrar todo"
        peligro
        alConfirmar={() => {
          borrarTodo()
          notificar('Tu calculadora quedó en blanco')
        }}
      />
    </Tarjeta>
  )
}
