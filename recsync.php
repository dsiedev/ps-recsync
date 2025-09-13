<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class Recsync extends Module
{
    const CACHE_PREFIX = 'recsync_';
    const CACHE_TTL_DEFAULT = 900; // 15 minutes
    const API_TIMEOUT_DEFAULT = 600; // 600ms
    const MAX_RETRIES = 2;
    
    public function __construct()
    {
        $this->name = 'recsync';
        $this->tab = 'front_office_features';
        $this->version = '1.0.0';
        $this->author = 'DSIELAB';
        $this->need_instance = 0;
        $this->bootstrap = true;
        $this->ps_versions_compliancy = ['min' => '1.7.0.0', 'max' => _PS_VERSION_];

        parent::__construct();

        $this->displayName = $this->l('RecSync - Recomendaciones Inteligentes');
        $this->description = $this->l('Muestra productos recomendados basados en la API de analítica/recomendaciones con fallback inteligente.');
        
        // Load dependencies
        require_once _PS_MODULE_DIR_ . $this->name . '/classes/RecsyncApiClient.php';
        require_once _PS_MODULE_DIR_ . $this->name . '/classes/RecsyncCache.php';
        require_once _PS_MODULE_DIR_ . $this->name . '/classes/RecsyncFallback.php';
        require_once _PS_MODULE_DIR_ . $this->name . '/classes/RecsyncTelemetry.php';
    }

    public function install()
    {
        return parent::install() &&
            $this->registerHook('displayHome') &&
            $this->registerHook('actionFrontControllerSetMedia') &&
            $this->registerHook('header') &&
            $this->registerHook('actionPresentProduct') &&
            $this->registerHook('actionValidateOrder') &&
            $this->installConfiguration() &&
            $this->installDatabase() &&
            $this->installAdminTab();
    }

    public function uninstall()
    {
        return parent::uninstall() &&
            $this->uninstallConfiguration() &&
            $this->uninstallDatabase() &&
            $this->uninstallAdminTab();
    }

    /**
     * Install default configuration
     */
    private function installConfiguration()
    {
        // Get Spanish language ID as default
        $spanishLanguageId = Language::getIdByIso('es');
        if (!$spanishLanguageId) {
            // Fallback to default language if Spanish is not available
            $spanishLanguageId = Configuration::get('PS_LANG_DEFAULT');
        }

        $configs = [
            // API Connection
            'RECSYNC_API_URL' => 'https://api.recsync.com',
            'RECSYNC_CLIENT_ID' => '',
            'RECSYNC_API_KEY' => '',
            'RECSYNC_API_TIMEOUT' => self::API_TIMEOUT_DEFAULT,
            'RECSYNC_API_RETRIES' => self::MAX_RETRIES,
            'RECSYNC_TLS_VERIFY' => 1,
            
            // Widget Configuration - Spanish as default
            'RECSYNC_WIDGET_TITLE' => [
                $spanishLanguageId => 'Recomendados para ti',
                Language::getIdByIso('en') => 'Recommended for you'
            ],
            'RECSYNC_WIDGET_LIMIT' => 12,
            'RECSYNC_WIDGET_LAYOUT' => 'grid',
            'RECSYNC_WIDGET_COLUMNS' => 4,
            'RECSYNC_EXCLUDE_OUT_OF_STOCK' => 1,
            'RECSYNC_CATEGORY_WHITELIST' => '',
            'RECSYNC_PRICE_MIN' => 0,
            'RECSYNC_PRICE_MAX' => 0,
            'RECSYNC_ORDER_BY' => 'sales',
            
            // Privacy & Consent
            'RECSYNC_RESPECT_CMP' => 1,
            'RECSYNC_USER_SALT' => Tools::passwdGen(32),
            'RECSYNC_DISABLE_GUEST_PERSONALIZATION' => 0,
            
            // Telemetry
            'RECSYNC_TELEMETRY_ENABLED' => 1,
            
            // Cache
            'RECSYNC_CACHE_TTL_MIN' => 300,
            'RECSYNC_CACHE_TTL_MAX' => 1800,
            'RECSYNC_SWR_ENABLED' => 1,
            
            // Fallback
            'RECSYNC_FALLBACK_STRATEGY' => 'bestsellers',
            'RECSYNC_FALLBACK_LIMIT' => 12,
            'RECSYNC_FALLBACK_PRODUCTS' => '',
            
            // Module Status
            'RECSYNC_ENABLED' => 1,
            'RECSYNC_DEBUG_ENABLED' => 0,
        ];

        foreach ($configs as $key => $value) {
            Configuration::updateValue($key, $value);
        }

        return true;
    }

    /**
     * Uninstall configuration
     */
    private function uninstallConfiguration()
    {
        $configs = [
            'RECSYNC_API_URL', 'RECSYNC_CLIENT_ID', 'RECSYNC_API_KEY', 'RECSYNC_API_TIMEOUT', 'RECSYNC_API_RETRIES',
            'RECSYNC_TLS_VERIFY', 'RECSYNC_WIDGET_TITLE', 'RECSYNC_WIDGET_LIMIT', 'RECSYNC_WIDGET_LAYOUT',
            'RECSYNC_WIDGET_COLUMNS', 'RECSYNC_EXCLUDE_OUT_OF_STOCK', 'RECSYNC_CATEGORY_WHITELIST',
            'RECSYNC_PRICE_MIN', 'RECSYNC_PRICE_MAX', 'RECSYNC_ORDER_BY', 'RECSYNC_RESPECT_CMP',
            'RECSYNC_USER_SALT', 'RECSYNC_DISABLE_GUEST_PERSONALIZATION',
            'RECSYNC_TELEMETRY_ENABLED', 'RECSYNC_TELEMETRY_URL', 'RECSYNC_CACHE_TTL_MIN',
            'RECSYNC_CACHE_TTL_MAX', 'RECSYNC_SWR_ENABLED', 'RECSYNC_FALLBACK_STRATEGY',
            'RECSYNC_FALLBACK_LIMIT', 'RECSYNC_FALLBACK_PRODUCTS', 'RECSYNC_ENABLED'
        ];

        foreach ($configs as $key) {
            Configuration::deleteByName($key);
        }

        return true;
    }

    /**
     * Install database tables
     */
    private function installDatabase()
    {
        $sql = [];
        
        // Cache table
        $sql[] = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'recsync_cache` (
            `id_cache` int(11) NOT NULL AUTO_INCREMENT,
            `cache_key` varchar(255) NOT NULL,
            `cache_data` longtext NOT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `expires_at` timestamp NOT NULL,
            PRIMARY KEY (`id_cache`),
            UNIQUE KEY `cache_key` (`cache_key`),
            KEY `expires_at` (`expires_at`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8;';
        
        // Telemetry events table
        $sql[] = 'CREATE TABLE IF NOT EXISTS `' . _DB_PREFIX_ . 'recsync_telemetry` (
            `id_telemetry` int(11) NOT NULL AUTO_INCREMENT,
            `event_type` varchar(50) NOT NULL,
            `request_id` varchar(255) NOT NULL,
            `widget_id` varchar(100) NOT NULL,
            `product_external_id` varchar(255) NOT NULL,
            `position` int(11) DEFAULT NULL,
            `user_id` varchar(255) DEFAULT NULL,
            `session_id` varchar(255) DEFAULT NULL,
            `client_id` varchar(255) DEFAULT NULL,
            `additional_data` text DEFAULT NULL,
            `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `sent_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id_telemetry`),
            KEY `event_type` (`event_type`),
            KEY `request_id` (`request_id`),
            KEY `created_at` (`created_at`)
        ) ENGINE=' . _MYSQL_ENGINE_ . ' DEFAULT CHARSET=utf8;';

        foreach ($sql as $query) {
            if (!Db::getInstance()->execute($query)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Uninstall database tables
     */
    private function uninstallDatabase()
    {
        $sql = [
            'DROP TABLE IF EXISTS `' . _DB_PREFIX_ . 'recsync_cache`',
            'DROP TABLE IF EXISTS `' . _DB_PREFIX_ . 'recsync_telemetry`'
        ];

        foreach ($sql as $query) {
            Db::getInstance()->execute($query);
        }

        return true;
    }

    /**
     * Main hook for displaying recommendations on homepage
     */
    public function hookDisplayHome($params)
    {
        // Debug logging
        $debugEnabled = Configuration::get('RECSYNC_DEBUG_ENABLED');
        if ($debugEnabled) {
            PrestaShopLogger::addLog(
                'RecSync Debug: hookDisplayHome called',
                1,
                null,
                'Recsync',
                $this->id
            );
        }
        
        $moduleEnabled = Configuration::get('RECSYNC_ENABLED');
        if (!$moduleEnabled) {
            if ($debugEnabled) {
                PrestaShopLogger::addLog(
                    'RecSync Debug: Module not enabled (RECSYNC_ENABLED = ' . ($moduleEnabled ? 'true' : 'false') . ')',
                    1,
                    null,
                    'Recsync',
                    $this->id
                );
            }
            return '';
        }

        try {
            if ($debugEnabled) {
                PrestaShopLogger::addLog(
                    'RecSync Debug: Starting hookDisplayHome execution',
                    1,
                    null,
                    'Recsync',
                    $this->id
                );
            }
            
            $apiClient = new RecsyncApiClient();
            $cache = new RecsyncCache();
            $fallback = new RecsyncFallback();
            
            // Get context
            $context = $this->buildContext();
            if ($debugEnabled) {
                PrestaShopLogger::addLog(
                    'RecSync Debug: Context built successfully',
                    1,
                    null,
                    'Recsync',
                    $this->id
                );
            }
            
            // Try to get recommendations from cache first
            $cacheKey = $this->generateCacheKey($context);
            $recommendations = $cache->get($cacheKey);
            
            if ($recommendations === false) {
                // Cache miss, try API
                if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                    PrestaShopLogger::addLog(
                        'RecSync Debug: Cache miss, trying API',
                        1,
                        null,
                        'Recsync',
                        $this->id
                    );
                }
                
                $recommendations = $apiClient->getRecommendations($context);
                
                if ($recommendations && isset($recommendations['recommendations'])) {
                    if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                        PrestaShopLogger::addLog(
                            'RecSync Debug: API response successful - products: ' . count($recommendations['recommendations']),
                            1,
                            null,
                            'Recsync',
                            $this->id
                        );
                    }
                    
                    // Cache successful response
                    $ttl = isset($recommendations['tracking']['ttl_seconds']) 
                        ? $recommendations['tracking']['ttl_seconds'] 
                        : self::CACHE_TTL_DEFAULT;
                    
                    $cache->set($cacheKey, $recommendations, $ttl);
                } else {
                    if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                        PrestaShopLogger::addLog(
                            'RecSync Debug: API failed or no response, using fallback',
                            1,
                            null,
                            'Recsync',
                            $this->id
                        );
                    }
                    
                    // API failed, use fallback
                    $recommendations = $fallback->getFallbackProducts($context);
                }
            } else {
                if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                    PrestaShopLogger::addLog(
                        'RecSync Debug: Cache hit, using cached recommendations',
                        1,
                        null,
                        'Recsync',
                        $this->id
                    );
                }
            }
            
            // Map external IDs to PrestaShop products
            $products = $this->mapProducts($recommendations);
            
            if ($debugEnabled) {
                PrestaShopLogger::addLog(
                    'RecSync Debug: Products mapped - count: ' . count($products) . '. Raw recommendations structure: ' . print_r($recommendations, true),
                    1,
                    null,
                    'Recsync',
                    $this->id
                );
            }
            
            // Complete with category-based products if needed
            $widgetLimit = (int)Configuration::get('RECSYNC_WIDGET_LIMIT');
            if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                PrestaShopLogger::addLog(
                    'RecSync Debug: Checking completion - current products: ' . count($products) . ', widget limit: ' . $widgetLimit,
                    1,
                    null,
                    'Recsync',
                    $this->id
                );
            }
            
            if (count($products) < $widgetLimit) {
                if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                    PrestaShopLogger::addLog(
                        'RecSync Debug: Starting category completion - need ' . ($widgetLimit - count($products)) . ' more products',
                        1,
                        null,
                        'Recsync',
                        $this->id
                    );
                }
                
                try {
                    $products = $this->completeWithCategoryProducts($products, $widgetLimit);
                    
                    if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                        PrestaShopLogger::addLog(
                            'RecSync Debug: Completed with category products - final count: ' . count($products),
                            1,
                            null,
                            'Recsync',
                            $this->id
                        );
                    }
                } catch (Exception $e) {
                    if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                        PrestaShopLogger::addLog(
                            'RecSync Error: Category completion failed: ' . $e->getMessage(),
                            2,
                            null,
                            'Recsync',
                            $this->id
                        );
                    }
                }
            } else {
                if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                    PrestaShopLogger::addLog(
                        'RecSync Debug: No completion needed - already have ' . count($products) . ' products',
                        1,
                        null,
                        'Recsync',
                        $this->id
                    );
                }
            }
            
            // If no products from API, try fallback
            if (empty($products)) {
                if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                    PrestaShopLogger::addLog(
                        'RecSync Debug: No products from API, trying fallback',
                        1,
                        null,
                        'Recsync',
                        $this->id
                    );
                }
                
                $fallbackRecommendations = $fallback->getFallbackProducts($context);
                $products = $this->mapProducts($fallbackRecommendations);
                
                if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                    PrestaShopLogger::addLog(
                        'RecSync Debug: Fallback products mapped - count: ' . count($products),
                        1,
                        null,
                        'Recsync',
                        $this->id
                    );
                }
                
                // Update tracking ID to indicate fallback
                if (isset($fallbackRecommendations['tracking']['request_id'])) {
                    $recommendations['tracking']['request_id'] = $fallbackRecommendations['tracking']['request_id'];
                }
            }
            
            if (empty($products)) {
                if ($debugEnabled) {
                    PrestaShopLogger::addLog(
                        'RecSync Debug: No products to display (including fallback). Final products count: ' . count($products),
                        1,
                        null,
                        'Recsync',
                        $this->id
                    );
                }
                return '';
            }
            
            // Debug logging for products and layout
            if ($debugEnabled) {
                PrestaShopLogger::addLog(
                    'RecSync Debug: Found ' . count($products) . ' products. Layout: ' . Configuration::get('RECSYNC_WIDGET_LAYOUT') . '. Widget enabled: ' . ($moduleEnabled ? 'true' : 'false'),
                    1,
                    null,
                    'Recsync',
                    $this->id
                );
            }
            
            // Assign to Smarty with safe defaults
            $this->context->smarty->assign([
                'recsync_products' => $products,
                'recsync_widget_title' => Configuration::get('RECSYNC_WIDGET_TITLE') ?: null,
                'recsync_widget_limit' => Configuration::get('RECSYNC_WIDGET_LIMIT') ?: 12,
                'recsync_widget_columns' => Configuration::get('RECSYNC_WIDGET_COLUMNS') ?: 4,
                'recsync_layout' => Configuration::get('RECSYNC_WIDGET_LAYOUT') ?: 'grid',
                'recsync_carousel_arrows' => Configuration::get('RECSYNC_CAROUSEL_ARROWS') ?: false,
                'recsync_carousel_indicators' => Configuration::get('RECSYNC_CAROUSEL_INDICATORS') !== false ? Configuration::get('RECSYNC_CAROUSEL_INDICATORS') : true,
                'recsync_tracking_id' => isset($recommendations['tracking']['request_id']) 
                    ? $recommendations['tracking']['request_id'] 
                    : 'fallback_' . time(),
                'recsync_widget_id' => 'home_main',
                'recsync_telemetry_enabled' => Configuration::get('RECSYNC_TELEMETRY_ENABLED') ?: false,
                'recsync_debug_enabled' => Configuration::get('RECSYNC_DEBUG_ENABLED') ?: false,
                'recsync_enabled' => Configuration::get('RECSYNC_ENABLED') ?: false,
                'recsync_module_url' => $this->_path ?: '',
                'recsync_has_products' => !empty($products),
                'recsync_product_count' => count($products),
            ]);
            
            return $this->display(__FILE__, 'views/templates/hook/displayHome.tpl');
            
        } catch (Exception $e) {
            PrestaShopLogger::addLog(
                'RecSync Error: ' . $e->getMessage(),
                3,
                null,
                'Recsync',
                $this->id
            );
            
            return '';
        }
    }

    /**
     * Hook for adding CSS/JS assets
     */
    public function hookActionFrontControllerSetMedia($params)
    {
        if (Configuration::get('RECSYNC_ENABLED')) {
            $this->context->controller->addCSS($this->_path . 'views/css/recsync.css');
            $this->context->controller->addJS($this->_path . 'views/js/recsync.js');
        }
    }

    /**
     * Hook for header (telemetry setup and analytics script)
     */
    public function hookHeader($params)
    {
        if (!Configuration::get('RECSYNC_ENABLED')) {
            return;
        }

        $context = Context::getContext();
        
        // Obtener configuración del módulo
        $clientId = Configuration::get('RECSYNC_CLIENT_ID');
        $apiUrl = Configuration::get('RECSYNC_API_URL');
        $debugEnabled = Configuration::get('RECSYNC_DEBUG_ENABLED');
        
        // Obtener y desencriptar la API key
        $apiKey = '';
        $encryptedApiKey = Configuration::get('RECSYNC_API_KEY');
        if (!empty($encryptedApiKey)) {
            $salt = Configuration::get('RECSYNC_USER_SALT');
            if (!empty($salt)) {
                $apiKey = openssl_decrypt(
                    base64_decode($encryptedApiKey), 
                    'AES-256-CBC', 
                    $salt, 
                    0, 
                    substr($salt, 0, 16)
                );
            }
        }
        
        // Obtener customer ID del backend
        $customerId = null;
        $isLoggedIn = false;
        
        if ($context->customer && $context->customer->isLogged()) {
            $isLoggedIn = true;
            $customerId = $context->customer->id;
        }
        
        // Asignar variables a Smarty
        $this->context->smarty->assign([
            'recsync_client_id' => $clientId,
            'recsync_api_url' => $apiUrl,
            'recsync_api_key' => $apiKey,
            'recsync_debug_enabled' => $debugEnabled,
            'recsync_module_url' => $this->_path,
            'recsync_customer_id' => $customerId,
            'recsync_is_logged_in' => $isLoggedIn
        ]);
        
        return $this->display(__FILE__, 'views/templates/hook/analytics.tpl');
    }



    /**
     * Hook for product presentation (optional)
     */
    public function hookActionPresentProduct($params)
    {
        // Optional: Uniform product data for recommendations
        if (isset($params['presentedProduct'])) {
            $product = $params['presentedProduct'];
            
            // Add external_id if not present
            if (!isset($product['external_id'])) {
                $product['external_id'] = $product['reference'] ?: 'PS_' . $product['id_product'];
            }
            
            $params['presentedProduct'] = $product;
        }
    }

    /**
     * Hook for order validation (purchase tracking)
     */
    public function hookActionValidateOrder($params)
    {
        if (!Configuration::get('RECSYNC_ENABLED') || !Configuration::get('RECSYNC_TELEMETRY_ENABLED')) {
            return;
        }

        $order = $params['order'];
        $customer = $params['customer'];
        
        // Track purchase event
        $telemetry = new RecsyncTelemetry();
        
        foreach ($order->getProducts() as $product) {
            $telemetry->trackPurchase(
                'order_' . $order->id,
                'checkout_complete',
                $product['product_reference'] ?: 'PS_' . $product['product_id'],
                $product['product_quantity'],
                $product['unit_price_tax_incl']
            );
        }
    }

    /**
     * Build context for API request
     */
    private function buildContext()
    {
        try {
            // Safe context building with fallbacks
            $language = 'es';
            $country = 'ES';
            $currency = 'CLP';
            $shopId = 1;
            
            if ($this->context->language && $this->context->language->iso_code) {
                $language = $this->context->language->iso_code;
            }
            
            if ($this->context->country && $this->context->country->iso_code) {
                $country = $this->context->country->iso_code;
            }
            
            if ($this->context->currency && $this->context->currency->iso_code) {
                $currency = $this->context->currency->iso_code;
            }
            
            try {
                $shopId = (int)Shop::getContextShopID();
            } catch (Exception $e) {
                // Fallback to default shop ID
                $shopId = 1;
            }
            
            $context = [
                'user' => [
                    'user_id' => $this->getUserId(),
                    'session_id' => $this->getSessionId(),
                    'consent_personalization' => $this->hasConsent(),
                    'is_logged_in' => ($this->context->customer && $this->context->customer->id) ? true : false,
                ],
                'context' => [
                    'page' => 'home',
                    'widget_id' => 'home_main',
                    'shop_id' => $shopId,
                    'language' => $language . '-' . $country,
                    'currency' => $currency,
                    'device' => $this->getDeviceType(),
                ],
                'rules' => [
                    'limit' => (int)Configuration::get('RECSYNC_WIDGET_LIMIT', 12),
                    'exclude_out_of_stock' => (bool)Configuration::get('RECSYNC_EXCLUDE_OUT_OF_STOCK', true),
                    'category_whitelist' => $this->getCategoryWhitelist(),
                ],
            ];
            
            return $context;
            
        } catch (Exception $e) {
            PrestaShopLogger::addLog(
                'RecSync Error: Could not build context: ' . $e->getMessage(),
                2,
                null,
                'Recsync',
                $this->id
            );
            
            // Return minimal context as fallback
            return [
                'user' => [
                    'user_id' => 'anonymous',
                    'session_id' => 's_' . time(),
                    'consent_personalization' => true,
                    'is_logged_in' => false,
                ],
                'context' => [
                    'page' => 'home',
                    'widget_id' => 'home_main',
                    'shop_id' => 1,
                    'language' => 'es-ES',
                    'currency' => 'CLP',
                    'device' => 'desktop',
                ],
                'rules' => [
                    'limit' => 12,
                    'exclude_out_of_stock' => true,
                    'category_whitelist' => [],
                ]
            ];
        }
    }

    /**
     * Get user ID (hashed for privacy)
     */
    private function getUserId()
    {
        // Verificar si hay un customer válido en el contexto
        if ($this->context->customer && $this->context->customer->id) {
            // Si hay un customer con ID, considerarlo como logueado
            return $this->context->customer->id;
        }
        
        // Si no hay customer o no tiene ID, usar anonymous
        return 'anonymous';
    }

    /**
     * Get session ID
     */
    private function getSessionId()
    {
        return 's_' . session_id();
    }

    /**
     * Check if user has consent for personalization
     */
    private function hasConsent()
    {
        if (!Configuration::get('RECSYNC_RESPECT_CMP')) {
            return true;
        }
        
        // Check if guest personalization is disabled
        if (Configuration::get('RECSYNC_DISABLE_GUEST_PERSONALIZATION') && !$this->context->customer->isLogged()) {
            return false;
        }
        
        // TODO: Integrate with CMP (Cookie Consent Manager)
        // For now, assume consent is given
        return true;
    }

    /**
     * Get device type
     */
    private function getDeviceType()
    {
        $userAgent = isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
        
        if (preg_match('/Mobile|Android|iPhone|iPad/', $userAgent)) {
            return 'mobile';
        } elseif (preg_match('/Tablet|iPad/', $userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }

    /**
     * Get category whitelist
     */
    private function getCategoryWhitelist()
    {
        $whitelist = Configuration::get('RECSYNC_CATEGORY_WHITELIST');
        return $whitelist ? explode(',', $whitelist) : [];
    }





    /**
     * Generate cache key
     */
    private function generateCacheKey($context)
    {
        $key = self::CACHE_PREFIX . 'home_' . 
               Shop::getContextShopID() . '_' . 
               ($this->context->language ? $this->context->language->id : 1) . '_' . 
               ($this->context->currency ? $this->context->currency->id : 1) . '_' . 
               md5(serialize($context));
        
        return $key;
    }

    /**
     * Map external product IDs to PrestaShop products
     */
    private function mapProducts($recommendations)
    {
        if (!isset($recommendations['recommendations']) || !is_array($recommendations['recommendations'])) {
            return [];
        }
        
        $products = [];
        $externalIds = [];
        foreach ($recommendations['recommendations'] as $rec) {
            if (isset($rec['id'])) {
                $externalIds[] = $rec['id'];
            }
        }
        
        if (empty($externalIds)) {
            return [];
        }
        
        // Query products by reference (external_id) or by ID if external_id starts with 'PS_'
        $referenceIds = [];
        $productIds = [];
        
        foreach ($externalIds as $externalId) {
            if (strpos($externalId, 'PS_') === 0) {
                $productIds[] = (int)substr($externalId, 3);
            } else {
                $referenceIds[] = $externalId;
            }
        }
        
        $sql = 'SELECT p.id_product, p.reference, p.active
                FROM ' . _DB_PREFIX_ . 'product p
                WHERE p.active = 1';
        
        if (!empty($referenceIds)) {
            $sql .= ' AND p.reference IN ("' . implode('","', array_map('pSQL', $referenceIds)) . '")';
        }
        
        if (!empty($productIds)) {
            if (!empty($referenceIds)) {
                $sql .= ' OR p.id_product IN (' . implode(',', $productIds) . ')';
            } else {
                $sql .= ' AND p.id_product IN (' . implode(',', $productIds) . ')';
            }
        }
        
        $results = Db::getInstance()->executeS($sql);
        
        if (!$results) {
            return [];
        }
        
        // Create mapping for both references and product IDs
        $productMap = [];
        foreach ($results as $row) {
            $productMap[$row['reference']] = $row['id_product'];
            $productMap['PS_' . $row['id_product']] = $row['id_product'];
        }
        
        // Build final product list with scores
        foreach ($recommendations['recommendations'] as $rec) {
            $externalId = $rec['id'];
            $score = $rec['score'] ?? 0;
            
            if (isset($productMap[$externalId])) {
                $productId = $productMap[$externalId];
                
                // Check stock if required
                if (Configuration::get('RECSYNC_EXCLUDE_OUT_OF_STOCK')) {
                    $product = new Product($productId, false, $this->context->language->id);
                    if (!$product->checkQty(1)) {
                        continue;
                    }
                }
                
                // Get product data
                $productData = $this->getProductData($productId);
                if ($productData) {
                    $productData['score'] = $score;
                    $products[] = $productData;
                }
            }
        }
        
        // Sort by score
        usort($products, function($a, $b) {
            return $b['score'] <=> $a['score'];
        });
        
        // Limit to configured limit
        $limit = (int)Configuration::get('RECSYNC_WIDGET_LIMIT');
        return array_slice($products, 0, $limit);
    }

    /**
     * Get product data for display
     */
    private function getProductData($productId)
    {
        try {
            // Validate product ID
            if (!$productId || !is_numeric($productId) || $productId <= 0) {
                return false;
            }
            
            $product = new Product($productId, false, $this->context->language->id);

            if (!Validate::isLoadedObject($product)) {
                return false;
            }

            // Get product with all necessary data
            $product = new Product($productId, true, $this->context->language->id);
            
            // Get product link
            $productLink = $this->context->link->getProductLink($product);
            
            // Get cover image
            $cover = Image::getCover($productId);
            $coverImage = null;
            
            if ($cover) {
                $coverImage = [
                    'bySize' => [
                        'home_default' => [
                            'url' => $this->context->link->getImageLink(
                                $product->link_rewrite[0],
                                $cover['id_image'],
                                'home_default'
                            ),
                            'width' => 250,
                            'height' => 250
                        ],
                        'large' => [
                            'url' => $this->context->link->getImageLink(
                                $product->link_rewrite[0],
                                $cover['id_image'],
                                'large_default'
                            ),
                            'width' => 800,
                            'height' => 800
                        ]
                    ],
                    'legend' => isset($cover['legend']) ? $cover['legend'] : $product->name[0]
                ];
            } else {
                // Use no picture image if no cover - use PrestaShop's standard method
                $coverImage = [
                    'bySize' => [
                        'home_default' => [
                            'url' => $this->context->link->getImageLink(
                                '',
                                Context::getContext()->language->iso_code . '-default',
                                'home_default'
                            ),
                            'width' => 250,
                            'height' => 250
                        ],
                        'large' => [
                            'url' => $this->context->link->getImageLink(
                                '',
                                Context::getContext()->language->iso_code . '-default',
                                'large_default'
                            ),
                            'width' => 800,
                            'height' => 800
                        ]
                    ],
                    'legend' => $product->name[0]
                ];
            }

            // Get price information
            $price = $product->getPrice();
            $regularPrice = $product->getPriceWithoutReduct();
            $hasDiscount = ($regularPrice > $price);
            
            // Calculate discount percentage
            $discountPercentage = '';
            if ($hasDiscount && $regularPrice > 0) {
                $discountPercentage = round((($regularPrice - $price) / $regularPrice) * 100) . '%';
            }

            // Get product flags
            $flags = [];
            if ($hasDiscount) {
                $flags[] = [
                    'type' => 'discount',
                    'label' => $discountPercentage
                ];
            }
            
            // Check if product is new
            if ($product->isNew()) {
                $flags[] = [
                    'type' => 'new',
                    'label' => 'Nuevo'
                ];
            }

            // Validate product name
            $productName = is_array($product->name) ? $product->name[0] : $product->name;
            if (empty($productName)) {
                $productName = 'Producto ' . $productId;
            }

            // Get add to cart URL
            $addToCartUrl = $this->context->link->getAddToCartURL($productId, 0);

            return [
                'id_product' => (int)$productId,
                'id_product_attribute' => 0,
                'name' => $productName,
                'url' => $productLink,
                'price' => Tools::displayPrice($price),
                'regular_price' => Tools::displayPrice($regularPrice),
                'has_discount' => $hasDiscount,
                'discount_percentage' => $discountPercentage,
                'discount_type' => $hasDiscount ? 'percentage' : null,
                'show_price' => true,
                'add_to_cart_url' => $addToCartUrl,
                'cover' => $coverImage,
                'flags' => $flags,
                'reference' => $product->reference ?: '',
                'external_id' => $product->reference ?: 'PS_' . $productId,
                'id_category_default' => (int)$product->id_category_default,
                'main_variants' => null, // Can be populated if needed
            ];

        } catch (Exception $e) {
            PrestaShopLogger::addLog(
                'RecSync Error: Could not get product data for product ' . $productId . ': ' . $e->getMessage(),
                2,
                null,
                'Recsync',
                $this->id
            );
            return false;
        }
    }

    /**
     * Module configuration form
     */
    public function getContent()
    {
        // Load admin CSS and JS
        $this->context->controller->addCSS($this->_path . 'views/css/admin.css');
        $this->context->controller->addJS($this->_path . 'views/js/admin.js');
        
        $output = '';
        
        if (Tools::isSubmit('submitRecsyncModule')) {
            $output .= $this->postProcess();
        }
        
        return $output . $this->displayForm();
    }

    /**
     * Process form submission
     */
    private function postProcess()
    {
        $configs = [
            'RECSYNC_API_URL', 'RECSYNC_CLIENT_ID', 'RECSYNC_API_KEY', 'RECSYNC_API_TIMEOUT', 'RECSYNC_API_RETRIES',
            'RECSYNC_TLS_VERIFY', 'RECSYNC_WIDGET_TITLE', 'RECSYNC_WIDGET_LIMIT', 'RECSYNC_WIDGET_LAYOUT',
            'RECSYNC_WIDGET_COLUMNS', 'RECSYNC_EXCLUDE_OUT_OF_STOCK', 'RECSYNC_CATEGORY_WHITELIST',
            'RECSYNC_TELEMETRY_ENABLED', 'RECSYNC_ENABLED', 'RECSYNC_DEBUG_ENABLED'
        ];
        
        foreach ($configs as $key) {
            $value = Tools::getValue($key);
            
            if ($key === 'RECSYNC_API_KEY') {
                // Only update API key if a new value is provided (not masked)
                if (!empty($value) && !$this->isMaskedValue($value)) {
                    // Encrypt API key
                    $value = $this->encryptApiKey($value);
                    Configuration::updateValue($key, $value);
                }
                // If value is empty or masked, don't update (keep current value)
                continue;
            }
            
            Configuration::updateValue($key, $value);
        }
        
        return $this->displayConfirmation($this->l('Settings updated successfully'));
    }

    /**
     * Display configuration form
     */
    private function displayForm()
    {
        // Create two forms for two-column layout
        $form1 = [
            'form' => [
                'legend' => [
                    'title' => $this->l('API Configuration'),
                ],
                'input' => [
                    [
                        'type' => 'switch',
                        'label' => $this->l('Enable Module'),
                        'name' => 'RECSYNC_ENABLED',
                        'is_bool' => true,
                        'values' => [
                            ['id' => 'active_on', 'value' => true, 'label' => $this->l('Enabled')],
                            ['id' => 'active_off', 'value' => false, 'label' => $this->l('Disabled')],
                        ],
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('API Base URL'),
                        'name' => 'RECSYNC_API_URL',
                        'required' => true,
                        'desc' => $this->l('Base URL for the recommendations API'),
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Client ID'),
                        'name' => 'RECSYNC_CLIENT_ID',
                        'required' => true,
                        'desc' => $this->l('Client identifier for API authentication'),
                    ],
                    [
                        'type' => 'switch',
                        'label' => $this->l('Enable Debug'),
                        'name' => 'RECSYNC_DEBUG_ENABLED',
                        'is_bool' => true,
                        'values' => [
                            ['id' => 'debug_on', 'value' => true, 'label' => $this->l('Enabled')],
                            ['id' => 'debug_off', 'value' => false, 'label' => $this->l('Disabled')],
                        ],
                        'desc' => $this->l('Enable debug mode for analytics script'),
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('API Key'),
                        'name' => 'RECSYNC_API_KEY',
                        'class' => 'fixed-width-lg',
                        'desc' => $this->l('API key for authentication (leave empty to keep current)'),
                        'form_group_class' => 'recsync-api-key-group',
                    ],
                    [
                        'type' => 'hidden',
                        'name' => 'RECSYNC_API_KEY_REAL',
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('API Timeout (ms)'),
                        'name' => 'RECSYNC_API_TIMEOUT',
                        'class' => 'fixed-width-sm',
                        'desc' => $this->l('Timeout for API requests in milliseconds'),
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('API Retries'),
                        'name' => 'RECSYNC_API_RETRIES',
                        'class' => 'fixed-width-sm',
                        'desc' => $this->l('Number of retry attempts for failed requests'),
                    ],
                    [
                        'type' => 'switch',
                        'label' => $this->l('Verify TLS'),
                        'name' => 'RECSYNC_TLS_VERIFY',
                        'is_bool' => true,
                        'values' => [
                            ['id' => 'tls_on', 'value' => true, 'label' => $this->l('Enabled')],
                            ['id' => 'tls_off', 'value' => false, 'label' => $this->l('Disabled')],
                        ],
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Widget Title'),
                        'name' => 'RECSYNC_WIDGET_TITLE',
                        'lang' => true,
                        'desc' => $this->l('Title displayed above the recommendations block'),
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Product Limit'),
                        'name' => 'RECSYNC_WIDGET_LIMIT',
                        'class' => 'fixed-width-sm',
                        'desc' => $this->l('Maximum number of products to display'),
                    ],
                    [
                        'type' => 'select',
                        'label' => $this->l('Layout'),
                        'name' => 'RECSYNC_WIDGET_LAYOUT',
                        'options' => [
                            'query' => [
                                ['id' => 'grid', 'name' => $this->l('Grid')],
                                ['id' => 'carousel', 'name' => $this->l('Carousel')],
                            ],
                            'id' => 'id',
                            'name' => 'name',
                        ],
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Grid Columns'),
                        'name' => 'RECSYNC_WIDGET_COLUMNS',
                        'class' => 'fixed-width-sm',
                        'desc' => $this->l('Number of columns in grid layout (2-6)'),
                    ],
                    [
                        'type' => 'switch',
                        'label' => $this->l('Exclude Out of Stock'),
                        'name' => 'RECSYNC_EXCLUDE_OUT_OF_STOCK',
                        'is_bool' => true,
                        'values' => [
                            ['id' => 'stock_on', 'value' => true, 'label' => $this->l('Yes')],
                            ['id' => 'stock_off', 'value' => false, 'label' => $this->l('No')],
                        ],
                    ],
                    [
                        'type' => 'text',
                        'label' => $this->l('Category Whitelist'),
                        'name' => 'RECSYNC_CATEGORY_WHITELIST',
                        'desc' => $this->l('Comma-separated list of category IDs to include'),
                    ],
                ],
            ],
        ];

        $form2 = [
            'form' => [
                'legend' => [
                    'title' => $this->l('Advanced Settings'),
                ],
                'input' => [
                    [
                        'type' => 'switch',
                        'label' => $this->l('Enable Telemetry'),
                        'name' => 'RECSYNC_TELEMETRY_ENABLED',
                        'is_bool' => true,
                        'values' => [
                            ['id' => 'telemetry_on', 'value' => true, 'label' => $this->l('Enabled')],
                            ['id' => 'telemetry_off', 'value' => false, 'label' => $this->l('Disabled')],
                        ],
                    ],
                ],
                'submit' => [
                    'title' => $this->l('Save'),
                    'class' => 'btn btn-default pull-right',
                ],
            ],
        ];
        
        $helper = new HelperForm();
        $helper->module = $this;
        $helper->name_controller = $this->name;
        $helper->token = Tools::getAdminTokenLite('AdminModules');
        $helper->currentIndex = AdminController::$currentIndex . '&configure=' . $this->name;
        $helper->default_form_language = $this->context->language->id;
        $helper->allow_employee_form_lang = Configuration::get('PS_BO_ALLOW_EMPLOYEE_FORM_LANG', 0);
        $helper->title = $this->displayName;
        $helper->show_toolbar = true;
        $helper->toolbar_scroll = true;
        $helper->submit_action = 'submitRecsyncModule';
        
        $helper->fields_value = [];
        
        // Process all inputs from both forms
        $allInputs = array_merge($form1['form']['input'], $form2['form']['input']);
        
        // Add hidden field for real API key value
        $allInputs[] = [
            'type' => 'hidden',
            'name' => 'RECSYNC_API_KEY_REAL',
        ];
        
        foreach ($allInputs as $input) {
            $key = $input['name'];
            
            // Handle hidden field for real API key value
            if ($key === 'RECSYNC_API_KEY_REAL') {
                // Get the real API key value for the hidden field
                $apiKeyValue = Configuration::get('RECSYNC_API_KEY');
                if (!empty($apiKeyValue)) {
                    $decryptedValue = $this->decryptApiKey($apiKeyValue);
                    $helper->fields_value[$key] = $decryptedValue;
                } else {
                    $helper->fields_value[$key] = '';
                }
                continue;
            }
            
            $value = Configuration::get($key);
            
            if ($key === 'RECSYNC_API_KEY' && !empty($value)) {
                $decryptedValue = $this->decryptApiKey($value);
                // Show only last 4 characters for security
                $value = str_repeat('•', max(0, strlen($decryptedValue) - 4)) . substr($decryptedValue, -4);
            }
            
            $helper->fields_value[$key] = $value;
        }
        
        return $helper->generateForm([$form1, $form2]);
    }

    /**
     * Encrypt API key
     */
    private function encryptApiKey($key)
    {
        $salt = Configuration::get('RECSYNC_USER_SALT');
        return base64_encode(openssl_encrypt($key, 'AES-256-CBC', $salt, 0, substr($salt, 0, 16)));
    }

    /**
     * Decrypt API key
     */
    private function decryptApiKey($encryptedKey)
    {
        $salt = Configuration::get('RECSYNC_USER_SALT');
        return openssl_decrypt(base64_decode($encryptedKey), 'AES-256-CBC', $salt, 0, substr($salt, 0, 16));
    }

    /**
     * Check if a value is masked (contains masking characters)
     */
    private function isMaskedValue($value)
    {
        // Check for common masking characters
        $maskingChars = ['•', '●', '▪', '▫', '▪', '▫', '*', '·'];
        
        foreach ($maskingChars as $char) {
            if (strpos($value, $char) !== false) {
                return true;
            }
        }
        
        // Also check if the value looks like a masked pattern (repeated characters + suffix)
        if (preg_match('/^[•●▪▫▪▫*·]{4,}[A-Z0-9]{4}$/', $value)) {
            return true;
        }
        
        return false;
    }

    /**
     * Install admin tab
     */
    private function installAdminTab()
    {
        // Find the Catalog parent tab
        $catalogTabId = Tab::getIdFromClassName('AdminCatalog');
        
        if (!$catalogTabId) {
            return false;
        }

        // Create the RecSync admin tab
        $tab = new Tab();
        $tab->class_name = 'AdminRecsync';
        $tab->module = $this->name;
        $tab->id_parent = $catalogTabId;
        $tab->position = 100; // Position in the menu
        
        // Get Spanish and English language IDs
        $spanishLanguageId = Language::getIdByIso('es');
        $englishLanguageId = Language::getIdByIso('en');
        
        // Set tab names for all languages with Spanish as default
        $languages = Language::getLanguages(false);
        foreach ($languages as $language) {
            if ($language['iso_code'] == 'es') {
                $tab->name[$language['id_lang']] = 'Configuración RecSync';
            } elseif ($language['iso_code'] == 'en') {
                $tab->name[$language['id_lang']] = 'RecSync Configuration';
            } else {
                // Default to Spanish for other languages
                $tab->name[$language['id_lang']] = 'Configuración RecSync';
            }
        }
        
        if (!$tab->add()) {
            return false;
        }

        return true;
    }

    /**
     * Uninstall admin tab
     */
    private function uninstallAdminTab()
    {
        $tabId = Tab::getIdFromClassName('AdminRecsync');
        
        if ($tabId) {
            $tab = new Tab($tabId);
            return $tab->delete();
        }
        
        return true;
    }

    /**
     * Complete recommendations with products from the same categories
     */
    private function completeWithCategoryProducts($products, $targetLimit)
    {
        if (empty($products)) {
            return $products;
        }

        // Get categories from existing products
        $categories = [];
        foreach ($products as $product) {
            if (isset($product['id_category_default']) && $product['id_category_default']) {
                $categories[] = (int)$product['id_category_default'];
            }
        }

        if (empty($categories)) {
            return $products;
        }

        // Remove duplicates
        $categories = array_unique($categories);

        PrestaShopLogger::addLog(
            'RecSync Debug: Completing with products from categories: ' . implode(', ', $categories),
            1,
            null,
            'Recsync',
            $this->id
        );

        // Get existing product IDs to avoid duplicates
        $existingProductIds = array_column($products, 'id_product');
        
        // Get additional products from the same categories
        $additionalProducts = $this->getProductsByCategories($categories, $existingProductIds, $targetLimit - count($products));
        
        if (!empty($additionalProducts)) {
            PrestaShopLogger::addLog(
                'RecSync Debug: Added ' . count($additionalProducts) . ' category-based products',
                1,
                null,
                'Recsync',
                $this->id
            );
            
            // Merge products
            $products = array_merge($products, $additionalProducts);
        }

        return $products;
    }

    /**
     * Get products by categories
     */
    private function getProductsByCategories($categories, $excludeProductIds = [], $limit = 10)
    {
        try {
            if (empty($categories) || !is_array($categories)) {
                return [];
            }
            
            // Clean and validate categories
            $validCategories = [];
            foreach ($categories as $category) {
                if (is_numeric($category) && $category > 0) {
                    $validCategories[] = (int)$category;
                }
            }
            
            if (empty($validCategories)) {
                return [];
            }
            
            // Clean and validate exclude product IDs
            $excludeIds = [];
            if (is_array($excludeProductIds)) {
                foreach ($excludeProductIds as $productId) {
                    if (is_numeric($productId) && $productId > 0) {
                        $excludeIds[] = (int)$productId;
                    }
                }
            }
            
            // Validate limit
            $limit = max(1, min(100, (int)$limit)); // Between 1 and 100
            
            // Build SQL query
            $sql = "
                SELECT DISTINCT p.id_product, pl.name, p.id_category_default
                FROM " . _DB_PREFIX_ . "product p
                INNER JOIN " . _DB_PREFIX_ . "product_lang pl ON p.id_product = pl.id_product
                WHERE p.active = 1
                AND p.id_category_default IN (" . implode(',', $validCategories) . ")
                AND pl.id_lang = " . (int)$this->context->language->id;
            
            if (!empty($excludeIds)) {
                $sql .= " AND p.id_product NOT IN (" . implode(',', $excludeIds) . ")";
            }
            
            // Add ordering based on configuration
            $orderBy = Configuration::get('RECSYNC_WIDGET_ORDER_BY', 'id_product_desc');
            switch ($orderBy) {
                case 'name_asc':
                    $sql .= " ORDER BY pl.name ASC";
                    break;
                case 'name_desc':
                    $sql .= " ORDER BY pl.name DESC";
                    break;
                case 'price_asc':
                    $sql .= " ORDER BY p.price ASC";
                    break;
                case 'price_desc':
                    $sql .= " ORDER BY p.price DESC";
                    break;
                case 'date_add_desc':
                    $sql .= " ORDER BY p.date_add DESC";
                    break;
                case 'date_add_asc':
                    $sql .= " ORDER BY p.date_add ASC";
                    break;
                default:
                    $sql .= " ORDER BY p.id_product DESC";
                    break;
            }
            
            $sql .= " LIMIT " . $limit;
            
            $results = Db::getInstance()->executeS($sql);
            
            if (!$results || !is_array($results)) {
                return [];
            }
            
            // Get product data for each result
            $products = [];
            foreach ($results as $row) {
                if (isset($row['id_product']) && is_numeric($row['id_product'])) {
                    $productData = $this->getProductData($row['id_product']);
                    if ($productData) {
                        $products[] = $productData;
                    }
                }
            }
            
            return $products;
            
        } catch (Exception $e) {
            PrestaShopLogger::addLog(
                'RecSync Error: Could not get products by categories: ' . $e->getMessage(),
                2,
                null,
                'Recsync',
                $this->id
            );
            return [];
        }
    }
}
