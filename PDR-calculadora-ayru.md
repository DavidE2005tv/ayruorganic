# 📋 PDR: Calculadora de Costos AYRU ORGANIC PRO (versión web)

> **Product Definition Report**
> **Estado**: BORRADOR
> **Fecha**: 2026-09-24
> **Versión**: 1.0
> **Fuentes**: `CALCULADORA_COSTOS_AYRU_ORGANIC_PRO_1_0_COMERCIAL.xlsx` (11 hojas) · `Manual_Usuario_Calculadora_AYRU_ORGANIC_PRO_1_0_FINAL.pdf` · piezas de marca (logo, Tónico Capilar, Ambientadores)

---

## 1. Problema de Negocio

### El Dolor
Los emprendedores de jabonería y cosmética artesanal fijan precios "a ojo". Olvidan costos
que no están en la fórmula (empaque, etiquetas, mano de obra, servicios, comisiones) y no
saben si un producto deja ganancia o pérdida. AYRU ORGANIC ya resolvió el cálculo con una
plantilla Excel comercial (PRO 1.0), pero el público objetivo **no es tecnológico** y la
plantilla le exige:

- Navegar 11 hojas y entender en qué orden llenarlas.
- Manejar códigos internos (`P01`, `MP001`) y listas desplegables.
- Distinguir celdas de captura (crema) de celdas protegidas (verdes).
- Escribir a mano la unidad en cada línea de receta, sin validación.
- Usar Excel o Google Sheets en el celular, donde la experiencia es mala.

### El Costo
- Errores de captura que el Excel no detecta. Por ejemplo, el Excel de muestra tiene fragancias
  compradas en "gr" y usadas en "ml" dentro de la receta, y la matemática las trata igual.
- Consultas de soporte por WhatsApp sobre "cómo se usa" en vez de "qué decisión tomo".
- Compradores que abandonan la herramienta antes de costear su primer producto.

### Situación Actual
Se vende una plantilla `.xlsx` protegida junto con un manual PDF de 4 páginas. El soporte es
por Instagram (@ayruorganic_), WhatsApp (314 682 9261) y correo (ayruorganic@gmail.com).

---

## 2. Propuesta de Valor

### En Una Frase
> Una calculadora web, con la calidez de la marca AYRU, que le dice al emprendedor artesanal
> cuánto le cuesta cada producto y a qué precio venderlo, sin que tenga que saber de Excel.

### Flujo Principal (Happy Path)
1. El usuario abre la web y escribe su correo. El sistema verifica que esté en la lista de
   compradores autorizados y lo deja entrar.
2. La primera vez ve una bienvenida con los pasos y dos opciones: **empezar en blanco** o
   **cargar el ejemplo AYRU**.
3. **Materias primas**: registra cada insumo con nombre, unidad de compra, cantidad comprada y
   precio. El sistema calcula el costo por g, ml o unidad.
4. **Productos**: crea un producto con nombre, unidades por lote, peso del lote, canal de venta,
   precio actual y margen deseado.
5. **Receta**: dentro del producto, agrega ingredientes eligiendo el insumo por nombre y
   escribiendo la cantidad. El sistema muestra el costo de cada ingrediente y el % del lote.
6. **Otros costos**: dentro del producto, agrega empaque, etiqueta, mano de obra, etc. Para cada
   uno indica "¿Sumar al costo? Sí/No".
7. El sistema muestra al instante el costo del lote, el costo unitario, el precio sugerido, el
   precio comercial, el margen actual y el estado ("OK", "Por debajo del sugerido", etc.).
8. **Resumen / Panel**: compara todos sus productos y ve las alertas.
9. **Simulador**: elige un producto, prueba precios y cantidades, y compara escenarios, incluido
   el mayorista.
10. **Respaldo**: descarga su copia de seguridad o un Excel con el resumen.

### Flujos Alternativos
- **Correo no autorizado**: mensaje amable con el WhatsApp o correo de soporte AYRU para
  adquirir acceso. Nunca revela qué correos existen.
- **Cambio de dispositivo**: en el equipo nuevo el usuario entra con su correo, carga el archivo
  de respaldo `.json` y recupera todo.
- **Precio de un insumo cambia**: lo edita en Materias primas y todos los productos que lo usan
  se recalculan solos.
- **Borrar un insumo usado en recetas**: el sistema avisa en qué productos se usa y pide
  confirmación. En el Excel la regla era "No borres códigos ya utilizados".
- **Límite alcanzado** (30 productos, 100 insumos, 20 ingredientes por receta): aparece un
  mensaje claro y el botón "Agregar" queda deshabilitado.
- **Navegador sin almacenamiento** (modo incógnito o datos borrados): aviso visible de que los
  datos no se guardarán y sugerencia de descargar el respaldo.

---

## 3. Usuario Objetivo

### Persona Principal
- **Rol**: emprendedor o emprendedora de jabonería y cosmética artesanal que compró la
  Calculadora PRO a AYRU ORGANIC.
- **Contexto**: produce por lotes en casa o en un taller pequeño y vende directo, en ferias, por
  mayor o en talleres. Quiere saber si su precio cubre sus costos.
- **Nivel técnico**: **no-tech**. Usa WhatsApp e Instagram con soltura, pero le intimidan las
  hojas de cálculo.
- **Dispositivo principal**: **ambos**. Carga datos en el computador y consulta o simula en el
  celular. El diseño debe ser mobile-first.
- **Frecuencia de uso**: semanal al empezar (carga inicial) y luego eventual, cuando cambia un
  precio de compra o se crea un producto.

### Personas Secundarias
- **Administrador AYRU**: no usa la app como tal. Gestiona la lista de correos autorizados en
  la variable de entorno del despliegue.

### TAM Estimado
Hasta unos 50 compradores autorizados en esta fase (lista en variable de entorno).

---

## 4. Arquitectura de Datos

### Input — Qué entra al sistema
| Dato | Tipo | Fuente | Obligatorio |
|------|------|--------|-------------|
| Correo electrónico | Texto | Formulario de acceso | Sí |
| Insumo (nombre, unidad de compra, cantidad comprada, precio, proveedor, fecha) | Formulario | Usuario | Nombre, unidad, cantidad y precio |
| Producto (nombre, unidades/lote, peso lote, peso/unidad, canal, precio actual, margen deseado) | Formulario | Usuario | Nombre, unidades y margen |
| Línea de receta (producto, insumo, cantidad, observación) | Formulario | Usuario | Insumo y cantidad |
| Otro costo (producto, concepto, detalle, costo por unidad/base, cantidad o factor, ¿sumar?, % sobre ventas, observaciones) | Formulario | Usuario | Concepto y ¿sumar? |
| Parámetros del simulador (precio a probar, unidades, precio y unidades mayoristas) | Formulario | Usuario | No (tienen valores por defecto) |
| Conversiones (gramos, g por cucharada, gotas, gotas/ml, ml, peso fórmula, %) | Formulario | Usuario | No |
| Tabla personal de cucharadas (ingrediente, g por cucharada, fecha, observación) | Formulario | Usuario | No |
| Archivo de respaldo | Archivo `.json` | Dispositivo del usuario | No |

### Output — Qué sale del sistema
| Dato | Tipo | Destino | Formato |
|------|------|---------|---------|
| Costos y precios por producto | Pantalla | Usuario | Tarjetas y tabla, moneda COP sin decimales |
| Resumen de todos los productos con estado | Dashboard | Usuario | Tabla o tarjetas con color por estado |
| Panel general (4 indicadores) | Dashboard | Usuario | KPIs |
| Escenarios del simulador | Pantalla | Usuario | Tabla comparativa y mayorista |
| Respaldo completo | Archivo | Dispositivo | `.json` versionado |
| Reporte | Archivo | Dispositivo | `.xlsx` (Materias primas, Productos, Resumen) |

### Entidades Principales (Modelo Conceptual)
| Entidad | Descripción | Relaciones |
|---------|-------------|------------|
| Usuario | Correo autorizado. Sin perfil ni contraseña. | Es dueño de un único "Libro" de datos |
| Materia prima | Insumo con costo por unidad derivado | Usada por N líneas de receta |
| Producto | Referencia comercial con lote, precio y margen | Tiene N líneas de receta y N otros costos |
| Línea de receta | Cantidad de un insumo en un producto | Pertenece a 1 producto y apunta a 1 materia prima |
| Otro costo | Gasto no-fórmula de un producto | Pertenece a 1 producto |
| Escenario de simulador | Parámetros temporales de prueba | Referencia 1 producto. No modifica el producto. |
| Referencia de cucharada | Fila de la tabla personal de conversiones | Independiente |

---

## 5. Reglas de Cálculo (fuente de verdad: Excel PRO 1.0)

> La web debe producir **exactamente** los mismos resultados que el Excel. Todas las divisiones
> usan el equivalente a `IFERROR(...,0)`: si el divisor es 0 o falta, el resultado es 0.

### 5.1 Materias primas
- `costoUnitarioInsumo = precioCompra / cantidadComprada`

### 5.2 Recetas (por línea)
- `costoUnitarioInsumo` = el de la materia prima elegida.
- `costoUtilizado = cantidadUsada × costoUnitarioInsumo`
- `% del lote = cantidadUsada / pesoLote(producto)`
- `unidad` = la unidad de compra del insumo. **Cambio vs Excel**: allí era texto libre; aquí se
  toma sola y no se puede editar.

### 5.3 Otros costos (por línea)
- `costoComisionAuto = SI(concepto = "Comisiones" Y sumar = Sí) → %sobreVentas × precioActual(producto) × unidadesLote(producto); si no → 0`
- `costoTotal = SI(sumar = Sí) → (SI(concepto = "Comisiones" Y %sobreVentas > 0) → costoComisionAuto; si no → costoPorUnidad × cantidadFactor); si no → 0`
- Conceptos: Empaque, Etiqueta, Consumibles, Mano de obra, Servicios, Transporte / prorrateo,
  Comisiones, Otros.

### 5.4 Productos
- `costoMateriasPrimas = Σ costoUtilizado` de sus líneas de receta
- `otrosCostos = Σ costoTotal` de sus otros costos
- `costoTotalLote = costoMateriasPrimas + otrosCostos`
- `costoUnitario = costoTotalLote / unidadesLote`
- `precioSugerido = costoUnitario / (1 − margenDeseado)`
- `utilidadSobreCosto = (precioActual − costoUnitario) / costoUnitario`
- `precioComercial = REDONDEAR.MAS(precioSugerido / 500) × 500`, es decir, el siguiente múltiplo
  de $500 hacia arriba.
- Canales: Venta directa, Feria, Mayorista, Taller / experiencia, Otro.
- Margen deseado por defecto para productos nuevos: 40 %.

### 5.5 Resumen de productos
- `utilidadPorUnidad = precioActual − costoUnitario`
- `margenActual = utilidadPorUnidad / precioActual`
- `diferenciaPrecio = precioActual − precioSugerido`
- `estado`:
  - Sin nombre → vacío
  - `precioActual = 0` → **"Sin precio"**
  - `precioActual < costoUnitario` → **"Revisar: bajo costo"**
  - `precioActual < precioSugerido` → **"Por debajo del sugerido"**
  - Cualquier otro caso → **"OK"**

### 5.6 Panel general
- Productos registrados = productos con nombre
- Productos con precio actual = productos con `precioActual > 0`
- Productos bajo costo = cantidad con estado "Revisar: bajo costo"
- Productos bajo precio sugerido = cantidad con estado "Por debajo del sugerido"

### 5.7 Simulador (para el producto seleccionado)
- Trae: costo unitario, precio actual, margen deseado y precio sugerido.
- `margenActual = (precioActual − costoUnitario) / precioActual`
- `precioAProbar` por defecto = precio sugerido (editable)
- `unidadesAVender` por defecto = 50
- Resultados del escenario:
  - `ingresos = precioAProbar × unidades`
  - `costoEstimado = costoUnitario × unidades`
  - `utilidadEstimada = ingresos − costoEstimado`
  - `utilidadPorUnidad = precioAProbar − costoUnitario`
  - `margenEscenario = utilidadPorUnidad / precioAProbar`
  - `diferenciaVsActual = precioAProbar − precioActual`
- Comparador (5 filas): Precio actual · −5 % del actual (`×0,95`) · Precio a probar · +5 % de la
  prueba (`×1,05`) · Precio sugerido. Cada fila muestra precio, costo unitario, utilidad por
  unidad, margen, unidades, ingresos y utilidad total.
- Mayorista:
  - `precioMayorista` por defecto = `precioSugerido × 0,85` (editable)
  - `unidadesMayoristas` por defecto = 12
  - `ingresoMayorista = precioMayorista × unidades`
  - `utilidadMayorista = (precioMayorista − costoUnitario) × unidades`
- Los cambios en el simulador **no modifican** el producto.

### 5.8 Conversiones
- Cucharadas = gramos / gPorCucharada (por defecto 10 g y 15 g/cda) · Cucharaditas = cucharadas × 3
- ml = gotas / gotasPorMl (por defecto 20 gotas y 20 gotas/ml) · Gotas = ml × gotasPorMl
  (por defecto 1 ml)
- Cantidad = pesoFórmula × % (por defecto 500 g y 1,5 % → 7,5 g)

### 5.9 Valores de verificación (dataset de ejemplo del Excel)
| Producto | Costo MP | Otros | Costo lote | Costo unit. | Sugerido | Comercial | Margen actual | Estado |
|---|---|---|---|---|---|---|---|---|
| Jabón de Café | 34.301,48 | 21.368 | 55.669,48 | 4.639,12 | 11.597,81 | 12.000 | 64,31 % | OK |
| Jabón de Miel y Avena | 29.184,67 | 21.368 | 50.552,67 | 4.212,72 | 10.531,81 | 11.000 | 67,59 % | OK |
| Jabón de Mentol | 47.625,33 | 19.784 | 67.409,33 | 5.617,44 | 14.043,61 | 14.500 | 62,55 % | OK |
| Jabón de Almendras | 0 | 0 | 0 | 0 | 0 | 0 | 0 % | Sin precio |

Panel: 4 registrados · 3 con precio · 0 bajo costo · 0 bajo sugerido.
Simulador (Miel y Avena, 50 u.): ingresos 526.590,28 · utilidad 315.954,17 · mayorista
8.952,03 × 12 → utilidad 56.871,75.

---

## 6. KPIs de Éxito

### Métrica Principal
**Paridad del 100 % con el Excel**: con el dataset de ejemplo, todas las cifras de la sección 5.9
coinciden (tolerancia ±0,01).

### Métricas Secundarias
- Una persona no técnica costea su primer producto completo (insumos, receta, otros costos y
  precio sugerido) en **menos de 15 minutos**, sin leer el manual.
- La app se usa cómodamente en un celular de 360 px de ancho, sin scroll horizontal en las
  vistas principales.
- Bajan las consultas de soporte del tipo "cómo se usa" frente a la versión Excel (medición
  cualitativa de AYRU).

---

## 7. Modelo de Negocio

### Monetización
Producto digital de AYRU ORGANIC vendido a emprendedores. La compra da acceso con el correo del
comprador. Licencia de uso personal o interno. No incluye actualizaciones futuras. El cobro
ocurre **fuera** de la app (canales actuales de AYRU).

### Competencia
| Competidor | Qué hacen | Nuestra diferencia |
|------------|-----------|-------------------|
| La propia plantilla Excel PRO 1.0 | Mismo cálculo en hoja de cálculo | Guiada, mobile-first, sin fórmulas visibles y con validación |
| Plantillas genéricas de costeo | Costeo general, no especializado | Pensada para jabonería (lotes, % del lote, conversiones de gotas y cucharadas) |

### Pricing Tentativo
Lo define AYRU. Queda fuera del alcance técnico de este proyecto.

---

## 8. Alcance del MVP (Fase 1)

### Features Core (Debe tener)
1. **Acceso por correo autorizado**: sin contraseña y sin servicio de autenticación externo. La
   lista de correos vive en una variable de entorno del despliegue (menos de 50 correos).
2. **Calculadora completa con paridad Excel**: Materias primas, Productos (con Receta y Otros
   costos dentro de cada producto), Resumen y Panel, Simulador y Conversiones, con las reglas de
   la sección 5.
3. **Datos en el navegador + respaldo**: guardado automático en el navegador, separado por
   correo. Respaldo `.json` para descargar y cargar, y exportación a `.xlsx` del resumen.

Incluido dentro de lo anterior:
- Onboarding: bienvenida con los pasos, "Empezar en blanco" o "Cargar ejemplo AYRU" (los 43
  insumos y los 4 productos del Excel), y opción para borrar el ejemplo.
- Ayuda contextual en lenguaje simple (contenido de las hojas AYUDA, LEEME e INICIO y del
  manual), incluida la explicación de "margen vs. utilidad sobre costo".
- Pie con licencia y datos de soporte AYRU.
- Límites PRO 1.0: 30 productos, 100 insumos, 20 ingredientes por receta. En "Otros costos" no
  hay límite por producto en el Excel (240 líneas en total). Se aplica un máximo equivalente de
  240 líneas.
- Identidad visual AYRU: logo y paleta extraída de las piezas de marca.

### Features Diferidas (Fase 2+)
- Sincronización en la nube (base de datos) para usar el mismo usuario en varios dispositivos
  sin pasar el archivo de respaldo.
- Panel de administración para agregar o quitar correos sin redesplegar.
- Importar el `.xlsx` de un comprador que ya tiene la plantilla llena.
- Versión "ilimitada" (sin los límites PRO 1.0) como producto superior.
- Imprimir o descargar la ficha de costo de un producto en PDF.
- Historial de precios de materias primas.

### Explícitamente Fuera de Alcance
- Registro de cuentas, contraseñas, magic links o verificación por correo: el acceso es solo por
  lista blanca.
- Pagos dentro de la app.
- Conversión automática entre unidades (g ↔ ml) en recetas: el Excel no la hace y cambiaría los
  resultados.
- Multi-idioma: solo español.
- Asesoría contable o tributaria: la app lo aclara en el pie.

---

## 9. Consideraciones Especiales

### Requisitos No Funcionales
- **Autenticación**: sí. Lista blanca de correos (`ALLOWED_EMAILS` en el entorno), comparación
  sin distinguir mayúsculas y sin espacios. La sesión se guarda en una cookie firmada, httpOnly
  y con expiración larga (por ejemplo, 30 días). Hay botón "Salir".
- **Roles/Permisos**: ninguno. Todos los usuarios autorizados son iguales.
- **Pagos/Billing**: no.
- **Datos sensibles**: bajos. El único dato personal es el correo, y los datos de costos se
  quedan en el dispositivo del usuario, no en el servidor.
- **Integraciones**: ninguna externa.
- **Multi-idioma**: no (es-CO).
- **Formato**: moneda COP (`$ 12.000`) sin decimales en pantalla, pero con precisión completa en
  el cálculo. Porcentajes con 1 decimal. Separador de miles "." y decimal ",".
- **Multi-tenant**: no en servidor. En el navegador los datos se separan por correo.
- **Offline**: los cálculos funcionan sin conexión una vez cargada la página. No se exige PWA.
- **Accesibilidad**: tipografía grande (base de 16 px o más), buen contraste, objetivos táctiles
  de 44 px o más y etiquetas en lenguaje cotidiano.

### Restricciones Conocidas
- Los datos viven en el navegador: si el usuario borra los datos del navegador sin haber
  descargado un respaldo, los pierde. Se mitiga con recordatorios de respaldo.
- Para agregar o quitar un correo autorizado hay que editar la variable de entorno y
  redesplegar.
- Los resultados deben coincidir con el Excel aunque este tenga particularidades (por ejemplo,
  sin conversión de unidades).

### Riesgos Identificados
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Pérdida de datos por limpiar el navegador o cambiar de equipo | Alto | Aviso visible de "último respaldo", recordatorio tras cambios importantes y respaldo en 1 clic |
| Divergencia de cálculos respecto al Excel | Alto | Motor de cálculo puro con tests contra los valores de la sección 5.9 |
| Correo compartido entre varias personas (reventa del acceso) | Medio | La licencia lo prohíbe. En Fase 2 se puede limitar por dispositivo o sesión. |
| Margen deseado ≥ 100 % produce precio infinito o negativo | Medio | Validar el margen entre 0 % y 95 % con mensaje explicativo |
| Archivo de respaldo corrupto o editado a mano | Medio | Validación estricta al importar, con vista previa antes de reemplazar |
| Usuario no técnico se pierde en la navegación | Medio | Flujo guiado de 3 pasos, estados vacíos que explican qué hacer y ejemplo AYRU |

---

## 10. Gaps Identificados y Recomendaciones

- **Unidades en recetas**: el Excel permite escribir cualquier unidad en la receta sin afectar
  el cálculo. La web muestra la unidad de compra del insumo, para que el usuario escriba la
  cantidad en esa misma unidad. Se agrega una ayuda: "Escribe la cantidad en la misma unidad en
  que compraste el insumo".
- **Peso por unidad**: en el Excel es manual. En la web se sugiere `pesoLote / unidades`, pero
  se puede editar. No afecta ningún cálculo.
- **Productos identificados por nombre en el simulador**: en el Excel, dos productos con el
  mismo nombre chocan. En la web se identifican internamente por ID y se avisa si hay nombres
  repetidos.
- **Borrado de insumos**: el Excel solo lo advierte en el manual. La web impide el borrado
  silencioso de un insumo en uso.
- **Códigos P01 y MP001**: se generan de forma automática y consecutiva y se muestran de forma
  discreta (sirven en el `.xlsx` exportado), pero el usuario nunca tiene que escribirlos.

---

## 11. Próximos Pasos (Pipeline MVP)

1. ✅ **PDR**: este documento
2. ⬜ **Tech Spec**: stack, modelo de datos en el navegador, auth por lista blanca, motor de cálculo
3. ⬜ **User Stories**: 1-2 epics, historias con criterios de aceptación
4. ⬜ **UI**: design system AYRU y pantallas core
5. ⬜ **Blueprint**: plan de construcción

---

*PDR generado con el pipeline La Herrería · Ruta MVP ágil*
*Pendiente aprobación antes de avanzar al Tech Spec*
