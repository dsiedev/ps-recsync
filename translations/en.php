<?php

global $_MODULE;
$_MODULE = array();

// Module information
$_MODULE['<{recsync}prestashop>recsync_displayName'] = 'RecSync - Smart Recommendations';
$_MODULE['<{recsync}prestashop>recsync_description'] = 'Displays recommended products based on analytics/recommendations API with intelligent fallback.';

// Configuration form labels
$_MODULE['<{recsync}prestashop>recsync_config_api_title'] = 'API Configuration';
$_MODULE['<{recsync}prestashop>recsync_config_widget_title'] = 'Widget Configuration';
$_MODULE['<{recsync}prestashop>recsync_config_advanced_title'] = 'Advanced Settings';

// API Configuration
$_MODULE['<{recsync}prestashop>recsync_enabled'] = 'Enable Module';
$_MODULE['<{recsync}prestashop>recsync_api_url'] = 'API URL';
$_MODULE['<{recsync}prestashop>recsync_client_id'] = 'Client ID';
$_MODULE['<{recsync}prestashop>recsync_api_key'] = 'API Key';
$_MODULE['<{recsync}prestashop>recsync_api_timeout'] = 'API Timeout';
$_MODULE['<{recsync}prestashop>recsync_api_retries'] = 'API Retries';
$_MODULE['<{recsync}prestashop>recsync_tls_verify'] = 'Verify TLS';

// Widget Configuration
$_MODULE['<{recsync}prestashop>recsync_widget_title'] = 'Widget Title';
$_MODULE['<{recsync}prestashop>recsync_widget_limit'] = 'Product Limit';
$_MODULE['<{recsync}prestashop>recsync_widget_layout'] = 'Widget Layout';
$_MODULE['<{recsync}prestashop>recsync_widget_columns'] = 'Widget Columns';
$_MODULE['<{recsync}prestashop>recsync_exclude_out_of_stock'] = 'Exclude Out of Stock';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist'] = 'Category Whitelist';

// Advanced Settings
$_MODULE['<{recsync}prestashop>recsync_telemetry_enabled'] = 'Enable Telemetry';
$_MODULE['<{recsync}prestashop>recsync_debug_enabled'] = 'Enable Debug';

// Form descriptions
$_MODULE['<{recsync}prestashop>recsync_enabled_desc'] = 'Enable or disable the RecSync module';
$_MODULE['<{recsync}prestashop>recsync_api_url_desc'] = 'Base URL for the recommendation API';
$_MODULE['<{recsync}prestashop>recsync_client_id_desc'] = 'Client identifier for API authentication';
$_MODULE['<{recsync}prestashop>recsync_api_key_desc'] = 'API key for authentication (will be encrypted)';
$_MODULE['<{recsync}prestashop>recsync_api_timeout_desc'] = 'Timeout for API requests in milliseconds';
$_MODULE['<{recsync}prestashop>recsync_api_retries_desc'] = 'Number of retry attempts for failed requests';
$_MODULE['<{recsync}prestashop>recsync_tls_verify_desc'] = 'Verify TLS certificates for API requests';
$_MODULE['<{recsync}prestashop>recsync_widget_title_desc'] = 'Title displayed in the recommendation widget';
$_MODULE['<{recsync}prestashop>recsync_widget_limit_desc'] = 'Maximum number of products to display';
$_MODULE['<{recsync}prestashop>recsync_widget_layout_desc'] = 'Layout style for the widget (grid/carousel)';
$_MODULE['<{recsync}prestashop>recsync_widget_columns_desc'] = 'Number of columns in grid layout';
$_MODULE['<{recsync}prestashop>recsync_exclude_out_of_stock_desc'] = 'Exclude products that are out of stock';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist_desc'] = 'Comma-separated list of category IDs to include';
$_MODULE['<{recsync}prestashop>recsync_telemetry_enabled_desc'] = 'Enable telemetry data collection';
$_MODULE['<{recsync}prestashop>recsync_debug_enabled_desc'] = 'Enable debug logging';

// Form options
$_MODULE['<{recsync}prestashop>recsync_enabled'] = 'Enabled';
$_MODULE['<{recsync}prestashop>recsync_disabled'] = 'Disabled';
$_MODULE['<{recsync}prestashop>recsync_grid'] = 'Grid';
$_MODULE['<{recsync}prestashop>recsync_carousel'] = 'Carousel';

// Messages
$_MODULE['<{recsync}prestashop>recsync_settings_updated'] = 'Settings updated successfully';
$_MODULE['<{recsync}prestashop>recsync_save'] = 'Save';

// Widget title default
$_MODULE['<{recsync}prestashop>recsync_widget_title_default'] = 'Recommended for you';

// Error messages
$_MODULE['<{recsync}prestashop>recsync_module_not_enabled'] = 'Module not enabled';
$_MODULE['<{recsync}prestashop>recsync_cache_miss'] = 'Cache miss, trying API';
$_MODULE['<{recsync}prestashop>recsync_api_success'] = 'API response successful';
$_MODULE['<{recsync}prestashop>recsync_api_failed'] = 'API failed or no response, using fallback';
$_MODULE['<{recsync}prestashop>recsync_cache_hit'] = 'Cache hit, using cached recommendations';
$_MODULE['<{recsync}prestashop>recsync_products_mapped'] = 'Products mapped';
$_MODULE['<{recsync}prestashop>recsync_checking_completion'] = 'Checking completion';
$_MODULE['<{recsync}prestashop>recsync_starting_completion'] = 'Starting category completion';
$_MODULE['<{recsync}prestashop>recsync_completed_with_categories'] = 'Completed with category products';
$_MODULE['<{recsync}prestashop>recsync_completion_failed'] = 'Category completion failed';
$_MODULE['<{recsync}prestashop>recsync_no_completion_needed'] = 'No completion needed';
$_MODULE['<{recsync}prestashop>recsync_no_products_from_api'] = 'No products from API, trying fallback';
$_MODULE['<{recsync}prestashop>recsync_fallback_mapped'] = 'Fallback products mapped';
$_MODULE['<{recsync}prestashop>recsync_no_products_display'] = 'No products to display (including fallback)';

// Admin menu
$_MODULE['<{recsync}prestashop>recsync_admin_menu'] = 'RecSync Configuration';

// Configuration sections
$_MODULE['<{recsync}prestashop>recsync_config_title'] = 'RecSync Configuration';
$_MODULE['<{recsync}prestashop>recsync_config_subtitle'] = 'Configure RecSync module parameters to enable personalized product recommendations.';

// Additional translations for PHP code
$_MODULE['<{recsync}prestashop>recsync_settings_updated_successfully'] = 'Settings updated successfully';
$_MODULE['<{recsync}prestashop>recsync_api_configuration'] = 'API Configuration';
$_MODULE['<{recsync}prestashop>recsync_enable_module'] = 'Enable Module';
$_MODULE['<{recsync}prestashop>recsync_enabled'] = 'Enabled';
$_MODULE['<{recsync}prestashop>recsync_disabled'] = 'Disabled';
$_MODULE['<{recsync}prestashop>recsync_api_base_url'] = 'API Base URL';
$_MODULE['<{recsync}prestashop>recsync_base_url_desc'] = 'Base URL for the recommendations API';
$_MODULE['<{recsync}prestashop>recsync_client_id'] = 'Client ID';
$_MODULE['<{recsync}prestashop>recsync_client_id_desc'] = 'Client identifier for API authentication';
$_MODULE['<{recsync}prestashop>recsync_enable_debug'] = 'Enable Debug';
$_MODULE['<{recsync}prestashop>recsync_debug_desc'] = 'Enable debug mode for analytics script';
$_MODULE['<{recsync}prestashop>recsync_api_key'] = 'API Key';
$_MODULE['<{recsync}prestashop>recsync_api_key_desc'] = 'API key for authentication (leave empty to keep current)';
$_MODULE['<{recsync}prestashop>recsync_api_timeout_ms'] = 'API Timeout (ms)';
$_MODULE['<{recsync}prestashop>recsync_timeout_desc'] = 'Timeout for API requests in milliseconds';
$_MODULE['<{recsync}prestashop>recsync_api_retries'] = 'API Retries';
$_MODULE['<{recsync}prestashop>recsync_retries_desc'] = 'Number of retry attempts for failed requests';
$_MODULE['<{recsync}prestashop>recsync_verify_tls'] = 'Verify TLS';
$_MODULE['<{recsync}prestashop>recsync_widget_title'] = 'Widget Title';
$_MODULE['<{recsync}prestashop>recsync_widget_title_desc'] = 'Title displayed above the recommendations block';
$_MODULE['<{recsync}prestashop>recsync_product_limit'] = 'Product Limit';
$_MODULE['<{recsync}prestashop>recsync_product_limit_desc'] = 'Maximum number of products to display';
$_MODULE['<{recsync}prestashop>recsync_layout'] = 'Layout';
$_MODULE['<{recsync}prestashop>recsync_grid'] = 'Grid';
$_MODULE['<{recsync}prestashop>recsync_carousel'] = 'Carousel';
$_MODULE['<{recsync}prestashop>recsync_grid_columns'] = 'Grid Columns';
$_MODULE['<{recsync}prestashop>recsync_grid_columns_desc'] = 'Number of columns in grid layout (2-6)';
$_MODULE['<{recsync}prestashop>recsync_exclude_out_of_stock'] = 'Exclude Out of Stock';
$_MODULE['<{recsync}prestashop>recsync_yes'] = 'Yes';
$_MODULE['<{recsync}prestashop>recsync_no'] = 'No';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist'] = 'Category Whitelist';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist_desc'] = 'Comma-separated list of category IDs to include';
$_MODULE['<{recsync}prestashop>recsync_advanced_settings'] = 'Advanced Settings';
$_MODULE['<{recsync}prestashop>recsync_enable_telemetry'] = 'Enable Telemetry';
$_MODULE['<{recsync}prestashop>recsync_save'] = 'Save';

// Template translations
$_MODULE['<{recsync}prestashop>recsync_configuracion_recsync'] = 'RecSync Configuration';
$_MODULE['<{recsync}prestashop>recsync_recsync_recomendaciones_inteligentes'] = 'RecSync - Smart Recommendations';
$_MODULE['<{recsync}prestashop>recsync_configure_params'] = 'Configure RecSync module parameters to enable personalized product recommendations.';
$_MODULE['<{recsync}prestashop>recsync_configuracion_api'] = 'API Configuration';
$_MODULE['<{recsync}prestashop>recsync_activar_modulo'] = 'Enable Module';
$_MODULE['<{recsync}prestashop>recsync_si'] = 'Yes';
$_MODULE['<{recsync}prestashop>recsync_no'] = 'No';
$_MODULE['<{recsync}prestashop>recsync_url_api'] = 'API URL';
$_MODULE['<{recsync}prestashop>recsync_url_base_desc'] = 'Base URL for the recommendations API';
$_MODULE['<{recsync}prestashop>recsync_id_cliente'] = 'Client ID';
$_MODULE['<{recsync}prestashop>recsync_id_cliente_desc'] = 'Client identifier for API authentication';
$_MODULE['<{recsync}prestashop>recsync_clave_api'] = 'API Key';
$_MODULE['<{recsync}prestashop>recsync_ingrese_nueva_clave'] = 'Enter new API key to update';
$_MODULE['<{recsync}prestashop>recsync_clave_actual'] = 'Current key: %s';
$_MODULE['<{recsync}prestashop>recsync_api_timeout_ms'] = 'API Timeout (ms)';
$_MODULE['<{recsync}prestashop>recsync_api_retries'] = 'API Retries';
$_MODULE['<{recsync}prestashop>recsync_verify_tls'] = 'Verify TLS';
$_MODULE['<{recsync}prestashop>recsync_widget_configuration'] = 'Widget Configuration';
$_MODULE['<{recsync}prestashop>recsync_widget_title'] = 'Widget Title';
$_MODULE['<{recsync}prestashop>recsync_product_limit'] = 'Product Limit';
$_MODULE['<{recsync}prestashop>recsync_layout'] = 'Layout';
$_MODULE['<{recsync}prestashop>recsync_grid'] = 'Grid';
$_MODULE['<{recsync}prestashop>recsync_carousel'] = 'Carousel';
$_MODULE['<{recsync}prestashop>recsync_grid_columns'] = 'Grid Columns';
$_MODULE['<{recsync}prestashop>recsync_exclude_out_of_stock'] = 'Exclude Out of Stock';
$_MODULE['<{recsync}prestashop>recsync_category_whitelist'] = 'Category Whitelist';
$_MODULE['<{recsync}prestashop>recsync_comma_separated_ids'] = 'Comma-separated category IDs';
$_MODULE['<{recsync}prestashop>recsync_advanced_settings'] = 'Advanced Settings';
$_MODULE['<{recsync}prestashop>recsync_enable_telemetry'] = 'Enable Telemetry';
$_MODULE['<{recsync}prestashop>recsync_enable_debug'] = 'Enable Debug';
$_MODULE['<{recsync}prestashop>recsync_debug_mode_desc'] = 'Enable debug mode for detailed logging';
$_MODULE['<{recsync}prestashop>recsync_recomendados_para_ti'] = 'Recommended for you';
$_MODULE['<{recsync}prestashop>recsync_no_recommendations'] = 'No recommendations available at the moment.';

// JavaScript translations
$_MODULE['<{recsync}prestashop>recsync_productos'] = 'Products';
$_MODULE['<{recsync}prestashop>recsync_pedido_completado'] = 'Order completed';
$_MODULE['<{recsync}prestashop>recsync_producto'] = 'Product';
$_MODULE['<{recsync}prestashop>recsync_page'] = 'Page';
$_MODULE['<{recsync}prestashop>configure_8a2f2b6f6b5b5b5b5b5b5b5b5b5b5b5b5'] = 'Show Carousel Arrows';
$_MODULE['<{recsync}prestashop>configure_9a2f2b6f6b5b5b5b5b5b5b5b5b5b5b5b6'] = 'Show navigation arrows in carousel mode';
$_MODULE['<{recsync}prestashop>configure_7a2f2b6f6b5b5b5b5b5b5b5b5b5b5b5b7'] = 'Show Carousel Indicators';
$_MODULE['<{recsync}prestashop>configure_8a2f2b6f6b5b5b5b5b5b5b5b5b5b5b5b8'] = 'Show navigation indicators (dots) in carousel mode';

?>