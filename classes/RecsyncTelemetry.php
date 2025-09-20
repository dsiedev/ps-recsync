<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class RecsyncTelemetry
{
    private $tableName;

    public function __construct()
    {
        $this->tableName = _DB_PREFIX_ . 'recsync_telemetry';
    }

    /**
     * Track page view event
     */
    public function trackPageView($page, $widgetId, $userId = null)
    {
        if (!Configuration::get('RECSYNC_TELEMETRY_ENABLED')) {
            return;
        }

        $data = [
            'event_type' => 'page_view',
            'event_data' => json_encode([
                'page' => $page,
                'widget_id' => $widgetId,
                'user_id' => $userId,
                'timestamp' => time()
            ]),
            'created_at' => date('Y-m-d H:i:s')
        ];

        return $this->insertEvent($data);
    }

    /**
     * Track product view event
     */
    public function trackProductView($productId, $userId = null, $recommendationContext = false, $productData = null)
    {
        if (!Configuration::get('RECSYNC_TELEMETRY_ENABLED')) {
            return;
        }

        // If productData is provided (from JavaScript), use it directly
        if ($productData && is_array($productData)) {
            $eventData = $productData;
        } else {
            // Build basic event data structure
            $eventData = [
                'product_id' => $productId,
                'user_id' => $userId,
                'timestamp' => time()
            ];
            
            // Try to get product category from PrestaShop
            if (class_exists('Product')) {
                try {
                    $product = new Product($productId);
                    if ($product->id_category_default) {
                        $category = new Category($product->id_category_default);
                        $eventData['item_category'] = $category->name[Context::getContext()->language->id] ?? 'Unknown';
                        $eventData['item_category_id'] = $product->id_category_default;
                    }
                } catch (Exception $e) {
                    // If we can't get category, continue without it
                }
            }
        }

        // Add recommendation context if provided
        if ($recommendationContext) {
            $eventData['recommendation_context'] = true;
        }

        $data = [
            'event_type' => 'view_item',
            'event_data' => json_encode($eventData),
            'created_at' => date('Y-m-d H:i:s')
        ];

        return $this->insertEvent($data);
    }

    /**
     * Track add to cart event
     */
    public function trackAddToCart($productId, $quantity, $userId = null, $productData = null)
    {
        if (!Configuration::get('RECSYNC_TELEMETRY_ENABLED')) {
            return;
        }

        // If productData is provided (from JavaScript), use it directly
        if ($productData && is_array($productData)) {
            $eventData = $productData;
        } else {
            // Build basic event data structure
            $eventData = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'user_id' => $userId,
                'timestamp' => time()
            ];
            
            // Try to get product category from PrestaShop
            if (class_exists('Product')) {
                try {
                    $product = new Product($productId);
                    if ($product->id_category_default) {
                        $category = new Category($product->id_category_default);
                        $eventData['item_category'] = $category->name[Context::getContext()->language->id] ?? 'Unknown';
                        $eventData['item_category_id'] = $product->id_category_default;
                    }
                } catch (Exception $e) {
                    // If we can't get category, continue without it
                }
            }
        }

        $data = [
            'event_type' => 'add_to_cart',
            'event_data' => json_encode($eventData),
            'created_at' => date('Y-m-d H:i:s')
        ];

        return $this->insertEvent($data);
    }

    /**
     * Track purchase event
     */
    public function trackPurchase($orderId, $eventType, $productId, $quantity, $price, $recommendationContext = false, $userId = null, $orderData = null)
    {
        if (!Configuration::get('RECSYNC_TELEMETRY_ENABLED')) {
            return;
        }

        // If orderData is provided, use it directly (from JavaScript)
        if ($orderData && is_array($orderData)) {
            $eventData = $orderData;
        } else {
            // Get real currency from configuration
            $currencyCode = 'USD'; // Default fallback
            if (class_exists('Currency')) {
                $defaultCurrency = Currency::getDefaultCurrency();
                if ($defaultCurrency) {
                    $currencyCode = $defaultCurrency->iso_code;
                }
            }
            
            // Build event data structure similar to the required format
            $eventData = [
                'transaction_id' => $orderId,
                'value' => $price * $quantity,
                'currency' => $currencyCode,
                'tax' => 0,
                'shipping' => 0,
                'coupon' => null,
                'affiliation' => Configuration::get('PS_SHOP_NAME') ?: 'PrestaShop Store',
                'payment_type' => 'unknown',
                'items' => [
                    [
                        'item_name' => 'Product',
                        'item_id' => $productId,
                        'price' => $price,
                        'quantity' => $quantity,
                        'item_category' => 'Unknown'
                    ]
                ]
            ];
        }

        // Add recommendation context if provided
        if ($recommendationContext) {
            $eventData['recommendation_context'] = true;
        }

        // Add user_id if provided
        if ($userId) {
            $eventData['user_id'] = $userId;
        }

            $data = [
                'event_type' => $eventType,
                'event_data' => json_encode($eventData),
                'created_at' => date('Y-m-d H:i:s')
            ];

            return $this->insertEvent($data);
    }

    /**
     * Track recommendation click event
     */
    public function trackRecommendationClick($recommendationId, $productId, $userId = null, $productData = null)
    {
        if (!Configuration::get('RECSYNC_TELEMETRY_ENABLED')) {
            return;
        }

        // If productData is provided (from JavaScript), use it directly
        if ($productData && is_array($productData)) {
            $eventData = $productData;
        } else {
            // Build basic event data structure
            $eventData = [
                'recommendation_id' => $recommendationId,
                'product_id' => $productId,
                'user_id' => $userId,
                'timestamp' => time()
            ];
            
            // Try to get product category from PrestaShop
            if (class_exists('Product')) {
                try {
                    $product = new Product($productId);
                    if ($product->id_category_default) {
                        $category = new Category($product->id_category_default);
                        $eventData['item_category'] = $category->name[Context::getContext()->language->id] ?? 'Unknown';
                        $eventData['item_category_id'] = $product->id_category_default;
                    }
                } catch (Exception $e) {
                    // If we can't get category, continue without it
                }
            }
        }

        // Add recommendation context
        $eventData['recommendation_context'] = true;

        $data = [
            'event_type' => 'recommendation_click',
            'event_data' => json_encode($eventData),
            'created_at' => date('Y-m-d H:i:s')
        ];

        return $this->insertEvent($data);
    }

    /**
     * Track API request event
     */
    public function trackApiRequest($requestId, $status, $responseTime = null)
    {
        if (!Configuration::get('RECSYNC_TELEMETRY_ENABLED')) {
            return;
        }

        $data = [
            'event_type' => 'api_request',
            'event_data' => json_encode([
                'request_id' => $requestId,
                'status' => $status,
                'response_time' => $responseTime,
                'timestamp' => time()
            ]),
            'created_at' => date('Y-m-d H:i:s')
        ];

        return $this->insertEvent($data);
    }

    /**
     * Insert event into database
     */
    private function insertEvent($data)
    {
        $sql = 'INSERT INTO ' . $this->tableName . ' 
                (event_type, event_data, created_at) 
                VALUES ("' . pSQL($data['event_type']) . '", 
                        "' . pSQL($data['event_data']) . '", 
                        "' . $data['created_at'] . '")';

        return Db::getInstance()->execute($sql);
    }

    /**
     * Get events for a specific time period
     */
    public function getEvents($eventType = null, $limit = 100, $offset = 0)
    {
        $sql = 'SELECT * FROM ' . $this->tableName;
        
        if ($eventType) {
            $sql .= ' WHERE event_type = "' . pSQL($eventType) . '"';
        }
        
        $sql .= ' ORDER BY created_at DESC LIMIT ' . (int)$limit . ' OFFSET ' . (int)$offset;
        
        return Db::getInstance()->executeS($sql);
    }

    /**
     * Clean old events
     */
    public function cleanOldEvents($days = 30)
    {
        $sql = 'DELETE FROM ' . $this->tableName . ' 
                WHERE created_at < DATE_SUB(NOW(), INTERVAL ' . (int)$days . ' DAY)';
        
        return Db::getInstance()->execute($sql);
    }

    /**
     * Get event statistics
     */
    public function getStats($days = 7)
    {
        $stats = [];
        
        // Total events
        $sql = 'SELECT COUNT(*) as total FROM ' . $this->tableName . ' 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ' . (int)$days . ' DAY)';
        $result = Db::getInstance()->getRow($sql);
        $stats['total'] = (int)$result['total'];
        
        // Events by type
        $sql = 'SELECT event_type, COUNT(*) as count FROM ' . $this->tableName . ' 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL ' . (int)$days . ' DAY) 
                GROUP BY event_type';
        $results = Db::getInstance()->executeS($sql);
        
        $stats['by_type'] = [];
        foreach ($results as $row) {
            $stats['by_type'][$row['event_type']] = (int)$row['count'];
        }
        
        return $stats;
    }
}
