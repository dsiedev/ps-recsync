{* RecSync - Product Buttons Enhancement *}
{* This template adds analytics attributes to all add to cart buttons *}

<script>
(function() {
    'use strict';
    
    // Function to enhance add to cart buttons with analytics
    function enhanceAddToCartButtons() {
        // Find all add to cart buttons in the page with expanded selectors
        let addToCartButtons = document.querySelectorAll(`
            [data-button-action="add-to-cart"], 
            [data-button-action="add_to_cart"],
            .add-to-cart, 
            .btn-add-to-cart,
            .add_to_cart,
            .btn-addtocart,
            button[type="submit"][form*="add_to_cart"],
            input[type="submit"][form*="add_to_cart"],
            button[onclick*="add"],
            button[onclick*="cart"],
            input[value*="Add"],
            input[value*="Agregar"],
            input[value*="Comprar"],
            input[value*="Añadir"]
        `);
        
        // Also search by text content for buttons that might not have specific classes
        const allButtons = document.querySelectorAll('button, input[type="submit"], a.btn, .btn');
        const textButtons = Array.from(allButtons).filter(button => {
            const text = (button.textContent || button.value || '').toLowerCase();
            return text.includes('add') || 
                   text.includes('carrito') || 
                   text.includes('comprar') || 
                   text.includes('agregar') ||
                   text.includes('añadir') ||
                   text.includes('buy') ||
                   text.includes('cart');
        });
        
        // Combine both sets and remove duplicates
        const allButtonsSet = new Set([...addToCartButtons, ...textButtons]);
        addToCartButtons = Array.from(allButtonsSet);
        
        addToCartButtons.forEach(function(button) {
            // Skip if already enhanced
            if (button.dataset.recsyncEnhanced) return;
            
            // Find product information with expanded selectors
            const productContainer = button.closest(`
                .product, 
                .product-miniature, 
                .product-item, 
                [data-id-product],
                .product-details,
                .product-info,
                .product-main,
                [data-product-id],
                .product-container,
                .product-wrapper,
                .product-box,
                .product-card,
                .product-block,
                .product-element,
                .product-section,
                .product-area,
                .product-zone,
                .product-region,
                .product-div,
                .product-article,
                .product-aside,
                .product-main,
                .product-content,
                .product-body,
                .product-header,
                .product-footer,
                .product-sidebar,
                .product-panel,
                .product-widget,
                .product-module,
                .product-component,
                .product-element,
                .product-item,
                .product-entry,
                .product-post,
                .product-page,
                .product-view,
                .product-display,
                .product-show,
                .product-render,
                .product-output,
                .product-result,
                .product-data,
                .product-info,
                .product-details,
                .product-summary,
                .product-overview,
                .product-preview,
                .product-thumbnail,
                .product-image,
                .product-gallery,
                .product-slider,
                .product-carousel,
                .product-grid,
                .product-list,
                .product-table,
                .product-form,
                .product-input,
                .product-field,
                .product-control,
                .product-button,
                .product-link,
                .product-anchor,
                .product-reference,
                .product-id,
                .product-key,
                .product-name,
                .product-title,
                .product-heading,
                .product-label,
                .product-text,
                .product-description,
                .product-content,
                .product-body,
                .product-main,
                .product-side,
                .product-left,
                .product-right,
                .product-top,
                .product-bottom,
                .product-center,
                .product-middle,
                .product-inner,
                .product-outer,
                .product-wrapper,
                .product-container,
                .product-box,
                .product-card,
                .product-block,
                .product-element,
                .product-section,
                .product-area,
                .product-zone,
                .product-region,
                .product-div,
                .product-article,
                .product-aside,
                .product-main,
                .product-content,
                .product-body,
                .product-header,
                .product-footer,
                .product-sidebar,
                .product-panel,
                .product-widget,
                .product-module,
                .product-component,
                .product-element,
                .product-item,
                .product-entry,
                .product-post,
                .product-page,
                .product-view,
                .product-display,
                .product-show,
                .product-render,
                .product-output,
                .product-result,
                .product-data,
                .product-info,
                .product-details,
                .product-summary,
                .product-overview,
                .product-preview,
                .product-thumbnail,
                .product-image,
                .product-gallery,
                .product-slider,
                .product-carousel,
                .product-grid,
                .product-list,
                .product-table,
                .product-form,
                .product-input,
                .product-field,
                .product-control,
                .product-button,
                .product-link,
                .product-anchor,
                .product-reference,
                .product-id,
                .product-key,
                .product-name,
                .product-title,
                .product-heading,
                .product-label,
                .product-text,
                .product-description,
                .product-content,
                .product-body,
                .product-main,
                .product-side,
                .product-left,
                .product-right,
                .product-top,
                .product-bottom,
                .product-center,
                .product-middle,
                .product-inner,
                .product-outer
            `);
            
            // Process the button with the found container
            if (productContainer) {
                processButtonWithContainer(button, productContainer);
            } else {
                // If no container found, try to get product info from meta tags or global variables
                const productId = document.querySelector('meta[property="product:price:amount"]')?.content ||
                                document.querySelector('meta[name="product_id"]')?.content ||
                                document.querySelector('meta[property="og:product:price:amount"]')?.content;
                
                if (productId) {
                    // Create a virtual container with basic info
                    const virtualContainer = {
                        dataset: { idProduct: productId },
                        querySelector: () => null
                    };
                    
                    // Process with virtual container
                    processButtonWithContainer(button, virtualContainer);
                } else if (window.recsyncDebug) {
                    console.log('RecSync: Could not find product container for button:', button);
                }
            }
        });
    }
    
    // Function to process a button with its product container
    function processButtonWithContainer(button, productContainer) {
        // Get product data
        const productId = productContainer.dataset?.idProduct || 
                         button.dataset.idProduct || 
                         button.closest('[data-id-product]')?.dataset.idProduct ||
                         document.querySelector('meta[name="product_id"]')?.content ||
                         document.querySelector('meta[property="product:price:amount"]')?.content;
        
        const productAttributeId = productContainer.dataset?.idProductAttribute || 
                                 button.dataset.idProductAttribute || 
                                 button.closest('[data-id-product-attribute]')?.dataset.idProductAttribute || '0';
        
        // Get product name from multiple sources
        const productName = productContainer.querySelector?.('.product-name, .product-title, h1, h2, h3')?.textContent?.trim() ||
                           document.querySelector('meta[property="og:title"]')?.content ||
                           document.querySelector('meta[name="product_name"]')?.content ||
                           document.title?.replace(/ - .*$/, '') ||
                           'Producto';
        
        // Get product price from multiple sources
        let price = 0;
        const priceElement = productContainer.querySelector?.('.price, .product-price, [data-price]');
        if (priceElement) {
            price = parseFloat(priceElement.dataset.price || priceElement.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        } else {
            // Try meta tags for price
            const metaPrice = document.querySelector('meta[property="product:price:amount"]')?.content ||
                             document.querySelector('meta[name="product_price"]')?.content;
            price = parseFloat(metaPrice) || 0;
        }
        
        // Get product reference/category
        const productReference = productContainer.dataset?.reference || 
                               productContainer.querySelector?.('[data-reference]')?.dataset.reference || 
                               document.querySelector('meta[name="product_reference"]')?.content ||
                               'PS_' + productId;
        
        // Get category from multiple sources
        const categoryElement = productContainer.querySelector?.('.category-name, .product-category');
        const category = categoryElement ? categoryElement.textContent.trim() : 
                        document.querySelector('meta[name="product_category"]')?.content || 'Productos';
        
        // Get variant/attribute name
        const variantElement = productContainer.querySelector?.('.product-variants, .product-attributes');
        const variant = variantElement ? variantElement.textContent.trim() : '';
        
        // Get position (if in a list)
        const productList = productContainer.closest?.('.products, .product-list, .product-grid');
        let position = 1;
        if (productList) {
            const products = productList.querySelectorAll('.product, .product-miniature, .product-item');
            for (let i = 0; i < products.length; i++) {
                if (products[i] === productContainer) {
                    position = i + 1;
                    break;
                }
            }
        }
        
        // Determine source
        const source = window.location.pathname.includes('/product/') || 
                      window.location.pathname.includes('.html') ? 'product_page' : 'product_list';
        
        // Add analytics attributes
        button.setAttribute('data-analytics-event', 'add_to_cart');
        button.setAttribute('data-analytics-data', JSON.stringify({
            item_name: productName,
            item_id: productReference,
            price: price,
            quantity: 1,
            item_category: category,
            item_variant: variant,
            position: position,
            product_id: productId,
            product_attribute_id: productAttributeId,
            source: source
        }));
        button.setAttribute('data-analytics-label', productName);
        
        // Mark as enhanced
        button.dataset.recsyncEnhanced = 'true';
        
        // Add visual indicator for debugging
        if (window.recsyncDebug) {
            button.style.border = '2px solid #28a745';
            button.title = 'RecSync Enhanced - ' + productName;
        }
        
        if (window.recsyncDebug) {
            console.log('RecSync: Enhanced button for product:', {
                name: productName,
                id: productId,
                price: price,
                source: source
            });
        }
        });
    }
    
    // Function to enhance view item buttons
    function enhanceViewItemButtons() {
        // Find all product links
        const productLinks = document.querySelectorAll('.product-name a, .product-title a, .product a[href*="/product/"]');
        
        productLinks.forEach(function(link) {
            // Skip if already enhanced
            if (link.dataset.recsyncEnhanced) return;
            
            // Find product container
            const productContainer = link.closest('.product, .product-miniature, .product-item, [data-id-product]');
            if (!productContainer) return;
            
            // Get product data (similar to add to cart)
            const productId = productContainer.dataset.idProduct || 
                             link.closest('[data-id-product]')?.dataset.idProduct;
            
            const productName = productContainer.querySelector('.product-name, .product-title, h1, h2, h3')?.textContent?.trim() || 'Producto';
            
            const priceElement = productContainer.querySelector('.price, .product-price, [data-price]');
            const price = priceElement ? parseFloat(priceElement.dataset.price || priceElement.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0 : 0;
            
            const productReference = productContainer.dataset.reference || 
                                   productContainer.querySelector('[data-reference]')?.dataset.reference || 
                                   'PS_' + productId;
            
            const categoryElement = productContainer.querySelector('.category-name, .product-category');
            const category = categoryElement ? categoryElement.textContent.trim() : 'Productos';
            
            // Get position
            const productList = productContainer.closest('.products, .product-list, .product-grid');
            let position = 1;
            if (productList) {
                const products = productList.querySelectorAll('.product, .product-miniature, .product-item');
                for (let i = 0; i < products.length; i++) {
                    if (products[i] === productContainer) {
                        position = i + 1;
                        break;
                    }
                }
            }
            
            // Add analytics attributes
            link.setAttribute('data-analytics-event', 'view_item');
            link.setAttribute('data-analytics-data', JSON.stringify({
                item_name: productName,
                item_id: productReference,
                price: price,
                quantity: 1,
                item_category: category,
                position: position,
                product_id: productId,
                source: 'product_list'
            }));
            link.setAttribute('data-analytics-label', productName);
            
            // Mark as enhanced
            link.dataset.recsyncEnhanced = 'true';
        });
    }
    
    // Initialize when DOM is ready
    function init() {
        // Initial enhancement
        enhanceAddToCartButtons();
        enhanceViewItemButtons();
        
        // Watch for dynamic content changes
        if (window.MutationObserver) {
            const observer = new MutationObserver(function(mutations) {
                let shouldEnhance = false;
                
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        for (let i = 0; i < mutation.addedNodes.length; i++) {
                            const node = mutation.addedNodes[i];
                            if (node.nodeType === 1) { // Element node
                                if (node.matches && (node.matches('[data-button-action="add-to-cart"], .add-to-cart') || 
                                    node.querySelector('[data-button-action="add-to-cart"], .add-to-cart'))) {
                                    shouldEnhance = true;
                                    break;
                                }
                            }
                        }
                    }
                });
                
                if (shouldEnhance) {
                    setTimeout(function() {
                        enhanceAddToCartButtons();
                        enhanceViewItemButtons();
                    }, 100);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose for debugging
    window.RecSyncEnhancer = {
        enhanceAddToCartButtons: enhanceAddToCartButtons,
        enhanceViewItemButtons: enhanceViewItemButtons
    };
    
})();
</script>
