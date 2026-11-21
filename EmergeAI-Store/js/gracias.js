/* Confirmación del pedido: envía purchase UNA sola vez por pedido.
   - El pedido viene de sessionStorage (lo guardó checkout.js).
   - Después de enviar purchase se marca como "enviado": recargar no lo repite.
   - Se vacía el carrito (y el cupón usado). */
(function () {
  'use strict';

  var D = window.TIENDA_DATOS;
  var C = window.Carrito;
  var A = window.Analitica;
  var K_PEDIDO = 'emergeai_pedido';

  var sinPedido = document.getElementById('sin-pedido');
  var confirmacion = document.getElementById('confirmacion');

  var pedido = null;
  try { pedido = JSON.parse(sessionStorage.getItem(K_PEDIDO) || 'null'); } catch (e) { pedido = null; }

  if (!pedido || !pedido.transaction_id || !Array.isArray(pedido.items)) {
    sinPedido.hidden = false;
    return;
  }
  confirmacion.hidden = false;

  /* ---------- Resumen en pantalla ---------- */
  document.getElementById('num-pedido').textContent = pedido.transaction_id;
  document.getElementById('datos-envio').textContent =
    pedido.servicio + ' · ' + pedido.pais + ' · pago con ' + pedido.payment_type + ' (simulado)';

  var descuentoTotal = pedido.items.reduce(function (s, it) { return s + (it.discount || 0) * it.quantity; }, 0);
  var filas = pedido.items.map(function (it) {
    return '<div class="resumen__fila resumen__fila--item"><span>' + it.quantity + ' × ' + it.item_name + '</span><span>' +
      C.formatoCOP(it.price * it.quantity) + '</span></div>';
  }).join('');
  document.getElementById('resumen-final').innerHTML =
    filas +
    '<div class="resumen__fila"><span>Productos</span><span>' + C.formatoCOP(pedido.value) + '</span></div>' +
    (descuentoTotal > 0
      ? '<div class="resumen__fila resumen__fila--ok"><span>Descuento aplicado (' + pedido.coupon + ')</span><span>' + C.formatoCOP(descuentoTotal) + '</span></div>'
      : '') +
    '<div class="resumen__fila"><span>Envío</span><span>' + (pedido.shipping === 0 ? 'Gratis' : C.formatoCOP(pedido.shipping)) + '</span></div>' +
    '<div class="resumen__fila resumen__fila--total"><span>Total simulado</span><span>' + C.formatoCOP(pedido.value + pedido.shipping) + '</span></div>';

  var nota = document.getElementById('nota-ga');

  /* ---------- purchase (una sola vez por pedido) ---------- */
  if (pedido.enviado) {
    nota.textContent = 'Este pedido ya fue registrado. Recargar la página no vuelve a enviar el evento purchase.';
    return;
  }

  /* La propiedad de usuario va antes de purchase (en esta página hay que fijarla de nuevo). */
  window.gtag('set', 'user_properties', { tipo_cliente: pedido.tipo_cliente });

  A.enviarEvento('purchase', {
    transaction_id: pedido.transaction_id,
    affiliation: pedido.affiliation || D.nombre,
    value: pedido.value,
    shipping: pedido.shipping,
    coupon: pedido.coupon,
    tipo_cliente: pedido.tipo_cliente,
    items: pedido.items
  });

  /* Marcar como enviado DESPUÉS de purchase y vaciar el carrito. */
  pedido.enviado = true;
  try { sessionStorage.setItem(K_PEDIDO, JSON.stringify(pedido)); } catch (e) { /* sin acción */ }
  C.vaciar();
  C.quitarCupon();

  nota.textContent = A.activo
    ? 'Se envió el evento purchase a GA4 (una sola vez para este pedido). Si recargas esta página no se repetirá.'
    : 'GA4 no está conectado (ID marcador): el evento purchase solo se muestra en el monitor. Si recargas esta página no se repetirá.';
})();
