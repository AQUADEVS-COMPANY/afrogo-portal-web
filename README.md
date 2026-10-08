# AfroGo Verifica — Portal de Documentos de Conductores

*"Cada documento, bajo control"*

Portal interno de AfroGo (Chincha, Ica, Perú) para revisar los documentos que suben los postulantes a conductor y aprobar o rechazar sus solicitudes. Consume la API `afrogo-api` (Node.js + Express + MySQL + JWT). **No tiene backend propio**: PHP solo se usa para includes y configuración; todo lo demás es HTML, CSS y JavaScript vanilla.

---

## 1. ¿De qué trata?

**Flujo:** Login → Inicio → Conductores → Detalle del conductor (+ Bitácora en pestaña aparte).

| Pantalla | Qué hace |
| --- | --- |
| `login/` | Inicio de sesión (correo y contraseña). Maneja errores 400, 401 y 429. |
| `dashboard/` | Inicio: contadores (pendientes, aprobados, total), accesos rápidos y las 6 solicitudes pendientes más antiguas. |
| `drivers/` | Lista de conductores con búsqueda en vivo, filtro por estado y tipo de vehículo, y orden (pendientes más antiguas primero). |
| `driver-detail/` | Datos completos, **fecha y hora de creación**, documentos con visor PDF y descarga, historial, y Aprobar/Rechazar. |
| `logs/` | Bitácora: quién aprobó o rechazó y cuándo. Se abre en otra pestaña. Filtros por correo, conductor y estado. |

### Roles

| Rol | Permisos |
| --- | --- |
| **Administrador** (`administrator`) | Ver, descargar, **aprobar y rechazar** (solo si el estado es `pending`). |
| **Secretario** (`secretary`) | Solo lectura: ver y descargar PDFs. |

> El front solo oculta los botones. La validación real está en la API (403) y en los procedimientos almacenados.

### Reglas de la interfaz

- **Tarjeta pendiente:** estilo normal. **Tarjeta aprobada:** tinte verde (success).
- **Rechazar elimina** al conductor y sus PDF (solo queda el log). Tras rechazar se vuelve a la lista.
- Los PDF se piden con `fetch` + token y se muestran desde un `blob:` (un `<iframe src>` directo no envía el token). La URL se libera con `revokeObjectURL` al cerrar.
- Errores 409 (ya procesada) refrescan el detalle; 404 devuelve a la lista.

### UX incluida

Skeleton loaders, estados vacíos y de error con reintento, toasts, búsqueda en vivo, contador de pendientes en el menú, visor PDF con anterior/siguiente (← →), copiar DNI/celular/correo, botón de WhatsApp, motivos rápidos al rechazar (máx. 200 caracteres), historial por conductor, animaciones solo con `transform/opacity`, `prefers-reduced-motion` y navegación por teclado.

---

## 2. Estructura

```
afrogo-portal/
├── shared/
│   ├── css/        variables, base, components, animations, noscript
│   ├── js/         utils, ui, validators, session, api-client, animations, components, shell
│   ├── img/        logo.svg, favicon.svg
│   ├── fonts/
│   └── includes/   config.php, head.php, sidebar.php, topbar.php, footer.php
├── login/            index.php, css/, js/, img/
├── dashboard/        index.php, css/, js/, img/
├── drivers/          index.php, css/, js/, img/
├── driver-detail/    index.php, css/, js/, img/
├── logs/             index.php, css/, js/, img/
├── index.php         (redirige a /login o /dashboard según la sesión)
├── robots.txt        (Disallow: /)
└── .htaccess         (cabeceras de seguridad, noindex, bloqueo de includes)
```

---

## 3. Requisitos

- **PHP 7.4+** (Apache con `mod_rewrite`, `mod_headers`; opcional `mod_deflate`, `mod_expires`) o el servidor integrado de PHP para pruebas.
- **API `afrogo-api` en marcha** (Node.js 20, MySQL 8). Ver su documentación.
- Un usuario del panel creado en la API.

---

## 4. Cómo ejecutar el proyecto

### 4.1 Preparar la API (una sola vez)

1. Base de datos: ejecutar `sql/aquadevs_afrogo_api_dev.sql` y luego `sql/002_auth_roles.sql` (con `max_allowed_packet` ≥ 64 MB).
2. `.env` de la API: configurar `DB_*`, `JWT_SECRET` (mín. 32 caracteres), `JWT_EXPIRES_IN=5h`, `SMTP_*` y **`ALLOWED_ORIGINS` incluyendo el origen del portal** (por ejemplo `http://localhost:8080`).
3. Crear el primer administrador:
   ```bash
   npm run create-user -- correo@dominio.com "Nombre Apellido" clave administrator
   ```
   (usa `secretary` como último parámetro para un usuario de solo lectura).
4. Iniciar la API (por defecto `http://localhost:3000`).

### 4.2 Configurar el portal

Editar `shared/includes/config.php`:

```php
const API_BASE_URL     = 'http://localhost:3000'; // misma URL que usa afrogo-web, sin barra final
const SESSION_IDLE_MIN = 15; // cierre por inactividad (minutos)
const SESSION_WARN_MIN = 5;  // aviso antes de que venza el token
```

La Content-Security-Policy se genera sola con el origen de `API_BASE_URL`.

### 4.3 Levantar el portal

**Opción A — Servidor integrado de PHP (desarrollo):**

```bash
cd afrogo-portal
php -S localhost:8080
```

Abrir `http://localhost:8080` y agregar ese origen a `ALLOWED_ORIGINS` de la API.

**Opción B — Apache (XAMPP/Laragon/hosting):**

1. Copiar `afrogo-portal/` a `htdocs` (o a la raíz del sitio).
2. Abrir `http://localhost/afrogo-portal/`. La ruta base se detecta sola (raíz o subcarpeta).
3. Agregar ese origen a `ALLOWED_ORIGINS` de la API.

**Opción C — Dev Tunnels:** reenviar el puerto de la API, poner esa URL en `API_BASE_URL` y el origen del portal en `ALLOWED_ORIGINS`.

### 4.4 Usar el portal

1. Entrar con el correo y la clave del usuario creado.
2. **Inicio** → **Ver conductores** → clic en un conductor para ver sus documentos.
3. Como administrador: **Aprobar** o **Rechazar** (con motivo opcional).
4. **Bitácora** se abre en una pestaña nueva.

---

## 5. Seguridad

- **Token** y usuario en `sessionStorage` (se borran al cerrar la pestaña). Cualquier 401 cierra sesión y redirige al login.
- Aviso antes de `expiresAt`, cierre automático al vencer y por **inactividad**.
- **CSP estricta** (sin scripts inline), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: no-referrer`, `noindex`, `Cache-Control: no-store`, HSTS sobre HTTPS.
- Datos de la API siempre con `textContent` (nunca `innerHTML`) para mitigar XSS.
- `shared/includes/` bloqueado por `.htaccess`.
- **En producción:** activar la redirección a HTTPS en `.htaccess` (hay un bloque comentado) y fijar `ALLOWED_ORIGINS` solo con el origen exacto del portal. Opcional: restringir `/` por IP o Basic Auth como segunda barrera.

---

## 6. Solución de problemas

| Síntoma | Causa probable |
| --- | --- |
| "No pudimos conectarnos" | API apagada, `API_BASE_URL` incorrecta, o el origen del portal no está en `ALLOWED_ORIGINS` (CORS). |
| Login responde 429 | Más de 5 intentos fallidos en 15 min por IP. Esperar. |
| La página queda en blanco | JavaScript desactivado o error de sesión; revisar la consola del navegador. |
| El PDF no se ve en el visor | Algunos navegadores móviles no muestran PDF embebidos: usar **Descargar**. |
| Estilos o rutas rotas en subcarpeta | Verificar que `DOCUMENT_ROOT` apunte al sitio; la ruta base se calcula en `config.php`. |
| No aparecen botones Aprobar/Rechazar | El rol no es `administrator` o el estado no es `pending`. |

---

## 7. Notas

- Verificar con `ALLOWED_ORIGINS` correcto y datos reales de punta a punta (envío con los 7 PDF, correos de Gmail y endpoints nuevos contra MySQL siguen sin probarse).
- Ideas pendientes: actualización automática de la lista con aviso de nuevas solicitudes, checklist de revisión de documentos y exportación a CSV.

Desarrollado por **Aquadevs Perú**.
