# Calculadora de Costos · AYRU ORGANIC PRO 1.0 (web)

Versión web de la plantilla Excel **Calculadora de Costos AYRU ORGANIC PRO 1.0**. Hace los mismos cálculos y usa las mismas
fórmulas, con una interfaz pensada para emprendedores de jabonería artesanal que no son técnicos.

- **Acceso** solo con el correo, que debe estar en una lista blanca. No hay contraseñas ni servicio externo de autenticación.
- **Datos** guardados en el navegador de cada persona, separados por correo, con respaldo `.json` y exportación a `.xlsx`.
- **Paridad con el Excel** comprobada con tests contra los valores de `docs/referencia/CALCULADORA_COSTOS_AYRU_ORGANIC_PRO_1_0_COMERCIAL.xlsx`.

Documentos de producto: [PDR-calculadora-ayru.md](PDR-calculadora-ayru.md) · [BLUEPRINT-calculadora-ayru.md](BLUEPRINT-calculadora-ayru.md)

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # completa ALLOWED_EMAILS y SESSION_SECRET
npm run dev
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm test` | Tests de paridad con el Excel (Vitest) |
| `npm run typecheck` | TypeScript estricto |
| `npm run lint` | ESLint (config de Next.js) |

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ALLOWED_EMAILS` | Correos autorizados, separados por coma. Se ignoran mayúsculas y espacios. |
| `SESSION_SECRET` | Mínimo 32 caracteres. Genera uno con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Dar o quitar acceso

1. En Vercel, abre **Settings → Environment Variables** y edita `ALLOWED_EMAILS`.
2. Redespliega el proyecto.

Al quitar un correo de la lista, esa persona pierde el acceso en su siguiente visita, aunque su sesión no haya expirado.

## Despliegue en Vercel

1. Importa el repositorio en Vercel (framework: Next.js).
2. Configura `ALLOWED_EMAILS` y `SESSION_SECRET` en Production (y en Preview, si la usas).
3. Despliega. La sesión dura 30 días y la cookie es `httpOnly`, `secure` y `sameSite=lax`.

## Arquitectura

```
src/
├── proxy.ts                     # Protege todas las rutas (Next 16: antes "middleware")
├── app/(auth)/login             # Acceso por correo
├── app/(main)/...               # Inicio, insumos, productos/[id], simulador, conversiones, mis-datos, ayuda
├── features/
│   ├── auth/                    # Lista blanca, sesión firmada (HMAC-SHA256), server actions
│   ├── calculadora/             # Motor de cálculo puro, tipos, esquemas Zod, store Zustand, datos de ejemplo
│   └── insumos | productos | simulador | conversiones | inicio | mis-datos | ayuda
└── shared/                      # AppShell, componentes UI con la marca AYRU
```

- **Motor de cálculo**: `src/features/calculadora/lib/calc.ts` y `simulador.ts`, con funciones puras. Cada una documenta la
  celda del Excel que replica. Todas las divisiones siguen la semántica `IFERROR(...;0)`.
- **Datos de ejemplo**: `src/features/calculadora/data/ejemplo-ayru.ts` se generó desde el Excel (43 insumos y 4 productos).
- **Límites PRO 1.0**: 30 productos, 100 insumos, 20 ingredientes por receta y 240 otros costos.

## Soporte AYRU ORGANIC

Instagram [@ayruorganic_](https://instagram.com/ayruorganic_) · WhatsApp 314 682 9261 · ayruorganic@gmail.com
