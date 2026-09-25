'use client'

import Link from 'next/link'
import { ArrowRight, BookOpenText } from 'lucide-react'
import { useLibro } from '@/features/calculadora/store/provider'
import { usePanel, useResumen, useTieneEjemplo, type ProductoConResultado } from '@/features/calculadora/store/selectores'
import { EncabezadoPagina } from '@/shared/components/layout/encabezado-pagina'
import { Aviso } from '@/shared/components/ui/aviso'
import { claseBoton } from '@/shared/components/ui/boton'
import { Cifra } from '@/shared/components/ui/cifra'
import { Vacio } from '@/shared/components/ui/vacio'
import { Bienvenida } from './bienvenida'
import { TablaResumen } from './tabla-resumen'

interface Sugerencia {
  texto: string
  accion: string
  href: string
}

function siguientePaso(hayInsumos: boolean, resumen: ProductoConResultado[], idsConReceta: Set<string>): Sugerencia {
  if (!hayInsumos) return { texto: 'Empieza registrando tus materias primas.', accion: 'Registrar insumos', href: '/insumos' }
  if (resumen.length === 0) return { texto: 'Ya tienes insumos. Ahora crea tu primer producto.', accion: 'Crear producto', href: '/productos' }
  const sinReceta = resumen.find((r) => !idsConReceta.has(r.producto.id))
  if (sinReceta) {
    return { texto: `A “${sinReceta.producto.nombre}” le falta la receta.`, accion: 'Armar receta', href: `/productos/${sinReceta.producto.id}` }
  }
  const sinPrecio = resumen.find((r) => r.producto.precioActual === 0)
  if (sinPrecio) {
    return { texto: `Escribe el precio actual de “${sinPrecio.producto.nombre}” para compararlo.`, accion: 'Poner precio', href: `/productos/${sinPrecio.producto.id}` }
  }
  return { texto: 'Todo está al día. Prueba otros precios y escenarios en el simulador.', accion: 'Abrir simulador', href: '/simulador' }
}

export function PaginaInicio() {
  const onboarded = useLibro((s) => s.meta.onboarded)
  const hayInsumos = useLibro((s) => s.insumos.length > 0)
  const recetas = useLibro((s) => s.recetas)
  const resumen = useResumen()
  const panel = usePanel()
  const tieneEjemplo = useTieneEjemplo()

  if (!onboarded && !hayInsumos && resumen.length === 0) return <Bienvenida />

  const sugerencia = siguientePaso(hayInsumos, resumen, new Set(recetas.map((l) => l.productoId)))

  return (
    <>
      <EncabezadoPagina
        paso="Panel general"
        titulo="Así van tus productos"
        descripcion="Un control rápido: no califica si un margen es bueno o malo, solo te muestra alertas según tus datos y el margen que tú definiste."
      />

      <Link
        href={sugerencia.href}
        className="grano group mb-6 flex animate-brotar flex-col gap-3 rounded-2xl bg-bosque px-5 py-4 text-papel shadow-hoja sm:flex-row sm:items-center sm:justify-between"
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-kraft">Siguiente paso</span>
          <span className="mt-1 block text-lg font-medium">{sugerencia.texto}</span>
        </span>
        <span className="inline-flex items-center gap-2 font-semibold text-kraft">
          {sugerencia.accion} <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </Link>

      {tieneEjemplo && (
        <Aviso tono="consejo" className="mb-6">
          Estás viendo los datos de ejemplo de AYRU. Cuando quieras empezar con los tuyos, quítalos desde{' '}
          <Link href="/mis-datos" className="font-semibold underline">Mis datos</Link>.
        </Aviso>
      )}

      <section aria-label="Indicadores" className="mb-8 grid animate-brotar grid-cols-2 gap-3 [animation-delay:80ms] lg:grid-cols-4">
        <Cifra etiqueta="Productos registrados" valor={panel.registrados} detalle="de 30 posibles" />
        <Cifra etiqueta="Con precio actual" valor={panel.conPrecio} detalle="tienen precio de venta" />
        <Cifra etiqueta="Bajo costo" valor={panel.bajoCosto} detalle="se venden con pérdida" tono={panel.bajoCosto > 0 ? 'alerta' : 'normal'} />
        <Cifra etiqueta="Bajo el sugerido" valor={panel.bajoSugerido} detalle="margen menor al deseado" tono={panel.bajoSugerido > 0 ? 'aviso' : 'normal'} />
      </section>

      <section className="animate-brotar [animation-delay:140ms]">
        <h2 className="mb-3 text-2xl font-semibold">Resumen de productos</h2>
        {resumen.length === 0 ? (
          <Vacio
            icono={<BookOpenText />}
            titulo="Aquí verás todos tus productos"
            accion={
              <Link href="/productos" className={claseBoton('primario')}>
                Crear producto
              </Link>
            }
          >
            Costo, precio, margen y estado de cada producto, todo junto para comparar.
          </Vacio>
        ) : (
          <TablaResumen filas={resumen} />
        )}
      </section>
    </>
  )
}
