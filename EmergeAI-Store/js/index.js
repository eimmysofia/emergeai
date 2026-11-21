/* Página del catálogo: view_item_list, view_promotion, select_promotion y select_item. */
(function () {
  'use strict';

  var D = window.TIENDA_DATOS;
  var P = window.PRODUCTOS;
  var C = window.Carrito;
  var A = window.Analitica;

  var lista = document.getElementById('lista');
  var banner = document.getElementById('banner-cupon');
  var avisoCupon = document.getElementById('cupon-aplicado');

  document.getElementById('conteo').textContent = P.length + ' servicios · precios en COP';

  /* ---------- Tarjetas del catálogo ---------- */
  lista.innerHTML = P.map(function (p, i) {
    return '<a class="tarjeta" href="producto.html?id=' + p.id + '" data-indice="' + i + '">' +
      window.bloqueHTML(p) +
      '<div class="tarjeta__cuerpo">' +
        '<span class="etiqueta">' + p.categoria + '</span>' +
        '<h3 class="tarjeta__titulo">' + p.nombre + '</h3>' +
        '<p class="tarjeta__desc">' + p.descripcion + '</p>' +
        '<div class="tarjeta__pie">' +
          '<span class="precio">' + C.precioHTML(p) + '<small> ' + p.periodo + '</small></span>' +
          '<span class="btn btn--pequeno">Ver detalle</span>' +
        '</div>' +
      '</div>' +
    '</a>';
  }).join('');

  /* ---------- view_item_list ---------- */
  A.enviarEvento('view_item_list', {
    item_list_id: D.lista.id,
    item_list_name: D.lista.nombre,
    items: P.map(function (p, i) { return C.itemGA(p, 1, i); })
  });

  /* ---------- Banner del cupón ---------- */
  function paramsPromocion() {
    return {
      promotion_id: D.cupon.codigo,
      promotion_name: D.cupon.nombre,
      creative_name: D.cupon.creativo,
      creative_slot: D.cupon.espacio,
      items: P.map(function (p, i) { return C.itemGA(p, 1, i); })
    };
  }

  if (C.cuponActivo()) {
    avisoCupon.hidden = false; // el cupón ya está aplicado: no se vuelve a mostrar el banner
  } else {
    banner.hidden = false;
    A.enviarEvento('view_promotion', paramsPromocion());

    banner.addEventListener('click', function (e) {
      var params = paramsPromocion(); // mismos parámetros que view_promotion
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        A.enviarEvento('select_promotion', params);
        C.aplicarCupon();
        return;
      }
      e.preventDefault();
      C.aplicarCupon();
      A.enviarEventoYNavegar('select_promotion', params, 'carrito.html');
    });
  }

  /* ---------- select_item (antes de navegar al detalle) ---------- */
  lista.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('.tarjeta') : null;
    if (!a) { return; }
    var i = Number(a.getAttribute('data-indice'));
    var params = {
      item_list_id: D.lista.id,
      item_list_name: D.lista.nombre,
      items: [C.itemGA(P[i], 1, i)]
    };
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      A.enviarEvento('select_item', params);
      return;
    }
    e.preventDefault();
    A.enviarEventoYNavegar('select_item', params, a.getAttribute('href'));
  });
})();
