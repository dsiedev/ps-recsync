# RecSync - Smart Recommendations Module

Un módulo completo de PrestaShop para mostrar productos recomendados basados en una API de analítica/recomendaciones con fallback inteligente.

## 🚀 Características

### ✅ Funcionalidades Principales
- **Integración con API de recomendaciones** - Conecta con tu API personalizada
- **Sistema de caché inteligente** - Con estrategia SWR (Stale-While-Revalidate)
- **Fallback automático** - Múltiples estrategias cuando la API falla
- **Telemetría avanzada** - Tracking de impresiones y clicks

- **GDPR Compliant** - Respeto por el consentimiento del usuario
- **Multiidioma y multitienda** - Soporte completo para PrestaShop

### 🎨 Interfaz de Usuario
- **Layouts flexibles** - Grid y carrusel responsivo
- **Diseño moderno** - CSS3 con animaciones suaves
- **Responsive design** - Optimizado para móviles y tablets
- **Indicadores visuales** - Scores, badges y estados

### ⚙️ Configuración Avanzada
- **Panel de administración completo** - Configuración detallada
- **Filtros de productos** - Por categoría, precio, stock
- **Personalización de widgets** - Títulos, límites, columnas
- **Gestión de caché** - TTL configurable y limpieza automática

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
   - Ir a Módulos > Module Manager > RecSync > Configurar
   - Completar la configuración de la API
   - Ajustar las preferencias del widget

## ⚙️ Configuración

### Conexión API
- **API Base URL**: URL base de tu API de recomendaciones
- **Client ID**: Identificador del cliente para autenticación API
- **API Key**: Clave de autenticación (encriptada en BD)
- **Timeout**: Tiempo de espera para requests (ms)
- **Retries**: Número de reintentos en caso de fallo

### Widget Home
- **Título**: Título del bloque de recomendaciones
- **Límite**: Número máximo de productos a mostrar
- **Layout**: Grid o carrusel
- **Columnas**: Número de columnas en grid (2-6)

### Privacidad y Consentimiento
- **Respetar CMP**: Respetar consentimiento de cookies
- **Hash de usuario**: Salt para hashear IDs de usuario
- **Personalización invitados**: Habilitar/deshabilitar

### Fallback
- **Estrategia**: Bestsellers, más vistos, nuevos productos, manual
- **Límite**: Número de productos de fallback
- **Productos manuales**: Lista de IDs de productos específicos

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

- `displayHome` - Widget principal en homepage
- `actionFrontControllerSetMedia` - Carga de assets CSS/JS
- `header` - Configuración de telemetría
- `actionPresentProduct` - Uniformización de datos de producto

## 📊 KPIs y Métricas

El módulo habilita el seguimiento de:

- **CTR del bloque** - Click-through rate de recomendaciones
- **RPM/GMV atribuible** - Revenue por mil impresiones
- **Latencia API** - Tiempo de respuesta de la API
- **Tasa de fallos** - Porcentaje de requests fallidos
- **Cobertura** - Usuarios con recomendaciones válidas

## 🔧 Desarrollo

### Estructura del Módulo
```
recsync/
├── classes/
│   ├── RecsyncApiClient.php
│   ├── RecsyncCache.php
│   ├── RecsyncFallback.php
│   └── RecsyncTelemetry.php
├── views/
│   ├── css/
│   │   ├── recsync.css
│   │   └── admin.css
│   ├── js/
│   │   └── recsync.js
│   └── templates/
│       └── hook/
│           ├── recommendations.tpl
│           └── telemetry.tpl
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
- Bestsellers (ventas recientes)
- Productos más vistos
- Productos nuevos
- Lista manual de productos

#### RecsyncTelemetry
Tracking de eventos de usuario:
- Impresiones y clicks
- Envío asíncrono a API
- Almacenamiento local con retry

## 🚨 Troubleshooting

### Problemas Comunes

1. **API no responde**
   - Verificar URL y API key
   - Revisar logs en PrestaShop
   - Comprobar timeout y retries

2. **No se muestran productos**
   - Verificar fallback strategy
   - Comprobar filtros de categoría/precio
   - Revisar stock de productos

3. **Telemetría no funciona**
   - Verificar configuración de telemetría
   - Comprobar consentimiento GDPR
   - Revisar logs de JavaScript

### Logs
Los logs se guardan en:
- PrestaShop: Módulos > Logs
- Base de datos: Tabla `ps_recsync_telemetry`

## 📝 Changelog

### v1.0.0
- Lanzamiento inicial
- Integración completa con API
- Sistema de fallback
- Telemetría avanzada

- GDPR compliance

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
