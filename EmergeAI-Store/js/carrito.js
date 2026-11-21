/* ==========================================================================
   Carrito, cupón y cálculo de envío (compartido por todas las páginas).
   El carrito vive en localStorage; no se guarda ningún dato personal.
   ========================================================================== */
(function () {
  'use strict';

  var D = window.TIENDA_DATOS;
  var K_CARRITO = 'emergeai_carrito';
  var K_CUPON = 'emergeai_cupon';
  var memoria = {}; // respaldo por si localStorage no está disponible

  var fmtCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  function leer(clave) {
    try {
      var t = localStorage.getItem(clave);
      return t === null ? undefined : JSON.parse(t);
    } catch (e) { return memoria[clave]; }
  }
  function escribir(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { memoria[clave] = valor; }
  }
  function borrar(clave) {
    try { localStorage.removeItem(clave); } catch (e) { /* sin acción */ }
    delete memoria[clave];
  }

  function formatoCOP(n) { return fmtCOP.format(n); }

  function producto(id) {
    return window.PRODUCTOS.filter(function (p) { return p.id === id; })[0];
  }

  /* ---------- Cupón ---------- */
  function cuponActivo() { return leer(K_CUPON) === D.cupon.codigo ? D.cupon.codigo : null; }
  function aplicarCupon() { escribir(K_CUPON, D.cupon.codigo); }
  function quitarCupon() { borrar(K_CUPON); }

  function precioUnitario(p) {
    return cuponActivo() ? Math.round(p.precio * (100 - D.cupon.porcentaje) / 100) : p.precio;
  }
  function descuentoUnitario(p) { return p.precio - precioUnitario(p); }

  /* ---------- Carrito ---------- */
  function lineas() {
    var crudo = leer(K_CARRITO);
    if (!Array.isArray(crudo)) return [];
    return crudo.filter(function (l) {
      return l && producto(l.id) && Number.isInteger(l.cantidad) && l.cantidad > 0;
    });
  }
  function guardar(ls) {
    escribir(K_CARRITO, ls.map(function (l) { return { id: l.id, cantidad: l.cantidad }; }));
    actualizarInsignia();
  }
  function unidades() {
    return lineas().reduce(function (s, l) { return s + l.cantidad; }, 0);
  }
  function agregar(id, n) {
    var ls = lineas();
    var l = ls.filter(function (x) { return x.id === id; })[0];
    if (l) { l.cantidad += n; } else { ls.push({ id: id, cantidad: n }); }
    guardar(ls);
  }
  /* Quita hasta n unidades y devuelve cuántas quitó realmente. */
  function quitar(id, n) {
    var ls = lineas();
    var l = ls.filter(function (x) { return x.id === id; })[0];
    if (!l) return 0;
    var q = Math.min(n, l.cantidad);
    l.cantidad -= q;
    guardar(ls.filter(function (x) { return x.cantidad > 0; }));
    return q;
  }
  function vaciar() { borrar(K_CARRITO); actualizarInsignia(); }
  function reiniciar() { borrar(K_CARRITO); borrar(K_CUPON); actualizarInsignia(); }

  /* ---------- Totales ---------- */
  function valorLista() {
    return lineas().reduce(function (s, l) { return s + producto(l.id).precio * l.cantidad; }, 0);
  }
  /* Valor de los productos con descuento y SIN envío. */
  function valor() {
    return lineas().reduce(function (s, l) { return s + precioUnitario(producto(l.id)) * l.cantidad; }, 0);
  }
  function descuentoTotal() { return valorLista() - valor(); }

  /* ---------- Ítems para GA4 ---------- */
  function itemGA(p, cantidad, indice) {
    var it = {
      item_id: p.id,
      item_name: p.nombre,
      item_brand: D.marca,
      item_category: p.categoria,
      price: precioUnitario(p),
      quantity: cantidad,
      index: indice
    };
    if (cuponActivo()) {
      it.discount = descuentoUnitario(p);
      it.coupon = D.cupon.codigo;
    }
    return it;
  }
  function itemsGA() {
    return lineas().map(function (l, i) { return itemGA(producto(l.id), l.cantidad, i); });
  }
  /* Parámetros comunes de view_cart, begin_checkout, add_shipping_info y add_payment_info. */
  function paramsCarrito() {
    var p = { value: valor(), items: itemsGA() };
    var c = cuponActivo();
    if (c) p.coupon = c;
    return p;
  }

  /* ---------- Envío ---------- */
  function calcularEnvio(pais, servicio, valorProductos) {
    var tipo = pais === 'Colombia' ? 'Nacional' : 'Internacional';
    var tier = tipo + ' - ' + servicio;
    var costo = D.envio.tarifas[tier];
    var gratis = false;
    if (tier === 'Nacional - Estándar' && valorProductos >= D.envio.gratisDesde) {
      costo = 0;
      gratis = true;
    }
    return { tipo_cliente: tipo, tier: tier, costo: costo, gratis: gratis };
  }

  /* ---------- Presentación ---------- */
  function precioHTML(p) {
    if (cuponActivo()) {
      return '<s class="precio__tachado">' + formatoCOP(p.precio) + '</s> <strong class="precio__valor">' +
        formatoCOP(precioUnitario(p)) + '</strong>';
    }
    return '<strong class="precio__valor">' + formatoCOP(p.precio) + '</strong>';
  }
  function actualizarInsignia() {
    var n = unidades();
    var nodos = document.querySelectorAll('[data-contador-carrito]');
    for (var i = 0; i < nodos.length; i++) nodos[i].textContent = n;
  }

  window.Carrito = {
    producto: producto, lineas: lineas, unidades: unidades,
    agregar: agregar, quitar: quitar, vaciar: vaciar, reiniciar: reiniciar,
    cuponActivo: cuponActivo, aplicarCupon: aplicarCupon, quitarCupon: quitarCupon,
    precioUnitario: precioUnitario, descuentoUnitario: descuentoUnitario,
    valor: valor, valorLista: valorLista, descuentoTotal: descuentoTotal,
    itemGA: itemGA, itemsGA: itemsGA, paramsCarrito: paramsCarrito,
    calcularEnvio: calcularEnvio, formatoCOP: formatoCOP, precioHTML: precioHTML,
    actualizarInsignia: actualizarInsignia
  };

  actualizarInsignia();
})();
