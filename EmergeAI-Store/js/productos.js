/* ==========================================================================
   Datos de la tienda y catálogo de productos (todo ficticio).
   Basado en el portafolio de EmergeAI Trade Solutions S.A.S.
   Precios en pesos colombianos (COP), enteros. TRM de laboratorio: 1 USD = 4.000 COP.
   ========================================================================== */
window.TIENDA_DATOS = {
  nombre: 'EmergeAI Store',
  marca: 'EmergeAI',
  moneda: 'COP',
  trm: 4000,
  lista: { id: 'catalogo_principal', nombre: 'Catálogo principal' },
  cupon: {
    codigo: 'BIENVENIDA10',
    porcentaje: 10,
    nombre: 'Cupón de bienvenida 10 %',
    creativo: 'banner_bienvenida_catalogo',
    espacio: 'catalogo_superior'
  },
  envio: {
    gratisDesde: 150000, // Nacional Estándar es gratis desde este valor en productos (ya con descuento)
    tarifas: {
      'Nacional - Estándar': 12000,
      'Nacional - Express': 25000,
      'Internacional - Estándar': 95000,
      'Internacional - Express': 160000
    }
  },
  paises: ['Colombia', 'Estados Unidos', 'México', 'Perú', 'Chile', 'Brasil', 'España', 'Alemania'],
  pagos: ['Tarjeta de crédito', 'PSE', 'Nequi', 'PayPal']
};

window.PRODUCTOS = [
  {
    id: 'MKI-001',
    nombre: 'Market Intelligence SaaS · Plan Pyme Exportadora',
    categoria: 'Inteligencia de mercados',
    precio: 1960000,
    usd: 490,
    periodo: 'por mes',
    descripcion: 'Plataforma de IA (ANFIS) que jerarquiza los mercados emergentes más rentables y de menor riesgo para tu subpartida arancelaria.',
    incluye: [
      'Hasta 3 subpartidas SA y 3 usuarios',
      'Dashboard con mapas de calor de oportunidad por mercado',
      'Alertas de cambios arancelarios y barreras no arancelarias',
      'Soporte 8/5 por chat'
    ],
    modalidad: '100 % remota (SaaS en la nube)',
    siglas: 'MI', etiqueta: 'Pyme Exportadora', colores: ['#0B2545', '#13A89E']
  },
  {
    id: 'MKI-002',
    nombre: 'Market Intelligence SaaS · Plan Empresa Mediana',
    categoria: 'Inteligencia de mercados',
    precio: 5000000,
    usd: 1250,
    periodo: 'por mes',
    descripcion: 'Inteligencia comercial ampliada con analítica predictiva de demanda a 12, 24 y 36 meses y conexión por API con tu ERP o CRM.',
    incluye: [
      'Hasta 15 subpartidas SA y 10 usuarios',
      'Proyecciones de demanda a 12, 24 y 36 meses',
      'API REST estándar para integrar con ERP/CRM',
      'EmergeAI Copilot: consultas en lenguaje natural',
      'Soporte 24/5 prioritario'
    ],
    modalidad: '100 % remota (SaaS en la nube)',
    siglas: 'MI', etiqueta: 'Empresa Mediana', colores: ['#0B2545', '#0E7F77']
  },
  {
    id: 'CTA-001',
    nombre: 'Customs & Tariff Compliance Agent · Starter Aduanas',
    categoria: 'Cumplimiento aduanero',
    precio: 1160000,
    usd: 290,
    periodo: 'por mes',
    descripcion: 'Agente de IA que clasifica tus productos en el Sistema Armonizado y revisa tus documentos antes de presentarlos a la aduana.',
    incluye: [
      'Hasta 250 documentos procesados por mes',
      'Código SA con índice de certeza probabilística',
      'Extensión web para el navegador',
      'Soporte 8/5 por correo'
    ],
    modalidad: '100 % remota (API, SaaS o extensión)',
    siglas: 'CA', etiqueta: 'Starter Aduanas', colores: ['#134074', '#3FA7D6']
  },
  {
    id: 'CTA-002',
    nombre: 'Customs & Tariff Compliance Agent · Professional Compliance',
    categoria: 'Cumplimiento aduanero',
    precio: 2760000,
    usd: 690,
    periodo: 'por mes',
    descripcion: 'Auditoría documental preventiva y gestión de reglas de origen para exportadores con mayor volumen de operaciones.',
    incluye: [
      'Hasta 1.500 documentos procesados por mes',
      'Integración por API con ERP/WMS',
      'Gestor de acuerdos comerciales y reglas de origen',
      'Documentación multilingüe (más de 15 idiomas)',
      'Soporte 24/5 prioritario'
    ],
    modalidad: '100 % remota (API REST y SaaS)',
    siglas: 'CA', etiqueta: 'Professional', colores: ['#134074', '#2A6FB0']
  },
  {
    id: 'TMB-001',
    nombre: 'TradeMatch B2B · Prospección Pyme',
    categoria: 'Prospección B2B',
    precio: 2600000,
    usd: 650,
    periodo: 'por mes',
    descripcion: 'Encuentra, verifica y contacta compradores e importadores potenciales en tu mercado de destino con mensajes multilingües.',
    incluye: [
      '1 mercado objetivo',
      'Hasta 100 compradores calificados por mes',
      'Secuencias de contacto en 2 idiomas',
      'Scoring de prospectos y revisión virtual quincenal'
    ],
    modalidad: 'Remota, con revisiones virtuales quincenales',
    siglas: 'TM', etiqueta: 'Prospección Pyme', colores: ['#0E7F77', '#2EC4B6']
  },
  {
    id: 'TMB-002',
    nombre: 'TradeMatch B2B · Expansión Regional',
    categoria: 'Prospección B2B',
    precio: 5600000,
    usd: 1400,
    periodo: 'por mes',
    descripcion: 'Prospección automatizada en varios mercados a la vez, con sincronización directa a tu CRM comercial.',
    incluye: [
      'Hasta 3 mercados objetivo',
      'Hasta 350 compradores calificados por mes',
      'Secuencias de contacto en 4 idiomas',
      'Sincronización con Salesforce, HubSpot y Zoho'
    ],
    modalidad: 'Remota, con revisiones virtuales quincenales',
    siglas: 'TM', etiqueta: 'Expansión Regional', colores: ['#0B6E69', '#13A89E']
  },
  {
    id: 'ADV-001',
    nombre: 'Advisory & Strategic Transformation · Diagnóstico y Roadmap Digital',
    categoria: 'Consultoría estratégica',
    precio: 14000000,
    usd: 3500,
    periodo: 'pago único',
    descripcion: 'Cuatro semanas de consultoría para medir la madurez exportadora y digital de tu empresa y trazar su plan de internacionalización.',
    incluye: [
      'Diagnóstico de madurez exportadora y digital',
      'Roadmap de internacionalización a 12 meses',
      'Taller ejecutivo de alfabetización en IA',
      'Equipo consultor dedicado'
    ],
    modalidad: 'Híbrida (presencial y remota)',
    siglas: 'AD', etiqueta: 'Diagnóstico', colores: ['#3D348B', '#7678ED']
  },
  {
    id: 'EXP-001',
    nombre: 'EmergeAI Analytics · Plan Starter Export (autoservicio)',
    categoria: 'Inteligencia de mercados',
    precio: 596000,
    usd: 149,
    periodo: 'por mes',
    descripcion: 'Plan de entrada del canal en línea: analítica predictiva para tus primeras partidas arancelarias, con contratación por checkout y sin intermediarios.',
    incluye: [
      'Analítica predictiva para hasta 5 partidas arancelarias',
      'Hasta 10 mercados evaluados y 3 usuarios',
      'Actualización mensual de datos',
      'Tarifa anual: USD 119 por mes'
    ],
    modalidad: '100 % remota (autoservicio, checkout en línea)',
    siglas: 'SE', etiqueta: 'Starter Export', colores: ['#B26A00', '#F5A623']
  }
];

/* Bloque visual del producto (sin imágenes externas): color + siglas. */
window.bloqueHTML = function (p) {
  return '<div class="bloque" style="--c1:' + p.colores[0] + ';--c2:' + p.colores[1] + '" aria-hidden="true">' +
    '<span class="bloque__siglas">' + p.siglas + '</span>' +
    '<span class="bloque__plan">' + p.etiqueta + '</span>' +
    '</div>';
};
