{*
* RecSync - Recommendations Widget Template
*}

{if isset($recsync_products) && $recsync_products|count > 0}
    <section class="recsync-widget" id="recsync-widget">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <h2 class="recsync-title">
                        {if isset($recsync_widget_title) && $recsync_widget_title}
                            {$recsync_widget_title|escape:'html':'UTF-8'}
                        {else}
                            {l s='Recomendados para ti' mod='recsync'}
                        {/if}
                    </h2>
                    
                    <div class="recsync-products">
                        <div class="row">
                            {foreach from=$recsync_products item=product name=recsync_products}
                                <div class="col-{if isset($recsync_widget_columns)}{12/$recsync_widget_columns}{else}3{/if} col-sm-6 col-md-{if isset($recsync_widget_columns)}{12/$recsync_widget_columns}{else}3{/if} col-lg-{if isset($recsync_widget_columns)}{12/$recsync_widget_columns}{else}3{/if}">
                                    <article class="product-miniature js-product-miniature" data-id-product="{$product.id_product}" data-id-product-attribute="{$product.id_product_attribute}">
                                        <div class="thumbnail-container">
                                            <a href="{$product.url}" class="thumbnail product-thumbnail">
                                                <img
                                                    src="{$product.cover.bySize.home_default.url}"
                                                    alt="{$product.cover.legend}"
                                                    loading="lazy"
                                                    width="{$product.cover.bySize.home_default.width}"
                                                    height="{$product.cover.bySize.home_default.height}"
                                                />
                                            </a>
                                            
                                            {if $product.discount_percentage}
                                                <div class="product-flags">
                                                    <span class="discount-percentage">{$product.discount_percentage}</span>
                                                </div>
                                            {/if}
                                        </div>
                                        
                                        <div class="product-description">
                                            <h3 class="h3 product-title">
                                                <a href="{$product.url}">{$product.name}</a>
                                            </h3>
                                            
                                            {if $product.show_price}
                                                <div class="product-price-and-shipping">
                                                    {if $product.has_discount}
                                                        <span class="sr-only">{l s='Regular price' d='Shop.Theme.Catalog'}</span>
                                                        <span class="regular-price">{$product.regular_price}</span>
                                                        <span class="sr-only">{l s='Price' d='Shop.Theme.Catalog'}</span>
                                                        <span class="price">{$product.price}</span>
                                                    {else}
                                                        <span class="sr-only">{l s='Price' d='Shop.Theme.Catalog'}</span>
                                                        <span class="price">{$product.price}</span>
                                                    {/if}
                                                </div>
                                            {/if}
                                            
                                            <div class="product-actions">
                                                <form action="{$urls.pages.cart}" method="post" class="add-to-cart-or-refresh">
                                                    <input type="hidden" name="token" value="{$static_token}">
                                                    <input type="hidden" name="id_product" value="{$product.id_product}" class="product_page_product_id">
                                                    <input type="hidden" name="id_customization" value="0" class="product_customization_id">
                                                    
                                                    <button
                                                        class="btn btn-primary add-to-cart"
                                                        data-button-action="add-to-cart"
                                                        type="submit"
                                                        {if !$product.add_to_cart_url}
                                                            disabled
                                                        {/if}
                                                    >
                                                        <i class="material-icons shopping-cart"></i>
                                                        {l s='Add to cart' d='Shop.Theme.Actions'}
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            {/foreach}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    
    {if isset($recsync_debug_enabled) && $recsync_debug_enabled}
        <div class="recsync-debug" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #ccc;">
            <h4>RecSync Debug Info:</h4>
            <p><strong>Products found:</strong> {$recsync_products|count}</p>
            <p><strong>Widget title:</strong> {$recsync_widget_title|escape:'html':'UTF-8'}</p>
            <p><strong>Widget limit:</strong> {$recsync_widget_limit}</p>
            <p><strong>Module URL:</strong> {$recsync_module_url}</p>
        </div>
    {/if}
{else}
    {if isset($recsync_debug_enabled) && $recsync_debug_enabled}
        <div class="recsync-debug" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #ccc;">
            <h4>RecSync Debug Info:</h4>
            <p><strong>No products found</strong></p>
            <p><strong>Products variable:</strong> {if isset($recsync_products)}Set ({$recsync_products|count} items){else}Not set{/if}</p>
            <p><strong>Module URL:</strong> {$recsync_module_url}</p>
        </div>
    {/if}
{/if}
