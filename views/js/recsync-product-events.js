/**
 * RecSync Product Events Tracking
 * Handles product-related events like add to cart, remove from cart, and purchase tracking
 */

    class RecSyncProductEvents {
        constructor() {
            this.analyticsLoaded = false;
        this.sentEvents = new Set();
            this.init();
        }
        
    init() {
        this.waitForPrestaShop();
    }

    waitForPrestaShop() {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkPrestaShop = () => {
            attempts++;
            
            if (window.prestashop && window.prestashop.customer) {
                this.checkPrestaShop();
            } else if (attempts < maxAttempts) {
                setTimeout(checkPrestaShop, 100);
            }
        };
        
        checkPrestaShop();
    }

    checkPrestaShop() {
        this.setupPrestaShopProductEvents();
        this.loadAnalytics();
        }
        
        setupPrestaShopProductEvents() {
            // Page view tracking is handled by the public analytics.js script
            this.setupPurchaseEventTracking();
            this.setupAddToCartTracking();
        }
        
        // Page view tracking functions removed - handled by public analytics.js script

    setupPurchaseEventTracking() {
        // Check if we're on an order confirmation page
        const isOrderConfirmationPage = this.isOrderConfirmationPage();
        
        if (isOrderConfirmationPage) {
            setTimeout(() => {
                this.trackPurchaseEvent();
            }, 1000);
        }
    }

    setupAddToCartTracking() {
        // Function to setup tracking for buttons
        const setupButtons = () => {
            const addToCartButtons = document.querySelectorAll(`
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
                input[value*="cart"],
                .btn-primary[form*="add_to_cart"]
            `);

            console.log('RecSync: Found', addToCartButtons.length, 'add to cart buttons');

            addToCartButtons.forEach((button, index) => {
                // Check if already has our listener
                if (!button.hasAttribute('data-recsync-tracked')) {
                    button.setAttribute('data-recsync-tracked', 'true');
                    console.log('RecSync: Setting up add to cart tracking for button', index, button);
                    button.addEventListener('click', (event) => {
                        console.log('RecSync: Add to cart button clicked', button);
                        this.handleAddToCartClick(button, event);
                    });
                }
            });
        };

        // Setup initial buttons
        setTimeout(setupButtons, 1000);

        // Watch for dynamically added buttons (like in modals)
        const observer = new MutationObserver((mutations) => {
            let shouldCheck = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Check if any added node contains add to cart buttons
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            if (node.querySelector && (
                                node.querySelector('[data-button-action="add-to-cart"]') ||
                                node.querySelector('[data-button-action="add_to_cart"]') ||
                                node.querySelector('.add-to-cart') ||
                                node.querySelector('.btn-add-to-cart') ||
                                node.classList.contains('add-to-cart') ||
                                node.classList.contains('btn-add-to-cart')
                            )) {
                                shouldCheck = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldCheck) {
                console.log('RecSync: New buttons detected, setting up tracking');
                setTimeout(setupButtons, 100);
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    handleAddToCartClick(button, event) {
        console.log('RecSync: Handling add to cart click');
        
        // Extract product data from the button or surrounding elements
        const productData = this.extractProductDataFromButton(button);
        
        if (productData && productData.item_id) {
            // If we only have basic data (like "Product" as name), fetch from backend
            if (productData.item_name === 'Product' || !productData.item_name) {
                console.log('RecSync: Product data incomplete, fetching from backend');
                this.fetchProductDataFromBackend(productData.item_id, (backendData) => {
                    if (backendData) {
                        const addToCartData = {
                            ...backendData,
                            page_location: window.location.href,
                            page_title: document.title,
                            currency: 'USD'
                        };
                        
                        console.log('RecSync: Sending add_to_cart event with backend data:', addToCartData);
                        this.trackEvent('add_to_cart', addToCartData);
                    } else {
                        console.log('RecSync: Backend fetch failed, using fallback data');
                        const addToCartData = {
                            ...productData,
                            page_location: window.location.href,
                            page_title: document.title,
                            currency: 'USD'
                        };
                        this.trackEvent('add_to_cart', addToCartData);
                    }
                });
            } else {
                // We have good data, use it directly
                const addToCartData = {
                    ...productData,
                    page_location: window.location.href,
                    page_title: document.title,
                    currency: 'USD'
                };
                
                console.log('RecSync: Sending add_to_cart event with extracted data:', addToCartData);
                this.trackEvent('add_to_cart', addToCartData);
            }
        } else {
            console.warn('RecSync: Could not extract product data for add to cart event');
        }
    }

    extractProductDataFromButton(button) {
        // Try to find product data from various sources
        let productId = null;
        let productName = null;
        let productPrice = null;
        let productCategory = null;

        // Method 1: Look for data attributes on the button
        productId = button.getAttribute('data-id-product') || 
                   button.getAttribute('data-product-id') ||
                   button.getAttribute('data-id');

        // Method 2: Look in the form that contains this button
        const form = button.closest('form');
        if (form) {
            productId = productId || form.querySelector('[name="id_product"]')?.value ||
                       form.querySelector('[data-id-product]')?.getAttribute('data-id-product');
        }

        // Method 3: Look in parent elements
        if (!productId) {
            const productElement = button.closest('[data-id-product]');
            if (productElement) {
                productId = productElement.getAttribute('data-id-product');
            }
        }

        // Method 4: Look for product name
        const productNameElement = document.querySelector('.product-name, h1, h2, h3, .product-title');
        if (productNameElement) {
            productName = productNameElement.textContent?.trim();
        }

        // Method 5: Look for price
        const priceElement = document.querySelector('.price, .product-price, .current-price');
        if (priceElement) {
            const priceText = priceElement.textContent?.replace(/[^\d.,]/g, '') || '0';
            productPrice = parseFloat(priceText.replace(',', '.')) || 0;
        }

        // Method 6: Look for category
        const categoryElement = document.querySelector('[data-category], .category-name, .breadcrumb a:last-child');
        if (categoryElement) {
            productCategory = categoryElement.getAttribute('data-category') || 
                            categoryElement.textContent?.trim() || 'Unknown';
        }

        if (productId) {
            return {
                item_id: productId,
                item_name: productName || 'Product',
                price: productPrice || 0,
                quantity: 1,
                item_category: productCategory || 'Unknown'
            };
        }

        return null;
    }

    fetchProductDataFromBackend(productId, callback) {
        const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        const endpointUrl = baseUrl + '/modules/recsync/controllers/front/productdata.php';
        const params = new URLSearchParams({
            id_product: productId
        });
        
        fetch(endpointUrl + '?' + params.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': window.location.href
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.product_data) {
                callback(data.product_data);
            } else {
                console.warn('RecSync: Failed to fetch product data from backend:', data.error || 'Unknown error');
                callback(null);
            }
        })
        .catch(error => {
            console.warn('RecSync: Error fetching product data from backend:', error);
            callback(null);
        });
    }

    isOrderConfirmationPage() {
        const url = window.location.href.toLowerCase();
        const pathname = window.location.pathname.toLowerCase();
        
        return pathname.includes('confirmacion-pedido') || 
               pathname.includes('order-confirmation') ||
               url.includes('id_order=') ||
               url.includes('id_cart=');
    }

    trackPurchaseEvent() {
        // Try to use analytics.js first
        if (this.analyticsLoaded && window.analytics) {
            this.fetchOrderDataAndSendViaAnalytics();
        } else {
            this.fetchOrderDataFromBackend();
        }
    }

    fetchOrderDataFromBackend(orderId, cartId, key) {
        // Extract order parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        orderId = orderId || urlParams.get('id_order');
        cartId = cartId || urlParams.get('id_cart');
        key = key || urlParams.get('key');

        if (!orderId) {
            this.fallbackToPageExtraction();
            return;
        }

        const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        const endpointUrl = baseUrl + '/modules/recsync/controllers/front/orderdata.php';
        const params = new URLSearchParams({
            id_order: orderId
        });
        
        if (cartId) {
            params.append('id_cart', cartId);
        }
        
        if (key) {
            params.append('key', key);
        }
        
        const fullUrl = endpointUrl + '?' + params.toString();
        
        fetch(fullUrl, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Referer': window.location.href
            },
            credentials: 'same-origin'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.order_data) {
                    this.trackEvent("purchase", data.order_data);
                } else {
                    throw new Error(data.error || 'Failed to get order data');
                }
            })
            .catch(error => {
                this.fallbackToPageExtraction();
            });
    }

    fetchOrderDataAndSendViaAnalytics(orderId, cartId, key) {
        const urlParams = new URLSearchParams(window.location.search);
        orderId = orderId || urlParams.get('id_order');
        cartId = cartId || urlParams.get('id_cart');
        key = key || urlParams.get('key');

        if (!orderId) {
            this.fallbackToPageExtraction();
            return;
        }

        const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        const endpointUrl = baseUrl + '/modules/recsync/controllers/front/orderdata.php';
        const params = new URLSearchParams({
            id_order: orderId
        });
        
        if (cartId) {
            params.append('id_cart', cartId);
        }
        
        if (key) {
            params.append('key', key);
        }
        
        const fullUrl = endpointUrl + '?' + params.toString();
        
        fetch(fullUrl, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json',
                'Cache-Control': 'no-cache',
                'Referer': window.location.href
            },
            credentials: 'same-origin'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success && data.order_data) {
                    window.analytics.track('purchase', {
                        transaction_id: data.order_data.transaction_id,
                        value: parseFloat(data.order_data.value),
                        currency: data.order_data.currency,
                        tax: parseFloat(data.order_data.tax),
                        shipping: parseFloat(data.order_data.shipping),
                        coupon: data.order_data.coupon,
                        affiliation: data.order_data.affiliation,
                        payment_type: data.order_data.payment_type,
                        items: data.order_data.items.map(item => ({
                            item_id: item.item_id,
                            item_name: item.item_name,
                            price: parseFloat(item.price),
                            quantity: parseInt(item.quantity),
                            item_category: item.item_category
                        }))
                    });
                } else {
                    throw new Error(data.error || 'Failed to get order data');
                }
            })
            .catch(error => {
                this.fallbackToPageExtraction();
            });
    }

    fallbackToPageExtraction() {
        const orderData = this.extractOrderDataFromPage();
        if (orderData && orderData.items && orderData.items.length > 0) {
            this.trackEvent("purchase", orderData);
            }
        }
        
        extractOrderDataFromPage() {
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('id_order');
            
        if (!orderId) {
            return null;
        }

        const orderItems = this.getOrderItems();
        
        if (orderItems.length === 0) {
            return null;
        }

        const totalValue = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return {
            transaction_id: orderId,
            value: totalValue,
            currency: 'USD',
            tax: 0,
            shipping: 0,
            coupon: null,
            affiliation: 'Unknown Store',
            payment_type: 'unknown',
            items: orderItems
        };
        }
        
        getOrderItems() {
            const items = [];
        const processedItems = new Set();
            
        const selectors = [
                '.order-line',
            'tr[data-id-product]',
            '.order-products .product',
            'div[class*="product"]',
            'li[class*="product"]',
            'li[class*="item"]'
        ];

        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            
            for (const element of elements) {
                const item = this.extractItemFromElement(element);
                if (item && item.item_id !== 'unknown' && !processedItems.has(item.item_id)) {
                        items.push(item);
                    processedItems.add(item.item_id);
                }
                }
            }
            
            return items;
        }
        
    extractItemFromElement(element) {
        let itemId = 'unknown';
        let itemName = 'Product';
        let price = 0;
        let quantity = 1;
        let itemCategory = 'Unknown';

        // Try to extract item ID
        const idSelectors = [
                '[data-id-product]',
            '.product-reference',
            '.product-id'
        ];
        
        for (const selector of idSelectors) {
            const idElement = element.querySelector(selector);
            if (idElement) {
                itemId = idElement.getAttribute('data-id-product') || 
                        idElement.textContent?.trim() || 
                        'unknown';
                break;
            }
        }

        // Try to extract item name
        const nameSelectors = [
                '.product-name',
                '.item-name',
            'h3',
            'h4',
            'a[href*="/product/"]'
        ];
        
        for (const selector of nameSelectors) {
            const nameElement = element.querySelector(selector);
            if (nameElement) {
                itemName = nameElement.textContent?.trim() || 'Product';
                break;
            }
        }

        // Try to extract price
        const priceSelectors = [
            '.price',
                '.product-price',
                '.item-price',
            '[class*="price"]'
        ];
        
        for (const selector of priceSelectors) {
            const priceElement = element.querySelector(selector);
            if (priceElement) {
                const priceText = priceElement.textContent?.replace(/[^\d.,]/g, '') || '0';
                price = parseFloat(priceText.replace(',', '.')) || 0;
                break;
            }
        }

        // Try to extract quantity
        const quantitySelectors = [
                '.quantity',
            '.product-quantity',
            'input[type="number"]'
        ];
        
        for (const selector of quantitySelectors) {
            const quantityElement = element.querySelector(selector);
            if (quantityElement) {
                quantity = parseInt(quantityElement.value || quantityElement.textContent) || 1;
                    break;
                }
            }
            
        // Try to extract category
        itemCategory = this.getProductCategoryFromElement(element);

        return {
            item_id: itemId,
            item_name: itemName,
            price: price,
            quantity: quantity,
            item_category: itemCategory
        };
    }

    getProductCategoryFromElement(element) {
            const categorySelectors = [
            '.category',
            '.product-category',
            '.breadcrumb a:not(:first-child)',
            '[data-category]'
        ];

        for (const selector of categorySelectors) {
            const categoryElement = element.querySelector(selector);
            if (categoryElement) {
                return categoryElement.getAttribute('data-category') || 
                       categoryElement.textContent?.trim() || 
                       'Unknown';
            }
        }

        return 'Unknown';
    }

    loadAnalytics() {
        if (window.analytics) {
            this.analyticsLoaded = true;
            return;
        }

        const script = document.createElement('script');
        script.src = 'http://127.0.0.1:3000/analytics.js';
        script.setAttribute('data-disable-purchase-events', 'true');
        script.onload = () => {
            this.analyticsLoaded = true;
        };
        document.head.appendChild(script);
        }
        
    trackEvent(eventName, eventData) {
        if (!RECSYNC_CONFIG.telemetryEnabled) {
            return;
        }
            
            const eventKey = eventName === "purchase" ? 
                `${eventName}_${eventData.transaction_id || eventData.order_id}_${Date.now()}` :
                `${eventName}_${eventData.item_id}_${Date.now()}`;
            
            const recentEvents = Array.from(this.sentEvents).filter(key => {
                const timestamp = parseInt(key.split('_').pop());
            return Date.now() - timestamp < 2000;
            });
            
            const similarEvent = recentEvents.find(key => 
                eventName === "purchase" ? 
                key.startsWith(`${eventName}_${eventData.transaction_id || eventData.order_id}_`) :
                key.startsWith(`${eventName}_${eventData.item_id}_`)
            );
            
            if (similarEvent) {
                return;
            }
            
            this.sentEvents.add(eventKey);
            
            this.sentEvents.forEach(key => {
                const timestamp = parseInt(key.split('_').pop());
                if (Date.now() - timestamp > 10000) {
                    this.sentEvents.delete(key);
                }
            });
            
            let eventPayload;
            
            if (eventName === "purchase") {
                eventPayload = {
                clientId: RECSYNC_CONFIG.clientId,
                    event: eventName,
                event_category: "ecommerce",
                event_label: eventName,
                value: parseFloat(eventData.value) || 0,
                currency: eventData.currency || 'USD',
                items: (eventData.items || []).map(item => ({
                    item_id: item.item_id,
                    item_name: item.item_name,
                    price: parseFloat(item.price) || 0,
                    quantity: parseInt(item.quantity) || 1,
                    item_category: item.item_category
                })),
                    user_id: this.getUserId(),
                session_id: this.getSessionId(),
                timestamp: new Date().toISOString(),
                page_location: window.location.href,
                page_title: document.title,
                    data: {
                    transaction_id: String(eventData.transaction_id) || '0',
                    value: parseFloat(eventData.value) || 0,
                    currency: eventData.currency || 'USD',
                    tax: parseFloat(eventData.tax) || 0,
                    shipping: parseFloat(eventData.shipping) || 0,
                        coupon: eventData.coupon || null,
                    affiliation: eventData.affiliation || 'Unknown Store',
                    payment_type: eventData.payment_type || 'unknown',
                    items: (eventData.items || []).map(item => ({
                        item_id: item.item_id,
                        item_name: item.item_name,
                        price: parseFloat(item.price) || 0,
                        quantity: parseInt(item.quantity) || 1,
                        item_category: item.item_category
                    })),
                    user_type: (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn) ? 'logged_in' : 'anonymous',
                    customer_id: (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn) ? window.RECSYNC_ANALYTICS_CONFIG.customerId : null,
                    user_id_reference: localStorage.getItem('dl_user_id_reference') || null
                    }
                };
            } else {
                eventPayload = {
                    clientId: RECSYNC_CONFIG.clientId,
                    event: eventName,
                    event_category: "ecommerce",
                    event_label: eventName,
                    value: eventData.price * eventData.quantity,
                    currency: eventData.currency,
                    items: [{
                        item_id: eventData.item_id,
                        item_name: eventData.item_name,
                        price: eventData.price,
                        quantity: eventData.quantity,
                        item_category: eventData.item_category
                    }],
                    user_id: this.getUserId(),
                    session_id: this.getSessionId(),
                    timestamp: new Date().toISOString(),
                    page_location: eventData.page_location,
                    page_title: eventData.page_title,
                    data: {
                        item_name: eventData.item_name,
                        item_id: eventData.item_id,
                        price: eventData.price,
                        quantity: eventData.quantity,
                        currency: eventData.currency,
                        user_type: (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn) ? 'logged_in' : 'anonymous',
                        customer_id: (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn) ? window.RECSYNC_ANALYTICS_CONFIG.customerId : null,
                        user_id_reference: localStorage.getItem('dl_user_id_reference') || null
                    }
                };
            }
            
        // Enviar evento a analytics.js si está disponible (EXCEPTO purchase - manejado por PHP hook)
        if (this.analyticsLoaded && window.analytics && eventName !== 'purchase') {
                try {
                    window.analytics.track(eventName, eventPayload);
                } catch (error) {
                // Silently handle errors
                }
            }
            
        // Enviar evento a nuestra API
            this.sendToRecSyncAPI(eventPayload);
        }
        
    sendToRecSyncAPI(eventPayload) {
        if (!RECSYNC_CONFIG.apiUrl || !RECSYNC_CONFIG.apiKey) {
            return;
        }

        fetch(RECSYNC_CONFIG.apiUrl, {
            method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RECSYNC_CONFIG.clientId}:${RECSYNC_CONFIG.apiKey}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify(eventPayload)
        })
        .then(response => response.json())
        .catch(error => {
            // Silently handle errors
            });
        }
        
        getUserId() {
        // Use backend configuration first (more reliable)
        if (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn && window.RECSYNC_ANALYTICS_CONFIG.customerId) {
            localStorage.removeItem('dl_anon_user_id');
            return String(window.RECSYNC_ANALYTICS_CONFIG.customerId);
        }
        
        // Fallback to PrestaShop object
        if (window.prestashop && window.prestashop.customer && window.prestashop.customer.isLoggedIn) {
            const customerId = window.prestashop.customer.id_customer;
                
                if (customerId) {
                    localStorage.removeItem('dl_anon_user_id');
                return String(customerId);
            }
        }
        
        // Generate anonymous ID if not logged in
        let anonId = localStorage.getItem('dl_anon_user_id');
        if (!anonId) {
            anonId = 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('dl_anon_user_id', anonId);
        }
        
        return anonId;
        }
        
        getSessionId() {
        let sessionId = sessionStorage.getItem('dl_session_id');
            if (!sessionId) {
            sessionId = 's_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('dl_session_id', sessionId);
        }
            return sessionId;
        }
    }
    
// Initialize when DOM is ready
    function initRecSyncProductEvents() {
    if (typeof RECSYNC_CONFIG !== 'undefined' && RECSYNC_CONFIG.telemetryEnabled) {
        new RecSyncProductEvents();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecSyncProductEvents);
    } else {
        initRecSyncProductEvents();
    }
