import { Trash2 } from 'lucide-react'
import { Boton } from './boton'

interface Props {
  textoGuardar: string
  alGuardar: () => void
  alCancelar: () => void
  alEliminar?: () => void
  textoEliminar?: string
  eliminarDeshabilitado?: boolean
}

/** Botones estándar de los diálogos de edición: Eliminar · Cancelar · Guardar */
export function PieFormulario({ textoGuardar, alGuardar, alCancelar, alEliminar, textoEliminar = 'Eliminar', eliminarDeshabilitado }: Props) {
  return (
    <>
      {alEliminar && (
        <Boton variante="fantasma" className="text-arcilla sm:mr-auto" onClick={alEliminar} disabled={eliminarDeshabilitado}>
          <Trash2 aria-hidden /> {textoEliminar}
        </Boton>
      )}
      <Boton variante="secundario" onClick={alCancelar}>
        Cancelar
      </Boton>
      <Boton onClick={alGuardar}>{textoGuardar}</Boton>
    </>
  )
}
