/**
 * RecSync - Seguimiento de interacciones en productos recomendados
 * Implementa seguimiento específico para la sección "Recomendados para ti"
 */

(function() {
    "use strict";
    
    // Configuración dinámica desde PrestaShop
    const RECSYNC_CONFIG = {
        enabled: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.enabled : true,
        telemetryEnabled: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.telemetryEnabled : true,
        clientId: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.clientId : "",
        apiUrl: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.apiUrl : "https://api.recsync.com",
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
            script.src = '/modules/recsync/views/js/analytics.js';
            script.setAttribute('data-disable-purchase-events', 'true');
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
                    const viewData = {
                        ...productData,
                        recommendation_context: true,
                        recommendation_position: index + 1,
                        page_location: window.location.href,
                        page_title: document.title,
                        currency: 'USD'
                    };
                    
                    this.trackEvent('view_item', viewData);
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
            const productData = this.extractProductData(element);
            if (productData) {
                const clickData = {
                    ...productData,
                    recommendation_context: true,
                    click_type: 'recommendation_click',
                    page_location: window.location.href,
                    page_title: document.title,
                    currency: 'USD'
                };
                
                this.trackEvent('recommendation_click', clickData);
            }
        }
        
        extractProductData(element) {
            const productId = element.getAttribute('data-id-product');
            const productName = element.querySelector('.product-name, h3, h4, a')?.textContent?.trim() || 'Product';
            const productPrice = this.extractPrice(element);
            const productCategory = element.getAttribute('data-category') || 
                                  element.querySelector('[data-category]')?.getAttribute('data-category') || 
                                  'Unknown';
            
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
            if (!RECSYNC_CONFIG.telemetryEnabled) return;
            
            const eventKey = `${eventName}_${eventData.item_id}_${Date.now()}`;
            
            const recentEvents = Array.from(this.sentEvents).filter(key => {
                const timestamp = parseInt(key.split('_').pop());
                return Date.now() - timestamp < 2000;
            });
            
            const similarEvent = recentEvents.find(key => 
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
                    window.analytics.track(eventName, eventPayload);
                } catch (error) {
                    // Silently handle errors
                }
            }
            
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
            if (window.prestashop && window.prestashop.customer && window.prestashop.customer.isLoggedIn) {
                const customerId = window.prestashop.customer.id_customer;
                
                if (customerId) {
                    localStorage.removeItem('dl_anon_user_id');
                    return String(customerId);
                }
            }
            
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
