<?php
/**
 * Controller para extraer datos del producto desde el backend
 * Uso: /modules/recsync/controllers/front/productdata.php?id_product=11
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
$productId = (int)Tools::getValue('id_product');

if (!$productId) {
    http_response_code(400);
    die('Product ID required');
}

// Cargar el producto
$product = new Product($productId, true, Context::getContext()->language->id);

if (!Validate::isLoadedObject($product)) {
    http_response_code(404);
    die('Product not found');
}

// Obtener categoría del producto
$category = new Category($product->id_category_default, Context::getContext()->language->id);
$categoryName = Validate::isLoadedObject($category) ? $category->name : 'Unknown';

// Obtener precio del producto con impuestos incluidos
// Simular el comportamiento de orderdata.php para un producto individual
$context = Context::getContext();
$price = $product->getPrice(true, null, 6, null, false, true, 1, false, null, null, null, true, true, true, $context);

// Preparar datos de respuesta
$productData = [
    'item_id' => (string)$productId,
    'item_name' => $product->name,
    'price' => (float)$price,
    'quantity' => 1,
    'item_category' => $categoryName,
    'item_category_id' => (string)$product->id_category_default
];

// Enviar respuesta JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

echo json_encode([
    'success' => true,
    'product_data' => $productData
]);