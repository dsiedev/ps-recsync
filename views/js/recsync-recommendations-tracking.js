/**
 * RecSync - Seguimiento de interacciones en productos recomendados
 * Implementa seguimiento específico para la sección "Recomendados para ti"
 */

(function() {
    "use strict";
    
    // Use global RECSYNC_CONFIG if available, otherwise fallback to basic config
    const RECSYNC_CONFIG = window.RECSYNC_CONFIG || {
        enabled: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.enabled : true,
        telemetryEnabled: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.telemetryEnabled : true,
        clientId: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.clientId : "",
        apiUrl: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.apiUrl + '/v1/events/' : "https://api.recsync.com/v1/events/",
        apiKey: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.apiKey : "",
        analyticsUrl: "http://127.0.0.1:3000/analytics.js"
    };
    
    class RecSyncRecommendationsTracking {
        constructor() {
            this.analyticsLoaded = false;
            this.sentEvents = new Set();
            this.recommendationWidget = null;
            this.init();
        }
        
        async init() {
            if (!RECSYNC_CONFIG.enabled || !RECSYNC_CONFIG.telemetryEnabled) {
                return;
            }
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupTracking());
            } else {
                this.setupTracking();
            }
        }
        
        setupTracking() {
            this.recommendationWidget = document.getElementById('recsync-widget');
            
            if (!this.recommendationWidget) {
                return;
            }
            
            this.loadAnalytics();
            this.trackRecommendationViews();
            this.setupClickTracking();
        }
        
        loadAnalytics() {
            if (window.analytics) {
                this.analyticsLoaded = true;
                return;
            }

            const script = document.createElement('script');
            script.src = RECSYNC_CONFIG.analyticsUrl;
            script.setAttribute('data-disable-purchase-events', 'true');
            script.setAttribute('data-client-id', RECSYNC_CONFIG.clientId);
            script.setAttribute('data-client-secret', RECSYNC_CONFIG.apiKey);
            script.setAttribute('data-api-url', RECSYNC_CONFIG.apiUrl);
            script.onload = () => {
                this.analyticsLoaded = true;
            };
            document.head.appendChild(script);
        }
        
        trackRecommendationViews() {
            const productElements = this.recommendationWidget.querySelectorAll('[data-id-product]');
            
            productElements.forEach((element, index) => {
                const productData = this.extractProductData(element);
                if (productData) {
                    element._recsyncProductData = {
                        ...productData,
                        recommendation_context: true,
                        recommendation_position: index + 1,
                        page_location: window.location.href,
                        page_title: document.title,
                        currency: 'USD'
                    };
                }
            });
        }
        
        setupClickTracking() {
            this.recommendationWidget.addEventListener('click', (event) => {
                const productElement = event.target.closest('[data-id-product]');
                if (productElement) {
                    this.handleProductClick(productElement, event);
                }
            });
        }
        
        handleProductClick(element, event) {
            const productId = element.getAttribute('data-id-product');
            
            console.log('RecSync: Product click detected, productId:', productId);
            
            if (productId) {
                // Get product data from backend instead of HTML extraction
                this.fetchProductDataFromBackend(productId, (productData) => {
                    console.log('RecSync: Product data received from backend:', productData);
                    
                    if (productData) {
                        const viewData = {
                            ...productData,
                            recommendation_context: true,
                            page_location: window.location.href,
                            page_title: document.title,
                            currency: 'USD'
                        };
                        
                        console.log('RecSync: Sending view_item event with data:', viewData);
                        this.trackEvent('view_item', viewData);
                    } else {
                        console.warn('RecSync: No product data received from backend');
                    }
                });
            } else {
                console.warn('RecSync: No product ID found on clicked element');
            }
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
        
        extractProductData(element) {
            const productId = element.getAttribute('data-id-product');
            
            // Extract product name from h3.product-title > a
            const productNameElement = element.querySelector('h3.product-title a, .product-title a, h3 a');
            const productName = productNameElement?.textContent?.trim() || 'Product';
            
            const productPrice = this.extractPrice(element);
            
            // Extract category from data-category attribute
            const productCategory = element.getAttribute('data-category') || 'Unknown';
            
            return {
                item_id: productId,
                item_name: productName,
                price: productPrice,
                quantity: 1,
                item_category: productCategory
            };
        }
        
        extractPrice(element) {
            const priceSelectors = [
                '.price',
                '.product-price',
                '[class*="price"]',
                '.current-price',
                '.regular-price'
            ];
            
            for (const selector of priceSelectors) {
                const priceElement = element.querySelector(selector);
                if (priceElement) {
                    const priceText = priceElement.textContent?.replace(/[^\d.,]/g, '') || '0';
                    return parseFloat(priceText.replace(',', '.')) || 0;
                }
            }
            
            return 0;
        }
        
        trackEvent(eventName, eventData) {
            console.log('RecSync: trackEvent called with:', eventName, eventData);
            
            if (!RECSYNC_CONFIG.telemetryEnabled) {
                console.warn('RecSync: Telemetry disabled, skipping event');
                return;
            }
            
            const eventKey = `${eventName}_${eventData.item_id}_${Date.now()}`;
            
            const recentEvents = Array.from(this.sentEvents).filter(key => {
                const timestamp = parseInt(key.split('_').pop());
                return Date.now() - timestamp < 2000;
            });
            
            const similarEvent = recentEvents.find(key => 
                key.startsWith(`${eventName}_${eventData.item_id}_`)
            );
            
            if (similarEvent) {
                console.log('RecSync: Similar event found recently, skipping');
                return;
            }
            
            this.sentEvents.add(eventKey);
            
            this.sentEvents.forEach(key => {
                const timestamp = parseInt(key.split('_').pop());
                if (Date.now() - timestamp > 10000) {
                    this.sentEvents.delete(key);
                }
            });
            
            const eventPayload = {
                clientId: RECSYNC_CONFIG.clientId,
                event: eventName,
                event_category: "ecommerce",
                event_label: eventName,
                value: eventData.price * eventData.quantity,
                currency: eventData.currency || 'USD',
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
                page_location: eventData.page_location || window.location.href,
                page_title: eventData.page_title || document.title,
                data: {
                    item_name: eventData.item_name,
                    item_id: eventData.item_id,
                    price: eventData.price,
                    quantity: eventData.quantity,
                    currency: eventData.currency || 'USD',
                    recommendation_context: eventData.recommendation_context || false,
                    recommendation_position: eventData.recommendation_position || null,
                    click_type: eventData.click_type || null,
                    user_type: (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn) ? 'logged_in' : 'anonymous',
                    customer_id: (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn) ? window.RECSYNC_ANALYTICS_CONFIG.customerId : null,
                    user_id_reference: localStorage.getItem('dl_user_id_reference') || null
                }
            };
            
            if (this.analyticsLoaded && window.analytics) {
                try {
                    console.log('RecSync: Sending to analytics.js:', eventName, eventPayload);
                    window.analytics.track(eventName, eventPayload);
                } catch (error) {
                    console.error('RecSync: Error sending to analytics.js:', error);
                }
            } else {
                console.log('RecSync: Analytics.js not available, sending directly to API');
            }
            
            console.log('RecSync: Sending to RecSync API:', eventPayload);
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
    
    // Inicializar cuando el DOM esté listo
    function initRecSyncRecommendationsTracking() {
        if (typeof RECSYNC_CONFIG !== 'undefined' && RECSYNC_CONFIG.telemetryEnabled) {
            new RecSyncRecommendationsTracking();
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRecSyncRecommendationsTracking);
    } else {
        initRecSyncRecommendationsTracking();
    }
    
})();
