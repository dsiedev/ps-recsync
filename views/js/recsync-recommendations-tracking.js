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
        debugEnabled: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.debugEnabled : true,
        analyticsUrl: "http://127.0.0.1:3000/analytics.js" // URL local del analytics.js
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
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Recommendations tracking disabled");
                }
                return;
            }
            
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupTracking());
            } else {
                this.setupTracking();
            }
        }
        
        setupTracking() {
            // Buscar el widget de recomendaciones
            this.recommendationWidget = document.getElementById('recsync-widget');
            
            if (!this.recommendationWidget) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Recommendation widget not found");
                }
                return;
            }
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Setting up recommendations tracking");
            }
            
            // Cargar analytics.js
            this.loadAnalytics();
            
            // Configurar seguimiento de interacciones
            this.setupInteractionTracking();
            
            // Seguimiento de vistas de productos recomendados
            this.trackRecommendationViews();
        }
        
        async loadAnalytics() {
            try {
                // Verificar si analytics.js ya está cargado
                if (window.analytics) {
                    this.analyticsLoaded = true;
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Analytics.js already loaded");
                    }
                    return;
                }
                
                // Cargar analytics.js dinámicamente
                const script = document.createElement("script");
                script.src = RECSYNC_CONFIG.analyticsUrl;
                script.setAttribute("data-client-id", RECSYNC_CONFIG.clientId);
                script.setAttribute("data-client-secret", RECSYNC_CONFIG.apiKey);
                script.setAttribute("data-debug", RECSYNC_CONFIG.debugEnabled.toString());
                script.async = true;
                
                script.onload = () => {
                    this.analyticsLoaded = true;
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Analytics.js loaded successfully");
                    }
                };
                
                script.onerror = () => {
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.error("RecSync: Failed to load analytics.js from", RECSYNC_CONFIG.analyticsUrl);
                    }
                };
                
                document.head.appendChild(script);
                
            } catch (error) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.error("RecSync: Error loading analytics.js", error);
                }
            }
        }
        
        setupInteractionTracking() {
            // Seguimiento de clicks en productos recomendados
            this.recommendationWidget.addEventListener('click', (event) => {
                this.handleProductClick(event);
            });
            
            // Seguimiento de hover sobre productos recomendados
            this.recommendationWidget.addEventListener('mouseenter', (event) => {
                this.handleProductHover(event);
            }, true);
            
            // Seguimiento de clics en botones "Añadir al carrito" en recomendaciones
            this.recommendationWidget.addEventListener('click', (event) => {
                this.handleAddToCartClick(event);
            });
        }
        
        handleProductClick(event) {
            const productElement = event.target.closest('.recsync-product, .js-product, .product-miniature');
            
            if (!productElement) return;
            
            // VERIFICAR que el producto esté dentro del widget de recomendaciones
            if (!this.recommendationWidget.contains(productElement)) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Product click outside recommendations widget, skipping");
                }
                return;
            }
            
            // VERIFICAR que el producto tenga un ID válido (indicador de que es un producto de recomendaciones)
            const productId = productElement.getAttribute('data-id-product');
            if (!productId || productId === 'null' || productId.trim() === '') {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Product without valid ID, skipping click");
                }
                return;
            }
            
            const productData = this.extractProductData(productElement);
            if (productData) {
                // Marcar como interacción con recomendación
                productData.recommendation_context = true;
                productData.recommendation_widget = 'home_main';
                
                this.trackEvent('recommendation_click', productData);
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Recommendation click tracked", productData);
                }
            } else {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.warn("RecSync: Could not extract product data for click", productElement);
                }
            }
        }
        
        handleProductHover(event) {
            const productElement = event.target.closest('.recsync-product, .js-product, .product-miniature');
            
            if (!productElement) return;
            
            // VERIFICAR que el producto esté dentro del widget de recomendaciones
            if (!this.recommendationWidget.contains(productElement)) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Product hover outside recommendations widget, skipping");
                }
                return;
            }
            
            // VERIFICAR que el producto tenga un ID válido (indicador de que es un producto de recomendaciones)
            const productId = productElement.getAttribute('data-id-product');
            if (!productId || productId === 'null' || productId.trim() === '') {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Product without valid ID, skipping hover");
                }
                return;
            }
            
            // Solo trackear hover una vez por producto por sesión
            
            const hoverKey = `hover_${productId}`;
            
            if (this.sentEvents.has(hoverKey)) return;
            
            const productData = this.extractProductData(productElement);
            if (productData) {
                productData.recommendation_context = true;
                productData.recommendation_widget = 'home_main';
                
                this.trackEvent('view_item', productData);
                this.sentEvents.add(hoverKey);
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Recommendation hover tracked", productData);
                }
            } else {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.warn("RecSync: Could not extract product data for hover", productElement);
                }
            }
        }
        
        handleAddToCartClick(event) {
            // Detectar botones de añadir al carrito SOLO en productos recomendados
            const addToCartButton = event.target.closest('[data-button-action="add-to-cart"], .add-to-cart, .btn-add-to-cart');
            
            if (!addToCartButton) return;
            
            // VERIFICAR que el botón esté dentro del widget de recomendaciones
            const productElement = addToCartButton.closest('.recsync-product, .js-product, .product-miniature');
            if (!productElement) return;
            
            // VERIFICAR que el producto esté dentro del widget de recomendaciones
            if (!this.recommendationWidget.contains(productElement)) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Add to cart button outside recommendations widget, skipping");
                }
                return;
            }
            
            // VERIFICAR que el producto tenga un ID válido (indicador de que es un producto de recomendaciones)
            const productId = productElement.getAttribute('data-id-product');
            if (!productId || productId === 'null' || productId.trim() === '') {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Product without valid ID, skipping add to cart");
                }
                return;
            }
            
            const productData = this.extractProductData(productElement);
            if (productData) {
                productData.recommendation_context = true;
                productData.recommendation_widget = 'home_main';
                productData.action_source = 'recommendations';
                
                this.trackEvent('add_to_cart', productData);
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Recommendation add to cart tracked", productData);
                }
            } else {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.warn("RecSync: Could not extract product data for add to cart", productElement);
                }
            }
        }
        
        trackRecommendationViews() {
            // Seguimiento de vista de la sección de recomendaciones
            const recommendationProducts = this.recommendationWidget.querySelectorAll('.recsync-product, .js-product, .product-miniature');
            
            if (recommendationProducts.length > 0) {
                // Filtrar productos que tienen ID válido y limitar según configuración
                const validProducts = Array.from(recommendationProducts)
                    .filter(product => {
                        const productId = product.getAttribute('data-id-product');
                        return productId && productId !== 'null' && productId.trim() !== '';
                    })
                    .slice(0, 12); // Limitar a máximo 12 productos como en la configuración
                
                const recommendationData = {
                    recommendation_widget: 'home_main',
                    recommendation_count: validProducts.length,
                    recommendation_products: validProducts.map(product => {
                        const productId = product.getAttribute('data-id-product');
                        const productName = product.querySelector('.product-title a, .product-name a, h3 a')?.textContent || 'Producto';
                        const categoryData = this.extractProductCategory(product, productName);
                        return {
                            item_id: productId,
                            item_name: productName,
                            item_category: categoryData.category,
                            item_category_id: categoryData.categoryId
                        };
                    }),
                    page_location: window.location.href,
                    page_title: document.title
                };
                
                this.trackEvent('recommendation_impression', recommendationData);
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Recommendation impression tracked", recommendationData);
                }
            }
        }
        
        extractProductData(productElement) {
            // Extraer datos del producto desde el elemento
            const productId = productElement.getAttribute('data-id-product');
            
            // Verificar que el ID del producto sea válido
            if (!productId || productId === 'null' || productId.trim() === '') {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.warn("RecSync: Product without valid ID found", productElement);
                }
                return null;
            }
            
            const productNameElement = productElement.querySelector('.product-title a, .product-name a, h3 a, .product-title, .product-name');
            const productName = productNameElement ? productNameElement.textContent.trim() : 'Producto sin nombre';
            const productUrl = productNameElement && productNameElement.href ? productNameElement.href : '#';
            
            // Extraer precio con múltiples selectores
            const priceElement = productElement.querySelector('.price, .product-price .price, .current-price .price, .price .current-price, .regular-price');
            let price = 0;
            if (priceElement) {
                const priceText = priceElement.textContent || '0';
                // Extraer solo números y puntos/commas
                const cleanPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
                price = parseFloat(cleanPrice) || 0;
            }
            
            // Si no se encuentra precio, intentar con otros selectores
            if (price === 0) {
                const alternativePriceElement = productElement.querySelector('[class*="price"]');
                if (alternativePriceElement) {
                    const priceText = alternativePriceElement.textContent || '0';
                    const cleanPrice = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
                    price = parseFloat(cleanPrice) || 0;
                }
            }
            
            // Extraer categoría del producto
            const categoryData = this.extractProductCategory(productElement, productName);
            
            // Extraer imagen
            const imageElement = productElement.querySelector('img');
            const imageUrl = imageElement ? imageElement.src : '';
            
            return {
                item_id: productId,
                item_name: productName,
                price: price,
                item_category: categoryData.category,
                item_category_id: categoryData.categoryId,
                quantity: 1,
                currency: 'CLP',
                item_url: productUrl,
                item_image: imageUrl,
                page_location: window.location.href,
                page_title: document.title
            };
        }
        
        extractProductCategory(productElement, productName) {
            // PRIMERO: Intentar extraer desde data attributes (más confiable - viene de PrestaShop)
            const category = productElement.getAttribute('data-category');
            const categoryId = productElement.getAttribute('data-category-id');
            
            if (category && category.trim()) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Found category from data attributes:", category, "categoryId:", categoryId);
                }
                return { category: category.trim(), categoryId: categoryId || null };
            }
            
            // FALLBACK: Intentar extraer categoría e ID desde atributos del producto
            const categorySelectors = [
                { selector: '[data-category]', attr: 'data-category' },
                { selector: '[data-category-id]', attr: 'data-category-id' },
                { selector: '.category', attr: 'textContent' },
                { selector: '.product-category', attr: 'textContent' },
                { selector: '.breadcrumb', attr: 'textContent' },
                { selector: '.category-name', attr: 'textContent' },
                { selector: '.product-category-name', attr: 'textContent' },
                { selector: 'meta[property="product:category"]', attr: 'content' },
                { selector: 'meta[name="category"]', attr: 'content' },
                { selector: '[data-id-category]', attr: 'data-id-category' },
                { selector: '.category-id', attr: 'textContent' }
            ];
            
            for (const { selector, attr } of categorySelectors) {
                const element = productElement.querySelector(selector);
                if (element) {
                    let category = '';
                    let categoryId = '';
                    
                    if (attr === 'textContent' || attr === 'content') {
                        category = element.textContent || element.content || '';
                    } else {
                        category = element.getAttribute(attr) || '';
                    }
                    
                    // Intentar extraer ID de categoría desde el mismo elemento o elementos relacionados
                    categoryId = element.getAttribute('data-category-id') || 
                                element.getAttribute('data-id-category') ||
                                element.getAttribute('data-category-id') ||
                                element.getAttribute('id') ||
                                '';
                    
                    // Si no hay ID en el elemento, buscar en elementos hijos
                    if (!categoryId) {
                        const idElement = element.querySelector('[data-category-id], [data-id-category], .category-id');
                        if (idElement) {
                            categoryId = idElement.getAttribute('data-category-id') ||
                                        idElement.getAttribute('data-id-category') ||
                                        idElement.textContent ||
                                        '';
                        }
                    }
                    
                    if (category && category.trim()) {
                        category = category.trim();
                        categoryId = categoryId ? categoryId.trim() : null;
                        
                        if (RECSYNC_CONFIG.debugEnabled) {
                            console.log("RecSync: Found category with selector:", selector, "category:", category, "categoryId:", categoryId);
                        }
                        return { category, categoryId };
                    }
                }
            }
            
            // Intentar extraer desde el breadcrumb del producto
            const breadcrumbElement = productElement.querySelector('.breadcrumb a, .breadcrumb span');
            if (breadcrumbElement && breadcrumbElement.textContent.trim()) {
                const category = breadcrumbElement.textContent.trim();
                const categoryId = breadcrumbElement.getAttribute('data-category-id') || 
                                 breadcrumbElement.getAttribute('href')?.match(/category\/(\d+)/)?.[1] ||
                                 null;
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Found category from breadcrumb:", category, "categoryId:", categoryId);
                }
                return { category, categoryId };
            }
            
            // Intentar extraer desde el nombre del producto (última palabra como fallback)
            // SOLO si la última palabra no parece ser parte del nombre del producto
            if (productName && productName.trim()) {
                const words = productName.trim().split(' ');
                if (words.length > 2) { // Cambiado de > 1 a > 2 para evitar palabras como "Bad..."
                    const lastWord = words[words.length - 1];
                    // Si la última palabra parece una categoría (no números, no muy larga, no termina en "...")
                    if (lastWord.length > 2 && 
                        lastWord.length < 20 && 
                        !/\d/.test(lastWord) && 
                        !lastWord.endsWith('...') &&
                        !lastWord.includes('Bad') &&
                        !lastWord.includes('Good') &&
                        !lastWord.includes('New')) {
                        if (RECSYNC_CONFIG.debugEnabled) {
                            console.log("RecSync: Using last word as category:", lastWord, "categoryId: null");
                        }
                        return { category: lastWord, categoryId: null };
                    }
                }
            }
            
            // Intentar extraer desde la URL del producto
            const productLink = productElement.querySelector('a[href]');
            if (productLink) {
                const href = productLink.getAttribute('href');
                if (href) {
                    // Extraer categoría de la URL (ej: /category/product-name o /category/123/product-name)
                    // Mejorar regex para evitar capturar "localhost", "http", etc.
                    const urlMatch = href.match(/\/category\/([^\/]+)/) || 
                                   href.match(/\/categoria\/([^\/]+)/) ||
                                   href.match(/\/([^\/]+)\/[^\/]+/) && !href.includes('localhost') && !href.includes('http');
                    const idMatch = href.match(/category\/(\d+)/) || href.match(/categoria\/(\d+)/);
                    
                    if (urlMatch && urlMatch[1] && urlMatch[1].length > 2) {
                        // Filtrar palabras comunes que no son categorías
                        const categoryWord = urlMatch[1];
                        if (!categoryWord.match(/^(localhost|http|www|index|home|inicio|product|producto)$/i)) {
                            const category = categoryWord.replace(/-/g, ' ').replace(/_/g, ' ');
                            const categoryId = idMatch ? idMatch[1] : null;
                            
                            if (RECSYNC_CONFIG.debugEnabled) {
                                console.log("RecSync: Found category from URL:", category, "categoryId:", categoryId);
                            }
                            return { category, categoryId };
                        }
                    }
                }
            }
            
            // Fallback: usar categoría genérica
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: No category found, using fallback: 'Productos', categoryId: null");
            }
            return { category: 'Productos', categoryId: null };
        }
        
        shouldSkipEvent(eventName, eventData) {
            // Para eventos de productos individuales, validar que tengan datos válidos
            if (['view_item', 'recommendation_click', 'add_to_cart'].includes(eventName)) {
                // Verificar que item_id no sea "unknown" o inválido
                if (!eventData.item_id || 
                    eventData.item_id === 'unknown' || 
                    eventData.item_id === 'null' || 
                    eventData.item_id.trim() === '') {
                    return true;
                }
                
                // Verificar que item_name no sea genérico
                if (!eventData.item_name || 
                    eventData.item_name === 'Producto' || 
                    eventData.item_name === 'Producto sin nombre' ||
                    eventData.item_name.trim() === '') {
                    return true;
                }
                
                // Verificar que price sea válido (puede ser 0 pero debe ser numérico)
                if (typeof eventData.price !== 'number' || eventData.price < 0) {
                    return true;
                }
            }
            
            // Para eventos de widget, validar que tengan productos válidos
            if (eventName === 'recommendation_impression') {
                if (!eventData.recommendation_products || 
                    eventData.recommendation_products.length === 0) {
                    return true;
                }
                
                // Verificar que todos los productos tengan IDs válidos
                const invalidProducts = eventData.recommendation_products.filter(product => 
                    !product.item_id || 
                    product.item_id === 'unknown' || 
                    product.item_id === 'null' ||
                    product.item_id.trim() === ''
                );
                
                if (invalidProducts.length > 0) {
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.warn("RecSync: Found invalid products in recommendation_impression:", invalidProducts);
                    }
                    return true;
                }
            }
            
            return false;
        }
        
        trackEvent(eventName, eventData) {
            if (!RECSYNC_CONFIG.telemetryEnabled) return;
            
            // VALIDAR datos del evento antes de enviar
            if (this.shouldSkipEvent(eventName, eventData)) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Event skipped due to invalid data:", eventName, eventData);
                }
                return;
            }
            
            // Crear clave única para evitar duplicados
            const eventKey = `${eventName}_${eventData.item_id || 'widget'}_${Date.now()}`;
            
            // Verificar si ya se envió este evento recientemente
            const recentEvents = Array.from(this.sentEvents).filter(key => {
                const timestamp = parseInt(key.split('_').pop());
                return Date.now() - timestamp < 2000; // 2 segundos
            });
            
            const similarEvent = recentEvents.find(key => 
                key.startsWith(`${eventName}_${eventData.item_id || 'widget'}_`)
            );
            
            if (similarEvent) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Duplicate event prevented:", eventName, eventData);
                }
                return;
            }
            
            this.sentEvents.add(eventKey);
            
            // Preparar payload del evento
            const eventPayload = {
                clientId: RECSYNC_CONFIG.clientId,
                event: eventName,
                event_category: "recommendations",
                event_label: eventName,
                value: eventData.price || 0,
                currency: eventData.currency || 'CLP',
                items: eventData.item_id ? [{
                    item_id: eventData.item_id,
                    item_name: eventData.item_name,
                    price: eventData.price,
                    quantity: eventData.quantity || 1,
                    item_category: eventData.item_category || 'Productos'
                }] : [],
                user_id: this.getUserId(),
                session_id: this.getSessionId(),
                timestamp: new Date().toISOString(),
                page_location: eventData.page_location,
                page_title: eventData.page_title,
                data: {
                    ...eventData,
                    user_type: (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn) ? 'logged_in' : 'anonymous',
                    customer_id: (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn) ? window.RECSYNC_ANALYTICS_CONFIG.customerId : null,
                    user_id_reference: localStorage.getItem('dl_user_id_reference') || null
                }
            };
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Sending recommendation event:", eventName, eventPayload);
            }
            
            // Enviar a analytics.js si está disponible
            if (this.analyticsLoaded && window.analytics) {
                try {
                    window.analytics.track(eventName, eventPayload);
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Event sent to analytics.js", eventName);
                    }
                } catch (error) {
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.error("RecSync: Error sending event to analytics.js", error);
                    }
                }
            }
            
            // También enviar directamente al API de RecSync
            this.sendToRecSyncAPI(eventPayload);
        }
        
        sendToRecSyncAPI(eventData) {
            const baseUrl = RECSYNC_CONFIG.apiUrl;
            const url = baseUrl + "/v1/events/";
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Sending to RecSync API", url, eventData);
            }
            
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + RECSYNC_CONFIG.clientId + ":" + RECSYNC_CONFIG.apiKey
                },
                body: JSON.stringify(eventData)
            }).then(response => {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: API Response status", response.status);
                }
                return response.json();
            }).then(data => {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: API Response data", data);
                }
            }).catch(error => {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.error("RecSync: Error sending to RecSync API", error);
                }
            });
        }
        
        getUserId() {
            // Usar la misma lógica que el archivo principal
            if (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn && window.RECSYNC_ANALYTICS_CONFIG.customerId) {
                return window.RECSYNC_ANALYTICS_CONFIG.customerId.toString();
            }
            
            if (typeof prestashop !== "undefined" && prestashop.customer) {
                let customerId = null;
                if (prestashop.customer.id !== undefined) {
                    customerId = prestashop.customer.id;
                } else if (prestashop.customer.__ob__ && prestashop.customer.__ob__.value) {
                    customerId = prestashop.customer.__ob__.value.id;
                }
                
                if (customerId) {
                    return customerId.toString();
                }
            }
            
            // Fallback: usar localStorage
            const existingId = localStorage.getItem('dl_anon_user_id');
            if (existingId) {
                return existingId;
            }
            
            const newId = crypto.randomUUID();
            localStorage.setItem('dl_anon_user_id', newId);
            return newId;
        }
        
        getSessionId() {
            let sessionId = localStorage.getItem("dl_session_id");
            
            if (!sessionId) {
                const timestamp = Date.now();
                const random = Math.random().toString(36).substr(2, 9);
                sessionId = "s_" + timestamp + "_" + random;
                localStorage.setItem("dl_session_id", sessionId);
            }
            
            return sessionId;
        }
    }
    
    // Inicializar cuando el DOM esté listo
    function initRecSyncRecommendationsTracking() {
        // Solo inicializar si el widget de recomendaciones existe
        const recommendationWidget = document.getElementById('recsync-widget');
        
        if (recommendationWidget && typeof window.RecSyncRecommendationsTracking === "undefined") {
            window.RecSyncRecommendationsTracking = new RecSyncRecommendationsTracking();
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Recommendations tracking initialized");
            }
        }
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRecSyncRecommendationsTracking);
    } else {
        initRecSyncRecommendationsTracking();
    }
    
    // También inicializar cuando se actualiza el contenido dinámicamente
    if (typeof prestashop !== "undefined") {
        prestashop.on("updatedProduct", initRecSyncRecommendationsTracking);
        prestashop.on("updatedCart", initRecSyncRecommendationsTracking);
    }
    
})();
