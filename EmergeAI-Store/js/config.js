/* ==========================================================================
   CONFIGURACIÓN DE LA TIENDA
   Este es el ÚNICO archivo que necesitas editar.
   ==========================================================================

   DÓNDE PEGAR EL ID DE MEDICIÓN DE GOOGLE ANALYTICS 4
   ---------------------------------------------------
   1. Entra a Google Analytics → Administrar → Flujos de datos → tu flujo web.
   2. Copia el "ID de medición" (empieza por G-, por ejemplo G-AB12CD34EF).
   3. Pégalo más abajo, entre las comillas, en lugar de G-XXXXXXXXXX.
   4. Guarda el archivo y súbelo a GitHub: Vercel publicará el cambio solo.

   Mientras el ID siga siendo G-XXXXXXXXXX la tienda funciona igual, pero NO
   carga gtag.js ni envía nada a Google: los eventos solo se ven en el monitor
   del lado derecho de la pantalla.

   DEBUG_MODE
   ----------
   true  -> los eventos aparecen en GA4 → Administrar → DebugView
            (recomendado durante el laboratorio).
   false -> modo normal: no se envía el parámetro debug_mode.
*/
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // <-- pega aquí tu ID de medición (formato G-...)
  DEBUG_MODE: true                    // <-- true para DebugView; false para desactivarlo
};
