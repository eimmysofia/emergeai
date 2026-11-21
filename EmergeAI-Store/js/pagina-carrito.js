/* Página del carrito: view_cart, add_to_cart (aumentar) y remove_from_cart (disminuir o quitar). */
(function () {
  'use strict';

  var C = window.Carrito;
  var A = window.Analitica;
  var D = window.TIENDA_DATOS;

  var vacio = document.getElementById('carrito-vacio');
  var contenido = document.getElementById('carrito-contenido');
  var contLineas = document.getElementById('lineas');
  var resumen = document.getElementById('resumen');

  function dibujar() {
    var ls = C.lineas();
    if (!ls.length) {
      contenido.hidden = true;
      vacio.hidden = false;
      document.getElementById('vacio-cupon').hidden = !C.cuponActivo();
      return;
    }
    vacio.hidden = true;
    contenido.hidden = false;

    contLineas.innerHTML = ls.map(function (l, i) {
      var p = C.producto(l.id);
      return '<article class="linea" data-id="' + p.id + '" data-indice="' + i + '">' +
        window.bloqueHTML(p) +
        '<div class="linea__info">' +
          '<h3 class="linea__titulo"><a href="producto.html?id=' + p.id + '">' + p.nombre + '</a></h3>' +
          '<p class="nota">' + p.categoria + ' · ' + p.periodo + '</p>' +
          '<p class="precio">' + C.precioHTML(p) + ' <small>c/u</small></p>' +
        '</div>' +
        '<div class="linea__acciones">' +
          '<div class="cantidad" role="group" aria-label="Cantidad de ' + p.nombre + '">' +
            '<button type="button" class="cantidad__btn" data-accion="menos" aria-label="Disminuir una unidad">−</button>' +
            '<span class="cantidad__valor" aria-live="polite">' + l.cantidad + '</span>' +
            '<button type="button" class="cantidad__btn" data-accion="mas" aria-label="Aumentar una unidad">+</button>' +
          '</div>' +
          '<strong class="linea__subtotal">' + C.formatoCOP(C.precioUnitario(p) * l.cantidad) + '</strong>' +
          '<button type="button" class="enlace" data-accion="quitar">Quitar</button>' +
        '</div>' +
      '</article>';
    }).join('');

    var cupon = C.cuponActivo();
    var filaDesc = C.descuentoTotal() > 0
      ? '<div class="resumen__fila resumen__fila--ok"><span>Descuento ' + D.cupon.porcentaje + ' %</span><span>− ' + C.formatoCOP(C.descuentoTotal()) + '</span></div>'
      : '';
    resumen.innerHTML =
      '<h2>Resumen</h2>' +
      (cupon
        ? '<p class="cupon-chip">Cupón <strong>' + cupon + '</strong> aplicado <button type="button" class="enlace" data-accion="quitar-cupon">Quitar cupón</button></p>'
        : '<p class="nota">¿Tienes un descuento? Aplica el cupón desde el banner del <a href="index.html">catálogo</a>.</p>') +
      '<div class="resumen__fila"><span>Productos (' + C.unidades() + ')</span><span>' + C.formatoCOP(C.valorLista()) + '</span></div>' +
      filaDesc +
      '<div class="resumen__fila resumen__fila--total"><span>Total productos</span><span>' + C.formatoCOP(C.valor()) + '</span></div>' +
      '<p class="nota">El envío se calcula en el checkout.</p>' +
      '<a class="btn btn--ancho" href="checkout.html">Ir al checkout</a>' +
      '<a class="enlace enlace--centro" href="index.html">Seguir comprando</a>';
  }

  dibujar();

  /* ---------- view_cart (solo si hay productos) ---------- */
  if (C.lineas().length) {
    A.enviarEvento('view_cart', C.paramsCarrito());
  }

  /* ---------- Acciones del carrito ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-accion]') : null;
    if (!b) { return; }
    var accion = b.getAttribute('data-accion');

    if (accion === 'quitar-cupon') {
      C.quitarCupon();
      dibujar();
      return;
    }

    var fila = b.closest('.linea');
    if (!fila) { return; }
    var id = fila.getAttribute('data-id');
    var indice = Number(fila.getAttribute('data-indice'));
    var p = C.producto(id);
    var linea = C.lineas().filter(function (l) { return l.id === id; })[0];
    if (!p || !linea) { return; }

    if (accion === 'mas') {
      if (linea.cantidad >= 99) { return; }
      C.agregar(id, 1);
      A.enviarEvento('add_to_cart', { value: C.precioUnitario(p), items: [C.itemGA(p, 1, indice)] });
    } else if (accion === 'menos') {
      var q = C.quitar(id, 1);
      if (q) {
        A.enviarEvento('remove_from_cart', { value: C.precioUnitario(p) * q, items: [C.itemGA(p, q, indice)] });
      }
    } else if (accion === 'quitar') {
      var todas = C.quitar(id, linea.cantidad);
      if (todas) {
        A.enviarEvento('remove_from_cart', { value: C.precioUnitario(p) * todas, items: [C.itemGA(p, todas, indice)] });
      }
    }
    dibujar();
  });
})();
