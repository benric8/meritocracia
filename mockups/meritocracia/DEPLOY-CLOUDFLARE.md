# Despliegue en Cloudflare Pages

## Subida directa (arrastrar archivos) — lo que usa la captura

### El aviso `_routes.json is not supported`
Ese archivo **no funciona** con “Upload and deploy”. Ya fue eliminado del proyecto. Puedes ignorar el aviso si aún lo tienes en una copia antigua.

`_redirects` sí es compatible; en sitio estático puro normalmente no hace falta.

### Cómo subir bien (importante)

No subas solo los `.html` sueltos. Debe quedar esta estructura en la raíz del sitio:

```
index.html          ← índice de mockups
pantallas/          ← carpeta con 01-login.html, 02-dashboard.html, etc.
assets/
css/
js/
referencias/        (opcional)
```

**Pasos:**
1. Abre la carpeta `meritocracia` en el explorador de archivos.
2. Selecciona **todo su contenido** (o arrastra la carpeta entera si Cloudflare lo permite).
3. Comprueba que en la lista de subida aparezcan:
   - `index.html`
   - carpeta `pantallas/` (con los HTML dentro)
   - carpeta `assets/`
   - carpeta `css/`
   - carpeta `js/`

Si solo ves `01-login.html`, `02-dashboard.html`… en la raíz **sin** carpeta `pantallas/`, el flujo no funcionará.

### Verificación
Tras publicar, abre (con **`.html`** en la URL):
```
https://tu-proyecto.pages.dev/pantallas/01-login.html?flow=admin
```

### HTTP 405 al pulsar «Iniciar»
Cloudflare Workers **no acepta POST** en archivos estáticos. El login ya usa `method="get"` y un script inline que redirige con GET. Vuelve a subir `pantallas/01-login.html` actualizado.

### URL sin extensión (`/pantallas/01-login`)
Usa siempre la ruta con `.html`:
```
/pantallas/01-login.html?flow=admin
```
(no `/pantallas/01-login`)

---

## Despliegue con Git (alternativa)

| Campo | Valor |
|-------|--------|
| Framework preset | None |
| Build command | *(vacío)* |
| Build output directory | `meritocracia` |

---

## Si sigue fallando

Usa **Netlify Drop** (gratis, sin configuración): [https://app.netlify.com/drop](https://app.netlify.com/drop) — arrastra la carpeta `meritocracia` completa.
