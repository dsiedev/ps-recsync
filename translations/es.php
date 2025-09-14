<?php

global $_MODULE;
$_MODULE = array();

// Module information
$_MODULE['<{recsync}prestashop>recsync_displayName'] = 'RecSync - Recomendaciones Inteligentes';
$_MODULE['<{recsync}prestashop>recsync_description'] = 'Muestra productos recomendados basados en la API de analítica/recomendaciones con fallback inteligente.';

// Configuration form labels
$_MODULE['<{recsync}prestashop>recsync_config_api_title'] = 'Configuración de API';
$_MODULE['<{recsync}prestashop>recsync_config_widget_title'] = 'Configuración del Widget';
$_MODULE['<{recsync}prestashop>recsync_config_advanced_title'] = 'Configuración Avanzada';

// API Configuration
$_MODULE['<{recsync}prestashop>recsync_enabled'] = 'Activar Módulo';
$_MODULE['<{recsync}prestashop>recsync_api_url'] = 'URL de API';
$_MODULE['<{recsync}prestashop>recsync_client_id'] = 'ID de Cliente';
$_MODULE['<{recsync}prestashop>recsync_api_key'] = 'Clave de API';
$_MODULE['<{recsync}prestashop>recsync_api_timeout'] = 'Timeout de API';
$_MODULE['<{recsync}prestashop>recsync_api_retries'] = 'Reintentos de API';
$_MODULE['<{recsync}prestashop>recsync_tls_verify'] = 'Verificar TLS';

// Widget Configuration
$_MODULE['<{recsync}prestashop>recsync_widget_title'] = 'Título del Widget';
$_MODULE['<{recsync}prestashop>recsync_widget_limit'] = 'Límite de Productos';
$_MODULE['<{recsync}prestashop>recsync_widget_layout'] = 'Diseño del Widget';
$_MODULE['<{recsync}prestashop>recsync_widget_columns'] = 'Columnas del Widget';
$_MODULE['<{recsync}prestashop>recsync_exclude_out_of_stock'] = 'Excluir Sin Stock';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist'] = 'Lista de Categorías';

// Advanced Settings
$_MODULE['<{recsync}prestashop>recsync_telemetry_enabled'] = 'Activar Telemetría';
$_MODULE['<{recsync}prestashop>recsync_debug_enabled'] = 'Activar Debug';

// Form descriptions
$_MODULE['<{recsync}prestashop>recsync_enabled_desc'] = 'Activar o desactivar el módulo RecSync';
$_MODULE['<{recsync}prestashop>recsync_api_url_desc'] = 'URL base para la API de recomendaciones';
$_MODULE['<{recsync}prestashop>recsync_client_id_desc'] = 'Identificador de cliente para autenticación de API';
$_MODULE['<{recsync}prestashop>recsync_api_key_desc'] = 'Clave de API para autenticación (será encriptada)';
$_MODULE['<{recsync}prestashop>recsync_api_timeout_desc'] = 'Timeout para peticiones de API en milisegundos';
$_MODULE['<{recsync}prestashop>recsync_api_retries_desc'] = 'Número de intentos para peticiones fallidas';
$_MODULE['<{recsync}prestashop>recsync_tls_verify_desc'] = 'Verificar certificados TLS para peticiones de API';
$_MODULE['<{recsync}prestashop>recsync_widget_title_desc'] = 'Título mostrado en el widget de recomendaciones';
$_MODULE['<{recsync}prestashop>recsync_widget_limit_desc'] = 'Número máximo de productos a mostrar';
$_MODULE['<{recsync}prestashop>recsync_widget_layout_desc'] = 'Estilo de diseño para el widget (cuadrícula/carrusel)';
$_MODULE['<{recsync}prestashop>recsync_widget_columns_desc'] = 'Número de columnas en el diseño de cuadrícula';
$_MODULE['<{recsync}prestashop>recsync_exclude_out_of_stock_desc'] = 'Excluir productos que están sin stock';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist_desc'] = 'Lista separada por comas de IDs de categorías a incluir';
$_MODULE['<{recsync}prestashop>recsync_telemetry_enabled_desc'] = 'Activar recolección de datos de telemetría';
$_MODULE['<{recsync}prestashop>recsync_debug_enabled_desc'] = 'Activar registro de debug';

// Form options
$_MODULE['<{recsync}prestashop>recsync_enabled'] = 'Activado';
$_MODULE['<{recsync}prestashop>recsync_disabled'] = 'Desactivado';
$_MODULE['<{recsync}prestashop>recsync_grid'] = 'Cuadrícula';
$_MODULE['<{recsync}prestashop>recsync_carousel'] = 'Carrusel';

// Messages
$_MODULE['<{recsync}prestashop>recsync_settings_updated'] = 'Configuración actualizada exitosamente';
$_MODULE['<{recsync}prestashop>recsync_save'] = 'Guardar';

// Widget title default
$_MODULE['<{recsync}prestashop>recsync_widget_title_default'] = 'Recomendados para ti';
$_MODULE['<{recsync}prestashop>recsync_recommended_for_you'] = 'Recomendados para ti';

// Error messages
$_MODULE['<{recsync}prestashop>recsync_module_not_enabled'] = 'Módulo no activado';
$_MODULE['<{recsync}prestashop>recsync_cache_miss'] = 'Cache perdido, intentando API';
$_MODULE['<{recsync}prestashop>recsync_api_success'] = 'Respuesta de API exitosa';
$_MODULE['<{recsync}prestashop>recsync_api_failed'] = 'API falló o sin respuesta, usando fallback';
$_MODULE['<{recsync}prestashop>recsync_cache_hit'] = 'Cache encontrado, usando recomendaciones en caché';
$_MODULE['<{recsync}prestashop>recsync_products_mapped'] = 'Productos mapeados';
$_MODULE['<{recsync}prestashop>recsync_checking_completion'] = 'Verificando completado';
$_MODULE['<{recsync}prestashop>recsync_starting_completion'] = 'Iniciando completado de categorías';
$_MODULE['<{recsync}prestashop>recsync_completed_with_categories'] = 'Completado con productos de categorías';
$_MODULE['<{recsync}prestashop>recsync_completion_failed'] = 'Completado de categorías falló';
$_MODULE['<{recsync}prestashop>recsync_no_completion_needed'] = 'No se necesita completado';
$_MODULE['<{recsync}prestashop>recsync_no_products_from_api'] = 'Sin productos de API, intentando fallback';
$_MODULE['<{recsync}prestashop>recsync_fallback_mapped'] = 'Productos de fallback mapeados';
$_MODULE['<{recsync}prestashop>recsync_no_products_display'] = 'Sin productos para mostrar (incluyendo fallback)';

// Admin menu
$_MODULE['<{recsync}prestashop>recsync_admin_menu'] = 'Configuración RecSync';

// Configuration sections
$_MODULE['<{recsync}prestashop>recsync_config_title'] = 'Configuración de RecSync';
$_MODULE['<{recsync}prestashop>recsync_config_subtitle'] = 'Configure los parámetros del módulo RecSync para habilitar recomendaciones personalizadas de productos.';

// Additional translations for PHP code
$_MODULE['<{recsync}prestashop>recsync_settings_updated_successfully'] = 'Configuración actualizada exitosamente';
$_MODULE['<{recsync}prestashop>recsync_api_configuration'] = 'Configuración de API';
$_MODULE['<{recsync}prestashop>recsync_enable_module'] = 'Activar Módulo';
$_MODULE['<{recsync}prestashop>recsync_enabled'] = 'Activado';
$_MODULE['<{recsync}prestashop>recsync_disabled'] = 'Desactivado';
$_MODULE['<{recsync}prestashop>recsync_api_base_url'] = 'URL de API';
$_MODULE['<{recsync}prestashop>recsync_base_url_desc'] = 'URL base para la API de recomendaciones';
$_MODULE['<{recsync}prestashop>recsync_client_id'] = 'ID de Cliente';
$_MODULE['<{recsync}prestashop>recsync_client_id_desc'] = 'Identificador de cliente para autenticación de API';
$_MODULE['<{recsync}prestashop>recsync_enable_debug'] = 'Activar Debug';
$_MODULE['<{recsync}prestashop>recsync_debug_desc'] = 'Activar modo debug para script de analíticas';
$_MODULE['<{recsync}prestashop>recsync_api_key'] = 'Clave de API';
$_MODULE['<{recsync}prestashop>recsync_api_key_desc'] = 'Clave de API para autenticación (dejar vacío para mantener actual)';
$_MODULE['<{recsync}prestashop>recsync_api_timeout_ms'] = 'Timeout de API (ms)';
$_MODULE['<{recsync}prestashop>recsync_timeout_desc'] = 'Timeout para peticiones de API en milisegundos';
$_MODULE['<{recsync}prestashop>recsync_api_retries'] = 'Reintentos de API';
$_MODULE['<{recsync}prestashop>recsync_retries_desc'] = 'Número de intentos para peticiones fallidas';
$_MODULE['<{recsync}prestashop>recsync_verify_tls'] = 'Verificar TLS';
$_MODULE['<{recsync}prestashop>recsync_widget_title'] = 'Título del Widget';
$_MODULE['<{recsync}prestashop>recsync_widget_title_desc'] = 'Título mostrado sobre el bloque de recomendaciones';
$_MODULE['<{recsync}prestashop>recsync_product_limit'] = 'Límite de Productos';
$_MODULE['<{recsync}prestashop>recsync_product_limit_desc'] = 'Número máximo de productos a mostrar';
$_MODULE['<{recsync}prestashop>recsync_layout'] = 'Diseño';
$_MODULE['<{recsync}prestashop>recsync_grid'] = 'Cuadrícula';
$_MODULE['<{recsync}prestashop>recsync_carousel'] = 'Carrusel';
$_MODULE['<{recsync}prestashop>recsync_grid_columns'] = 'Columnas de Cuadrícula';
$_MODULE['<{recsync}prestashop>recsync_grid_columns_desc'] = 'Número de columnas en diseño de cuadrícula (2-6)';
$_MODULE['<{recsync}prestashop>recsync_exclude_out_of_stock'] = 'Excluir Sin Stock';
$_MODULE['<{recsync}prestashop>recsync_yes'] = 'Sí';
$_MODULE['<{recsync}prestashop>recsync_no'] = 'No';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist'] = 'Lista de Categorías';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist_desc'] = 'Lista separada por comas de IDs de categorías a incluir';
$_MODULE['<{recsync}prestashop>recsync_advanced_settings'] = 'Configuraciones Avanzadas';
$_MODULE['<{recsync}prestashop>recsync_enable_telemetry'] = 'Activar Telemetría';
$_MODULE['<{recsync}prestashop>recsync_save'] = 'Guardar';

// Template translations (duplicates removed, using main translations above)
$_MODULE['<{recsync}prestashop>recsync_widget_configuration'] = 'Configuración del Widget';
$_MODULE['<{recsync}prestashop>recsync_api_timeout_ms'] = 'Timeout de API (ms)';
$_MODULE['<{recsync}prestashop>recsync_api_retries'] = 'Reintentos de API';
$_MODULE['<{recsync}prestashop>recsync_verify_tls'] = 'Verificar TLS';
$_MODULE['<{recsync}prestashop>recsync_widget_title'] = 'Título del Widget';
$_MODULE['<{recsync}prestashop>recsync_product_limit'] = 'Límite de Productos';
$_MODULE['<{recsync}prestashop>recsync_layout'] = 'Diseño';
$_MODULE['<{recsync}prestashop>recsync_grid'] = 'Cuadrícula';
$_MODULE['<{recsync}prestashop>recsync_carousel'] = 'Carrusel';
$_MODULE['<{recsync}prestashop>recsync_grid_columns'] = 'Columnas de Cuadrícula';
$_MODULE['<{recsync}prestashop>recsync_exclude_out_of_stock'] = 'Excluir Sin Stock';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist'] = 'Lista de Categorías';
$_MODULE['<{recsync}prestashop>recsync_advanced_settings'] = 'Configuraciones Avanzadas';
$_MODULE['<{recsync}prestashop>recsync_enable_telemetry'] = 'Activar Telemetría';
$_MODULE['<{recsync}prestashop>recsync_enable_debug'] = 'Activar Debug';
$_MODULE['<{recsync}prestashop>recsync_yes'] = 'Sí';
$_MODULE['<{recsync}prestashop>recsync_no'] = 'No';
$_MODULE['<{recsync}prestashop>recsync_comma_separated_ids'] = 'IDs de categorías separados por comas';
$_MODULE['<{recsync}prestashop>recsync_debug_mode_desc'] = 'Activar modo debug para registro detallado';

// Exact template translations using correct MD5 keys (configure template)
$_MODULE['<{recsync}prestashop>configure_3264205e358bc7a22f068fec8d63c54e'] = 'Timeout de API (ms)';
$_MODULE['<{recsync}prestashop>configure_7b03d5850e1b124e10a02d5c8fccfb28'] = 'Reintentos de API';
$_MODULE['<{recsync}prestashop>configure_5f8c2510408bc3044a4027daa74f01ad'] = 'Verificar TLS';
$_MODULE['<{recsync}prestashop>configure_7139ec57d9839282272d095f5b176e55'] = 'Configuración del Widget';
$_MODULE['<{recsync}prestashop>configure_a763014a3695992edd8b8ad584a4a454'] = 'Título del Widget';
$_MODULE['<{recsync}prestashop>configure_5d1dba09dcca2334ab1c3345824e2141'] = 'Límite de Productos';
$_MODULE['<{recsync}prestashop>configure_ebd9bec4d70abc789d439c1f136b0538'] = 'Diseño';
$_MODULE['<{recsync}prestashop>configure_5174d1309f275ba6f275db3af9eb3e18'] = 'Cuadrícula';
$_MODULE['<{recsync}prestashop>configure_225bf3d9290b5f536b2e442259e78652'] = 'Carrusel';
$_MODULE['<{recsync}prestashop>configure_172b15accf31c1b20be0e05d04170e57'] = 'Columnas de Cuadrícula';
$_MODULE['<{recsync}prestashop>configure_14ec31b87eb94fdf3245558a0e15afca'] = 'Excluir Sin Stock';
$_MODULE['<{recsync}prestashop>configure_3eda7a5c0bc45537506ccc738f877d48'] = 'Lista de Categorías';
$_MODULE['<{recsync}prestashop>configure_9ffc3ccc968a96d902af963c6d7b4e97'] = 'Configuraciones Avanzadas';
$_MODULE['<{recsync}prestashop>configure_659ecda2261731d4a114563c8a652cff'] = 'Activar Telemetría';
$_MODULE['<{recsync}prestashop>configure_93cba07454f06a4a960172bbd6e2a435'] = 'Sí';
$_MODULE['<{recsync}prestashop>configure_bafd7322c6e97d25b6299b5d6fe8920b'] = 'No';
$_MODULE['<{recsync}prestashop>configure_8819c44e0c4c2f8e4a78d88f8f98de20'] = 'Activar Debug';
$_MODULE['<{recsync}prestashop>configure_2b75ae6d246d09fea5aecbe8b91b1483'] = 'IDs de categorías separados por comas';
$_MODULE['<{recsync}prestashop>configure_071b3928532cb3b90a2062632d9d7768'] = 'Activar modo debug para registro detallado';

// JavaScript translations
$_MODULE['<{recsync}prestashop>recsync_productos'] = 'Productos';
$_MODULE['<{recsync}prestashop>recsync_pedido_completado'] = 'Pedido completado';
$_MODULE['<{recsync}prestashop>recsync_producto'] = 'Producto';
$_MODULE['<{recsync}prestashop>recsync_page'] = 'Página';
$_MODULE['<{recsync}prestashop>configure_8a2f2b6f6b5b5b5b5b5b5b5b5b5b5b5b5'] = 'Mostrar Flechas del Carrusel';
$_MODULE['<{recsync}prestashop>configure_9a2f2b6f6b5b5b5b5b5b5b5b5b5b5b5b6'] = 'Mostrar flechas de navegación en modo carrusel';
$_MODULE['<{recsync}prestashop>configure_7a2f2b6f6b5b5b5b5b5b5b5b5b5b5b5b7'] = 'Mostrar Indicadores del Carrusel';
$_MODULE['<{recsync}prestashop>configure_8a2f2b6f6b5b5b5b5b5b5b5b5b5b5b5b8'] = 'Mostrar indicadores de navegación (puntos) en modo carrusel';
$_MODULE['<{recsync}prestashop>recsync_recommendation_tracking'] = 'Seguimiento de Recomendaciones';
$_MODULE['<{recsync}prestashop>recsync_recommendation_tracking_desc'] = 'Rastrea clicks, vistas y añadidos al carrito en productos recomendados para mejorar las recomendaciones';

?>