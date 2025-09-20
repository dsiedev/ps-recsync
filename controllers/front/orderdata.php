<?php
/**
 * Controller para extraer datos del pedido desde el backend
 * Uso: /modules/recsync/controllers/front/orderdata.php?id_order=22
 * SEGURIDAD: Solo accesible desde el mismo dominio
 */

require_once(dirname(__FILE__) . '/../../../../config/config.inc.php');
require_once(dirname(__FILE__) . '/../../../../init.php');

// Verificar que el módulo esté habilitado
if (!Module::isInstalled('recsync') || !Module::isEnabled('recsync')) {
    http_response_code(404);
    die('Module not found');
}

// Verificar que la telemetría esté habilitada
$telemetryEnabled = Configuration::get('RECSYNC_TELEMETRY_ENABLED');

if (!$telemetryEnabled) {
    http_response_code(403);
    die('Telemetry disabled');
}

// MEDIDAS DE SEGURIDAD SIMPLIFICADAS

// 1. Verificar que la petición venga del mismo dominio
$allowedHosts = [
    $_SERVER['HTTP_HOST'],
    'localhost',
    '127.0.0.1'
];

$referer = isset($_SERVER['HTTP_REFERER']) ? parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST) : null;

if ($referer && !in_array($referer, $allowedHosts)) {
    http_response_code(403);
    die('Access denied: Invalid referer');
}

// Obtener parámetros de la URL
$orderId = (int)Tools::getValue('id_order');
$cartId = (int)Tools::getValue('id_cart');
$key = Tools::getValue('key');


if (!$orderId) {
    http_response_code(400);
    die('Order ID required');
}

try {
    // Verificar que el pedido existe
    $order = new Order($orderId);
    if (!Validate::isLoadedObject($order)) {
        http_response_code(404);
        die('Order not found');
    }
    
    // Verificar la clave del pedido si se proporciona
    if ($key && $order->secure_key !== $key) {
        http_response_code(403);
        die('Invalid order key');
    }
    
    // Verificar que el pedido esté en estado válido (no cancelado)
    if ($order->current_state == Configuration::get('PS_OS_CANCELED')) {
        http_response_code(403);
        die('Access denied: Order is canceled');
    }

    // Obtener moneda
    $currency = new Currency($order->id_currency);
    $currencyCode = $currency->iso_code;

    // Obtener método de pago
    $paymentMethod = 'unknown';
    if ($order->payment) {
        $paymentMethod = $order->payment;
    }

    // Construir array de datos del pedido
    $orderData = [
        'transaction_id' => $order->id,
        'value' => (float)$order->total_paid,
        'currency' => $currencyCode,
        'tax' => (float)($order->total_paid_tax_incl - $order->total_paid_tax_excl),
        'shipping' => (float)$order->total_shipping,
        'coupon' => null,
        'affiliation' => Configuration::get('PS_SHOP_NAME') ?: 'PrestaShop Store',
        'payment_type' => $paymentMethod,
        'items' => []
    ];

    // Agregar productos al array de items
    $products = $order->getProducts();
    foreach ($products as $product) {
        // Obtener categoría real del producto
        $categoryName = 'Unknown';
        if (isset($product['category_name']) && !empty($product['category_name'])) {
            $categoryName = $product['category_name'];
        } else {
            // Intentar obtener categoría desde el objeto Product
            try {
                $productObj = new Product($product['product_id']);
                if ($productObj->id_category_default) {
                    $category = new Category($productObj->id_category_default, Context::getContext()->language->id);
                    $categoryName = $category->name ?? 'Unknown';
                }
            } catch (Exception $e) {
                // Si no se puede obtener la categoría, usar Unknown
            }
        }
        
        $orderData['items'][] = [
            'item_name' => $product['product_name'],
            'item_id' => $product['product_reference'] ?: 'PS_' . $product['product_id'],
            'price' => (float)$product['unit_price_tax_incl'],
            'quantity' => (int)$product['product_quantity'],
            'item_category' => $categoryName
        ];
    }
    
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
    header('Access-Control-Allow-Headers: Content-Type');
    
    
    // Devolver datos en formato JSON
    echo json_encode([
        'success' => true,
        'order_data' => $orderData
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
?>