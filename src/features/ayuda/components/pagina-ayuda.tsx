import { AtSign, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { EncabezadoPagina } from '@/shared/components/layout/encabezado-pagina'
import { SOPORTE } from '@/shared/components/layout/marca'
import { Aviso } from '@/shared/components/ui/aviso'
import { Tarjeta } from '@/shared/components/ui/tarjeta'

const PASOS = [
  { t: 'Materias primas', d: 'Registra cada insumo, la cantidad que trae la presentación y lo que pagaste. Si compras 1.000 g de base de glicerina por $18.000, cada gramo cuesta $18.' },
  { t: 'Productos', d: 'Crea el producto con sus unidades por lote, peso, precio actual y el margen que deseas.' },
  { t: 'Receta', d: 'Dentro del producto, elige los insumos y escribe la cantidad que usas en el lote, en la misma unidad en que los compras.' },
  { t: 'Otros costos', d: 'Suma empaque, etiquetas, consumibles, mano de obra, servicios, transporte y comisiones. Elige “Sí” para sumarlo al costo o “No” para guardarlo como referencia.' },
  { t: 'Resumen', d: 'En Inicio comparas todos tus productos: costo, precio, margen y estado.' },
  { t: 'Simulador', d: 'Prueba otro precio, las unidades que esperas vender y un escenario mayorista sin cambiar tu precio real.' },
  { t: 'Conversiones', d: 'Gramos a cucharadas, gotas a mililitros y porcentajes de formulación.' },
]

const GLOSARIO = [
  { t: 'Costo unitario', d: 'Cuánto cuesta producir una unidad, según los costos registrados (costo del lote ÷ unidades del lote).' },
  { t: 'Utilidad por unidad', d: 'Precio de venta menos costo unitario.' },
  { t: 'Margen', d: 'Utilidad dividida por el precio de venta. Un margen de 60 % significa que de cada $10.000 que vendes, $6.000 te quedan después del costo.' },
  { t: 'Utilidad sobre costo', d: 'Utilidad dividida por el costo unitario. No es lo mismo que el margen: por eso la calculadora muestra ambos.' },
  { t: 'Precio sugerido', d: 'El precio que necesitas para lograr tu margen deseado: costo unitario ÷ (1 − margen deseado).' },
  { t: 'Precio comercial', d: 'El precio sugerido redondeado al siguiente múltiplo de $500 para que sea fácil de cobrar. Es una referencia, no una obligación.' },
  { t: 'Comisiones', d: 'Si en Otros costos eliges “Comisiones” y escribes un %, la calculadora lo estima sola: % × precio actual × unidades del lote.' },
]

const PREGUNTAS = [
  { p: '¿Dónde se guardan mis datos?', r: 'En este navegador, en tu dispositivo. Nadie más los ve. Por eso es importante descargar un respaldo desde “Mis datos” de vez en cuando.' },
  { p: '¿Cómo paso mis datos a otro computador o celular?', r: 'En “Mis datos” descarga el respaldo (.json). En el otro dispositivo entra con tu correo y usa “Restaurar respaldo”.' },
  { p: 'Cambió el precio de un insumo, ¿debo cambiar mis recetas?', r: 'No. Actualiza el precio en Materias primas y todos los productos que lo usan se recalculan solos.' },
  { p: '¿Por qué no puedo eliminar un insumo?', r: 'Porque se usa en alguna receta. Quítalo primero de esas recetas; así evitamos que un producto quede con costos incompletos.' },
  { p: '¿Cuántos productos puedo registrar?', r: 'La versión PRO 1.0 admite hasta 30 productos, 100 insumos y 20 ingredientes por receta.' },
]

export function PaginaAyuda() {
  return (
    <>
      <EncabezadoPagina paso="Ayuda" titulo="Guía de la calculadora" descripcion="Todo lo que necesitas para costear, definir tu precio, simular y decidir." />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <h2 className="mb-3 text-2xl font-semibold">Paso a paso</h2>
          <ol className="flex flex-col gap-2">
            {PASOS.map((p, i) => (
              <li key={p.t} className="flex gap-4 rounded-2xl border border-linea/70 bg-papel p-4">
                <span className="cifra grid size-9 shrink-0 place-items-center rounded-full bg-bosque font-display font-semibold text-papel">{i + 1}</span>
                <div>
                  <h3 className="text-lg font-semibold leading-tight">{p.t}</h3>
                  <p className="mt-1 text-[0.95rem] leading-relaxed text-tinta-suave">{p.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-semibold">Cómo leer los resultados</h2>
          <Tarjeta className="divide-y divide-linea/60">
            {GLOSARIO.map((g) => (
              <div key={g.t} className="px-5 py-3.5">
                <h3 className="font-sans text-base font-bold text-bosque">{g.t}</h3>
                <p className="mt-0.5 text-sm leading-relaxed text-tinta-suave">{g.d}</p>
              </div>
            ))}
          </Tarjeta>
        </section>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-2xl font-semibold">Preguntas frecuentes</h2>
        <div className="flex flex-col gap-2">
          {PREGUNTAS.map((q) => (
            <details key={q.p} className="group rounded-2xl border border-linea/70 bg-papel px-5 py-4 open:shadow-hoja">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold">
                {q.p}
                <ChevronDown className="size-5 shrink-0 text-oliva transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-2 leading-relaxed text-tinta-suave">{q.r}</p>
            </details>
          ))}
        </div>
      </section>

      <Aviso tono="consejo" className="mt-8">
        <strong>Buenas prácticas:</strong> actualiza periódicamente los precios de tus materias primas, trabaja con cantidades y
        rendimientos reales, incluye tu tiempo de trabajo (no es gratis) y revisa tus costos de empaque y venta por canal.
      </Aviso>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Tarjeta className="grano bg-bosque p-6 text-papel">
          <h2 className="text-2xl font-semibold text-papel">Soporte AYRU ORGANIC</h2>
          <p className="mt-1 text-sm text-papel/75">Al escribirnos, indica “Calculadora PRO 1.0” y cuéntanos qué necesitas.</p>
          <ul className="mt-5 flex flex-col gap-3">
            <li>
              <a href={SOPORTE.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-semibold hover:underline">
                <MessageCircle className="size-5 text-kraft" aria-hidden /> WhatsApp {SOPORTE.whatsapp}
              </a>
            </li>
            <li>
              <a href={SOPORTE.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-semibold hover:underline">
                <AtSign className="size-5 text-kraft" aria-hidden /> Instagram {SOPORTE.instagram}
              </a>
            </li>
            <li>
              <a href={`mailto:${SOPORTE.correo}`} className="flex items-center gap-3 font-semibold hover:underline">
                <Mail className="size-5 text-kraft" aria-hidden /> {SOPORTE.correo}
              </a>
            </li>
          </ul>
        </Tarjeta>
        <Tarjeta className="p-6">
          <h2 className="text-2xl font-semibold">Licencia y alcance</h2>
          <p className="mt-3 text-sm leading-relaxed text-tinta-suave">
            Producto digital de AYRU ORGANIC. Licencia para uso personal o interno del comprador. No se autoriza su reventa,
            redistribución, publicación, entrega a terceros ni comercialización total o parcial. La compra corresponde a la versión
            entregada y no incluye compromiso de actualizaciones futuras.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-tinta-suave">
            La calculadora es una herramienta educativa y administrativa. Sus resultados dependen de la información ingresada y no
            sustituyen asesoría contable, tributaria o financiera.
          </p>
        </Tarjeta>
      </div>
      <p className="mt-8 text-center text-xs uppercase tracking-[0.2em] text-tinta-suave">AYRU ORGANIC · Calculadora PRO 1.0 · Versión comercial</p>
    </>
  )
}
