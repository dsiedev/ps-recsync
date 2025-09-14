{*
* RecSync - Recommendations Widget Template
* Uses standard PrestaShop product structure for consistency
*}


{if isset($recsync_products) && $recsync_products|count > 0}
    <section class="recsync-widget" id="recsync-widget">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    {if isset($recsync_widget_title) && $recsync_widget_title && $recsync_widget_title|trim != ''}
                        <h2 class="recsync-title">
                            {$recsync_widget_title|escape:'html':'UTF-8'}
                        </h2>
                    {/if}
                    
                    <div class="recsync-products">
                        {if isset($recsync_layout) && $recsync_layout == 'carousel'}
                            {* Carousel Layout *}
                            <div class="recsync-carousel{if isset($recsync_carousel_arrows) && $recsync_carousel_arrows} show-arrows{/if}{if isset($recsync_carousel_indicators) && $recsync_carousel_indicators} show-indicators{/if}" data-carousel="true">
                                <div class="recsync-carousel-container">
                                    {foreach from=$recsync_products item=product name=recsync_products}
                                        <div class="recsync-product js-product product" data-id-product="{$product.id_product}" data-category="{$product.category_name|escape:'html':'UTF-8'}" data-category-id="{$product.category_id}" data-recsync-tracking="recommendation" data-recsync-widget="home_main">
                                            <article class="product-miniature js-product-miniature" data-id-product="{$product.id_product}" data-id-product-attribute="{$product.id_product_attribute}">
                                                <div class="thumbnail-container">
                                                    <div class="thumbnail-top">
                                                        {* Product thumbnail using standard PrestaShop structure *}
                                                        {if $product.cover}
                                                            <a href="{$product.url}" class="thumbnail product-thumbnail">
                                                                <img
                                                                    src="{$product.cover.bySize.home_default.url}"
                                                                    alt="{if !empty($product.cover.legend)}{$product.cover.legend}{else}{$product.name|truncate:30:'...'}{/if}"
                                                                    loading="lazy"
                                                                    data-full-size-image-url="{$product.cover.large.url}"
                                                                    width="{$product.cover.bySize.home_default.width}"
                                                                    height="{$product.cover.bySize.home_default.height}"
                                                                />
                                                            </a>
                                                        {else}
                                                            <a href="{$product.url}" class="thumbnail product-thumbnail">
                                                                <img
                                                                    src="{$urls.no_picture_image.bySize.home_default.url}"
                                                                    loading="lazy"
                                                                    width="{$urls.no_picture_image.bySize.home_default.width}"
                                                                    height="{$urls.no_picture_image.bySize.home_default.height}"
                                                                />
                                                            </a>
                                                        {/if}

                                                        <div class="highlighted-informations{if !$product.main_variants} no-variants{/if}">
                                                            {* Quick view button *}
                                                            <a class="quick-view js-quick-view" href="#" data-link-action="quickview">
                                                                <i class="material-icons search">&#xE8B6;</i> {l s='Quick view' d='Shop.Theme.Actions'}
                                                            </a>

                                                            {* Product variants *}
                                                            {if $product.main_variants}
                                                                {include file='catalog/_partials/variant-links.tpl' variants=$product.main_variants}
                                                            {/if}
                                                        </div>
                                                    </div>

                                                    <div class="product-description">
                                                        {* Product name *}
                                                        <h3 class="h3 product-title">
                                                            <a href="{$product.url}" content="{$product.url}">{$product.name|truncate:30:'...'}</a>
                                                        </h3>

                                                        {* Product price and shipping *}
                                                        {if $product.show_price}
                                                            <div class="product-price-and-shipping">
                                                                {if $product.has_discount}
                                                                    {hook h='displayProductPriceBlock' product=$product type="old_price"}
                                                                    <span class="regular-price" aria-label="{l s='Regular price' d='Shop.Theme.Catalog'}">{$product.regular_price}</span>
                                                                    {if $product.discount_type === 'percentage'}
                                                                        <span class="discount-percentage discount-product">{$product.discount_percentage}</span>
                                                                    {elseif $product.discount_type === 'amount'}
                                                                        <span class="discount-amount discount-product">{$product.discount_amount_to_display}</span>
                                                                    {/if}
                                                                {/if}

                                                                {hook h='displayProductPriceBlock' product=$product type="before_price"}

                                                                <span class="price" aria-label="{l s='Price' d='Shop.Theme.Catalog'}">
                                                                    {capture name='custom_price'}{hook h='displayProductPriceBlock' product=$product type='custom_price' hook_origin='products_list'}{/capture}
                                                                    {if '' !== $smarty.capture.custom_price}
                                                                        {$smarty.capture.custom_price nofilter}
                                                                    {else}
                                                                        {$product.price}
                                                                    {/if}
                                                                </span>

                                                                {hook h='displayProductPriceBlock' product=$product type='unit_price'}
                                                                {hook h='displayProductPriceBlock' product=$product type='weight'}
                                                            </div>
                                                        {/if}

                                                        {* Product reviews *}
                                                        {hook h='displayProductListReviews' product=$product}
                                                    </div>

                                                    {* Product flags using standard PrestaShop structure *}
                                                    <ul class="product-flags js-product-flags">
                                                        {foreach from=$product.flags item=flag}
                                                            <li class="product-flag {$flag.type}">{$flag.label}</li>
                                                        {/foreach}
                                                    </ul>
                                                </div>
                                            </article>
                                        </div>
                                    {/foreach}
                                </div>
                            </div>
                        {else}
                            {* Grid Layout *}
                            <div class="products row">
                                {foreach from=$recsync_products item=product name=recsync_products}
                                    {* Use standard PrestaShop product classes for responsive grid *}
                                    <div class="js-product product col-xs-12 col-sm-6 col-xl-{if isset($recsync_widget_columns)}{12/$recsync_widget_columns}{else}4{/if}" data-id-product="{$product.id_product}" data-category="{$product.category_name|escape:'html':'UTF-8'}" data-category-id="{$product.category_id}" data-recsync-tracking="recommendation" data-recsync-widget="home_main">
                                        <article class="product-miniature js-product-miniature" data-id-product="{$product.id_product}" data-id-product-attribute="{$product.id_product_attribute}">
                                            <div class="thumbnail-container">
                                                <div class="thumbnail-top">
                                                    {* Product thumbnail using standard PrestaShop structure *}
                                                    {if $product.cover}
                                                        <a href="{$product.url}" class="thumbnail product-thumbnail">
                                                            <img
                                                                src="{$product.cover.bySize.home_default.url}"
                                                                alt="{if !empty($product.cover.legend)}{$product.cover.legend}{else}{$product.name|truncate:30:'...'}{/if}"
                                                                loading="lazy"
                                                                data-full-size-image-url="{$product.cover.large.url}"
                                                                width="{$product.cover.bySize.home_default.width}"
                                                                height="{$product.cover.bySize.home_default.height}"
                                                            />
                                                        </a>
                                                    {else}
                                                        <a href="{$product.url}" class="thumbnail product-thumbnail">
                                                            <img
                                                                src="{$urls.no_picture_image.bySize.home_default.url}"
                                                                loading="lazy"
                                                                width="{$urls.no_picture_image.bySize.home_default.width}"
                                                                height="{$urls.no_picture_image.bySize.home_default.height}"
                                                            />
                                                        </a>
                                                    {/if}

                                                    <div class="highlighted-informations{if !$product.main_variants} no-variants{/if}">
                                                        {* Quick view button *}
                                                        <a class="quick-view js-quick-view" href="#" data-link-action="quickview">
                                                            <i class="material-icons search">&#xE8B6;</i> {l s='Quick view' d='Shop.Theme.Actions'}
                                                        </a>

                                                        {* Product variants *}
                                                        {if $product.main_variants}
                                                            {include file='catalog/_partials/variant-links.tpl' variants=$product.main_variants}
                                                        {/if}
                                                    </div>
                                                </div>

                                                <div class="product-description">
                                                    {* Product name *}
                                                    <h3 class="h3 product-title">
                                                        <a href="{$product.url}" content="{$product.url}">{$product.name|truncate:30:'...'}</a>
                                                    </h3>

                                                    {* Product price and shipping *}
                                                    {if $product.show_price}
                                                        <div class="product-price-and-shipping">
                                                            {if $product.has_discount}
                                                                {hook h='displayProductPriceBlock' product=$product type="old_price"}
                                                                <span class="regular-price" aria-label="{l s='Regular price' d='Shop.Theme.Catalog'}">{$product.regular_price}</span>
                                                                {if $product.discount_type === 'percentage'}
                                                                    <span class="discount-percentage discount-product">{$product.discount_percentage}</span>
                                                                {elseif $product.discount_type === 'amount'}
                                                                    <span class="discount-amount discount-product">{$product.discount_amount_to_display}</span>
                                                                {/if}
                                                            {/if}

                                                            {hook h='displayProductPriceBlock' product=$product type="before_price"}

                                                            <span class="price" aria-label="{l s='Price' d='Shop.Theme.Catalog'}">
                                                                {capture name='custom_price'}{hook h='displayProductPriceBlock' product=$product type='custom_price' hook_origin='products_list'}{/capture}
                                                                {if '' !== $smarty.capture.custom_price}
                                                                    {$smarty.capture.custom_price nofilter}
                                                                {else}
                                                                    {$product.price}
                                                                {/if}
                                                            </span>

                                                            {hook h='displayProductPriceBlock' product=$product type='unit_price'}
                                                            {hook h='displayProductPriceBlock' product=$product type='weight'}
                                                        </div>
                                                    {/if}

                                                    {* Product reviews *}
                                                    {hook h='displayProductListReviews' product=$product}
                                                </div>

                                                {* Product flags using standard PrestaShop structure *}
                                                <ul class="product-flags js-product-flags">
                                                    {foreach from=$product.flags item=flag}
                                                        <li class="product-flag {$flag.type}">{$flag.label}</li>
                                                    {/foreach}
                                                </ul>
                                            </div>
                                        </article>
                                    </div>
                                {/foreach}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </section>
{/if}