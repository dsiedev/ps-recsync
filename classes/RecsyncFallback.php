<?php
if (!defined('_PS_VERSION_')) {
    exit;
}

class RecsyncFallback
{
    /**
     * Get fallback products when API fails
     */
    public function getFallbackProducts($context)
    {
        $strategy = Configuration::get('RECSYNC_FALLBACK_STRATEGY');
        $limit = (int)Configuration::get('RECSYNC_FALLBACK_LIMIT');
        
        switch ($strategy) {
            case 'bestsellers':
                return $this->getBestsellers($context, $limit);
            case 'newest':
                return $this->getNewest($context, $limit);
            case 'random':
                return $this->getRandom($context, $limit);
            case 'featured':
                return $this->getFeatured($context, $limit);
            default:
                return $this->getBestsellers($context, $limit);
        }
    }

    /**
     * Get best selling products
     */
    private function getBestsellers($context, $limit)
    {
        $sql = 'SELECT p.id_product, p.reference, pl.name, p.active
                FROM ' . _DB_PREFIX_ . 'product p
                LEFT JOIN ' . _DB_PREFIX_ . 'product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = ' . (int)Context::getContext()->language->id . '
                WHERE p.active = 1
                ORDER BY p.sales DESC, p.id_product DESC
                LIMIT ' . (int)$limit;
        
        $products = Db::getInstance()->executeS($sql);
        
        if (!$products) {
            return $this->getRandom($context, $limit);
        }
        
        return $this->formatFallbackResponse($products, 'bestsellers');
    }

    /**
     * Get newest products
     */
    private function getNewest($context, $limit)
    {
        $sql = 'SELECT p.id_product, p.reference, pl.name, p.active
                FROM ' . _DB_PREFIX_ . 'product p
                LEFT JOIN ' . _DB_PREFIX_ . 'product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = ' . (int)Context::getContext()->language->id . '
                WHERE p.active = 1
                ORDER BY p.date_add DESC
                LIMIT ' . (int)$limit;
        
        $products = Db::getInstance()->executeS($sql);
        
        if (!$products) {
            return $this->getRandom($context, $limit);
        }
        
        return $this->formatFallbackResponse($products, 'newest');
    }

    /**
     * Get random products
     */
    private function getRandom($context, $limit)
    {
        $sql = 'SELECT p.id_product, p.reference, pl.name, p.active
                FROM ' . _DB_PREFIX_ . 'product p
                LEFT JOIN ' . _DB_PREFIX_ . 'product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = ' . (int)Context::getContext()->language->id . '
                WHERE p.active = 1
                ORDER BY RAND()
                LIMIT ' . (int)$limit;
        
        $products = Db::getInstance()->executeS($sql);
        
        if (!$products) {
            return [
                'recommendations' => [],
                'tracking' => [
                    'request_id' => 'fallback_' . time(),
                    'strategy' => 'random',
                    'ttl_seconds' => 300
                ]
            ];
        }
        
        return $this->formatFallbackResponse($products, 'random');
    }

    /**
     * Get featured products
     */
    private function getFeatured($context, $limit)
    {
        $sql = 'SELECT p.id_product, p.reference, pl.name, p.active
                FROM ' . _DB_PREFIX_ . 'product p
                LEFT JOIN ' . _DB_PREFIX_ . 'product_lang pl ON p.id_product = pl.id_product AND pl.id_lang = ' . (int)Context::getContext()->language->id . '
                WHERE p.active = 1 AND p.featured = 1
                ORDER BY p.id_product DESC
                LIMIT ' . (int)$limit;
        
        $products = Db::getInstance()->executeS($sql);
        
        if (!$products) {
            return $this->getBestsellers($context, $limit);
        }
        
        return $this->formatFallbackResponse($products, 'featured');
    }

    /**
     * Format fallback response
     */
    private function formatFallbackResponse($products, $strategy)
    {
        $recommendations = [];
        
        foreach ($products as $index => $product) {
            $recommendations[] = [
                'type' => 'fallback_' . $strategy,
                'id' => $product['reference'] ?: 'PS_' . $product['id_product'],
                'score' => 0.5 - ($index * 0.05), // Decreasing score
                'reason' => 'Fallback: ' . ucfirst($strategy) . ' products'
            ];
        }
        
        return [
            'recommendations' => $recommendations,
            'tracking' => [
                'request_id' => 'fallback_' . time(),
                'strategy' => $strategy,
                'ttl_seconds' => 300
            ]
        ];
    }
}
