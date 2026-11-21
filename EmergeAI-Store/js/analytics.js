/* ==========================================================================
   Google Analytics 4 (gtag.js)
   - Carga gtag.js SOLO si GA_MEASUREMENT_ID tiene formato G-... y no es el
     marcador G-XXXXXXXXXX (ver js/config.js).
   - Expone dos funciones:
       Analitica.enviarEvento(nombre, parametros)
       Analitica.enviarEventoYNavegar(nombre, parametros, url)
   ========================================================================== */
(function () {
  'use strict';

  var cfg = window.TIENDA_CONFIG || {};
  var ID = String(cfg.GA_MEASUREMENT_ID || '').trim();
  var DEBUG = cfg.DEBUG_MODE === true;
  var activo = /^G-[A-Z0-9]+$/i.test(ID) && ID.toUpperCase() !== 'G-XXXXXXXXXX';

  /* gtag estándar. Sin ID válido no se envía nada a Google (no-op),
     pero las propiedades de usuario igual se muestran en el monitor. */
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    if (activo) { window.dataLayer.push(arguments); }
    if (arguments[0] === 'set' && arguments[1] === 'user_properties' && window.Monitor) {
      window.Monitor.registrarPropiedades(arguments[2]);
    }
  }
  window.gtag = gtag;

  if (activo) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
    document.head.appendChild(s);

    gtag('js', new Date());
    if (DEBUG) {
      gtag('config', ID, { debug_mode: true });
    } else {
      gtag('config', ID); // sin debug_mode
    }
  }

  /* Elimina valores vacíos para no enviar parámetros inútiles. */
  function limpiar(obj) {
    var r = {};
    Object.keys(obj || {}).forEach(function (k) {
      var v = obj[k];
      if (v !== undefined && v !== null && v !== '') { r[k] = v; }
    });
    return r;
  }

  /* Envía un evento a GA4 y lo muestra en el monitor. */
  function enviarEvento(nombre, parametros, extra) {
    var p = limpiar(parametros);
    if (!p.currency) { p.currency = 'COP'; } // todos los eventos llevan currency
    var paraGA = p;
    if (extra) {
      paraGA = {};
      Object.keys(p).forEach(function (k) { paraGA[k] = p[k]; });
      Object.keys(extra).forEach(function (k) { paraGA[k] = extra[k]; });
    }
    gtag('event', nombre, paraGA);
    if (window.Monitor) { window.Monitor.registrar(nombre, p, activo); }
  }

  /* Envía el evento y luego navega. Con GA activo espera el event_callback
     (event_timeout de 1000 ms) y tiene un respaldo a los 1200 ms por si
     gtag.js está bloqueado. Sin GA no hay nada que esperar: navega al instante. */
  function enviarEventoYNavegar(nombre, parametros, url) {
    var navego = false;
    function ir() {
      if (navego) { return; }
      navego = true;
      window.location.href = url;
    }
    if (!activo) {
      enviarEvento(nombre, parametros);
      ir();
      return;
    }
    enviarEvento(nombre, parametros, { event_callback: ir, event_timeout: 1000 });
    setTimeout(ir, 1200);
  }

  window.Analitica = {
    activo: activo,
    id: ID,
    enviarEvento: enviarEvento,
    enviarEventoYNavegar: enviarEventoYNavegar
  };

  /* Monitor + page_view (gtag('config') ya envía el page_view automático). */
  if (window.Monitor) {
    window.Monitor.iniciar({ activo: activo, id: ID, debug: DEBUG });
    window.Monitor.registrar('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.search
    }, activo);
  }
})();
