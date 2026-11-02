# Cubrí Seguros — contratación digital de seguro de celular

Prototipo académico realizado con HTML5, Tailwind CSS v4 por CDN, Basecoat CSS y JavaScript vanilla con módulos ES. No utiliza frameworks ni backend. El pago es simulado y no genera una póliza real.

## Cómo ejecutar

1. Descargá o cloná el repositorio.
2. Abrí la carpeta con Visual Studio Code.
3. Ejecutá `index.html` con la extensión **Live Server** (recomendado), o desde una terminal dentro de la carpeta ejecutá `python -m http.server 8000` y abrí `http://localhost:8000`.
4. No abras el HTML con doble clic (`file://`), porque `fetch()` necesita un servidor local para cargar `data/planes.json`.

El proyecto utiliza CDN para Tailwind CSS, Basecoat CSS e Inter, por lo que requiere conexión a internet para esos recursos.

## Estructura

```text
cubri-seguros/
├── index.html
├── css/
│   └── tokens.css
├── data/
│   └── planes.json
├── js/
│   ├── app.js
│   ├── estado.js
│   ├── render.js
│   ├── validaciones.js
│   ├── cotizador.js
│   └── pago.js
└── README.md
```

## Funcionalidades implementadas

- Catálogo con cuatro productos; solo Celular está habilitado.
- Flujo de cuatro pasos con stepper, navegación hacia atrás y estado centralizado en `solicitud`.
- Carga de planes desde JSON local mediante `fetch()`.
- Cotización de Básico, Plus y Premium; Plus preseleccionado como recomendado.
- Validaciones de equipo, datos personales y tarjeta; errores accesibles en línea.
- Resumen del seguro que se actualiza desde el estado y se adapta a mobile/desktop.
- Pago simulado con demora de 1,5 segundos, pantalla de éxito o error y reintento conservando los datos.
- Generación de número de póliza con formato `POL-AAAA-NNNNNN`.
- Diseño responsive mobile-first.

## Reglas de cálculo

`cuota = Math.round(valor * tasaAnual / 12 * factorAntiguedad)`

| Plan | Tasa anual | Coberturas |
|---|---:|---|
| Básico | 4% | Robo con violencia |
| Plus | 6% | Robo con violencia, rotura de pantalla |
| Premium | 9% | Robo con violencia, rotura total, hurto/pérdida |

Factores: menos de 1 año = 1,00; 1 a 2 años = 1,10; más de 2 años = 1,25.

## Casos de prueba de cotización

| Valor del equipo | Antigüedad | Básico | Plus | Premium |
|---:|---|---:|---:|---:|
| $600.000 | Menos de 1 año | $2.000 | $3.000 | $4.500 |
| $600.000 | 1 a 2 años | $2.200 | $3.300 | $4.950 |
| $1.200.000 | Más de 2 años | $5.000 | $7.500 | $11.250 |

## Tarjetas de prueba

**No ingreses datos de tarjetas reales.**

- `4111 1111 1111 1111` → aprobado.
- `4000 0000 0000 0002` → rechazado; permite probar la pantalla de error y el reintento.
- Cualquier otro número de 16 dígitos válido según las reglas del ejercicio → aprobado.

Para las pruebas manuales, usá una fecha futura con formato `MM/AA` (por ejemplo `12/28` mientras siga vigente), un CVV de prueba de tres dígitos (por ejemplo `123`) y un titular ficticio.

## Capturas mobile y desktop

Antes de entregar, ejecutá el sitio en el navegador y agregá capturas propias a una carpeta `capturas/`:

- `capturas/inicio-mobile.png` — viewport aproximado de 390 px.
- `capturas/planes-desktop.png` — viewport aproximado de 1440 px.
- `capturas/datos-mobile.png` — formulario de titular en mobile.
- `capturas/exito-desktop.png` — pantalla de éxito en desktop.

Las capturas no se incluyen porque deben tomarse de la versión ejecutada en tu propio navegador.

## Publicación

Subí los archivos a un repositorio GitHub y habilitá GitHub Pages desde **Settings → Pages** (deploy desde la rama principal y carpeta raíz). También podés publicar la carpeta en Netlify. Una vez publicado, agregá aquí la URL del sitio.

## Alcance y decisiones

- No hay servidor, persistencia ni procesamiento de tarjetas real.
- El estado vive en un único objeto JS y los módulos se ocupan de responsabilidades específicas.
- Los planes se cargan desde `data/planes.json`; las cuotas se calculan con una sola función de cotización.
- Los términos son informativos para esta demo, no un contrato legal.
