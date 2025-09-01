/**
 * RecSync Frontend JavaScript
 * Handles recommendation buttons and interactions
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    function initRecSync() {
        setupAddToCartButtons();
    }

    /**
     * Setup add to cart buttons
     */
    function setupAddToCartButtons() {
        document.addEventListener('click', function(event) {
            const addToCartBtn = event.target.closest('.recsync-add-to-cart-btn');
            if (!addToCartBtn) return;

            event.preventDefault();
            event.stopPropagation();

            const productId = addToCartBtn.dataset.productId;
            const productAttributeId = addToCartBtn.dataset.productAttributeId || 0;
            const addToCartUrl = addToCartBtn.dataset.addToCartUrl;

            if (!addToCartUrl) {
                console.warn('RecSync: No add to cart URL found');
                return;
            }

            // Show loading state
            addToCartBtn.classList.add('loading');
            const originalText = addToCartBtn.innerHTML;
            addToCartBtn.innerHTML = '<i class="material-icons">&#xE86A;</i> Agregando...';

            // Prepare form data
            const formData = new FormData();
            formData.append('id_product', productId);
            formData.append('id_product_attribute', productAttributeId);
            formData.append('qty', '1');
            formData.append('action', 'update');

            // Send request
            fetch(addToCartUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success || !data.hasError) {
                    // Success state
                    addToCartBtn.classList.remove('loading');
                    addToCartBtn.classList.add('success');
                    addToCartBtn.innerHTML = '<i class="material-icons">&#xE5CA;</i> ¡Agregado!';

                    // Trigger PrestaShop cart update
                    if (typeof prestashop !== 'undefined') {
                        prestashop.emit('updateCart', {
                            reason: {
                                idProduct: parseInt(productId),
                                idProductAttribute: parseInt(productAttributeId),
                                linkAction: 'add-to-cart'
                            },
                            resp: data
                        });
                    }

                    // Reset button after 2 seconds
                    setTimeout(() => {
                        addToCartBtn.classList.remove('success');
                        addToCartBtn.innerHTML = originalText;
                    }, 2000);
                } else {
                    // Error state
                    addToCartBtn.classList.remove('loading');
                    addToCartBtn.innerHTML = originalText;
                    
                    if (data.errors && data.errors.length > 0) {
                        console.error('RecSync: Add to cart error:', data.errors);
                    }
                }
            })
            .catch(error => {
                // Error state
                addToCartBtn.classList.remove('loading');
                addToCartBtn.innerHTML = originalText;
                console.error('RecSync: Add to cart request failed:', error);
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRecSync);
    } else {
        initRecSync();
    }

    // Expose to global scope for debugging
    window.RecSyncFrontend = {
        init: initRecSync,
        setupAddToCartButtons: setupAddToCartButtons
    };

})();
