# Residencia la Luz · web y gestor de contenidos

Web pública para una residencia de mayores con un **panel de gestión propio**:
editor visual de páginas por bloques, noticias al estilo de una red social,
calendario de eventos, biblioteca de imágenes, temas visuales y configuración
del centro. Pensada para que el personal la mantenga sin conocimientos técnicos.

> **Contenido de demostración.** Todos los textos, datos de contacto e
> imágenes incluidos son ficticios y están marcados como tales. Las
> ilustraciones de `public/demo` no son fotografías reales. Antes de publicar
> hay que sustituirlos por información real y comprobada (ver
> [Lista de comprobación antes de publicar](#lista-de-comprobación-antes-de-publicar)).

---

## Índice

1. [Tecnologías](#tecnologías)
2. [Qué incluye](#qué-incluye)
3. [Puesta en marcha en local](#puesta-en-marcha-en-local)
4. [Crear las cuentas del panel](#crear-las-cuentas-del-panel)
5. [Configurar Supabase en la nube](#configurar-supabase-en-la-nube)
6. [Desplegar en Vercel](#desplegar-en-vercel)
7. [Dominio propio](#dominio-propio)
8. [Seguridad](#seguridad)
9. [Base de datos](#base-de-datos)
10. [Bloques y temas](#bloques-y-temas)
11. [Pruebas y calidad](#pruebas-y-calidad)
12. [Estructura del proyecto](#estructura-del-proyecto)
13. [Lista de comprobación antes de publicar](#lista-de-comprobación-antes-de-publicar)
14. [Limitaciones conocidas y siguientes pasos](#limitaciones-conocidas-y-siguientes-pasos)

---

## Tecnologías

| Área | Elección |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack, Server Actions, `proxy.ts`) |
| Lenguaje | TypeScript estricto, React 19 |
| Estilos | Tailwind CSS v4 + variables CSS generadas desde el tema |
| Datos | Supabase: PostgreSQL, Auth, Storage, Row Level Security |
| Validación | Zod 4 (formularios, bloques, temas) |
| Texto enriquecido | Tiptap 3 (saneado en servidor con `sanitize-html`) |
| Arrastrar y soltar | dnd-kit (bloques, servicios, galería, menús) |
| Calendario del panel | FullCalendar 6 (clic para crear, arrastrar para mover) |
| Fechas | date-fns 4 + `@date-fns/tz` (todo en `Europe/Madrid`) |
| Iconos | lucide-react |
| Pruebas | Vitest (unitarias y de seguridad RLS) y Playwright (e2e) |
| Despliegue | Vercel |

## Qué incluye

### Web pública

- **Inicio, Conócenos, Servicios, Instalaciones (galería con filtros y ampliación), Noticias, Eventos, Contacto** y páginas legales (aviso legal, privacidad, cookies). Todas editables con bloques.
- **Noticias:** listado paginado, filtro por categoría, buscador (búsqueda de texto completo en español), página de detalle con galería y botones para compartir.
- **Eventos:** calendario mensual accesible (funciona sin JavaScript), vista de lista, filtro por categoría, página de detalle y descarga `.ics` para añadir al calendario. Horas siempre en hora peninsular.
- **Contacto:** formulario validado con aviso de privacidad, campo trampa anti-spam, tiempo mínimo de envío y límite de envíos por IP.
- **SEO:** metadatos por página, Open Graph, `sitemap.xml`, `robots.txt`, datos estructurados JSON-LD (centro en la página de contacto, noticias y eventos).
- **Accesibilidad:** HTML semántico, un único `h1` por página, foco visible, enlaces «saltar al contenido», textos alternativos, contraste comprobado en los temas, vídeos que no se cargan hasta pulsar.

### Panel de gestión (ruta privada `ADMIN_PATH`)

1. **Resumen:** accesos rápidos, cifras, páginas con cambios pendientes, últimas noticias, próximos eventos y actividad reciente.
2. **Páginas:** editor visual por bloques (15 tipos), arrastrar para ordenar, duplicar, ocultar, visibilidad por dispositivo, vista previa en directo (ordenador/tableta/móvil), guardar borrador, publicar, descartar, historial de versiones y recuperación. Ver la página real en modo borrador.
3. **Noticias:** publicación rápida tipo red social (título, texto, foto, publicar), editor completo con vista previa, programación con fecha y hora, borradores, archivo, destacadas, SEO, galería, duplicar, acciones masivas y filtros.
4. **Eventos y calendario:** calendario mensual; clic en un día para crear, arrastrar para mover o alargar; borradores, duplicar, categorías con color.
5. **Servicios:** ordenar arrastrando, mostrar/ocultar, editor con icono, imagen y texto.
6. **Galería multimedia:** subida múltiple con validación real del tipo de archivo y redimensionado, texto alternativo, etiquetas, indicador de uso, aviso antes de borrar imágenes en uso y opción de **sustituir** una imagen en todos sus usos. Pestaña de la galería pública de instalaciones (orden, categoría, pie de foto, visibilidad).
7. **Menús y navegación:** cabecera, pie y enlaces legales, ordenables; los enlaces principales se pueden ocultar pero no borrar.
8. **Apariencia y temas:** 3 temas predefinidos; colores, tipografías, tamaños, formas y estilos de componentes; avisos de contraste; vista previa en directo; probar en la web real sin que lo vean las visitas; borrador, publicar, restablecer y duplicar.
9. **Información del centro:** nombre, logotipo, favicon, contacto, mapa, horario, redes sociales, textos de privacidad y datos del titular.
10. **Configuración:** mi cuenta, SEO general, categorías, testimonios (solo con consentimiento registrado), usuarios y roles, invitaciones y registro de actividad.

Además: **Mensajes de contacto** (bandeja, leído/no leído, archivo, borrado).

**Roles:** *Administración* (todo) y *Edición* (contenidos: páginas, noticias, eventos, servicios e imágenes). Apariencia, menús, datos del centro y usuarios son solo de administración, comprobado en servidor y en la base de datos.

---

## Puesta en marcha en local

Requisitos: Node.js 20.9 o superior (recomendado 22), npm y Docker (para Supabase local).

```bash
npm install
cp .env.example .env.local

# 1. Arranca Supabase en local (aplica migraciones y datos de demostración)
npx supabase start
#    Copia de la salida "Project URL", "Publishable key" y "Secret key"
#    a NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY y
#    SUPABASE_SECRET_KEY en .env.local

# 2. Crea tu cuenta de administración (ver siguiente apartado)
npm run admin:create -- tu-correo@ejemplo.es admin

# 3. Arranca la web
npm run dev
```

- Web pública: <http://localhost:3000>
- Panel: <http://localhost:3000/gestion-centro> (o la ruta que pongas en `ADMIN_PATH`)
- Correos de recuperación en local: Mailpit en <http://127.0.0.1:54324>

Comandos útiles:

| Comando | Para qué sirve |
| --- | --- |
| `npm run db:reset` | Borra la base local y vuelve a aplicar migraciones y datos demo |
| `npm run seed:build` | Regenera `supabase/seed.sql` (fechas de eventos y noticias relativas a hoy) |
| `npm run db:types` | Regenera los tipos TypeScript desde la base local |
| `npm run check` | Lint + tipos + pruebas unitarias + build |

> Sin variables de Supabase la web no simula datos: muestra una pantalla
> explicando qué falta configurar.

## Crear las cuentas del panel

**No hay registro público ni contraseñas predeterminadas.** Las cuentas se crean así:

1. **Primera cuenta de administración** (requiere `SUPABASE_SECRET_KEY` en `.env.local`):
   ```bash
   npm run admin:create -- persona@centro.es admin
   ```
   El script genera una contraseña aleatoria robusta y la **muestra una sola vez**.
   Cámbiala en el primer acceso con «¿Has olvidado tu contraseña?».
   Para usar una contraseña concreta (por ejemplo en local), exporta `ADMIN_PASSWORD` solo para esa orden.
2. **Resto del equipo:** desde *Configuración › Usuarios › Invitar*. La persona recibe un correo para crear su contraseña.
   Requiere `SUPABASE_SECRET_KEY` en el servidor y el envío de correo configurado en Supabase.
3. Para crear una cuenta en un proyecto en la nube desde tu ordenador, pon temporalmente en `.env.local` la URL y la clave secreta de ese proyecto y ejecuta el script; después retíralas.

Una cuenta sin rol puede iniciar sesión pero no ve ni modifica nada.

## Configurar Supabase en la nube

1. Crea un proyecto en <https://supabase.com> (región UE, por ejemplo *Frankfurt* o *Paris*, por protección de datos).
2. Vincula y aplica las migraciones:
   ```bash
   npx supabase login
   npx supabase link --project-ref TU_REF
   npx supabase db push
   ```
3. **Datos de demostración (opcional):** solo si quieres partir del contenido de ejemplo, ejecuta `supabase/seed.sql` en *SQL Editor*. Las imágenes de demostración se sirven desde `public/demo`. Para empezar en blanco, no lo ejecutes y crea las páginas principales desde el seed como plantilla.
   > La web necesita las páginas de sistema (inicio, conocenos, servicios…), los menús, la fila de `site_settings` y al menos un tema activo. El seed los crea; si no lo usas, copia esas partes.
4. **Authentication › Sign In / Providers:** desactiva *Allow new users to sign up* (no hay registro público). Mantén activo el proveedor *Email*.
5. **Authentication › URL Configuration:**
   - *Site URL:* `https://tu-dominio.es`
   - *Redirect URLs:* `https://tu-dominio.es/**` (y la URL de vista previa de Vercel si la usas).
6. **Authentication › Emails › SMTP:** configura un SMTP propio (el de Supabase tiene límites muy bajos) y traduce las plantillas de *Invite* y *Reset password* al español.
7. **Authentication › Policies:** contraseña mínima de 10 caracteres con mayúsculas, minúsculas y números (igual que en `supabase/config.toml`).
8. **Storage:** la migración crea el bucket `media` (público, 8 MB, JPEG/PNG/WebP/AVIF). No hace falta crearlo a mano.
9. Copia *Project URL*, *Publishable key* y *Secret key* para Vercel.

## Desplegar en Vercel

1. Sube el repositorio a GitHub (comprueba que `.env.local` **no** se sube; está en `.gitignore`).
2. En Vercel: *Add New › Project* e importa el repositorio. Framework: Next.js (detección automática).
3. Variables de entorno (*Settings › Environment Variables*), para *Production* y *Preview*:

   | Variable | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clave publicable |
   | `SUPABASE_SECRET_KEY` | clave secreta (marcar como *Sensitive*) |
   | `NEXT_PUBLIC_SITE_URL` | `https://tu-dominio.es` |
   | `ADMIN_PATH` | tu ruta privada, por ejemplo `/acceso-equipo-7k2` |

4. Despliega. La publicación programada de noticias **no necesita tareas programadas**: una noticia con fecha futura queda oculta por la propia base de datos hasta su hora.

> `SUPABASE_SECRET_KEY` es **necesaria en producción**: sin ella no se guardan
> los mensajes del formulario ni funciona la limitación de intentos de acceso.

## Dominio propio

1. En Vercel: *Settings › Domains › Add* y escribe `tu-dominio.es` y `www.tu-dominio.es`.
2. En tu proveedor de dominio crea los registros DNS que indique Vercel (normalmente `A` a `76.76.21.21` para la raíz y `CNAME` a `cname.vercel-dns.com` para `www`).
3. Actualiza `NEXT_PUBLIC_SITE_URL` en Vercel y la *Site URL* / *Redirect URLs* en Supabase. Vuelve a desplegar.

---

## Seguridad

- **Autenticación real** con Supabase Auth. Sin registro público, sin credenciales predeterminadas, recuperación de contraseña por correo.
- **Autorización en tres capas:** el `proxy` redirige al acceso; cada página y acción del servidor vuelve a comprobar sesión y rol (`requireStaffPage`, `runAction`); y **Row Level Security** en todas las tablas impide cualquier escritura no autorizada aunque alguien use la clave pública directamente.
- **Ruta del panel configurable** (`ADMIN_PATH`), sin enlaces públicos, fuera de `robots.txt`, con `noindex` y sin caché. La ruta interna `/panel-interno` devuelve 404 desde fuera. Ocultar la ruta *no* sustituye a las medidas anteriores.
- **Limitación de intentos** de acceso (por IP y por cuenta), de recuperación de contraseña y del formulario de contacto. Mensajes de error genéricos.
- **Secretos solo en el servidor:** la clave secreta no lleva prefijo `NEXT_PUBLIC_` y solo se usa en módulos marcados `server-only`.
- **Sin código arbitrario:** los bloques son datos validados con Zod que se pintan con componentes propios; no existe un bloque de HTML libre ni de scripts. El HTML de los editores de texto se sanea al guardar y al mostrar (lista blanca). Los vídeos guardan solo el identificador.
- **Subidas seguras:** comprobación del tipo real por los primeros bytes del archivo, tamaño máximo, nombres aleatorios y solo formatos de imagen rasterizados (no SVG).
- **Cabeceras:** Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **Registro de actividad** de todas las creaciones, ediciones, borrados, publicaciones y cambios de rol.
- **Protecciones de base de datos:** las páginas y enlaces de menú principales no se pueden borrar ni renombrar; siempre queda al menos una cuenta de administración; nadie puede asignarse un rol.

### Privacidad (RGPD)

- El formulario solo pide nombre, correo, teléfono opcional, asunto y mensaje. Se guarda la versión del aviso de privacidad aceptado.
- El panel recuerda en cada punto relevante que **no deben publicarse fotografías identificables de residentes, datos de salud ni información personal** sin consentimiento expreso por escrito.
- Los testimonios y los miembros del equipo solo se muestran si se marca que existe autorización.
- No se cargan cookies de terceros: los vídeos y mapas se cargan solo tras una acción de la persona (vídeos) o desde dominios declarados en la CSP.

## Base de datos

Migraciones versionadas en `supabase/migrations`:

| Archivo | Contenido |
| --- | --- |
| `…01_esquema_base.sql` | Tipos, tablas, índices y disparadores |
| `…02_seguridad_rls.sql` | RLS, funciones de publicación de páginas y temas, roles, limitación de intentos, auditoría, vista de uso de imágenes y bucket de Storage |
| `…03_funciones_multimedia.sql` | Sustitución de una imagen en todos sus usos |
| `…04_proteccion_sistema.sql` | Protección de páginas y enlaces principales |

Tablas principales:

- `profiles` — cuenta y rol (`admin` | `editor` | sin rol).
- `pages`, `page_revisions`, `page_blocks` — páginas; los bloques con `revision_id` nulo son el **borrador**; publicar copia el borrador a una nueva revisión.
- `news_posts`, `news_categories`, `news_post_media` — noticias (con búsqueda de texto completo en español).
- `events`, `event_categories` — eventos (instantes en UTC; se muestran en hora de Madrid).
- `services`, `testimonials`.
- `media`, `gallery_items`, `gallery_categories` — biblioteca y galería pública. Vista `media_usage` para saber dónde se usa cada imagen.
- `themes` — tokens publicados, borrador y valores originales; un único tema activo.
- `site_settings` (una fila), `menu_items`, `contact_messages`, `audit_log`, `rate_limit_hits`.

Los datos de demostración (`supabase/seed.sql`) se generan con `npm run seed:build` y están marcados con `is_demo = true`.

## Bloques y temas

- **Bloques** (`src/features/blocks/schema.ts`, versión de formato 1): portada con imagen, portada imagen + texto, texto enriquecido, imagen con texto, galería, servicios, noticias, eventos, valores, testimonios, equipo, llamada a la acción, contacto, separador y vídeo. Cada bloque tiene ajustes de fondo, espaciado, ancho, alineación, ancla y visibilidad por dispositivo. Para añadir un tipo: esquema Zod + valores por defecto + componente en `blocks-view.tsx` + formulario en `block-forms.tsx`. Si cambia el formato, sube `BLOCKS_SCHEMA_VERSION` y añade una migración de datos.
- **Temas** (`src/features/theme`): colores, tipografía (6 fuentes servidas con `next/font`), formas y variantes de componentes. Se convierten en variables CSS `--lz-*`; todos los valores están acotados por el esquema, así que no es posible inyectar CSS.

## Pruebas y calidad

```bash
npm run lint
npm run typecheck
npm run test               # unitarias: bloques, saneado, fechas, temas, esquemas
npm run test:integration   # seguridad RLS contra Supabase LOCAL (ver cabecera del archivo)
npm run test:e2e           # Playwright: páginas públicas, formulario, panel
npm run build
```

Las pruebas de integración necesitan `TEST_SUPABASE_URL`, `TEST_SUPABASE_PUBLISHABLE_KEY`, `TEST_SUPABASE_SECRET_KEY` (y opcionalmente `TEST_EDITOR_EMAIL` / `TEST_EDITOR_PASSWORD`). Solo se ejecutan contra `localhost`. Las e2e aceptan `E2E_BASE_URL`, `E2E_ADMIN_PATH`, `E2E_EDITOR_EMAIL` y `E2E_EDITOR_PASSWORD`.

## Estructura del proyecto

```
src/
  app/
    (public)/              web pública
    panel-interno/         panel (se sirve en ADMIN_PATH)
      (panel)/             secciones con menú lateral
      (editor)/            editores a pantalla completa (páginas y temas)
    api/                   subida de imágenes y vista previa
    sitemap.ts, robots.ts
  components/
    public/                componentes de la web
    blocks/                renderizado de bloques
    admin/                 componentes del panel
  features/                lógica por dominio: consultas, esquemas y acciones de servidor
  lib/                     Supabase, fechas, saneado, límites, utilidades
  proxy.ts                 ruta del panel, sesión y protección
supabase/                  configuración local, migraciones y seed
scripts/                   seed, imágenes de demostración y creación de cuentas
tests/                     unitarias, integración (RLS) y e2e
```

## Lista de comprobación antes de publicar

- [ ] Sustituir **todos** los textos de demostración (buscar «demostración», «ejemplo» y la etiqueta *Demo* en el panel).
- [ ] Sustituir las ilustraciones de demostración por fotografías propias **sin residentes identificables** (o con consentimiento escrito).
- [ ] Rellenar *Información del centro* con datos reales: nombre, dirección, teléfonos, correo, horario, mapa y redes.
- [ ] Encargar la **revisión jurídica** de aviso legal, privacidad y cookies; completar titular y NIF. Los textos incluidos son orientativos.
- [ ] Revisar el texto informativo de privacidad del formulario con la persona responsable de protección de datos.
- [ ] Desactivar el aviso «web en preparación» en *Información del centro* cuando todo lo anterior esté hecho.
- [ ] Publicar solo servicios, cifras y testimonios reales y comprobables.
- [ ] Configurar SMTP propio y traducir las plantillas de correo de Supabase.
- [ ] Elegir una `ADMIN_PATH` difícil de adivinar y crear las cuentas con el script o por invitación.
- [ ] Borrar el contenido demo que no se use (noticias, eventos y servicios marcados *Demo*).
- [ ] Revisar la web con un lector de pantalla y en móvil.
- [ ] Dar de alta el dominio en Google Search Console y enviar `sitemap.xml`.

## Limitaciones conocidas y siguientes pasos

- **Copias de seguridad:** dependen del plan de Supabase (las diarias se incluyen en los planes de pago). Recomendable activarlas antes de publicar.
- **Cookies/analítica:** no se incluye ninguna herramienta de analítica. Si se añade una que use cookies, habrá que incorporar un banner de consentimiento.
- **Correo de aviso al recibir mensajes:** los mensajes se ven en el panel; el aviso por correo al equipo no está implementado (se puede añadir con un *Database Webhook* de Supabase o un proveedor como Resend).
- **Autenticación en dos pasos:** Supabase la ofrece (TOTP); no está activada en el panel.
- **Idiomas:** la web está solo en español.
- **Vista previa del editor de páginas:** reproduce fielmente los bloques; los módulos automáticos de algunas páginas (listado de noticias, calendario…) se indican con un recuadro y se ven completos con «Ver borrador en la web».
