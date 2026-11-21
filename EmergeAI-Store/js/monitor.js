/* ==========================================================================
   MONITOR DE EVENTOS (ayuda didáctica)
   Panel fijo a la derecha que muestra qué envía la tienda a GA4.
   - Estado de la conexión con GA4
   - Origen de la visita (UTM de la primera página de la sesión)
   - Últimos 12 eventos (persisten entre páginas en sessionStorage)
   - Botón "Simular nuevo visitante"
   No muestra ni guarda ningún dato personal.
   ========================================================================== */
(function () {
  'use strict';

  var K_EVENTOS = 'monitor_eventos';
  var K_ORIGEN = 'monitor_origen';
  var K_PROPS = 'monitor_propiedades';
  var K_OCULTO = 'monitor_oculto'; // se guarda en localStorage: recuerda el estado del panel
  var MAX_EVENTOS = 12;

  var el = {};
  var fmtCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  function leerSS(clave, defecto) {
    try {
      var t = sessionStorage.getItem(clave);
      return t ? JSON.parse(t) : defecto;
    } catch (e) { return defecto; }
  }
  function escribirSS(clave, valor) {
    try { sessionStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin acción */ }
  }
  function cop(n) { return typeof n === 'number' ? fmtCOP.format(n) : '—'; }

  /* Resumen legible de cada evento. */
  function resumir(nombre, p) {
    p = p || {};
    var items = Array.isArray(p.items) ? p.items : [];
    var it = items[0] || {};
    var cupon = p.coupon ? ' · cupón ' + p.coupon : '';
    var n = items.length + (items.length === 1 ? ' producto' : ' productos');
    switch (nombre) {
      case 'page_view': return p.page_title || p.page_path || 'página vista';
      case 'view_item_list': return (p.item_list_name || '') + ' · ' + n;
      case 'view_promotion':
      case 'select_promotion': return (p.promotion_id || '') + ' · ' + (p.creative_slot || '') + ' · ' + n;
      case 'select_item': return (it.item_name || '') + ' · posición ' + ((it.index || 0) + 1) + ' en ' + (p.item_list_name || 'la lista');
      case 'view_item': return (it.item_name || '') + ' · ' + cop(p.value);
      case 'add_to_cart':
      case 'remove_from_cart': return (it.quantity || 1) + ' × ' + (it.item_name || '') + ' · ' + cop(p.value);
      case 'view_cart':
      case 'begin_checkout': return n + ' · ' + cop(p.value) + cupon;
      case 'add_shipping_info': return (p.shipping_tier || '') + ' · ' + cop(p.value) + cupon;
      case 'add_payment_info': return (p.payment_type || '') + ' · ' + cop(p.value) + cupon;
      case 'purchase':
        return (p.transaction_id || '') + ' · productos ' + cop(p.value) + ' + envío ' + cop(p.shipping) +
          ' · ' + (p.tipo_cliente || '') + cupon;
      default: return n;
    }
  }

  /* ---------- Origen de la visita ---------- */
  function limpiarUTM(v) {
    return v ? String(v).replace(/[\r\n<>]/g, '').trim().slice(0, 60) : '';
  }
  function capturarOrigen() {
    var o = leerSS(K_ORIGEN, null);
    if (!o) {
      var q = new URLSearchParams(window.location.search);
      var s = limpiarUTM(q.get('utm_source'));
      var m = limpiarUTM(q.get('utm_medium'));
      var c = limpiarUTM(q.get('utm_campaign'));
      o = (s || m || c) ? (s || '—') + ' / ' + (m || '—') + ' · ' + (c || '—') : 'directo (sin UTM)';
      escribirSS(K_ORIGEN, o);
    }
    return o;
  }

  /* ---------- Dibujo ---------- */
  function dibujarPropiedades() {
    if (!el.props) return;
    var props = leerSS(K_PROPS, {});
    var claves = Object.keys(props);
    el.props.textContent = claves.length
      ? claves.map(function (k) { return k + ' = ' + props[k]; }).join(' · ')
      : '—';
  }

  function dibujarLista() {
    if (!el.lista) return;
    var datos = leerSS(K_EVENTOS, []);
    el.lista.textContent = '';
    if (!datos.length) {
      var vacio = document.createElement('li');
      vacio.className = 'ev ev--vacio';
      vacio.textContent = 'Aún no hay eventos en esta sesión.';
      el.lista.appendChild(vacio);
      return;
    }
    datos.forEach(function (ev) {
      var li = document.createElement('li');
      li.className = 'ev' + (ev.nombre === 'purchase' ? ' ev--compra' : '');

      var cab = document.createElement('div');
      cab.className = 'ev__cab';
      var hora = document.createElement('span');
      hora.className = 'ev__hora';
      hora.textContent = ev.hora;
      var nom = document.createElement('span');
      nom.className = 'ev__nombre';
      nom.textContent = ev.nombre;
      var tag = document.createElement('span');
      tag.className = 'ev__tag ' + (ev.ga ? 'ev__tag--ga' : 'ev__tag--local');
      tag.textContent = ev.ga ? 'enviado a GA4' : 'solo local';
      cab.appendChild(hora);
      cab.appendChild(nom);
      cab.appendChild(tag);

      var res = document.createElement('div');
      res.className = 'ev__res';
      res.textContent = ev.resumen;

      var det = document.createElement('details');
      det.className = 'ev__det';
      var sum = document.createElement('summary');
      sum.textContent = 'Ver parámetros';
      var pre = document.createElement('pre');
      pre.textContent = JSON.stringify(ev.params, null, 2);
      det.appendChild(sum);
      det.appendChild(pre);

      li.appendChild(cab);
      li.appendChild(res);
      li.appendChild(det);
      el.lista.appendChild(li);
    });
  }

  function aplicarOculto(oculto) {
    document.body.classList.toggle('monitor-oculto', oculto);
    el.panel.classList.toggle('monitor--oculto', oculto);
    el.toggle.textContent = oculto ? 'Mostrar' : 'Ocultar';
    el.toggle.setAttribute('aria-expanded', oculto ? 'false' : 'true');
    el.toggle.setAttribute('aria-label', (oculto ? 'Mostrar' : 'Ocultar') + ' el monitor de eventos');
  }
  function estaOculto() {
    try { return localStorage.getItem(K_OCULTO) === '1'; } catch (e) { return false; }
  }
  function guardarOculto(v) {
    try { localStorage.setItem(K_OCULTO, v ? '1' : '0'); } catch (e) { /* sin acción */ }
  }

  /* ---------- Simular nuevo visitante ---------- */
  function borrarCookiesGA() {
    var host = window.location.hostname;
    var partes = host.split('.');
    var dominios = [null, host, '.' + host]; // sin atributo domain, y variantes del host
    if (!/^\d+(\.\d+){3}$/.test(host) && partes.length > 2) {
      for (var i = 1; i < partes.length - 1; i++) {
        var sufijo = partes.slice(i).join('.');
        dominios.push(sufijo, '.' + sufijo);
      }
    }
    var nombres = document.cookie.split(';').map(function (c) {
      return c.split('=')[0].trim();
    }).filter(function (n) {
      return n.indexOf('_ga') === 0 || n === '_gid' || n.indexOf('_gat') === 0;
    });
    nombres.forEach(function (nombre) {
      dominios.forEach(function (dom) {
        document.cookie = nombre + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/' +
          (dom ? '; domain=' + dom : '');
      });
    });
  }
  function simularNuevoVisitante() {
    borrarCookiesGA();
    if (window.Carrito) { window.Carrito.reiniciar(); }
    else {
      try { localStorage.removeItem('emergeai_carrito'); localStorage.removeItem('emergeai_cupon'); } catch (e) { /* sin acción */ }
    }
    try { sessionStorage.clear(); } catch (e) { /* sin acción */ }
    window.location.href = 'index.html';
  }

  /* ---------- API pública ---------- */
  function iniciar(conf) {
    if (el.panel) return;
    var origen = capturarOrigen();

    var panel = document.createElement('aside');
    panel.id = 'monitor';
    panel.className = 'monitor';
    panel.setAttribute('aria-label', 'Monitor de eventos de Google Analytics 4');
    panel.innerHTML =
      '<div class="monitor__cab">' +
        '<strong class="monitor__titulo">Monitor de eventos</strong>' +
        '<button type="button" class="monitor__toggle" id="monitor-toggle" aria-controls="monitor-cuerpo">Ocultar</button>' +
      '</div>' +
      '<div class="monitor__cuerpo" id="monitor-cuerpo">' +
        '<p class="monitor__estado" id="monitor-estado"></p>' +
        '<dl class="monitor__datos">' +
          '<dt>Origen de la visita</dt><dd id="monitor-origen"></dd>' +
          '<dt>Propiedad de usuario</dt><dd id="monitor-props"></dd>' +
        '</dl>' +
        '<h2 class="monitor__sub">Últimos ' + MAX_EVENTOS + ' eventos</h2>' +
        '<ol class="monitor__lista" id="monitor-lista" role="log" aria-live="off"></ol>' +
        '<button type="button" class="monitor__reset" id="monitor-reset">Simular nuevo visitante</button>' +
      '</div>';
    document.body.appendChild(panel);
    document.body.classList.add('con-monitor');

    el.panel = panel;
    el.toggle = panel.querySelector('#monitor-toggle');
    el.estado = panel.querySelector('#monitor-estado');
    el.origen = panel.querySelector('#monitor-origen');
    el.props = panel.querySelector('#monitor-props');
    el.lista = panel.querySelector('#monitor-lista');

    if (conf && conf.activo) {
      el.estado.className = 'monitor__estado monitor__estado--ok';
      el.estado.textContent = 'Conectado a ' + conf.id + (conf.debug ? ' · modo depuración' : '');
    } else {
      el.estado.className = 'monitor__estado monitor__estado--error';
      el.estado.textContent = 'Sin ID de medición: los eventos solo se muestran aquí. Edita js/config.js.';
    }
    el.origen.textContent = origen;

    el.toggle.addEventListener('click', function () {
      var nuevo = !el.panel.classList.contains('monitor--oculto');
      guardarOculto(nuevo);
      aplicarOculto(nuevo);
    });
    panel.querySelector('#monitor-reset').addEventListener('click', simularNuevoVisitante);

    aplicarOculto(estaOculto());
    dibujarPropiedades();
    dibujarLista();
  }

  function registrar(nombre, params, enviadoAGA) {
    var lista = leerSS(K_EVENTOS, []);
    lista.unshift({
      hora: new Date().toLocaleTimeString('es-CO', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      nombre: nombre,
      resumen: resumir(nombre, params),
      params: params,
      ga: !!enviadoAGA
    });
    escribirSS(K_EVENTOS, lista.slice(0, MAX_EVENTOS));
    dibujarLista();
  }

  function registrarPropiedades(obj) {
    var props = leerSS(K_PROPS, {});
    Object.keys(obj || {}).forEach(function (k) { props[k] = obj[k]; });
    escribirSS(K_PROPS, props);
    dibujarPropiedades();
  }

  window.Monitor = { iniciar: iniciar, registrar: registrar, registrarPropiedades: registrarPropiedades };
})();
