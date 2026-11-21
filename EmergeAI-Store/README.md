# EmergeAI Store · laboratorio académico de GA4

Tienda en línea **ficticia** para el laboratorio de Google Analytics 4 del *Diplomado en E-commerce y Negocios Internacionales Digitales*. Vende los servicios del portafolio de **EmergeAI Trade Solutions S.A.S.** (inteligencia de mercados, cumplimiento aduanero, prospección B2B y consultoría).

- Solo HTML, CSS y JavaScript puros: sin frameworks, sin npm, sin compilación, sin servidor y sin base de datos.
- No procesa pagos reales ni guarda datos personales. No pide correo, teléfono, documento ni datos de tarjeta.
- Todos los valores están en pesos colombianos (COP). La tienda está en Colombia y vende a clientes nacionales e internacionales.

## 1. Lo único que debes editar: `js/config.js`

```js
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // pega aquí tu ID de medición
  DEBUG_MODE: true                    // true para DebugView
};
```

1. En Google Analytics: **Administrar → Flujos de datos →** tu flujo web → copia el **ID de medición** (formato `G-...`).
2. Pégalo en `GA_MEASUREMENT_ID` y guarda.
3. Con el marcador `G-XXXXXXXXXX` la tienda **no carga gtag.js** y los eventos solo aparecen en el monitor.
4. Con `DEBUG_MODE: true` verás los eventos en **Administrar → DebugView**. Con `false` no se envía `debug_mode`.

## 2. Estructura de archivos

| Archivo | Función |
| --- | --- |
| `index.html` + `js/index.js` | Catálogo, banner del cupón |
| `producto.html?id=...` + `js/producto.js` | Detalle de producto |
| `carrito.html` + `js/pagina-carrito.js` | Carrito |
| `checkout.html` + `js/checkout.js` | Checkout en dos pasos |
| `gracias.html` + `js/gracias.js` | Confirmación y evento `purchase` |
| `js/config.js` | ID de GA4 y modo depuración (único archivo a editar) |
| `js/productos.js` | Datos de la tienda y los 8 productos |
| `js/carrito.js` | Carrito en `localStorage`, cupón, totales y envío |
| `js/analytics.js` | Carga de gtag.js y funciones de envío de eventos |
| `js/monitor.js` | Monitor de eventos (ayuda didáctica) |
| `css/estilos.css` | Estilos |

## 3. Catálogo (8 productos)

| ID | Producto | Precio (COP) |
| --- | --- | --- |
| MKI-001 | Market Intelligence SaaS · Plan Pyme Exportadora | 1.960.000 |
| MKI-002 | Market Intelligence SaaS · Plan Empresa Mediana | 5.000.000 |
| CTA-001 | Customs & Tariff Compliance Agent · Starter Aduanas | 1.160.000 |
| CTA-002 | Customs & Tariff Compliance Agent · Professional Compliance | 2.760.000 |
| TMB-001 | TradeMatch B2B · Prospección Pyme | 2.600.000 |
| TMB-002 | TradeMatch B2B · Expansión Regional | 5.600.000 |
| ADV-001 | Advisory & Strategic Transformation · Diagnóstico y Roadmap Digital | 14.000.000 |
| EXP-001 | EmergeAI Analytics · Plan Starter Export (autoservicio) | 596.000 |

Los precios provienen del documento «Segunda entrega – Grupo 4» (tablas 5, 7, 9, 11 y 44), que los expresa en USD; se convirtieron a COP con una TRM de laboratorio de **1 USD = 4.000 COP**. Los productos `MKI`, `CTA`, `TMB` y `ADV` son los planes de entrada y de gama media de los cuatro servicios del catálogo; `EXP-001` es el plan de autoservicio del canal en línea.

> Como el producto más barato vale 596.000 COP, el envío **Nacional Estándar siempre resulta gratis** (el umbral es 150.000). Para ver el cobro de 12.000 COP habría que agregar al catálogo un producto de menos de 150.000 COP.

## 4. Cupón y envío

- **Cupón `BIENVENIDA10`:** 10 % de descuento. Se aplica al hacer clic en el banner del catálogo, que lleva al carrito. Con cupón, cada ítem lleva `price` (con descuento), `discount` (por unidad) y `coupon`.
- **Tarifas de envío (COP):** Nacional Estándar 12.000 · Nacional Express 25.000 · Internacional Estándar 95.000 · Internacional Express 160.000.
- **Nacional Estándar gratis** cuando el valor de los productos (ya con descuento) es de 150.000 o más.
- Colombia es envío **Nacional**; los demás países (Estados Unidos, México, Perú, Chile, Brasil, España y Alemania) son **Internacional**.

## 5. Eventos de GA4 (contrato de medición)

Todos llevan `currency: "COP"`. Cada ítem lleva `item_id`, `item_name`, `item_brand`, `item_category`, `price`, `quantity` e `index`.

| Evento | Cuándo se envía |
| --- | --- |
| `view_item_list` | Al cargar el catálogo (`item_list_id: "catalogo_principal"`) |
| `view_promotion` | Al mostrarse el banner del cupón (`promotion_id: "BIENVENIDA10"`) |
| `select_promotion` | Clic en el banner: aplica el cupón y lleva al carrito |
| `select_item` | Clic en un producto del catálogo, antes de navegar |
| `view_item` | Al abrir el detalle del producto |
| `add_to_cart` | Al agregar o aumentar unidades |
| `remove_from_cart` | Al quitar o disminuir unidades |
| `view_cart` | Al abrir el carrito con productos |
| `begin_checkout` | Al abrir `checkout.html` |
| `add_shipping_info` | Clic en «Continuar al pago» (`shipping_tier`: `Nacional - Estándar`, `Nacional - Express`, `Internacional - Estándar` o `Internacional - Express`) |
| `add_payment_info` | Clic en «Pagar (simulado)» (`payment_type`) |
| `purchase` | Al cargar `gracias.html`, una sola vez por pedido |

Detalles del `purchase`: `value` es el total de productos con descuento y **sin envío**; `shipping` es el costo de envío; incluye `transaction_id` único, `affiliation`, `coupon` (si existe) y `tipo_cliente` (`Nacional` o `Internacional`). Además se fija la propiedad de usuario `tipo_cliente` con `gtag('set', 'user_properties', ...)` al confirmar el envío y de nuevo en `gracias.html`, justo antes de `purchase`.

El pedido se guarda en `sessionStorage` antes de ir a `gracias.html`, se marca como enviado después de `purchase` (así recargar no lo repite) y se vacía el carrito.

Para usar `tipo_cliente` en los informes de GA4, regístralo como **dimensión personalizada** (Administrar → Definiciones personalizadas).

## 6. Monitor de eventos

El panel de la derecha (380 px) es una ayuda didáctica: muestra el estado de la conexión, el origen de la visita (UTM de la primera página de la sesión), los últimos 12 eventos con un resumen y sus parámetros, y la propiedad de usuario. Se puede **ocultar/mostrar** (recuerda el estado). En pantallas de menos de 820 px pasa a la parte inferior con 300 px de alto.

El botón **«Simular nuevo visitante»** borra las cookies `_ga*` del sitio, el carrito y `sessionStorage`, y vuelve al catálogo, para repetir el recorrido como si fuera una persona nueva.

Para probar el origen de la visita, abre la tienda con parámetros UTM, por ejemplo:

```
index.html?utm_source=newsletter&utm_medium=email&utm_campaign=lanzamiento
```

## 7. Probar en tu computador (opcional)

Abre `index.html` con doble clic, o sirve la carpeta con cualquier servidor estático, por ejemplo `python3 -m http.server 8000` y entra a `http://localhost:8000`.

## 8. Publicar en Vercel desde GitHub (sin instalar nada)

**Subir a GitHub desde el navegador**

1. Descomprime el `.zip`.
2. En GitHub: **New repository** → ponle un nombre (por ejemplo `emergeai-store`) → **Create repository**.
3. En el repositorio vacío: **uploading an existing file** (o **Add file → Upload files**).
4. Abre la carpeta descomprimida, selecciona **todo su contenido** (`index.html`, `producto.html`, `carrito.html`, `checkout.html`, `gracias.html`, `README.md` y las carpetas `css` y `js`) y arrástralo a la página. `index.html` debe quedar en la raíz del repositorio.
5. **Commit changes**.

**Publicar en Vercel**

1. Entra a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. **Add New… → Project** → importa el repositorio.
3. En **Framework Preset** elige **Other**. Deja vacíos Build Command y Output Directory.
4. Pulsa **Deploy**. Vercel te dará una URL pública `https://...vercel.app`.

Cada vez que cambies `js/config.js` en GitHub (por ejemplo, para pegar tu ID de medición), Vercel vuelve a publicar la tienda automáticamente.

---

Sitio académico de simulación. No procesa pagos ni guarda datos personales. Usa Google Analytics 4.
