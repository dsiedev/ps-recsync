{if $recsync_products && count($recsync_products) > 0}
<div class="recsync-widget" data-widget-id="{$recsync_widget_id}" data-tracking-id="{$recsync_tracking_id}">
    {if $recsync_widget_title}
        <h2 class="recsync-widget-title">{$recsync_widget_title}</h2>
    {/if}
    
    {if $recsync_layout == 'carousel'}
        <div class="recsync-carousel">
            <div class="recsync-carousel-container">
                {foreach from=$recsync_products item=product name=products}
                    <div class="recsync-product recsync-telemetry-track" 
                         data-external-id="{$product.external_id}"
                         data-product-id="{$product.id_product}"
                         data-product-attribute-id="{$product.id_product_attribute|default:0}"
                         data-position="{$smarty.foreach.products.iteration}">
                        <a href="{$product.link}" title="{$product.name}">
                            <div class="recsync-product-image">
                                {if $product.image_url}
                                    <img src="{$product.image_url}" alt="{$product.name}" loading="lazy">
                                {else}
                                    <div class="recsync-product-placeholder">
                                        <i class="material-icons">image</i>
                                    </div>
                                {/if}
                                
                                {if $product.score}
                                    <div class="recsync-product-score">
                                        {($product.score * 100)|round}%
                                    </div>
                                {/if}
                                
                                {if $recsync_tracking_id && $recsync_tracking_id|strpos:'fallback_' === 0}
                                    <div class="recsync-fallback-indicator">
                                        Fallback
                                    </div>
                                {/if}
                            </div>
                            
                            <div class="recsync-product-content">
                                <h3 class="recsync-product-name">{$product.name}</h3>
                                <div class="recsync-product-price">{$product.price_formatted}</div>
                                
                                {if $product.score}
                                    <div class="recsync-score-indicator">
                                        <span>Score:</span>
                                        <div class="recsync-score-stars">
                                            {for $i=1 to 5}
                                                <div class="recsync-score-star{if $product.score >= $i/5} filled{/if}"></div>
                                            {/for}
                                        </div>
                                    </div>
                                {/if}
                                
                                <div class="recsync-product-actions">
                                    <button
                                        data-analytics-event="view_item"
                                        data-analytics-data='{literal}{{/literal}
                                            "item_name": "{$product.name|escape:'html':'UTF-8'}",
                                            "item_id": "{$product.external_id|escape:'html':'UTF-8'}",
                                            "price": {$product.price_amount|default:0},
                                            "quantity": 1,
                                            "item_category": "{$product.category_name|default:'Productos'|escape:'html':'UTF-8'}",
                                            "item_variant": "{$product.attribute_name|default:''|escape:'html':'UTF-8'}",
                                            "position": {$smarty.foreach.products.iteration},
                                            "widget_id": "{$recsync_widget_id|escape:'html':'UTF-8'}",
                                            "request_id": "{$recsync_tracking_id|escape:'html':'UTF-8'}"
                                        {literal}}{/literal}'
                                        data-analytics-label="{$product.name|escape:'html':'UTF-8'}"
                                        class="btn btn-primary recsync-view-btn"
                                        onclick="window.location.href='{$product.link}'"
                                    >
                                        Ver Producto
                                    </button>
                                    
                                    {if $product.add_to_cart_url}
                                        <button
                                            data-analytics-event="add_to_cart"
                                            data-analytics-data='{literal}{{/literal}
                                                "item_name": "{$product.name|escape:'html':'UTF-8'}",
                                                "item_id": "{$product.external_id|escape:'html':'UTF-8'}",
                                                "price": {$product.price_amount|default:0},
                                                "quantity": 1,
                                                "item_category": "{$product.category_name|default:'Productos'|escape:'html':'UTF-8'}",
                                                "item_variant": "{$product.attribute_name|default:''|escape:'html':'UTF-8'}",
                                                "position": {$smarty.foreach.products.iteration},
                                                "widget_id": "{$recsync_widget_id|escape:'html':'UTF-8'}",
                                                "request_id": "{$recsync_tracking_id|escape:'html':'UTF-8'}"
                                            {literal}}{/literal}'
                                            data-analytics-label="{$product.name|escape:'html':'UTF-8'}"
                                            class="btn btn-success recsync-add-to-cart-btn"
                                            data-button-action="add-to-cart"
                                            data-product-id="{$product.id_product}"
                                            data-product-attribute-id="{$product.id_product_attribute|default:0}"
                                            data-add-to-cart-url="{$product.add_to_cart_url}"
                                        >
                                            <i class="material-icons shopping-cart">&#xE547;</i>
                                            Agregar al carrito
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        </a>
                    </div>
                {/foreach}
            </div>
        </div>
    {else}
        <div class="recsync-grid columns-{$recsync_columns}">
            {foreach from=$recsync_products item=product name=products}
                <div class="recsync-product recsync-telemetry-track" 
                     data-external-id="{$product.external_id}"
                     data-product-id="{$product.id_product}"
                     data-product-attribute-id="{$product.id_product_attribute|default:0}"
                     data-position="{$smarty.foreach.products.iteration}">
                    <a href="{$product.link}" title="{$product.name}">
                        <div class="recsync-product-image">
                            {if $product.image_url}
                                <img src="{$product.image_url}" alt="{$product.name}" loading="lazy">
                            {else}
                                <div class="recsync-product-placeholder">
                                    <i class="material-icons">image</i>
                                </div>
                            {/if}
                            
                            {if $product.score}
                                <div class="recsync-product-score">
                                    {($product.score * 100)|round}%
                                </div>
                            {/if}
                            
                            {if $recsync_tracking_id && $recsync_tracking_id|strpos:'fallback_' === 0}
                                <div class="recsync-fallback-indicator">
                                    Fallback
                                </div>
                            {/if}
                        </div>
                        
                        <div class="recsync-product-content">
                            <h3 class="recsync-product-name">{$product.name}</h3>
                            <div class="recsync-product-price">{$product.price_formatted}</div>
                            
                            {if $product.score}
                                <div class="recsync-score-indicator">
                                    <span>Score:</span>
                                    <div class="recsync-score-stars">
                                        {for $i=1 to 5}
                                            <div class="recsync-score-star{if $product.score >= $i/5} filled{/if}"></div>
                                        {/for}
                                    </div>
                                </div>
                            {/if}
                            
                            <div class="recsync-product-actions">
                                <button
                                    data-analytics-event="view_item"
                                    data-analytics-data='{literal}{{/literal}
                                        "item_name": "{$product.name|escape:'html':'UTF-8'}",
                                        "item_id": "{$product.external_id|escape:'html':'UTF-8'}",
                                        "price": {$product.price_amount|default:0},
                                        "quantity": 1,
                                        "item_category": "{$product.category_name|default:'Productos'|escape:'html':'UTF-8'}",
                                        "item_variant": "{$product.attribute_name|default:''|escape:'html':'UTF-8'}",
                                        "position": {$smarty.foreach.products.iteration},
                                        "widget_id": "{$recsync_widget_id|escape:'html':'UTF-8'}",
                                        "request_id": "{$recsync_tracking_id|escape:'html':'UTF-8'}"
                                    {literal}}{/literal}'
                                    data-analytics-label="{$product.name|escape:'html':'UTF-8'}"
                                    class="btn btn-primary recsync-view-btn"
                                    onclick="window.location.href='{$product.link}'"
                                >
                                    Ver Producto
                                </button>
                                
                                {if $product.add_to_cart_url}
                                    <button
                                        data-analytics-event="add_to_cart"
                                        data-analytics-data='{literal}{{/literal}
                                            "item_name": "{$product.name|escape:'html':'UTF-8'}",
                                            "item_id": "{$product.external_id|escape:'html':'UTF-8'}",
                                            "price": {$product.price_amount|default:0},
                                            "quantity": 1,
                                            "item_category": "{$product.category_name|default:'Productos'|escape:'html':'UTF-8'}",
                                            "item_variant": "{$product.attribute_name|default:''|escape:'html':'UTF-8'}",
                                            "position": {$smarty.foreach.products.iteration},
                                            "widget_id": "{$recsync_widget_id|escape:'html':'UTF-8'}",
                                            "request_id": "{$recsync_tracking_id|escape:'html':'UTF-8'}"
                                        {literal}}{/literal}'
                                        data-analytics-label="{$product.name|escape:'html':'UTF-8'}"
                                        class="btn btn-success recsync-add-to-cart-btn"
                                        data-button-action="add-to-cart"
                                        data-product-id="{$product.id_product}"
                                        data-product-attribute-id="{$product.id_product_attribute|default:0}"
                                        data-add-to-cart-url="{$product.add_to_cart_url}"
                                    >
                                        <i class="material-icons shopping-cart">&#xE547;</i>
                                        Agregar al carrito
                                    </button>
                                {/if}
                            </div>
                        </div>
                    </a>
                </div>
            {/foreach}
        </div>
    {/if}
</div>

{if $recsync_telemetry_enabled && $recsync_tracking_id}
<script>
    // Pass configuration to JavaScript
    window.recsyncTelemetryEnabled = true;
    window.recsyncTelemetryUrl = '{$recsync_telemetry_url}';
    window.recsyncUserId = '{$recsync_user_id}';
    window.recsyncSessionId = '{$recsync_session_id}';
    window.recsyncWidgetId = '{$recsync_widget_id}';
    window.recsyncTrackingId = '{$recsync_tracking_id}';
</script>
{/if}

{else}
<div class="recsync-widget">
    <div class="recsync-empty">
        <div class="recsync-empty-icon">📦</div>
        <p>{l s='No recommendations available at the moment.' mod='recsync'}</p>
    </div>
</div>
{/if}
