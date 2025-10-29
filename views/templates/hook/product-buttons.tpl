{* RecSync - Product Buttons Enhancement *}
{* This template adds analytics attributes to all product buttons *}

<script>
(function() {
    'use strict';
    
    
    // Function to enhance product buttons with analytics
    function enhanceProductButtons() {
        
        // Find all product links and buttons
        let productElements = document.querySelectorAll(`
            a[href*="controller=product"],
            a[href*="id_product="],
            .product-miniature a,
            .product a,
            .product-item a,
            .product-link,
            [data-product-id],
            [data-product-url]
        `);
        
        
        productElements.forEach(function(element) {
            // Skip if already enhanced
            if (element.dataset.recsyncEnhanced) return;
            
            // Find product information
            const productData = extractProductData(element);
            
            if (productData) {
                // Add analytics attributes
                element.setAttribute('data-analytics-event', 'view_item');
                element.setAttribute('data-analytics-item-id', productData.item_id);
                element.setAttribute('data-analytics-item-name', productData.item_name);
                element.setAttribute('data-analytics-price', productData.price);
                element.setAttribute('data-analytics-category', productData.item_category);
                element.setAttribute('data-analytics-category-id', productData.item_category_id);
                element.setAttribute('data-analytics-quantity', '1');
                
                // Mark as enhanced
                element.dataset.recsyncEnhanced = 'true';
                
            }
        });
        
        // Set up click tracking
        setupClickTracking();
    }
    
    // Function to extract product data from element
    function extractProductData(element) {
        let productId = null;
        let productName = null;
        let productPrice = null;
        let productCategory = 'Unknown';
        let categoryId = null;
        
        // Try to get product ID from various sources
        const href = element.href || '';
        const productIdMatch = href.match(/[?&]id_product=(\d+)/);
        if (productIdMatch) {
            productId = productIdMatch[1];
        }
        
        // Try to get from data attributes
        if (!productId) {
            productId = element.dataset.productId || 
                       element.closest('[data-product-id]')?.dataset.productId;
        }
        
        // Try to get from parent containers
        if (!productId) {
            const productContainer = element.closest('.product, .product-miniature, .product-item');
            if (productContainer) {
                productId = productContainer.dataset.productId ||
                           productContainer.dataset.idProduct;
            }
        }
        
        // Try to get product name
        const nameElement = element.querySelector('.product-name, .product-title, h3, h4, h5') ||
                           element.closest('.product, .product-miniature')?.querySelector('.product-name, .product-title, h3, h4, h5');
        if (nameElement) {
            productName = nameElement.textContent?.trim();
        }
        
        // Try to get product price
        const priceElement = element.querySelector('.price, .product-price, .current-price') ||
                           element.closest('.product, .product-miniature')?.querySelector('.price, .product-price, .current-price');
        if (priceElement) {
            const priceText = priceElement.textContent?.trim();
            const priceMatch = priceText?.match(/[\d,]+\.?\d*/);
            if (priceMatch) {
                productPrice = parseFloat(priceMatch[0].replace(',', ''));
            }
        }
        
        // Try to get category
        const categoryElement = element.querySelector('[data-category], .category') ||
                               element.closest('.product, .product-miniature')?.querySelector('[data-category], .category');
        if (categoryElement) {
            productCategory = categoryElement.getAttribute('data-category') || 
                            categoryElement.textContent?.trim() || 'Unknown';
        }
        
        // Try to get category ID
        const categoryIdElement = element.querySelector('[data-category-id]') ||
                                 element.closest('.product, .product-miniature')?.querySelector('[data-category-id]');
        if (categoryIdElement) {
            categoryId = categoryIdElement.getAttribute('data-category-id');
        }
        
        if (productId) {
            return {
                item_id: productId,
                item_name: productName || 'Product ' + productId,
                price: productPrice || 0,
                quantity: 1,
                item_category: productCategory,
                item_category_id: categoryId
            };
        }
        
        return null;
    }
    
    // Function to set up click tracking
    function setupClickTracking() {
        document.addEventListener('click', function(event) {
            const element = event.target.closest('[data-analytics-event="view_item"]');
            
                   if (element) {
                
                const eventData = {
                    item_id: element.getAttribute('data-analytics-item-id'),
                    item_name: element.getAttribute('data-analytics-item-name'),
                    price: parseFloat(element.getAttribute('data-analytics-price')) || 0,
                    quantity: parseInt(element.getAttribute('data-analytics-quantity')) || 1,
                    item_category: element.getAttribute('data-analytics-category'),
                    item_category_id: element.getAttribute('data-analytics-category-id')
                };
                
                const eventPayload = {
                    clientId: window.RECSYNC_ANALYTICS_CONFIG.clientId,
                    event: 'view_item',
                    data: eventData,
                    timestamp: new Date().toISOString(),
                    user_id: window.RECSYNC_ANALYTICS_CONFIG.customerId || 'anonymous',
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    referrer: document.referrer || null
                };
                
                
                // Send event directly to RecSync API (not using analytics.js)
                fetch(window.RECSYNC_CONFIG.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + window.RECSYNC_ANALYTICS_CONFIG.clientId + ':' + window.RECSYNC_ANALYTICS_CONFIG.apiKey
                    },
                    body: JSON.stringify(eventPayload)
                       }).then(response => {
                           // Event sent
                       }).catch(error => {
                           // Error handling
                       });
            }
        });
    }
    
    // Initialize when DOM is ready
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', enhanceProductButtons);
        } else {
            enhanceProductButtons();
        }
        
        // Re-enhance when new content is loaded (for AJAX)
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    setTimeout(enhanceProductButtons, 100);
                }
            });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
    }
    
    // Start initialization
        init();
    
})();
</script>
