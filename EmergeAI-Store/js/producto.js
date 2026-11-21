/* Página de detalle (producto.html?id=ABC-001): view_item y add_to_cart. */
(function () {
  'use strict';

  var D = window.TIENDA_DATOS;
  var C = window.Carrito;
  var A = window.Analitica;

  var contenedor = document.getElementById('detalle');
  var id = new URLSearchParams(window.location.search).get('id');
  var p = C.producto(id);

  if (!p) {
    contenedor.innerHTML =
      '<div class="vacio">' +
        '<h1>Producto no encontrado</h1>' +
        '<p>La referencia solicitada no existe en el catálogo.</p>' +
        '<a class="btn" href="index.html">Volver al catálogo</a>' +
      '</div>';
    return;
  }

  document.title = p.nombre + ' · EmergeAI Store';

  contenedor.innerHTML =
    '<nav class="migas" aria-label="Ruta de navegación"><a href="index.html">Catálogo</a> › <span>' + p.nombre + '</span></nav>' +
    '<div class="detalle">' +
      window.bloqueHTML(p) +
      '<div class="detalle__info">' +
        '<span class="etiqueta">' + p.categoria + '</span>' +
        '<h1>' + p.nombre + '</h1>' +
        '<p class="nota">Referencia ' + p.id + '</p>' +
        '<p class="detalle__precio">' + C.precioHTML(p) + ' <small>' + p.periodo + '</small></p>' +
        '<p class="nota">≈ USD ' + p.usd + ' · TRM de laboratorio: 1 USD = ' + D.trm.toLocaleString('es-CO') + ' COP</p>' +
        '<p>' + p.descripcion + '</p>' +
        '<ul class="lista-check">' + p.incluye.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' +
        '<p class="nota">Modalidad: ' + p.modalidad + '</p>' +
        '<div class="compra">' +
          '<label for="cantidad">Cantidad</label>' +
          '<input id="cantidad" type="number" min="1" max="10" value="1" inputmode="numeric">' +
          '<button id="btn-agregar" type="button" class="btn">Agregar al carrito</button>' +
        '</div>' +
        '<div id="mensaje" class="aviso aviso--ok" role="status" hidden></div>' +
      '</div>' +
    '</div>';

  /* ---------- view_item ---------- */
  A.enviarEvento('view_item', {
    value: C.precioUnitario(p),
    items: [C.itemGA(p, 1, 0)]
  });

  /* ---------- add_to_cart ---------- */
  var campo = document.getElementById('cantidad');
  var mensaje = document.getElementById('mensaje');

  document.getElementById('btn-agregar').addEventListener('click', function () {
    var n = parseInt(campo.value, 10);
    if (!(n >= 1)) { n = 1; }
    if (n > 10) { n = 10; }
    campo.value = n;

    C.agregar(p.id, n);
    A.enviarEvento('add_to_cart', {
      value: C.precioUnitario(p) * n,
      items: [C.itemGA(p, n, 0)]
    });

    mensaje.hidden = false;
    mensaje.innerHTML = 'Agregaste <strong>' + n + ' × ' + p.nombre + '</strong> al carrito. ' +
      '<a href="carrito.html">Ver carrito</a> · <a href="index.html">Seguir comprando</a>';
  });
})();
