# RecSync - Smart Recommendations Module

Un módulo completo de PrestaShop para mostrar productos recomendados basados en una API de analítica/recomendaciones con fallback inteligente.

## 🚀 Características

### ✅ Funcionalidades Principales
- **Integración con API de recomendaciones** - Conecta con tu API personalizada
- **Sistema de caché inteligente** - Con estrategia SWR (Stale-While-Revalidate)
- **Fallback automático** - Múltiples estrategias cuando la API falla (bestsellers, newest, random, featured)
- **Telemetría avanzada** - Tracking de impresiones, clicks y compras
- **Panel de administración completo** - Acceso desde menú "Catálogo" → "Configuración RecSync"
- **GDPR Compliant** - Respeto por el consentimiento del usuario
- **Multiidioma y multitienda** - Soporte completo para PrestaShop (Español por defecto)

### 🎨 Interfaz de Usuario
- **Layouts flexibles** - Grid y carrusel responsivo con navegación configurable
- **Diseño moderno** - CSS3 con animaciones suaves y gradientes
- **Responsive design** - Optimizado para móviles y tablets
- **Carrusel inteligente** - Navegación por flechas e indicadores configurables
- **Autoplay y pausa** - Reproducción automática con pausa al hover
- **Indicadores visuales** - Scores, badges y estados de productos

### ⚙️ Configuración Avanzada
- **Panel de administración completo** - Configuración detallada desde menú "Catálogo"
- **Filtros de productos** - Por categoría, precio, stock
- **Personalización de widgets** - Títulos, límites, columnas
- **Configuración de carrusel** - Flechas de navegación e indicadores configurables
- **Gestión de caché** - TTL configurable y limpieza automática
- **Debug mode** - Logging detallado para troubleshooting

## 📋 Requisitos

- PrestaShop 1.7.x o 8.x
- PHP 7.4 - 8.2
- MySQL 5.7+
- cURL habilitado
- OpenSSL habilitado

## 🛠️ Instalación

1. **Descargar el módulo**
   ```bash
   # Copiar la carpeta recsync a modules/
   cp -r recsync /path/to/prestashop/modules/
   ```

2. **Instalar desde el Back-Office**
   - Ir a Módulos > Module Manager
   - Buscar "RecSync"
   - Hacer clic en "Instalar"

3. **Configurar el módulo**
   - Ir a **Catálogo** > **Configuración RecSync** (nuevo menú)
   - O ir a Módulos > Module Manager > RecSync > Configurar
   - Completar la configuración de la API
   - Ajustar las preferencias del widget y carrusel

## ⚙️ Configuración

### Conexión API
- **API Base URL**: URL base de tu API de recomendaciones
- **Client ID**: Identificador del cliente para autenticación API
- **API Key**: Clave de autenticación (encriptada en BD)
- **Timeout**: Tiempo de espera para requests (ms)
- **Retries**: Número de reintentos en caso de fallo

### Widget Home
- **Título**: Título del bloque de recomendaciones (por defecto: "Recomendados para ti")
- **Límite**: Número máximo de productos a mostrar
- **Layout**: Grid o carrusel
- **Columnas**: Número de columnas en grid (2-6)
- **Excluir sin stock**: Filtrar productos sin stock
- **Lista de categorías**: IDs de categorías permitidas (separados por comas)

### Configuración de Carrusel
- **Mostrar flechas**: Habilitar/deshabilitar flechas de navegación
- **Mostrar indicadores**: Habilitar/deshabilitar puntos de navegación inferior
- **Autoplay**: Reproducción automática (configurable)
- **Pausa al hover**: Pausar carrusel al pasar el mouse

### Privacidad y Consentimiento
- **Respetar CMP**: Respetar consentimiento de cookies
- **Hash de usuario**: Salt para hashear IDs de usuario
- **Personalización invitados**: Habilitar/deshabilitar

### Fallback
- **Estrategia**: Bestsellers, newest, random, featured
- **Límite**: Número de productos de fallback
- **Productos manuales**: Lista de IDs de productos específicos

### Configuración Avanzada
- **Activar módulo**: Habilitar/deshabilitar el módulo
- **Activar telemetría**: Habilitar/deshabilitar tracking de eventos
- **Activar debug**: Habilitar/deshabilitar logging detallado
- **Verificar TLS**: Validación de certificados SSL

## 🔌 API Contract

### Request
```json
{
  "user": {
    "user_id": "u_abc123",
    "session_id": "s_xyz789",
    "consent_personalization": true,
    "is_logged_in": false
  },
  "context": {
    "page": "home",
    "widget_id": "home_main",
    "shop_id": 1,
    "language": "es-CL",
    "currency": "CLP",
    "device": "desktop"
  },
  "rules": {
    "limit": 12,
    "exclude_out_of_stock": true,
    "category_whitelist": [],
    "price_range": null
  }
}
```

### Response
```json
{
  "recommendations": [
    {"external_id": "SKU-123", "score": 0.92},
    {"external_id": "SKU-456", "score": 0.87}
  ],
  "tracking": {
    "request_id": "req_2025-08-17_10:21:00_abcdef",
    "ttl_seconds": 900
  }
}
```

### Telemetry Events
```json
{
  "event_type": "impression|click",
  "request_id": "req_2025-08-17_10:21:00_abcdef",
  "widget_id": "home_main",
  "product_external_id": "SKU-123",
  "position": 1,
  "user_id": "u_abc123",
  "session_id": "s_xyz789",
  "timestamp": 1640995200000
}
```

## 🎯 Hooks Disponibles

- `displayHome` - Widget principal en homepage (carrusel/grid)
- `actionFrontControllerSetMedia` - Carga de assets CSS/JS
- `header` - Configuración de telemetría y analytics
- `actionPresentProduct` - Uniformización de datos de producto
- `actionValidateOrder` - Tracking de eventos de compra

## 📊 KPIs y Métricas

El módulo habilita el seguimiento de:

- **CTR del bloque** - Click-through rate de recomendaciones
- **RPM/GMV atribuible** - Revenue por mil impresiones
- **Latencia API** - Tiempo de respuesta de la API
- **Tasa de fallos** - Porcentaje de requests fallidos
- **Cobertura** - Usuarios con recomendaciones válidas
- **Eventos de compra** - Tracking de conversiones atribuibles

## 🎠 Funcionalidades de Carrusel

### Características del Carrusel
- **Navegación configurable** - Flechas de navegación opcionales
- **Indicadores visuales** - Puntos de navegación inferior configurables
- **Autoplay inteligente** - Reproducción automática con pausa al hover
- **Responsive** - Adaptación automática a diferentes tamaños de pantalla
- **Touch/Swipe** - Soporte para dispositivos táctiles
- **Navegación por teclado** - Soporte para accesibilidad

### Configuración del Carrusel
```javascript
// Configuración disponible en AdminRecsyncController
RECSYNC_CAROUSEL_ARROWS: true/false    // Mostrar flechas
RECSYNC_CAROUSEL_INDICATORS: true/false // Mostrar indicadores
```

### Comportamiento Responsivo
- **Desktop**: 4 productos por vista
- **Tablet**: 2-3 productos por vista  
- **Mobile**: 1 producto por vista
- **Auto-ajuste** según el ancho de pantalla

## 🛡️ Manejo de Errores y Seguridad

### Protecciones Implementadas
- **Try-catch global** en todos los hooks principales
- **Fallback automático** cuando la API falla
- **Retry con exponential backoff** en peticiones HTTP
- **Validación exhaustiva** de datos de entrada
- **Sanitización SQL** en todas las consultas
- **Logging seguro** sin exposición de datos sensibles

### Garantías de Estabilidad
- ✅ **Nunca rompe la tienda** - Todos los hooks retornan string vacío en caso de error
- ✅ **Múltiples capas de fallback** - API → Cache → Fallback local → Array vacío
- ✅ **Operaciones atómicas** - No deja el sistema en estado inconsistente
- ✅ **Timeouts configurables** - Evita bloqueos por API lenta
- ✅ **Debug mode opcional** - Logging detallado solo cuando se necesita

### Estrategias de Fallback
1. **API disponible** → Usar recomendaciones de API
2. **API falla** → Usar datos del caché
3. **Cache falla** → Usar estrategia de fallback local
4. **Todo falla** → Mostrar sección vacía (no rompe la página)

## 🔧 Desarrollo

### Estructura del Módulo
```
recsync/
├── classes/
│   ├── RecsyncApiClient.php
│   ├── RecsyncCache.php
│   ├── RecsyncFallback.php
│   └── RecsyncTelemetry.php
├── controllers/admin/
│   └── AdminRecsyncController.php
├── views/
│   ├── css/
│   │   └── recsync.css
│   ├── js/
│   │   ├── recsync.js
│   │   ├── recsync-product-events.js
│   │   └── admin.js
│   └── templates/
│       ├── admin/
│       │   └── configure.tpl
│       └── hook/
│           ├── displayHome.tpl
│           └── analytics.tpl
├── translations/
│   ├── es.php
│   └── en.php
├── recsync.php
├── config.xml
└── README.md
```

### Clases Principales

#### RecsyncApiClient
Maneja las comunicaciones con la API de recomendaciones:
- Requests HTTP con retry y timeout
- Manejo de errores y logging
- Encriptación de API keys

#### RecsyncCache
Sistema de caché con estrategia SWR:
- Cache en base de datos
- TTL configurable
- Limpieza automática de expirados

#### RecsyncFallback
Estrategias de fallback cuando la API falla:
- **Bestsellers** (productos más vendidos)
- **Newest** (productos más recientes)
- **Random** (selección aleatoria)
- **Featured** (productos destacados)

#### RecsyncTelemetry
Tracking de eventos de usuario:
- Impresiones y clicks
- Eventos de compra
- Envío asíncrono a API
- Almacenamiento local con retry

#### AdminRecsyncController
Panel de administración personalizado:
- Configuración completa del módulo
- Test de conexión API
- Estadísticas y métricas
- Interfaz amigable con validaciones

## 🚨 Troubleshooting

### Problemas Comunes

1. **API no responde**
   - Verificar URL y API key en configuración
   - Revisar logs en PrestaShop (activar debug mode)
   - Comprobar timeout y retries
   - Verificar conectividad de red

2. **No se muestran productos**
   - Verificar que el módulo esté habilitado
   - Comprobar fallback strategy configurada
   - Revisar filtros de categoría/precio
   - Verificar stock de productos
   - Limpiar caché del módulo

3. **Carrusel no funciona**
   - Verificar configuración de flechas e indicadores
   - Comprobar que hay suficientes productos
   - Revisar errores JavaScript en consola
   - Verificar que el layout esté en modo "carousel"

4. **Telemetría no funciona**
   - Verificar configuración de telemetría habilitada
   - Comprobar consentimiento GDPR
   - Revisar logs de JavaScript en consola
   - Verificar configuración de analytics

### Logs
Los logs se guardan en:
- PrestaShop: Módulos > Logs
- Base de datos: Tabla `ps_recsync_telemetry`

## 📝 Changelog

### v1.0.0
- ✅ Lanzamiento inicial
- ✅ Integración completa con API
- ✅ Sistema de fallback con múltiples estrategias
- ✅ Telemetría avanzada (impresiones, clicks, compras)
- ✅ Panel de administración personalizado
- ✅ Layouts grid y carrusel responsivo
- ✅ Configuración de navegación de carrusel
- ✅ Soporte multiidioma (Español por defecto)
- ✅ GDPR compliance
- ✅ Manejo robusto de errores
- ✅ Sistema de caché inteligente
- ✅ Debug mode y logging detallado

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Crear un Pull Request

## 📄 Licencia

Este módulo está bajo la licencia MIT. Ver el archivo LICENSE para más detalles.

## 👥 Autor

**DSIELAB**
- Email: contacto@dsielab.com
- Website: https://dsielab.com

## 🆘 Soporte

Para soporte técnico:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación completa

---

**RecSync** - Haciendo las recomendaciones más inteligentes en PrestaShop 🚀
