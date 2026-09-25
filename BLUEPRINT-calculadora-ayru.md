# 🗺️ BLUEPRINT: Calculadora de Costos AYRU ORGANIC PRO (web)

> **Estado**: APROBADO (build manual autorizado por el usuario el 2026-09-24)
> **Ruta**: MVP ágil · **Fuente de verdad funcional**: [PDR-calculadora-ayru.md](PDR-calculadora-ayru.md)
> Este documento consolida el Tech Spec, las User Stories, el Design System y el plan por fases.

---

## 1. Stack técnico

| Capa | Decisión |
|---|---|
| Framework | Next.js 16 (App Router, `src/proxy.ts`) + React 19 + TypeScript strict |
| Estilos | Tailwind CSS 3.4 con tokens CSS. Componentes propios ligeros en `src/shared/components/ui` (sin shadcn CLI: evita la dependencia de Radix y cuida el peso de la app) |
| Estado | Zustand 5 + `persist` en `localStorage`, con clave por correo: `ayru-calc:v1:<email>` |
| Validación | Zod 4 (formulario de login, formularios de datos, importación del respaldo) |
| Auth | Lista blanca `ALLOWED_EMAILS` + cookie de sesión firmada con HMAC-SHA256 (`SESSION_SECRET`) usando Web Crypto. Sin Supabase. |
| Exportación | `write-excel-file/browser` (import dinámico) para `.xlsx`. JSON nativo para el respaldo. |
| Iconos | lucide-react |
| Tipografía | `next/font/google`: **Fraunces** (display, serif orgánica, como las piezas de marca) + **Figtree** (texto, muy legible) |
| Tests | Vitest (motor de cálculo contra los valores del Excel) |
| Deploy | Vercel. Variables: `ALLOWED_EMAILS`, `SESSION_SECRET` |

**Removido del scaffold**: `@supabase/*`, `src/lib/supabase`, página `signup` y el placeholder de `dashboard`.

### Variables de entorno
```
ALLOWED_EMAILS=correo1@gmail.com,correo2@hotmail.com   # separados por coma; se ignoran mayúsculas y espacios
SESSION_SECRET=<cadena aleatoria de 32 caracteres o más>
```

---

## 2. Arquitectura

```
src/
├── proxy.ts                         # Protege todo excepto /login y los assets; verifica la cookie y la lista blanca
├── app/
│   ├── layout.tsx                   # Fuentes, metadata, lang="es"
│   ├── globals.css                  # Tokens AYRU
│   ├── (auth)/login/page.tsx        # Acceso por correo
│   └── (main)/
│       ├── layout.tsx               # Lee la sesión → AppShell (navegación) + StoreProvider(email)
│       ├── page.tsx                 # Inicio: bienvenida/onboarding + Panel general + Resumen
│       ├── insumos/page.tsx         # Materias primas
│       ├── productos/page.tsx       # Catálogo
│       ├── productos/[id]/page.tsx  # Ficha: Datos · Receta · Otros costos · Resultado
│       ├── simulador/page.tsx
│       ├── conversiones/page.tsx
│       ├── mis-datos/page.tsx       # Respaldo JSON, restaurar, exportar Excel, ejemplo, borrar
│       └── ayuda/page.tsx           # Guía, margen vs. utilidad, licencia, soporte
├── features/
│   ├── auth/        (services/session.ts, services/allowlist.ts, actions.ts, components/LoginForm.tsx)
│   ├── calculadora/ (lib/calc.ts + calc.test.ts, types/, store/, data/ejemplo-ayru.ts, lib/format.ts, lib/backup.ts, lib/export-xlsx.ts)
│   ├── inicio/      (components/)
│   ├── insumos/     (components/)
│   ├── productos/   (components/)
│   ├── simulador/   (components/)
│   ├── conversiones/(components/)
│   └── mis-datos/   (components/)
└── shared/
    ├── components/ (AppShell, BrandLogo, ui/*)
    └── lib/cn.ts
```

### Modelo de datos (navegador)
```ts
interface Insumo       { id; codigo: 'MP001'; nombre; unidad; cantidadComprada; precioCompra; proveedor; fechaActualizacion; ejemplo? }
interface Producto     { id; codigo: 'P01'; nombre; unidadesLote; pesoLote; pesoUnidad: number|null; canal; precioActual; margenDeseado; ejemplo? }
interface LineaReceta  { id; productoId; insumoId; cantidad; observacion }
interface OtroCosto    { id; productoId; concepto; detalle; costoUnidad; cantidadFactor; sumar: boolean; porcentajeVentas; observaciones }
interface Libro        { insumos; productos; recetas; otrosCostos; simulador; conversiones; tablaCucharadas; meta{ onboarded; ultimoCambio; ultimoRespaldo } }
```
- Los cálculos **no se guardan**: se derivan con funciones puras de `calc.ts`.
- Límites: 30 productos · 100 insumos · 20 ingredientes por producto · 240 otros costos en total.
- Códigos: se asigna el menor número libre (P01–P30, MP001–MP100).
- Borrar un producto borra su receta y sus otros costos. Borrar un insumo en uso se bloquea y se muestra en qué productos está.

### Auth (flujo)
1. `/login`: el formulario llama a la server action `iniciarSesion(email)` → Zod valida → normaliza (`trim().toLowerCase()`) → verifica contra `ALLOWED_EMAILS`.
2. Si el correo está autorizado se crea la cookie `ayru_session = base64url({e,exp}).firma` (httpOnly, sameSite=lax, secure en producción, 30 días) y se redirige a `/`.
3. Si no está autorizado, se muestra un mensaje genérico con los contactos de soporte.
4. `proxy.ts`: verifica la firma, la expiración **y** que el correo siga en la lista; si falla, redirige a `/login`. Quitar un correo de la lista revoca su acceso.
5. `(main)/layout.tsx` vuelve a verificar la sesión en el servidor (defensa en profundidad) y entrega el correo al cliente.
6. "Salir": una server action borra la cookie.

---

## 3. Design System AYRU

**Dirección**: *Botánica artesanal*. Papel lino cálido, verde bosque profundo, títulos serif
orgánicos y detalles de hoja o etiqueta kraft. Tranquilo, confiable y humano: una libreta de
taller bonita, no una hoja de cálculo.

| Token | Valor | Uso |
|---|---|---|
| `--bosque` | `#1C4618` | Primario: botones, navegación activa, encabezados |
| `--bosque-900` | `#12300F` | Hover y texto sobre claro |
| `--oliva` | `#5C6D37` | Secundario: títulos de sección, iconos |
| `--salvia` | `#E3ECD6` | Superficie de **resultados automáticos** (código visual "celdas verdes") |
| `--lino` | `#F5ECDE` | Fondo de la app |
| `--papel` | `#FBF7EF` | Tarjetas |
| `--kraft` | `#E6CFB4` | Acento de **campos de captura** (código visual "celdas crema") |
| `--canela` | `#A86E40` | Acento, alertas suaves, "¿Sumar al costo?" |
| `--arcilla` | `#9C3B24` | Error y estado "bajo costo" |
| `--tinta` | `#212714` | Texto |
| `--tinta-suave` | `#5B5E4C` | Texto secundario |

- Base de 17 px en móvil y 16 px en escritorio. Objetivos táctiles de 44 px o más. Contraste AA.
- Estados: OK = bosque/salvia · Por debajo del sugerido = canela · Bajo costo = arcilla · Sin precio = gris cálido.
- Números: `tabular-nums`, COP `$ 12.000`, porcentajes `64,3 %`.
- Navegación: barra inferior en móvil (Inicio · Insumos · Productos · Simulador · Más) y barra lateral en escritorio.
- Movimiento: una entrada escalonada por página, transiciones de 150–200 ms y `prefers-reduced-motion` respetado.

---

## 4. User Stories

**Epic A — Acceso**
- **US-01** Como comprador, quiero entrar solo con mi correo para no recordar contraseñas.
  *AC*: si el correo está autorizado entro a Inicio; si no, veo un mensaje amable con WhatsApp y correo de soporte; la sesión dura 30 días; puedo salir.
- **US-02** Como AYRU, quiero controlar quién entra con una lista en el entorno.
  *AC*: un correo que no está en `ALLOWED_EMAILS` no pasa aunque tenga una cookie antigua.

**Epic B — Calculadora**
- **US-03** Materias primas: crear, editar, buscar y eliminar insumos, viendo el costo por g/ml/unidad al instante. *AC*: 1000 g a $18.000 → $18/gr; máximo 100; si el insumo está en uso, no se deja borrar.
- **US-04** Productos: crear y editar productos con lote, peso, canal, precio y margen. *AC*: margen entre 0 % y 95 %; máximo 30; peso/unidad sugerido.
- **US-05** Receta: agregar ingredientes eligiendo el insumo por nombre. *AC*: unidad automática; costo y % del lote visibles; máximo 20 por producto; un cambio de precio en el insumo se refleja solo.
- **US-06** Otros costos: agregar gastos con "¿Sumar al costo?" y comisión porcentual. *AC*: se cumplen las reglas 5.3 del PDR.
- **US-07** Resultado del producto: ver costo del lote, costo unitario, precio sugerido, precio comercial, utilidad, margen, utilidad sobre costo y estado. *AC*: valores del PDR 5.9.
- **US-08** Inicio: Panel general (4 indicadores) + resumen de todos los productos con estado.
- **US-09** Simulador: elegir producto, probar precio y unidades, comparar 5 escenarios y el escenario mayorista, sin alterar el producto. *AC*: valores del PDR 5.9.
- **US-10** Conversiones: gramos ↔ cucharadas, gotas ↔ ml, % de fórmula y tabla personal de cucharadas.

**Epic C — Mis datos**
- **US-11** Onboarding: primera visita con "Empezar en blanco" o "Cargar ejemplo AYRU"; el ejemplo se puede quitar.
- **US-12** Respaldo: descargar `.json`, restaurarlo con vista previa y confirmación, y ver cuándo fue el último respaldo.
- **US-13** Exportar a Excel (`.xlsx`) insumos, productos, recetas, otros costos y resumen.
- **US-14** Ayuda: guía paso a paso, glosario (margen vs. utilidad sobre costo, precio comercial), licencia y soporte.

---

## 5. Fases

| Fase | Nombre | Entregable | Stories |
|---|---|---|---|
| F1 | Fundaciones | Limpieza del scaffold, tokens, fuentes, logo, env, auth completa, AppShell | US-01, US-02 |
| F2 | Motor de cálculo | Tipos, `calc.ts` puro, dataset de ejemplo generado desde el Excel, tests de paridad en verde | base de US-03 a US-10 |
| F3 | Store y datos | Zustand persistido por correo, acciones CRUD con límites, respaldo, importación y exportación xlsx | US-11, US-12, US-13 |
| F4 | Pantallas de captura | Insumos, Productos, Ficha (Receta y Otros costos) | US-03 a US-07 |
| F5 | Pantallas de análisis | Inicio (Panel y Resumen), Simulador, Conversiones, Mis datos, Ayuda | US-08 a US-14 |
| F6 | Validación | typecheck, lint, tests, build, prueba en navegador (móvil y escritorio), README y `.env.example` | todas |

### Criterios de aceptación globales
- [x] `npm run test`: paridad con el Excel (tolerancia 0,01) en productos, resumen, panel, simulador y conversiones.
- [x] `npm run typecheck`, `npm run lint` y `npm run build` sin errores.
- [x] Login: el correo autorizado entra, el no autorizado se rechaza y el acceso sin cookie redirige a `/login`.
- [x] Flujo completo en 360 px sin scroll horizontal en las vistas principales.
- [x] Respaldo exportado → borrar datos → importar → datos idénticos.
- [~] Ningún `any` y archivos de 500 líneas o menos ✅ · funciones de 50 líneas o menos: se cumple en lógica y utilidades; 20 componentes JSX quedan entre 51 y 93 líneas

---

## Changelog
- 2026-09-24 · v1.1 · MVP construido (F1–F6). 34 tests unitarios + 72 verificaciones E2E (escritorio 1440 px y móvil 360 px) en verde.
- 2026-09-24 · v1.0 · Blueprint inicial a partir del PDR aprobado.
