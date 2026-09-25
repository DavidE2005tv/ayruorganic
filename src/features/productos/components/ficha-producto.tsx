'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, CopyPlus, Pencil, Trash2 } from 'lucide-react'
import { pesoUnidadSugerido } from '@/features/calculadora/lib/calc'
import { formatoNumero, formatoPesos, formatoPorcentaje } from '@/features/calculadora/lib/format'
import { useLibro } from '@/features/calculadora/store/provider'
import { useProductoConResultado } from '@/features/calculadora/store/selectores'
import type { Producto } from '@/features/calculadora/types'
import { Boton, claseBoton } from '@/shared/components/ui/boton'
import { Confirmar } from '@/shared/components/ui/dialogo'
import { notificar } from '@/shared/components/ui/notificaciones'
import { Vacio } from '@/shared/components/ui/vacio'
import { FormularioProducto } from './formulario-producto'
import { SeccionOtrosCostos } from './seccion-otros-costos'
import { SeccionReceta } from './seccion-receta'
import { TarjetaResultado } from './tarjeta-resultado'

function AccionesProducto({ producto: p, alEditar }: { producto: Producto; alEditar: () => void }) {
  const router = useRouter()
  const eliminar = useLibro((s) => s.eliminarProducto)
  const duplicar = useLibro((s) => s.duplicarProducto)
  const [borrando, setBorrando] = useState(false)

  const copiar = () => {
    const r = duplicar(p.id)
    if (!r.ok) return notificar(r.error, 'error')
    notificar('Producto duplicado con su receta y costos')
    router.push(`/productos/${r.id}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Boton variante="secundario" onClick={alEditar}>
        <Pencil aria-hidden /> Editar datos
      </Boton>
      <Boton variante="secundario" onClick={copiar}>
        <CopyPlus aria-hidden /> Duplicar
      </Boton>
      <Boton variante="fantasma" className="text-arcilla" onClick={() => setBorrando(true)}>
        <Trash2 aria-hidden /> Eliminar
      </Boton>
      <Confirmar
        abierto={borrando}
        alCerrar={() => setBorrando(false)}
        titulo="¿Eliminar este producto?"
        mensaje={
          <>
            Se borrarán <strong>{p.nombre}</strong>, su receta y sus otros costos. Tus materias primas no se tocan.
          </>
        }
        textoConfirmar="Sí, eliminar"
        peligro
        alConfirmar={() => {
          router.push('/productos')
          eliminar(p.id)
          notificar('Producto eliminado')
        }}
      />
    </div>
  )
}

function DatosProducto({ producto: p, alEditar }: { producto: Producto; alEditar: () => void }) {
  const datos = [
    { t: 'Unidades por lote', v: formatoNumero(p.unidadesLote) },
    { t: 'Peso del lote', v: `${formatoNumero(p.pesoLote)} g` },
    { t: 'Peso por unidad', v: `${formatoNumero(p.pesoUnidad ?? pesoUnidadSugerido(p))} g` },
    { t: 'Canal', v: p.canal },
    { t: 'Precio actual', v: p.precioActual > 0 ? formatoPesos(p.precioActual) : 'Sin precio' },
    { t: 'Margen deseado', v: formatoPorcentaje(p.margenDeseado) },
  ]
  return (
    <button
      type="button"
      onClick={alEditar}
      aria-label="Editar datos del producto"
      className="mb-6 grid w-full grid-cols-2 gap-px overflow-hidden rounded-2xl border border-linea/70 bg-linea/60 text-left sm:grid-cols-3 lg:grid-cols-6"
    >
      {datos.map((d) => (
        <span key={d.t} className="bg-[#FFFDF8] px-4 py-3 transition-colors hover:bg-kraft/15">
          <span className="block text-xs font-semibold text-tinta-suave">{d.t}</span>
          <span className="cifra mt-0.5 block font-semibold">{d.v}</span>
        </span>
      ))}
    </button>
  )
}

export function FichaProducto({ id }: { id: string }) {
  const item = useProductoConResultado(id)
  const [editando, setEditando] = useState(false)

  if (!item) {
    return (
      <Vacio icono={<ArrowLeft />} titulo="No encontramos este producto" accion={<Link href="/productos" className={claseBoton('primario')}>Volver a productos</Link>}>
        Puede que lo hayas eliminado o que estés en otro dispositivo.
      </Vacio>
    )
  }

  const { producto: p, resultado } = item
  return (
    <>
      <Link href="/productos" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-oliva hover:text-bosque">
        <ArrowLeft className="size-4" aria-hidden /> Todos los productos
      </Link>
      <header className="mb-6 flex animate-brotar flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-canela">
            Producto {p.codigo}
            {p.ejemplo && ' · ejemplo'}
          </p>
          <h1 className="mt-1 text-[2rem] font-semibold leading-[1.05] sm:text-[2.6rem]">{p.nombre}</h1>
        </div>
        <AccionesProducto producto={p} alEditar={() => setEditando(true)} />
      </header>
      <DatosProducto producto={p} alEditar={() => setEditando(true)} />
      <div className="grid gap-5 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        <div className="order-2 flex flex-col gap-5 lg:order-1">
          <SeccionReceta producto={p} />
          <SeccionOtrosCostos producto={p} />
        </div>
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-8">
            <TarjetaResultado producto={p} resultado={resultado} />
          </div>
        </div>
      </div>
      {editando && <FormularioProducto producto={p} alCerrar={() => setEditando(false)} />}
    </>
  )
}
