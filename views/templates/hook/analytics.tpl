{* RecSync Analytics Script Template - Eventos de Producto *}

{* Configuración para analytics.js *}
<script>
window.RECSYNC_ANALYTICS_CONFIG = {
    enabled: true,
    telemetryEnabled: true,
    clientId: "{$recsync_client_id|escape:'html':'UTF-8'}",
    apiUrl: "{$recsync_api_url}",
    apiKey: "{$recsync_api_key|escape:'html':'UTF-8'}",
    debugEnabled: {if $recsync_debug_enabled}true{else}false{/if},
    moduleUrl: "{$recsync_module_url}",
    // Customer data from backend
    customerId: {if $recsync_customer_id}{$recsync_customer_id}{else}null{/if},
    isLoggedIn: {if $recsync_is_logged_in}true{else}false{/if}
};

// Función para inicializar RecSync cuando prestashop esté disponible
function initRecSyncAnalytics() {
    // Verificar si prestashop está disponible
    if (typeof prestashop === 'undefined' || !prestashop.customer) {
        setTimeout(initRecSyncAnalytics, 100);
        return;
    }


    // Crear RECSYNC_CONFIG para compatibilidad con el script
    window.RECSYNC_CONFIG = {
        telemetryEnabled: window.RECSYNC_ANALYTICS_CONFIG.telemetryEnabled,
        clientId: window.RECSYNC_ANALYTICS_CONFIG.clientId,
        apiUrl: window.RECSYNC_ANALYTICS_CONFIG.apiUrl + '/v1/events/',
        apiKey: window.RECSYNC_ANALYTICS_CONFIG.apiKey,
        debugEnabled: window.RECSYNC_ANALYTICS_CONFIG.debugEnabled
    };
    
    

    // Cargar analytics.js público (ahora corregido para enviar formato correcto)
    const analyticsScript = document.createElement('script');
    analyticsScript.src = 'http://127.0.0.1:3000/analytics.js';
    analyticsScript.setAttribute('data-client-id', window.RECSYNC_ANALYTICS_CONFIG.clientId);
    analyticsScript.setAttribute('data-client-secret', window.RECSYNC_ANALYTICS_CONFIG.apiKey);
    analyticsScript.setAttribute('data-debug', window.RECSYNC_ANALYTICS_CONFIG.debugEnabled.toString());
    analyticsScript.async = true;
    
    
    // Cargar eventos específicos de producto
    const productEventsScript = document.createElement('script');
    productEventsScript.src = window.RECSYNC_ANALYTICS_CONFIG.moduleUrl + 'views/js/recsync-product-events.js';
    productEventsScript.async = true;
    
    productEventsScript.onload = function() {
        // Script loaded successfully
    };
    
    document.head.appendChild(productEventsScript);
    
    // Cargar eventos de recomendaciones
    const recommendationsScript = document.createElement('script');
    recommendationsScript.src = window.RECSYNC_ANALYTICS_CONFIG.moduleUrl + 'views/js/recsync-recommendations-tracking.js';
    recommendationsScript.async = true;
    
    recommendationsScript.onload = function() {
        // Script loaded successfully
    };
    
    document.head.appendChild(recommendationsScript);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecSyncAnalytics);
} else {
    initRecSyncAnalytics();
}
</script>
