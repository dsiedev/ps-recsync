<?php
/**
 * RecSync Admin Controller
 * Provides a dedicated admin interface for RecSync configuration
 */

class AdminRecsyncController extends ModuleAdminController
{
    public function __construct()
    {
        $this->bootstrap = true;
        $this->display = 'view';
        $this->meta_title = 'Configuración RecSync';
        
        parent::__construct();
        
        // Load module instance
        $this->module = Module::getInstanceByName('recsync');
    }

    public function initContent()
    {
        parent::initContent();
        
        // Get current configuration
        $config = $this->getModuleConfiguration();
        
        // Assign variables to template
        $this->context->smarty->assign([
            'recsync_config' => $config,
            'module_dir' => $this->module->getPathUri(),
            'form_action' => $this->context->link->getAdminLink('AdminRecsync'),
            'token' => Tools::getAdminTokenLite('AdminRecsync'),
        ]);
        
        $this->setTemplate('configure.tpl');
    }

    public function postProcess()
    {
        if (Tools::isSubmit('submitRecsyncConfig')) {
            $this->processConfiguration();
        }
        
        parent::postProcess();
    }

    /**
     * Process configuration form submission
     */
    private function processConfiguration()
    {
        $configs = [
            'RECSYNC_API_URL', 'RECSYNC_CLIENT_ID', 'RECSYNC_API_KEY', 'RECSYNC_API_TIMEOUT', 'RECSYNC_API_RETRIES',
            'RECSYNC_TLS_VERIFY', 'RECSYNC_WIDGET_TITLE', 'RECSYNC_WIDGET_LIMIT', 'RECSYNC_WIDGET_LAYOUT',
            'RECSYNC_WIDGET_COLUMNS', 'RECSYNC_EXCLUDE_OUT_OF_STOCK', 'RECSYNC_CATEGORY_WHITELIST',
            'RECSYNC_TELEMETRY_ENABLED', 'RECSYNC_ENABLED', 'RECSYNC_DEBUG_ENABLED', 'RECSYNC_CAROUSEL_ARROWS', 'RECSYNC_CAROUSEL_INDICATORS'
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
        
        $this->confirmations[] = $this->l('Settings updated successfully');
    }

    /**
     * Get current module configuration
     */
    private function getModuleConfiguration()
    {
        return [
            'api_url' => Configuration::get('RECSYNC_API_URL'),
            'client_id' => Configuration::get('RECSYNC_CLIENT_ID'),
            'api_key' => $this->getMaskedApiKey(),
            'api_timeout' => Configuration::get('RECSYNC_API_TIMEOUT'),
            'api_retries' => Configuration::get('RECSYNC_API_RETRIES'),
            'tls_verify' => Configuration::get('RECSYNC_TLS_VERIFY'),
            'widget_title' => Configuration::get('RECSYNC_WIDGET_TITLE') ?: 'Recomendados para ti',
            'widget_limit' => Configuration::get('RECSYNC_WIDGET_LIMIT'),
            'widget_layout' => Configuration::get('RECSYNC_WIDGET_LAYOUT'),
            'widget_columns' => Configuration::get('RECSYNC_WIDGET_COLUMNS'),
            'exclude_out_of_stock' => Configuration::get('RECSYNC_EXCLUDE_OUT_OF_STOCK'),
            'category_whitelist' => Configuration::get('RECSYNC_CATEGORY_WHITELIST'),
            'telemetry_enabled' => Configuration::get('RECSYNC_TELEMETRY_ENABLED'),
            'enabled' => Configuration::get('RECSYNC_ENABLED'),
            'debug_enabled' => Configuration::get('RECSYNC_DEBUG_ENABLED'),
            'carousel_arrows' => Configuration::get('RECSYNC_CAROUSEL_ARROWS'),
            'carousel_indicators' => Configuration::get('RECSYNC_CAROUSEL_INDICATORS'),
        ];
    }

    /**
     * Get masked API key for display
     */
    private function getMaskedApiKey()
    {
        $encryptedKey = Configuration::get('RECSYNC_API_KEY');
        if (empty($encryptedKey)) {
            return '';
        }
        
        $salt = Configuration::get('RECSYNC_USER_SALT');
        if (empty($salt)) {
            return '';
        }
        
        $decryptedKey = openssl_decrypt(
            base64_decode($encryptedKey), 
            'AES-256-CBC', 
            $salt, 
            0, 
            substr($salt, 0, 16)
        );
        
        if ($decryptedKey === false) {
            return '';
        }
        
        // Show only last 4 characters for security
        return str_repeat('•', max(0, strlen($decryptedKey) - 4)) . substr($decryptedKey, -4);
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
     * Get module statistics
     */
    public function getStats()
    {
        try {
            $telemetry = new RecsyncTelemetry();
            $stats = $telemetry->getStats(7); // Last 7 days
            
            return [
                'success' => true,
                'data' => $stats
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Test API connection
     */
    public function testApiConnection()
    {
        try {
            $apiClient = new RecsyncApiClient();
            
            // Create test context
            $testContext = [
                'user' => [
                    'user_id' => 'test_admin',
                    'session_id' => 'admin_test',
                    'consent_personalization' => true,
                    'is_logged_in' => true,
                ],
                'context' => [
                    'page' => 'admin_test',
                    'widget_id' => 'admin_test',
                    'shop_id' => 1,
                    'language' => 'es-ES',
                    'currency' => 'CLP',
                    'device' => 'desktop',
                ],
                'rules' => [
                    'limit' => 3,
                    'exclude_out_of_stock' => true,
                    'category_whitelist' => [],
                ],
            ];
            
            $result = $apiClient->getRecommendations($testContext);
            
            return [
                'success' => $result !== false,
                'message' => $result !== false ? 'API connection successful' : 'API connection failed',
                'data' => $result
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'API connection error: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ];
        }
    }
}
