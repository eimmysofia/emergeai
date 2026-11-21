/* Checkout en dos pasos: begin_checkout, add_shipping_info y add_payment_info.
   No se pide ni se guarda correo, teléfono, documento ni datos de tarjeta.
   El nombre ficticio solo se valida en pantalla: no se envía a GA4 ni se almacena. */
(function () {
  'use strict';

  var D = window.TIENDA_DATOS;
  var C = window.Carrito;
  var A = window.Analitica;

  var vacio = document.getElementById('checkout-vacio');
  var contenido = document.getElementById('checkout-contenido');

  if (!C.lineas().length) {
    vacio.hidden = false;
    return;
  }
  contenido.hidden = false;

  var campoNombre = document.getElementById('nombre');
  var selPais = document.getElementById('pais');
  var contServicios = document.getElementById('servicios');
  var errorEnvio = document.getElementById('error-envio');
  var paso1 = document.getElementById('paso-1');
  var paso2 = document.getElementById('paso-2');
  var ind1 = document.getElementById('ind-1');
  var ind2 = document.getElementById('ind-2');
  var resumen = document.getElementById('resumen');
  var contPagos = document.getElementById('pagos');
  var btnPagar = document.getElementById('btn-pagar');

  var envioConfirmado = null; // se llena al pulsar "Continuar al pago"

  /* ---------- Formulario ---------- */
  selPais.innerHTML = D.paises.map(function (p) {
    return '<option value="' + p + '">' + p + '</option>';
  }).join('');

  contPagos.innerHTML = D.pagos.map(function (m, i) {
    return '<label class="opcion"><input type="radio" name="pago" value="' + m + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="opcion__texto"><strong>' + m + '</strong></span></label>';
  }).join('');

  function paisActual() { return selPais.value; }
  function servicioActual() {
    var r = document.querySelector('input[name="servicio"]:checked');
    return r ? r.value : 'Estándar';
  }
  function pagoActual() {
    var r = document.querySelector('input[name="pago"]:checked');
    return r ? r.value : D.pagos[0];
  }

  function textoCosto(env) {
    return env.gratis ? 'Gratis' : C.formatoCOP(env.costo);
  }

  function dibujarServicios() {
    var actual = servicioActual();
    var v = C.valor();
    contServicios.innerHTML = ['Estándar', 'Express'].map(function (s) {
      var env = C.calcularEnvio(paisActual(), s, v);
      var nota = s === 'Estándar'
        ? (env.tipo_cliente === 'Nacional' ? 'Entrega en 3 a 5 días hábiles' : 'Entrega internacional en 10 a 15 días hábiles')
        : (env.tipo_cliente === 'Nacional' ? 'Entrega en 1 a 2 días hábiles' : 'Entrega internacional en 3 a 5 días hábiles');
      return '<label class="opcion"><input type="radio" name="servicio" value="' + s + '"' + (s === actual ? ' checked' : '') + '>' +
        '<span class="opcion__texto"><strong>' + env.tier + '</strong><small>' + nota + '</small></span>' +
        '<span class="opcion__precio' + (env.gratis ? ' opcion__precio--ok' : '') + '">' + textoCosto(env) + '</span></label>';
    }).join('');
  }

  function dibujarResumen() {
    var ls = C.lineas();
    var env = C.calcularEnvio(paisActual(), servicioActual(), C.valor());
    var filas = ls.map(function (l) {
      var p = C.producto(l.id);
      return '<div class="resumen__fila resumen__fila--item"><span>' + l.cantidad + ' × ' + p.nombre + '</span><span>' +
        C.formatoCOP(C.precioUnitario(p) * l.cantidad) + '</span></div>';
    }).join('');
    var desc = C.descuentoTotal() > 0
      ? '<div class="resumen__fila resumen__fila--ok"><span>Descuento ' + D.cupon.porcentaje + ' % (' + C.cuponActivo() + ')</span><span>− ' + C.formatoCOP(C.descuentoTotal()) + '</span></div>'
      : '';
    resumen.innerHTML =
      '<h2>Tu pedido</h2>' + filas +
      '<div class="resumen__fila"><span>Productos</span><span>' + C.formatoCOP(C.valor()) + '</span></div>' + desc +
      '<div class="resumen__fila"><span>Envío · ' + env.tier + '</span><span>' + textoCosto(env) + '</span></div>' +
      '<div class="resumen__fila resumen__fila--total"><span>Total a pagar</span><span>' + C.formatoCOP(C.valor() + env.costo) + '</span></div>' +
      '<p class="nota">Pago simulado: no se cobra nada.</p>';
  }

  function refrescar() {
    dibujarServicios();
    dibujarResumen();
  }

  selPais.addEventListener('change', function () {
    envioConfirmado = null;
    refrescar();
  });
  contServicios.addEventListener('change', function () {
    envioConfirmado = null;
    dibujarResumen();
  });
  campoNombre.addEventListener('input', function () { errorEnvio.hidden = true; });

  refrescar();

  /* ---------- begin_checkout ---------- */
  A.enviarEvento('begin_checkout', C.paramsCarrito());

  /* ---------- Paso 1 → add_shipping_info ---------- */
  document.getElementById('btn-continuar').addEventListener('click', function () {
    var nombre = campoNombre.value.trim();
    if (nombre.length < 2) {
      errorEnvio.textContent = 'Escribe un nombre ficticio para continuar (por ejemplo, "Cliente de Prueba").';
      errorEnvio.hidden = false;
      campoNombre.focus();
      return;
    }
    errorEnvio.hidden = true;

    var env = C.calcularEnvio(paisActual(), servicioActual(), C.valor());
    envioConfirmado = { pais: paisActual(), servicio: servicioActual(), env: env };

    /* Propiedad de usuario: antes de add_shipping_info y de purchase. */
    window.gtag('set', 'user_properties', { tipo_cliente: env.tipo_cliente });

    var params = C.paramsCarrito();
    params.shipping_tier = env.tier;
    A.enviarEvento('add_shipping_info', params);

    paso1.hidden = true;
    paso2.hidden = false;
    ind1.classList.remove('activo');
    ind1.classList.add('hecho');
    ind2.classList.add('activo');
    paso2.scrollIntoView({ block: 'start' });
  });

  document.getElementById('btn-volver').addEventListener('click', function () {
    paso2.hidden = true;
    paso1.hidden = false;
    ind2.classList.remove('activo');
    ind1.classList.remove('hecho');
    ind1.classList.add('activo');
  });

  /* ---------- Paso 2 → add_payment_info ---------- */
  function generarIdTransaccion() {
    return 'EAI-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  btnPagar.addEventListener('click', function () {
    if (!envioConfirmado) { return; }
    btnPagar.disabled = true;

    var pago = pagoActual();
    var env = envioConfirmado.env;
    var base = C.paramsCarrito();

    /* El pedido se guarda en sessionStorage ANTES de ir a gracias.html. */
    var pedido = {
      transaction_id: generarIdTransaccion(),
      affiliation: D.nombre,
      value: base.value,
      shipping: env.costo,
      coupon: base.coupon,
      tipo_cliente: env.tipo_cliente,
      items: base.items,
      pais: envioConfirmado.pais,
      servicio: env.tier,
      payment_type: pago,
      enviado: false
    };
    try { sessionStorage.setItem('emergeai_pedido', JSON.stringify(pedido)); } catch (e) { /* sin acción */ }

    base.payment_type = pago;
    A.enviarEventoYNavegar('add_payment_info', base, 'gracias.html');
  });
})();
