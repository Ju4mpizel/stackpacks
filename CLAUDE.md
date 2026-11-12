# StackPacks — guía del proyecto

> Coleccionable de cartas para aprender desarrollo. Cada día abres sobres, cada carta es un tema corto
> (resumen + ejemplo + link a documentación) y al estudiarla "evoluciona". Completar series desbloquea
> tecnologías más avanzadas en un árbol de tecnologías.

Inspirado en la **mecánica** de los juegos de cartas coleccionables digitales. **No usar** nombres, logos,
personajes, arte ni tipografías de Pokémon ni de ninguna otra franquicia. Todo el arte y la marca son propios.

---

## 1. Stack

- **Next.js (App Router, última versión estable) con JavaScript**, sin TypeScript. Usar `.jsx`/`.js`.
- **pnpm** como gestor de paquetes.
- **Tailwind CSS v4** (configuración con `@theme` en `globals.css`, sin `tailwind.config.js`).
- **Zustand** con el middleware `persist` (localStorage) para el progreso del usuario.
- **Motion** (`motion/react`, antes Framer Motion) para abrir sobres, girar cartas y desbloquear nodos.
- **Iconos de tecnologías**: `simple-icons` o Devicons en SVG. Iconos de UI: `lucide-react`.
- Sin backend en el MVP. Todo el contenido está en JSON dentro de `/data`.
- Deploy pensado para Vercel.

### Reglas de Next.js para este proyecto
- Las páginas de contenido (árbol, serie, detalle de carta) son **Server Components** que leen el JSON
  y se generan estáticas (`generateStaticParams`).
- Todo lo que usa progreso, localStorage o animación es **Client Component** (`"use client"`), y debe
  ser lo más pequeño posible (islas).
- **Evitar errores de hidratación**: el store persistido se lee solo después de montar. Crear un hook
  `useHydrated()` y mostrar un skeleton hasta que sea `true`. Nunca leer `localStorage` durante el render en servidor.
- Usar `next/font` para las fuentes y `next/image` solo para imágenes raster (las cartas son SVG/CSS).

---

## 2. Árbol de tecnologías

```
NIVEL 0 · Fundamentos (abiertas desde el inicio)
  html · css · javascript · python · git · sql

NIVEL 1
  typescript ← javascript
  tailwind   ← css
  nodejs     ← javascript
  php        ← html

NIVEL 2
  react      ← html + css + javascript
  laravel    ← php + sql + html
  supabase   ← sql + javascript
  angular    ← typescript + html + css
  django     ← python + sql

NIVEL 3
  nextjs     ← react + nodejs
```

**Una serie está completada** cuando **todas** sus cartas están *evolucionadas* (no basta con obtenerlas).
Una serie se desbloquea cuando todas las series de `requires` están completadas.

Cada serie solo tiene temas **propios**: React no repite HTML ni JS, porque ya son requisito.

---

## 3. Modelo de datos

```
/data
  series.json             // lista de series y su lugar en el árbol
  cards/html.json         // cartas de cada serie
  cards/css.json
  ...
```

```js
// series.json (un elemento)
{
  "id": "laravel",
  "name": "Laravel",
  "tier": 2,
  "requires": ["php", "sql", "html"],
  "color": "#FF5A5F",          // color de acento de la serie
  "icon": "laravel",           // slug de simple-icons
  "status": "available"        // "available" | "coming-soon"
}
```

```js
// cards/javascript.json (un elemento)
{
  "id": "js-fetch",
  "seriesId": "javascript",
  "title": "Fetch API",
  "category": "Asincronía",     // agrupa las barras de progreso dentro de la serie
  "stage": 4,                  // orden pedagógico dentro de la serie (1..n)
  "rarity": "legendary",       // common | uncommon | rare | epic | legendary
  "summary": "fetch() pide datos a un servidor y devuelve una Promesa con la respuesta.",
  "keyPoints": ["Devuelve una Promise", "Hay que llamar a res.json()", "No falla con 404: revisa res.ok"],
  "example": "const res = await fetch(url);\nconst data = await res.json();",
  "docUrl": "https://developer.mozilla.org/es/docs/Web/API/Fetch_API",
  "docLabel": "MDN — Fetch API",
  "glyph": "plug",             // icono lucide que se usa en el arte de la carta
  "quiz": [
    { "q": "¿Qué devuelve fetch()?", "options": ["Un objeto JSON", "Una Promise", "Un string"], "answer": 1 }
  ]
}
```

**Rareza = importancia o impacto del tema**, no lo difícil que es conseguirlo.
- common: sintaxis básica (etiquetas, variables)
- uncommon: piezas de uso diario (bucles, flexbox)
- rare: conceptos que cambian cómo programas (funciones, git branch)
- epic: conceptos clave (DOM, JOIN, merge)
- legendary: lo que más se usa en el trabajo (fetch/REST, async/await, Grid, pull requests, transacciones)

Reglas del contenido: en **español**, resumen de 1 o 2 frases, 2–4 puntos clave, ejemplo de 5 líneas como máximo,
1–2 preguntas de quiz. La documentación debe ser **oficial y fácil de leer**: MDN en español,
docs.python.org/es, git-scm.com/book/es, react.dev, laravel.com, etc. **Verificar que cada URL existe.**

Cada serie base tiene **entre 12 y 20 cartas**.

---

## 4. Estado del usuario (Zustand + persist)

```js
{
  cards: { "js-fetch": { obtainedAt, copies, docOpened, evolved } },
  shards: 0,                       // fragmentos que dan las cartas repetidas
  packs: { available: 2, lastReset: "2026-11-11" },
  profile: { name, avatarColor, showcase: ["js-fetch", ...] },   // hasta 6 cartas para presumir
  pityCounter: 0
}
```

Incluir un campo `version` en el store y una función `migrate`, para no romper el progreso si cambia la estructura.

---

## 5. Mecánicas

**Sobres**
- **2 sobres al día en total** (no por serie). Se reinician a medianoche, hora local del usuario.
- El usuario elige de qué serie desbloqueada abrir.
- Cada sobre trae **2 cartas**.

**Qué cartas salen** (función pura `drawPack(series, userCards, rng)` en `/lib/packs.js`, con tests):
1. Solo se sortean cartas de la **etapa actual** de la serie: la más baja que aún tiene cartas sin obtener.
   Hay un 15 % de probabilidad de una carta de la etapa siguiente.
2. Las cartas **no obtenidas tienen prioridad**. Solo salen repetidas si ya no quedan cartas nuevas en el grupo.
3. Hay una probabilidad baja (0–5 %) de encontrar una repetida en vez de una nueva, para que los fragmentos tengan uso.
4. **Garantía**: si en 4 sobres seguidos no salió nada raro o superior, el siguiente trae al menos una rara.
5. El RNG se puede inyectar, para poder testear con una semilla fija.

**Repetidas → fragmentos**: common 5, uncommon 10, rare 20, epic 40, legendary 80. Con fragmentos se canjea
una carta concreta que te falte (cuesta el doble de lo que da).

**Evolución de una carta**
1. Obtenida → se ve **apagada** (desaturada, sin brillo), pero todo su contenido se puede leer.
2. Pulsar "Leer documentación" abre `docUrl` en una pestaña nueva y marca `docOpened`.
3. Con `docOpened` se habilita el **mini quiz**. Si lo respondes bien → `evolved: true`, con una animación
   de evolución y el acabado holográfico. Si fallas, puedes reintentar enseguida.

**Desbloqueo**: al completar una serie se anima el árbol: el nodo se ilumina y la línea hacia los hijos se dibuja.

---

## 6. Pantallas (rutas)

- `/` — Inicio: sobres disponibles hoy, cuenta atrás para el próximo reinicio, series en progreso y un CTA grande "Abrir sobre".
- `/arbol` — Árbol de tecnologías. Los nodos muestran su progreso. Los bloqueados llevan candado y "Requiere: PHP ✅ · SQL 60 %".
- `/series/[id]` — Binder (carpeta de cartas) de la serie: barras por categoría, grilla por etapas, siluetas de las cartas que faltan.
- `/abrir/[id]` — Abrir el sobre: rasgar, revelar y girar las cartas (la animación más cuidada del proyecto).
- `/carta/[id]` — Detalle de la carta: arte, resumen, ejemplo, documentación y quiz.
- `/perfil` — Nombre, estadísticas, series completadas (insignias) y vitrina de hasta 6 cartas.
- `/canje` — Gastar fragmentos.

Mobile first. La app tiene que verse increíble en el celular.

---

## 7. Diseño: neobrutalismo colorido

**Nada de estética genérica de "app de IA"**: sin degradados violetas, sin glassmorphism, sin tarjetas grises redondeadas.

Referencia de componentes: https://www.neobrutalism.dev (inspiración; se pueden adaptar a JSX).

Tokens en `@theme`:
- Fondo crema `#FFF6E5` con una retícula de puntos sutil. Texto y bordes `#111111`.
- Paleta saturada: amarillo `#FFD23F`, rosa `#FF6B9E`, celeste `#3BCEAC`, azul `#4D7CFE`, naranja `#FF8C42`, lila `#B28DFF`.
- Bordes de **3px negros**. **Sombras duras** sin desenfoque: `4px 4px 0 #111` (6px en hover).
- Radios pequeños (6–10px) o cero. Nada de radios gigantes.
- **Interacción "presionar"**: en `:active` el elemento se desplaza `translate(4px,4px)` y la sombra baja a 0.
- Tipografía: **Archivo Black** o **Space Grotesk Bold** para títulos (grandes, a veces rotados 1–2°),
  **Space Grotesk** o **DM Sans** para el texto, **JetBrains Mono** para el código.
- Stickers, etiquetas ladeadas, marquesinas, flechas dibujadas: el desorden controlado forma parte del estilo.

**Rarezas en la carta** (marco y sello):
- common: marco blanco, sello ●
- uncommon: marco celeste, ◆
- rare: marco azul, ★
- epic: marco lila, ★★
- legendary: marco amarillo con borde doble, ★★★, más una animación especial al revelarla

**Carta** (relación de aspecto 63:88, componente `<Card />`):
- Arriba: nombre + icono de la serie. Al centro: **arte** compuesto del icono SVG de la tecnología, el `glyph`
  del tema y formas geométricas con el color de la serie (sin imágenes externas). Abajo: categoría, rareza y número "07/18".
- **Apagada**: `grayscale` + menos opacidad + candado pequeño.
- **Evolucionada**: color completo + **brillo holográfico** con CSS (gradiente cónico + `mix-blend-mode`
  que sigue al puntero o al giroscopio) + inclinación 3D en hover. Debe ser solo CSS/transform, sin librerías pesadas.

**Accesibilidad**: respetar `prefers-reduced-motion` (sin giros ni brillos animados), contraste AA,
todo usable con teclado, foco visible de estilo brutalista (contorno grueso de color).

---

## 8. Rendimiento (es parte de la evaluación)

- Las páginas de contenido se generan estáticas. El JSON de las cartas se lee en servidor y al cliente
  solo se pasa lo necesario.
- Componentes pesados (escena del sobre, quiz) con `next/dynamic`.
- Animar solo `transform` y `opacity`. Usar `memo` en la grilla del binder.
- Importar solo los iconos que se usan (nada de importar todo `simple-icons`).
- Objetivo: **Lighthouse ≥ 95** en Performance, Accesibilidad y Buenas prácticas, en móvil.

---

## 9. Estructura sugerida

```
/app            rutas (layout, page, arbol, series/[id], abrir/[id], carta/[id], perfil, canje)
/components     ui/ (Button, Badge, Panel...), card/, pack/, tree/
/data           series.json, cards/*.json
/lib            packs.js, progress.js (desbloqueo, % por categoría), dates.js
/store          useProgress.js (Zustand)
/hooks          useHydrated.js, useDailyReset.js
```

Pruebas con **Vitest** para `/lib` (sorteo, garantía, desbloqueo, reinicio diario).
Un script `pnpm validate:data` que revise los JSON: ids únicos, `requires` válidos, `answer` dentro del rango, URLs con https.

---

## 10. Plan por fases (un commit claro por fase)

1. **Base**: crear el proyecto con pnpm, Tailwind v4, fuentes, tokens neobrutalistas, componentes `ui/` y una página `/estilos` para verlos.
2. **Datos**: `series.json` completo y las cartas de **las 6 series del nivel 0**, más el script de validación.
3. **Carta**: componente `<Card />` en sus estados (silueta, apagada, evolucionada) y las 5 rarezas.
4. **Lógica**: store, `drawPack` con tests, reinicio diario, fragmentos y desbloqueo.
5. **Abrir sobre**: escena animada completa.
6. **Binder + detalle + quiz + evolución.**
7. **Árbol de tecnologías** con desbloqueos animados.
8. **Perfil, vitrina y canje.**
9. **React** como primera serie desbloqueable con contenido. El resto queda como `coming-soon`.
10. **Pulido**: accesibilidad, Lighthouse, metadatos, imagen OG y README con capturas.

En cada fase: correr `pnpm lint`, `pnpm test` y `pnpm build` antes de dar la fase por terminada.

---

## 11. Temas orientativos del nivel 0

- **HTML**: estructura del documento, encabezados y párrafos, enlaces, imágenes, listas, div vs etiquetas semánticas, formularios, inputs, tablas, atributos, accesibilidad básica (alt, label).
- **CSS**: selectores, cascada y especificidad, modelo de caja, colores y unidades, tipografía, display, **Flexbox**, **Grid**, position, media queries/responsive, variables CSS, transiciones.
- **JavaScript**: variables (let/const), tipos, operadores, condicionales, bucles, funciones, arrow functions, arrays y sus métodos (map/filter), objetos, desestructuración, DOM, eventos, módulos, Promises, **async/await**, **fetch**, JSON, manejo de errores.
- **Python**: variables y tipos, input/print, condicionales, bucles, funciones, listas, diccionarios, tuplas y sets, strings y f-strings, manejo de errores, módulos e imports, archivos, comprensiones de listas, clases básicas, pip y entornos virtuales.
- **Git & GitHub**: qué es el control de versiones, init/clone, status, add, **commit**, log, .gitignore, **ramas**, merge, conflictos, remote, push/pull, **pull requests**, buenas prácticas de mensajes de commit.
- **SQL**: tablas y tipos, CREATE TABLE, INSERT, **SELECT**, WHERE, ORDER BY/LIMIT, UPDATE, DELETE, claves primarias, claves foráneas, **JOIN**, GROUP BY y agregaciones, índices, transacciones.
