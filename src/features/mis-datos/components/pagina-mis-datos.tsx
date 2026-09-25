'use client'

import { UploadCloud } from 'lucide-react'
import { EncabezadoPagina } from '@/shared/components/layout/encabezado-pagina'
import { Bloque, BloqueBorrarTodo, BloqueEjemplo, BloqueExcel, BloqueRespaldo } from './bloques'
import { RestaurarRespaldo } from './restaurar-respaldo'

export function PaginaMisDatos() {
  return (
    <>
      <EncabezadoPagina
        paso="Herramientas"
        titulo="Mis datos y respaldo"
        descripcion="Tus datos se guardan en este navegador. Descarga un respaldo de vez en cuando para no perderlos y para usarlos en otro dispositivo."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <BloqueRespaldo />
        <Bloque icono={<UploadCloud className="size-5" />} titulo="Restaurar respaldo" descripcion="¿Cambiaste de computador o celular? Carga aquí tu archivo.">
          <RestaurarRespaldo />
        </Bloque>
        <BloqueExcel />
        <BloqueEjemplo />
      </div>
      <BloqueBorrarTodo />
    </>
  )
}
