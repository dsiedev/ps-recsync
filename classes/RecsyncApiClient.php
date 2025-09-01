<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class RecsyncApiClient
{
    private $apiUrl;
    private $apiKey;
    private $timeout;
    private $retries;
    private $tlsVerify;

    public function __construct()
    {
        $this->apiUrl = Configuration::get('RECSYNC_API_URL');
        $this->apiKey = $this->decryptApiKey(Configuration::get('RECSYNC_API_KEY'));
        $this->timeout = (int)Configuration::get('RECSYNC_API_TIMEOUT') / 1000; // Convert to seconds
        $this->retries = (int)Configuration::get('RECSYNC_API_RETRIES');
        $this->tlsVerify = (bool)Configuration::get('RECSYNC_TLS_VERIFY');
    }

    /**
     * Get recommendations from API
     */
    public function getRecommendations($context)
    {
        if (empty($this->apiUrl) || empty($this->apiKey)) {
            if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                PrestaShopLogger::addLog(
                    'RecSync API Error: Missing API URL or Key - URL: ' . $this->apiUrl . ', Key: ' . (empty($this->apiKey) ? 'empty' : 'set'),
                    3,
                    null,
                    'Recsync',
                    null
                );
            }
            return false;
        }
        
        // Obtener user_id del contexto
        $userId = $context['user']['user_id'] ?? 'anonymous';
        
        // Construir URL con el formato correcto: /api/v1/recommendation/{user_id}
        $recommendationsUrl = rtrim($this->apiUrl, '/') . '/v1/recommendation/' . urlencode($userId);
        
        $payload = [
            'user' => $context['user'],
            'context' => $context['context'],
            'rules' => $context['rules'],
        ];
        
        if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
            PrestaShopLogger::addLog(
                'RecSync API Debug: Making request to ' . $recommendationsUrl . ' with payload: ' . json_encode($payload),
                1,
                null,
                'Recsync',
                null
            );
        }



        $attempts = 0;
        $lastError = null;

        while ($attempts <= $this->retries) {
            try {
                $response = $this->makeRequest($payload);
                
                if ($response && isset($response['recommendations'])) {
                    return $response;
                }
                
                break;
                
            } catch (Exception $e) {
                $lastError = $e;
                $attempts++;
                
                if ($attempts <= $this->retries) {
                    // Wait before retry (exponential backoff)
                    usleep(pow(2, $attempts) * 100000); // 100ms, 200ms, 400ms...
                }
            }
        }

        // Log error
        if ($lastError) {
            if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
                PrestaShopLogger::addLog(
                    'RecSync API Error: ' . $lastError->getMessage(),
                    3,
                    null,
                    'Recsync',
                    null
                );
            }
        }

        return false;
    }

    /**
     * Make HTTP request to API
     */
    private function makeRequest($payload)
    {
        $ch = curl_init();
        
        // Obtener user_id del contexto
        $userId = $payload['user']['user_id'] ?? 'anonymous';
        
        // Construir URL con el formato correcto: /api/v1/recommendation/{user_id}
        $recommendationsUrl = rtrim($this->apiUrl, '/') . '/v1/recommendation/' . urlencode($userId);
        
        // Construir header de autorización con Client ID y API Key
        $authHeader = 'Bearer ' . Configuration::get('RECSYNC_CLIENT_ID') . ':' . $this->apiKey;
        
        // Construir URL con parámetros de query para GET request
        $queryParams = http_build_query([
            'user' => json_encode($payload['user']),
            'context' => json_encode($payload['context']),
            'rules' => json_encode($payload['rules'])
        ]);
        $recommendationsUrl .= '?' . $queryParams;
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $recommendationsUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => $this->tlsVerify,
            CURLOPT_SSL_VERIFYHOST => $this->tlsVerify ? 2 : 0,
            CURLOPT_HTTPGET => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: ' . $authHeader,
                'Accept: application/json',
                'User-Agent: RecSync/1.0.0 PrestaShop/' . _PS_VERSION_,
            ],
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        // Log response details
        if (Configuration::get('RECSYNC_DEBUG_ENABLED')) {
            PrestaShopLogger::addLog(
                'RecSync API Debug: Response HTTP ' . $httpCode . ' - Error: ' . ($error ?: 'None') . ' - Response: ' . substr($response, 0, 500),
                1,
                null,
                'Recsync',
                null
            );
        }

        if ($error) {
            throw new Exception('cURL Error: ' . $error);
        }

        if ($httpCode >= 500) {
            throw new Exception('API Server Error: HTTP ' . $httpCode);
        }

        if ($httpCode >= 400) {
            throw new Exception('API Client Error: HTTP ' . $httpCode);
        }

        if ($httpCode !== 200) {
            throw new Exception('Unexpected HTTP Code: ' . $httpCode);
        }

        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response: ' . json_last_error_msg());
        }

        return $data;
    }

    /**
     * Decrypt API key
     */
    private function decryptApiKey($encryptedKey)
    {
        if (empty($encryptedKey)) {
            return '';
        }

        $salt = Configuration::get('RECSYNC_USER_SALT');
        return openssl_decrypt(
            base64_decode($encryptedKey), 
            'AES-256-CBC', 
            $salt, 
            0, 
            substr($salt, 0, 16)
        );
    }
}
