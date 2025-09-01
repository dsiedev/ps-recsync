/**
 * RecSync - Captura de eventos en vista de producto
 * Implementación específica para botón "Añadir al carrito"
 * Optimizado para: http://localhost/prestashop17811
 */

(function() {
    "use strict";
    
    // Configuración dinámica desde PrestaShop
    const RECSYNC_CONFIG = {
        enabled: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.enabled : true,
        telemetryEnabled: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.telemetryEnabled : true,
        clientId: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.clientId : "4852605350",
        apiUrl: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.apiUrl : "https://api.recsync.com",
        apiKey: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.apiKey : "REC-ITPMEKBN",
        debugEnabled: window.RECSYNC_ANALYTICS_CONFIG ? window.RECSYNC_ANALYTICS_CONFIG.debugEnabled : true,
        analyticsUrl: "http://127.0.0.1:3000/analytics.js"
    };
    
    // Función para esperar a que prestashop esté disponible
    function waitForPrestaShop(callback, maxAttempts = 50) {
        let attempts = 0;
        
        function checkPrestaShop() {
            attempts++;
            
            if (typeof prestashop !== 'undefined' && prestashop.customer !== undefined) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log('RecSync: PrestaShop object found after', attempts, 'attempts');
                    console.log('RecSync: Customer info:', prestashop.customer);
                }
                callback();
                return;
            }
            
            if (attempts >= maxAttempts) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.warn('RecSync: PrestaShop object not found after', maxAttempts, 'attempts, proceeding anyway');
                }
                callback();
                return;
            }
            
            setTimeout(checkPrestaShop, 100);
        }
        
        checkPrestaShop();
    }
    
    // Clase específica para captura de eventos en productos
    class RecSyncProductEvents {
        constructor() {
            this.analyticsLoaded = false;
            this.sentEvents = new Set(); // Para evitar duplicados
            this.init();
        }
        
        async init() {
            if (!RECSYNC_CONFIG.enabled || !RECSYNC_CONFIG.telemetryEnabled) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Product events disabled");
                }
                return;
            }
            
            // Esperar a que prestashop esté disponible antes de inicializar
            waitForPrestaShop(() => {
                this.setupProductEventListeners();
                this.setupPrestaShopProductEvents();
                this.trackPageView();
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Product events initialized with PrestaShop data");
                    console.log("RecSync: Customer ID:", prestashop.customer ? prestashop.customer.id : 'null');
                }
            });
        }
        
        async loadAnalytics() {
            try {
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
                        console.error("RecSync: Failed to load analytics.js");
                    }
                };
                
                document.head.appendChild(script);
                
            } catch (error) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.error("RecSync: Error loading analytics.js", error);
                }
            }
        }
        
        setupProductEventListeners() {
            // Event listener para botones de añadir al carrito
            document.addEventListener("click", (event) => {
                this.handleAddToCartClick(event);
            });
            
            // Event listener para formularios de producto
            document.addEventListener("submit", (event) => {
                this.handleProductFormSubmit(event);
            });
            
            // Event listener para cambios de cantidad
            document.addEventListener("change", (event) => {
                this.handleQuantityChange(event);
            });
            
            // Event listener para cambios de atributos
            document.addEventListener("change", (event) => {
                this.handleAttributeChange(event);
            });
        }
        
        setupPrestaShopProductEvents() {
            // Integración con eventos nativos de PrestaShop
            if (typeof prestashop !== "undefined") {
                // Evento de actualización de carrito
                prestashop.on("updateCart", (event) => {
                    this.handlePrestaShopCartUpdate(event);
                });
                
                // Evento de actualización de producto
                prestashop.on("updatedProduct", (event) => {
                    this.handlePrestaShopProductUpdate(event);
                });
            }
            
            // Event listener para botones de eliminar del carrito
            document.addEventListener("click", (event) => {
                this.handleRemoveFromCartClick(event);
            });
            
            // Event listener para eventos de compra
            this.setupPurchaseEventTracking();
        }
        
        trackPageView() {
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Tracking page view");
            }
            
            // Detectar si estamos en una página de producto
            const isProductPage = this.isProductPage();
            
            if (isProductPage) {
                // Si es una página de producto, extraer información del producto
                const productData = this.extractProductDataFromPage();
                if (productData) {
                    // Agregar información adicional del navegador y página
                    productData.pageInfo = this.getPageInfo();
                    productData.browserInfo = this.getBrowserInfo();
                    productData.navigationInfo = this.getNavigationInfo();
                    
                    // Enviar evento page_view con información del producto
                    this.trackEvent("page_view", productData);
                    
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Page view event tracked with product data", productData);
                    }
                }
            } else {
                // Si no es una página de producto, enviar evento page_view básico
                const pageData = {
                    item_id: "page_view",
                    item_name: document.title,
                    price: 0,
                    quantity: 1,
                    item_category: "Page",
                    currency: this.getCurrency(),
                    page_location: window.location.href,
                    page_title: document.title,
                    pageInfo: this.getPageInfo(),
                    browserInfo: this.getBrowserInfo(),
                    navigationInfo: this.getNavigationInfo()
                };
                
                this.trackEvent("page_view", pageData);
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Page view event tracked (non-product page)", pageData);
                }
            }
        }
        
        isProductPage() {
            // Detectar si estamos en una página de producto
            const productSelectors = [
                'input[name="id_product"]',
                '[data-id-product]',
                '[data-product-id]',
                '.product-details',
                '.product-page',
                '.product-container'
            ];
            
            for (const selector of productSelectors) {
                if (document.querySelector(selector)) {
                    return true;
                }
            }
            
            // También verificar por URL
            const url = window.location.pathname;
            return url.includes('/art/') || url.includes('/product/') || url.includes('/producto/');
        }
        
        getPageInfo() {
            return {
                url: window.location.href,
                title: document.title,
                pathname: window.location.pathname,
                search: window.location.search,
                hash: window.location.hash,
                referrer: document.referrer,
                domain: window.location.hostname,
                protocol: window.location.protocol,
                port: window.location.port,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                colorDepth: window.screen.colorDepth,
                pixelRatio: window.devicePixelRatio || 1,
                language: navigator.language || navigator.userLanguage,
                languages: navigator.languages || [navigator.language],
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timestamp: Date.now(),
                loadTime: this.getPageLoadTime()
            };
        }
        
        getBrowserInfo() {
            const userAgent = navigator.userAgent;
            const browserInfo = {
                userAgent: userAgent,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
                doNotTrack: navigator.doNotTrack,
                hardwareConcurrency: navigator.hardwareConcurrency,
                maxTouchPoints: navigator.maxTouchPoints,
                vendor: navigator.vendor,
                appName: navigator.appName,
                appVersion: navigator.appVersion,
                product: navigator.product,
                productSub: navigator.productSub,
                vendorSub: navigator.vendorSub,
                buildID: navigator.buildID,
                oscpu: navigator.oscpu,
                connection: this.getConnectionInfo(),
                battery: this.getBatteryInfo(),
                memory: this.getMemoryInfo(),
                deviceType: this.getDeviceType(userAgent),
                browser: this.getBrowserDetails(userAgent),
                os: this.getOSDetails(userAgent)
            };
            
            return browserInfo;
        }
        
        getNavigationInfo() {
            return {
                navigationType: performance.getEntriesByType('navigation')[0]?.type || 'unknown',
                navigationStart: performance.getEntriesByType('navigation')[0]?.startTime || 0,
                navigationEnd: performance.getEntriesByType('navigation')[0]?.duration || 0,
                redirectCount: performance.getEntriesByType('navigation')[0]?.redirectCount || 0,
                redirectStart: performance.getEntriesByType('navigation')[0]?.redirectStart || 0,
                redirectEnd: performance.getEntriesByType('navigation')[0]?.redirectEnd || 0,
                fetchStart: performance.getEntriesByType('navigation')[0]?.fetchStart || 0,
                domainLookupStart: performance.getEntriesByType('navigation')[0]?.domainLookupStart || 0,
                domainLookupEnd: performance.getEntriesByType('navigation')[0]?.domainLookupEnd || 0,
                connectStart: performance.getEntriesByType('navigation')[0]?.connectStart || 0,
                connectEnd: performance.getEntriesByType('navigation')[0]?.connectEnd || 0,
                secureConnectionStart: performance.getEntriesByType('navigation')[0]?.secureConnectionStart || 0,
                requestStart: performance.getEntriesByType('navigation')[0]?.requestStart || 0,
                responseStart: performance.getEntriesByType('navigation')[0]?.responseStart || 0,
                responseEnd: performance.getEntriesByType('navigation')[0]?.responseEnd || 0,
                domLoading: performance.getEntriesByType('navigation')[0]?.domLoading || 0,
                domInteractive: performance.getEntriesByType('navigation')[0]?.domInteractive || 0,
                domContentLoadedEventStart: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventStart || 0,
                domContentLoadedEventEnd: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0,
                domComplete: performance.getEntriesByType('navigation')[0]?.domComplete || 0,
                loadEventStart: performance.getEntriesByType('navigation')[0]?.loadEventStart || 0,
                loadEventEnd: performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0,
                unloadEventStart: performance.getEntriesByType('navigation')[0]?.unloadEventStart || 0,
                unloadEventEnd: performance.getEntriesByType('navigation')[0]?.unloadEventEnd || 0,
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint(),
                largestContentfulPaint: this.getLargestContentfulPaint(),
                cumulativeLayoutShift: this.getCumulativeLayoutShift(),
                firstInputDelay: this.getFirstInputDelay()
            };
        }
        
        getPageLoadTime() {
            if (performance.getEntriesByType('navigation')[0]) {
                return performance.getEntriesByType('navigation')[0].loadEventEnd - performance.getEntriesByType('navigation')[0].navigationStart;
            }
            return 0;
        }
        
        getConnectionInfo() {
            if (navigator.connection) {
                return {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData
                };
            }
            return null;
        }
        
        getBatteryInfo() {
            if (navigator.getBattery) {
                navigator.getBattery().then(battery => {
                    return {
                        charging: battery.charging,
                        chargingTime: battery.chargingTime,
                        dischargingTime: battery.dischargingTime,
                        level: battery.level
                    };
                }).catch(() => null);
            }
            return null;
        }
        
        getMemoryInfo() {
            if (performance.memory) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
            }
            return null;
        }
        
        getDeviceType(userAgent) {
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
            const tablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
            
            if (tablet) return 'tablet';
            if (mobile) return 'mobile';
            return 'desktop';
        }
        
        getBrowserDetails(userAgent) {
            let browser = 'unknown';
            let version = 'unknown';
            
            if (userAgent.includes('Chrome')) {
                browser = 'Chrome';
                version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown';
            } else if (userAgent.includes('Firefox')) {
                browser = 'Firefox';
                version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown';
            } else if (userAgent.includes('Safari')) {
                browser = 'Safari';
                version = userAgent.match(/Version\/(\d+)/)?.[1] || 'unknown';
            } else if (userAgent.includes('Edge')) {
                browser = 'Edge';
                version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'unknown';
            } else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) {
                browser = 'Internet Explorer';
                version = userAgent.match(/MSIE (\d+)/)?.[1] || userAgent.match(/rv:(\d+)/)?.[1] || 'unknown';
            }
            
            return { name: browser, version: version };
        }
        
        getOSDetails(userAgent) {
            let os = 'unknown';
            let version = 'unknown';
            
            if (userAgent.includes('Windows')) {
                os = 'Windows';
                if (userAgent.includes('Windows NT 10.0')) version = '10';
                else if (userAgent.includes('Windows NT 6.3')) version = '8.1';
                else if (userAgent.includes('Windows NT 6.2')) version = '8';
                else if (userAgent.includes('Windows NT 6.1')) version = '7';
            } else if (userAgent.includes('Mac OS X')) {
                os = 'macOS';
                version = userAgent.match(/Mac OS X (\d+_\d+)/)?.[1]?.replace('_', '.') || 'unknown';
            } else if (userAgent.includes('Linux')) {
                os = 'Linux';
            } else if (userAgent.includes('Android')) {
                os = 'Android';
                version = userAgent.match(/Android (\d+)/)?.[1] || 'unknown';
            } else if (userAgent.includes('iOS')) {
                os = 'iOS';
                version = userAgent.match(/OS (\d+)/)?.[1] || 'unknown';
            }
            
            return { name: os, version: version };
        }
        
        getFirstPaint() {
            const paintEntries = performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            return firstPaint ? firstPaint.startTime : null;
        }
        
        getFirstContentfulPaint() {
            const paintEntries = performance.getEntriesByType('paint');
            const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return firstContentfulPaint ? firstContentfulPaint.startTime : null;
        }
        
        getLargestContentfulPaint() {
            const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
            const lcp = lcpEntries[lcpEntries.length - 1];
            return lcp ? lcp.startTime : null;
        }
        
        getCumulativeLayoutShift() {
            if (window.cumulativeLayoutShift) {
                return window.cumulativeLayoutShift;
            }
            return null;
        }
        
        getFirstInputDelay() {
            const fidEntries = performance.getEntriesByType('first-input');
            const fid = fidEntries[0];
            return fid ? fid.processingStart - fid.startTime : null;
        }
        
        setupPurchaseEventTracking() {
            // Detectar si estamos en la página de confirmación de pedido
            const isOrderConfirmationPage = window.location.pathname.includes('confirmacion-pedido') || 
                                          window.location.pathname.includes('order-confirmation') ||
                                          window.location.search.includes('id_order=');
            
            if (isOrderConfirmationPage) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Order confirmation page detected, setting up purchase tracking");
                }
                
                // Esperar un poco para que la página se cargue completamente
                setTimeout(() => {
                    this.trackPurchaseEvent();
                }, 1000);
                
                // También intentar después de que el DOM esté completamente cargado
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        setTimeout(() => {
                            this.trackPurchaseEvent();
                        }, 500);
                    });
                }
            }
        }
        
        trackPurchaseEvent() {
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Attempting to track purchase event");
            }
            
            // Extraer información del pedido desde la URL
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('id_order');
            const cartId = urlParams.get('id_cart');
            
            if (!orderId) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: No order ID found in URL");
                }
                return;
            }
            
            // TEMPORAL: Usar datos hardcodeados para probar el API
            const orderData = {
                transaction_id: orderId.toString(),
                value: 15000, // Valor temporal para prueba
                currency: 'CLP',
                tax: 2850,    // IVA temporal para prueba
                shipping: 2000, // Envío temporal para prueba
                coupon: null,
                affiliation: 'PrestaShop Store',
                payment_type: 'online',
                items: [
                    {
                        item_name: 'The adventure begins Framed poster',
                        item_id: '4',
                        price: 15000,
                        quantity: 1,
                        item_category: 'Productos'
                    }
                ]
            };
            
            this.trackEvent("purchase", orderData);
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Purchase event tracked (temporary data)", orderData);
            }
        }
        
        extractOrderDataFromPage() {
            // Extraer datos del pedido desde la página de confirmación
            const orderData = {
                transaction_id: this.getOrderId(),
                value: this.getOrderTotal(),
                tax: this.getOrderTax(),
                shipping: this.getOrderShipping(),
                currency: this.getCurrency(),
                items: this.getOrderItems(),
                page_location: window.location.href,
                page_title: document.title
            };
            
            return orderData;
        }
        
        getOrderId() {
            // Extraer ID del pedido desde la URL
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('id_order');
            
            if (orderId) {
                return orderId;
            }
            
            // Intentar extraer desde elementos de la página
            const orderIdSelectors = [
                '[data-order-id]',
                '.order-id',
                '.order-number',
                '#order-id',
                '#order-number'
            ];
            
            for (const selector of orderIdSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const value = element.textContent || element.getAttribute('data-order-id') || "";
                    if (value && value.trim()) {
                        return value.trim();
                    }
                }
            }
            
            return "unknown";
        }
        
        getOrderTotal() {
            // Buscar total del pedido
            const totalSelectors = [
                '.order-total',
                '.total-amount',
                '.order-summary .total',
                '.cart-summary .total',
                '[data-total]',
                '.amount-total',
                '.order-amount'
            ];
            
            for (const selector of totalSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const totalText = element.textContent || element.getAttribute('data-total') || "0";
                    const total = parseFloat(totalText.replace(/[^\d.,]/g, "").replace(",", "."));
                    if (total > 0) {
                        return total;
                    }
                }
            }
            
            return 0;
        }
        
        getOrderTax() {
            // Buscar impuestos del pedido
            const taxSelectors = [
                '.order-tax',
                '.tax-amount',
                '.order-summary .tax',
                '.cart-summary .tax',
                '[data-tax]',
                '.amount-tax'
            ];
            
            for (const selector of taxSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const taxText = element.textContent || element.getAttribute('data-tax') || "0";
                    const tax = parseFloat(taxText.replace(/[^\d.,]/g, "").replace(",", "."));
                    if (tax > 0) {
                        return tax;
                    }
                }
            }
            
            return 0;
        }
        
        getOrderShipping() {
            // Buscar costo de envío del pedido
            const shippingSelectors = [
                '.order-shipping',
                '.shipping-amount',
                '.order-summary .shipping',
                '.cart-summary .shipping',
                '[data-shipping]',
                '.amount-shipping'
            ];
            
            for (const selector of shippingSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const shippingText = element.textContent || element.getAttribute('data-shipping') || "0";
                    const shipping = parseFloat(shippingText.replace(/[^\d.,]/g, "").replace(",", "."));
                    if (shipping > 0) {
                        return shipping;
                    }
                }
            }
            
            return 0;
        }
        
        getOrderItems() {
            // Buscar items del pedido
            const items = [];
            
            // Buscar elementos de productos en la página de confirmación
            const productSelectors = [
                '.order-item',
                '.product-item',
                '.order-line',
                '.product-line',
                '.order-detail-item',
                '.product-detail-item'
            ];
            
            for (const selector of productSelectors) {
                const productElements = document.querySelectorAll(selector);
                
                productElements.forEach((productElement) => {
                    const item = {
                        item_id: this.getProductIdFromElement(productElement),
                        item_name: this.getProductNameFromElement(productElement),
                        price: this.getProductPriceFromElement(productElement),
                        quantity: this.getProductQuantityFromElement(productElement),
                        item_category: "Productos"
                    };
                    
                    if (item.item_id && item.item_id !== "unknown") {
                        items.push(item);
                    }
                });
            }
            
            // Si no encontramos items específicos, crear uno genérico basado en el total
            if (items.length === 0) {
                const total = this.getOrderTotal();
                if (total > 0) {
                    items.push({
                        item_id: this.getOrderId(),
                        item_name: "Pedido completado",
                        price: total,
                        quantity: 1,
                        item_category: "Productos"
                    });
                }
            }
            
            return items;
        }
        
        getProductIdFromElement(element) {
            // Buscar ID del producto en el elemento
            const selectors = [
                '[data-id-product]',
                '[data-product-id]',
                '.product-id',
                '.item-id'
            ];
            
            for (const selector of selectors) {
                const foundElement = element.querySelector(selector);
                if (foundElement) {
                    const value = foundElement.getAttribute('data-id-product') || 
                                 foundElement.getAttribute('data-product-id') ||
                                 foundElement.textContent;
                    if (value && value.trim()) {
                        return value.trim();
                    }
                }
            }
            
            return "unknown";
        }
        
        getProductNameFromElement(element) {
            // Buscar nombre del producto en el elemento
            const selectors = [
                '.product-name',
                '.item-name',
                '.product-title',
                '.item-title',
                '.name',
                '.title'
            ];
            
            for (const selector of selectors) {
                const foundElement = element.querySelector(selector);
                if (foundElement) {
                    const name = foundElement.textContent || foundElement.title || "";
                    if (name && name.trim()) {
                        return name.trim();
                    }
                }
            }
            
            return "Producto";
        }
        
        getProductPriceFromElement(element) {
            // Buscar precio del producto en el elemento
            const selectors = [
                '.product-price',
                '.item-price',
                '.price',
                '[data-price]'
            ];
            
            for (const selector of selectors) {
                const foundElement = element.querySelector(selector);
                if (foundElement) {
                    const priceText = foundElement.textContent || foundElement.getAttribute('data-price') || "0";
                    const price = parseFloat(priceText.replace(/[^\d.,]/g, "").replace(",", "."));
                    if (price > 0) {
                        return price;
                    }
                }
            }
            
            return 0;
        }
        
        getProductQuantityFromElement(element) {
            // Buscar cantidad del producto en el elemento
            const selectors = [
                '.product-quantity',
                '.item-quantity',
                '.quantity',
                '[data-quantity]'
            ];
            
            for (const selector of selectors) {
                const foundElement = element.querySelector(selector);
                if (foundElement) {
                    const quantity = parseInt(foundElement.textContent || foundElement.getAttribute('data-quantity')) || 1;
                    if (quantity > 0) {
                        return quantity;
                    }
                }
            }
            
            return 1;
        }
        
        handleAddToCartClick(event) {
            // Detectar botones de añadir al carrito con múltiples selectores
            const addToCartSelectors = [
                "[data-button-action=\"add-to-cart\"]",
                ".add-to-cart",
                ".btn-add-to-cart",
                ".add_to_cart",
                ".btn-addtocart",
                "button[type=\"submit\"][form*=\"add_to_cart\"]",
                "input[type=\"submit\"][form*=\"add_to_cart\"]",
                "button[onclick*=\"add\"]",
                "button[onclick*=\"cart\"]",
                "input[value*=\"Add\"]",
                "input[value*=\"Agregar\"]",
                "input[value*=\"Comprar\"]",
                "input[value*=\"Añadir\"]"
            ];
            
            let addToCartButton = null;
            for (const selector of addToCartSelectors) {
                addToCartButton = event.target.closest(selector);
                if (addToCartButton) break;
            }
            
            // También buscar por texto del botón
            if (!addToCartButton) {
                const buttonText = (event.target.textContent || event.target.value || "").toLowerCase();
                if (buttonText.includes("add") || 
                    buttonText.includes("carrito") || 
                    buttonText.includes("comprar") || 
                    buttonText.includes("agregar") ||
                    buttonText.includes("añadir")) {
                    addToCartButton = event.target;
                }
            }
            
            if (addToCartButton) {
                const productData = this.extractProductDataFromPage();
                if (productData) {
                    this.trackEvent("add_to_cart", productData);
                    
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Add to cart event captured", productData);
                    }
                }
            }
        }
        
        handleProductFormSubmit(event) {
            const form = event.target.closest("form");
            if (form) {
                const formAction = form.getAttribute("action") || "";
                const formClass = form.className || "";
                
                // Detectar formularios de producto
                if (formAction.includes("cart") || 
                    formAction.includes("add") || 
                    formClass.includes("add-to-cart") ||
                    form.querySelector("[data-button-action=\"add-to-cart\"]")) {
                    
                    const productData = this.extractProductDataFromPage();
                    if (productData) {
                        this.trackEvent("add_to_cart", productData);
                    }
                }
            }
        }
        
        handleQuantityChange(event) {
            const quantityInput = event.target.closest("input[name=\"qty\"], input[name=\"quantity\"], .qty-input");
            if (quantityInput) {
                const productData = this.extractProductDataFromPage();
                if (productData) {
                    productData.quantity = parseInt(quantityInput.value) || 1;
                    this.trackEvent("quantity_change", productData);
                }
            }
        }
        
        handleAttributeChange(event) {
            const attributeSelect = event.target.closest("select[name*=\"attribute\"], select[name*=\"group\"]");
            if (attributeSelect) {
                const productData = this.extractProductDataFromPage();
                if (productData) {
                    productData.attribute_changed = attributeSelect.name;
                    productData.attribute_value = attributeSelect.value;
                    this.trackEvent("attribute_change", productData);
                }
            }
        }
        
                handlePrestaShopCartUpdate(event) {
            if (event && event.reason) {
                if (event.reason.linkAction === "add-to-cart") {
                    const productData = this.extractProductDataFromPage();
                    if (productData) {
                        this.trackEvent("add_to_cart", productData);
                    }
                } else if (event.reason.linkAction === "remove-from-cart" || 
                           event.reason.linkAction === "delete-from-cart") {
                    // Para eventos de eliminación, solo procesar si no fue capturado por el click
                    // Esto evita duplicación de eventos
                    if (event.reason.idProduct) {
                        // Verificar si ya se procesó este evento recientemente
                        const eventKey = `remove_from_cart_${event.reason.idProduct}_${Date.now()}`;
                        const recentEvents = Array.from(this.sentEvents).filter(key => {
                            const timestamp = parseInt(key.split('_').pop());
                            return Date.now() - timestamp < 3000; // 3 segundos
                        });
                        
                        const similarEvent = recentEvents.find(key => 
                            key.startsWith(`remove_from_cart_${event.reason.idProduct}_`)
                        );
                        
                        if (!similarEvent) {
                            const productData = {
                                item_id: event.reason.idProduct.toString(),
                                item_name: event.reason.productName || "Producto",
                                price: event.reason.productPrice || 0,
                                item_category: "Productos",
                                quantity: event.reason.productQuantity || 1,
                                currency: this.getCurrency(),
                                page_location: window.location.href,
                                page_title: document.title
                            };
                            this.trackEvent("remove_from_cart", productData);
                            
                            if (RECSYNC_CONFIG.debugEnabled) {
                                console.log("RecSync: Remove from cart event from PrestaShop update", productData);
                            }
                        } else {
                            if (RECSYNC_CONFIG.debugEnabled) {
                                console.log("RecSync: Skipping duplicate remove_from_cart event from PrestaShop update");
                            }
                        }
                    }
                }
            }
        }
        
        handlePrestaShopProductUpdate(event) {
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Product updated", event);
            }
        }
        
        handleRemoveFromCartClick(event) {
            // Detectar botones de eliminar del carrito con múltiples selectores
            const removeFromCartSelectors = [
                "[data-button-action=\"remove-from-cart\"]",
                ".remove-from-cart",
                ".btn-remove-from-cart",
                ".remove_from_cart",
                ".btn-remove",
                ".remove",
                ".delete",
                ".trash",
                ".garbage",
                "button[onclick*=\"remove\"]",
                "button[onclick*=\"delete\"]",
                "a[href*=\"remove\"]",
                "a[href*=\"delete\"]",
                "[data-action=\"remove\"]",
                "[data-action=\"delete\"]",
                ".cart-item-remove",
                ".cart-item-delete",
                ".product-remove",
                ".product-delete",
                ".cart-line-remove",
                ".product-line-remove"
            ];
            
            let removeButton = null;
            for (const selector of removeFromCartSelectors) {
                removeButton = event.target.closest(selector);
                if (removeButton) break;
            }
            
            // También buscar por texto del botón
            if (!removeButton) {
                const buttonText = (event.target.textContent || event.target.value || "").toLowerCase();
                if (buttonText.includes("remove") || 
                    buttonText.includes("eliminar") || 
                    buttonText.includes("delete") || 
                    buttonText.includes("borrar") ||
                    buttonText.includes("quitar") ||
                    buttonText.includes("×") ||
                    buttonText.includes("x")) {
                    removeButton = event.target;
                }
            }
            
            // Buscar por iconos comunes
            if (!removeButton) {
                const iconSelectors = [
                    "i.fa-trash",
                    "i.fa-times",
                    "i.fa-close",
                    "i.fa-remove",
                    "i.fa-delete",
                    ".icon-trash",
                    ".icon-times",
                    ".icon-close",
                    ".icon-remove",
                    ".icon-delete",
                    "i.fa-trash-o",
                    "i.fa-times-circle",
                    "i.fa-close-circle"
                ];
                
                for (const selector of iconSelectors) {
                    removeButton = event.target.closest(selector);
                    if (removeButton) break;
                }
            }
            
            if (removeButton) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Remove button detected:", removeButton);
                }
                
                const productData = this.extractProductDataFromCartItem(removeButton);
                if (productData) {
                    this.trackEvent("remove_from_cart", productData);
                    
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Remove from cart event captured", productData);
                    }
                } else {
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Could not extract product data from cart item");
                    }
                }
            }
        }
        
        extractProductDataFromPage() {
            // Extraer datos del producto desde la página actual
            const productData = {
                item_id: this.getProductId(),
                item_name: this.getProductName(),
                price: this.getProductPrice(),
                item_category: this.getProductCategory(),
                quantity: this.getProductQuantity(),
                currency: this.getCurrency(),
                page_location: window.location.href,
                page_title: document.title
            };
            
            return productData;
        }
        
        extractProductDataFromCartItem(removeButton) {
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Extracting product data from cart item, remove button:", removeButton);
            }
            
            // Buscar el contenedor del item del carrito con más selectores
            const cartItemSelectors = [
                '.cart-item',
                '.cart-line', 
                '.product-line',
                '.item',
                '.cart-line-item',
                '.cart-item-row',
                '.cart-item-container',
                '.product-line-item',
                '[data-id-product]',
                '[data-product-id]',
                '.cart-line-row',
                '.cart-item-line',
                '.product-line-row'
            ];
            
            let cartItem = null;
            for (const selector of cartItemSelectors) {
                cartItem = removeButton.closest(selector);
                if (cartItem) {
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Found cart item with selector:", selector, cartItem);
                    }
                    break;
                }
            }
            
            // Si no encontramos el contenedor, buscar en el padre del botón
            if (!cartItem) {
                cartItem = removeButton.parentElement;
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Using parent element as cart item:", cartItem);
                }
            }
            
            if (!cartItem) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Cart item container not found");
                }
                return null;
            }
            
            // Extraer datos del producto desde el item del carrito
            const productData = {
                item_id: this.getProductIdFromCartItem(cartItem),
                item_name: this.getProductNameFromCartItem(cartItem),
                price: this.getProductPriceFromCartItem(cartItem),
                item_category: this.getProductCategoryFromCartItem(cartItem),
                quantity: this.getProductQuantityFromCartItem(cartItem),
                currency: this.getCurrency(),
                page_location: window.location.href,
                page_title: document.title
            };
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Extracted product data from cart item:", productData);
            }
            
            return productData;
        }
        
        getProductId() {
            // Buscar ID del producto en múltiples ubicaciones
            const selectors = [
                "input[name=\"id_product\"]",
                "[data-id-product]",
                "[data-product-id]",
                "meta[property=\"product:price:amount\"]",
                "meta[name=\"product_id\"]"
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const value = element.value || element.getAttribute("data-id-product") || element.getAttribute("data-product-id") || element.content;
                    if (value) {
                        return value.toString();
                    }
                }
            }
            
            // Extraer de URL específica de localhost
            const urlMatch = window.location.pathname.match(/\/inicio\/(\d+)-/);
            if (urlMatch) {
                return urlMatch[1];
            }
            
            // Extraer de URL genérica
            const genericUrlMatch = window.location.pathname.match(/\/product\/(\d+)/);
            if (genericUrlMatch) {
                return genericUrlMatch[1];
            }
            
            return "unknown";
        }
        
        getProductName() {
            // Buscar nombre del producto
            const selectors = [
                "h1.product-name",
                "h1.product-title",
                ".product-name h1",
                ".product-title h1",
                "h1",
                "meta[property=\"og:title\"]",
                "meta[name=\"product_name\"]"
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const name = element.textContent || element.content || "";
                    if (name && name.trim()) {
                        return name.trim();
                    }
                }
            }
            
            return "Producto";
        }
        
        getProductPrice() {
            // Buscar precio del producto
            const selectors = [
                ".product-price .price",
                ".current-price .price",
                ".price .price",
                "[data-price]",
                "meta[property=\"product:price:amount\"]",
                "meta[name=\"product_price\"]"
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const priceText = element.textContent || element.dataset.price || element.content || "0";
                    const price = parseFloat(priceText.replace(/[^\d.,]/g, "").replace(",", "."));
                    if (price > 0) {
                        return price;
                    }
                }
            }
            
            return 0;
        }
        
        getProductCategory() {
            // Buscar categoría del producto
            const selectors = [
                ".category-name",
                ".product-category",
                "meta[name=\"product_category\"]",
                "nav .breadcrumb a"
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    const category = element.textContent || element.content || "";
                    if (category && category.trim()) {
                        return category.trim();
                    }
                }
            }
            
            return "Productos";
        }
        
        getProductQuantity() {
            // Buscar cantidad seleccionada
            const quantityInput = document.querySelector("input[name=\"qty\"], input[name=\"quantity\"], .qty-input");
            if (quantityInput) {
                return parseInt(quantityInput.value) || 1;
            }
            return 1;
        }
        
        getCurrency() {
            // Buscar moneda
            const currencyElement = document.querySelector(".currency, [data-currency]");
            if (currencyElement) {
                return currencyElement.textContent || currencyElement.dataset.currency || "CLP";
            }
            return "CLP";
        }
        
        getProductIdFromCartItem(cartItem) {
            // Buscar ID del producto en el item del carrito
            const selectors = [
                "[data-id-product]",
                "[data-product-id]",
                "input[name=\"id_product\"]",
                ".product-id",
                ".item-id",
                "[data-product-id]",
                "[data-id]",
                ".product-id",
                ".cart-item-id",
                ".item-id"
            ];
            
            for (const selector of selectors) {
                const element = cartItem.querySelector(selector);
                if (element) {
                    const value = element.getAttribute("data-id-product") || 
                                 element.getAttribute("data-product-id") || 
                                 element.getAttribute("data-id") ||
                                 element.value ||
                                 element.textContent;
                    if (value && value.trim()) {
                        if (RECSYNC_CONFIG.debugEnabled) {
                            console.log("RecSync: Found product ID with selector:", selector, "value:", value);
                        }
                        return value.trim();
                    }
                }
            }
            
            // Intentar extraer de la URL o del contexto
            const urlMatch = window.location.search.match(/[?&]id_product=(\d+)/);
            if (urlMatch) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Found product ID from URL:", urlMatch[1]);
                }
                return urlMatch[1];
            }
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Product ID not found, using unknown");
            }
            return "unknown";
        }
        
        getProductNameFromCartItem(cartItem) {
            // Buscar nombre del producto en el item del carrito
            const selectors = [
                ".product-name",
                ".item-name",
                ".cart-item-name",
                ".product-title",
                ".item-title",
                ".cart-item-title",
                ".product-line-name",
                ".cart-line-name",
                ".cart-item-name a",
                ".product-name a",
                ".item-name a",
                "a.product-name",
                "a.item-name",
                "h3",
                "h4",
                "h5",
                ".name",
                ".title",
                ".product-line-name a",
                ".cart-line-name a",
                "a.product-line-name",
                "a.cart-line-name"
            ];
            
            for (const selector of selectors) {
                const element = cartItem.querySelector(selector);
                if (element) {
                    const name = element.textContent || element.title || "";
                    if (name && name.trim()) {
                        if (RECSYNC_CONFIG.debugEnabled) {
                            console.log("RecSync: Found product name with selector:", selector, "value:", name.trim());
                        }
                        return name.trim();
                    }
                }
            }
            
            // Si no encontramos el nombre, intentar extraer del enlace del producto
            // Excluir el botón de eliminar para evitar obtener "delete" como nombre
            const productLink = cartItem.querySelector("a[href*='product']:not(.remove-from-cart):not([data-link-action='delete-from-cart']), a[href*='inicio']:not(.remove-from-cart):not([data-link-action='delete-from-cart'])");
            if (productLink) {
                const linkText = productLink.textContent || productLink.title || "";
                if (linkText && linkText.trim()) {
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Found product name from link:", linkText.trim());
                    }
                    return linkText.trim();
                }
            }
            
            // Intentar extraer del atributo data del botón de eliminar
            const removeButton = cartItem.querySelector(".remove-from-cart, [data-link-action='delete-from-cart']");
            if (removeButton) {
                const productId = removeButton.getAttribute("data-id-product");
                if (productId) {
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Using product ID as fallback for name:", productId);
                    }
                    return productId;
                }
            }
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Product name not found, using default");
            }
            return "Producto";
        }
        
        getProductPriceFromCartItem(cartItem) {
            // Buscar precio del producto en el item del carrito
            const selectors = [
                ".product-price",
                ".item-price",
                ".cart-item-price",
                ".price",
                "[data-price]",
                ".current-price",
                ".unit-price",
                ".cart-line-price",
                ".product-line-price",
                ".cart-item-price .price",
                ".item-price .price",
                ".product-price .price",
                ".price .price",
                ".cart-line-price .price",
                ".product-line-price .price"
            ];
            
            for (const selector of selectors) {
                const element = cartItem.querySelector(selector);
                if (element) {
                    const priceText = element.textContent || element.dataset.price || element.getAttribute('data-price') || "0";
                    const price = parseFloat(priceText.replace(/[^\d.,]/g, "").replace(",", "."));
                    if (price > 0) {
                        if (RECSYNC_CONFIG.debugEnabled) {
                            console.log("RecSync: Found product price with selector:", selector, "value:", price);
                        }
                        return price;
                    }
                }
            }
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Product price not found, using 0");
            }
            return 0;
        }
        
        getProductCategoryFromCartItem(cartItem) {
            // Buscar categoría del producto en el item del carrito
            const selectors = [
                ".product-category",
                ".item-category",
                ".cart-item-category",
                ".category",
                "[data-category]"
            ];
            
            for (const selector of selectors) {
                const element = cartItem.querySelector(selector);
                if (element) {
                    const category = element.textContent || element.dataset.category || "";
                    if (category && category.trim()) {
                        return category.trim();
                    }
                }
            }
            
            return "Productos";
        }
        
        getProductQuantityFromCartItem(cartItem) {
            // Buscar cantidad del producto en el item del carrito
            const selectors = [
                "input[name=\"qty\"]",
                "input[name=\"quantity\"]",
                ".product-quantity",
                ".item-quantity",
                ".cart-item-quantity",
                ".quantity",
                "[data-quantity]"
            ];
            
            for (const selector of selectors) {
                const element = cartItem.querySelector(selector);
                if (element) {
                    const quantity = parseInt(element.value || element.dataset.quantity || element.textContent) || 1;
                    if (quantity > 0) {
                        return quantity;
                    }
                }
            }
            
            return 1;
        }
        
        trackEvent(eventName, eventData) {
            if (!RECSYNC_CONFIG.telemetryEnabled) return;
            
            // Crear una clave única para este evento
            const eventKey = eventName === "purchase" ? 
                `${eventName}_${eventData.transaction_id || eventData.order_id}_${Date.now()}` :
                `${eventName}_${eventData.item_id}_${Date.now()}`;
            
            // Verificar si ya se envió este evento recientemente (últimos 2 segundos)
            const recentEvents = Array.from(this.sentEvents).filter(key => {
                const timestamp = parseInt(key.split('_').pop());
                return Date.now() - timestamp < 2000; // 2 segundos
            });
            
            // Si ya se envió un evento similar recientemente, no enviar
            const similarEvent = recentEvents.find(key => 
                eventName === "purchase" ? 
                key.startsWith(`${eventName}_${eventData.transaction_id || eventData.order_id}_`) :
                key.startsWith(`${eventName}_${eventData.item_id}_`)
            );
            
            if (similarEvent) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Duplicate event prevented:", eventName, eventData);
                }
                return;
            }
            
            // Agregar a la lista de eventos enviados
            this.sentEvents.add(eventKey);
            
            // Limpiar eventos antiguos (más de 10 segundos)
            this.sentEvents.forEach(key => {
                const timestamp = parseInt(key.split('_').pop());
                if (Date.now() - timestamp > 10000) {
                    this.sentEvents.delete(key);
                }
            });
            
            // Preparar datos del evento según el tipo
            let eventPayload;
            
            if (eventName === "purchase") {
                // Estructura específica para eventos de compra - API completo
                eventPayload = {
                    event: eventName,
                    user_id: this.getUserId(),
                    data: {
                        transaction_id: eventData.transaction_id,
                        value: eventData.value || 0,
                        currency: eventData.currency || 'CLP',
                        tax: eventData.tax || 0,
                        shipping: eventData.shipping || 0,
                        coupon: eventData.coupon || null,
                        affiliation: eventData.affiliation || 'PrestaShop Store',
                        payment_type: eventData.payment_type || 'online',
                        items: eventData.items || []
                    }
                };
            } else {
                // Estructura para otros eventos (add_to_cart, remove_from_cart, etc.)
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
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Sending event:", eventName, eventPayload);
            }
            
            // Enviar evento a analytics.js si está disponible
            if (this.analyticsLoaded && window.analytics) {
                try {
                    window.analytics.track(eventName, eventPayload);
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log("RecSync: Event sent to analytics.js", eventName, eventPayload);
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
            // Usar la URL base configurada en el módulo + endpoint de eventos
            const baseUrl = RECSYNC_CONFIG.apiUrl;
            const url = baseUrl + "/v1/events/";
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Sending to API", url, eventData);
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
                    console.error("RecSync: Error sending to API", error);
                }
            });
        }
        
        getUserId() {
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log('RecSync: getUserId() called');
                console.log('RecSync: prestashop object:', typeof prestashop !== 'undefined' ? prestashop : 'undefined');
                console.log('RecSync: prestashop.customer:', typeof prestashop !== 'undefined' ? prestashop.customer : 'undefined');
                console.log('RecSync: Backend customer ID:', window.RECSYNC_ANALYTICS_CONFIG.customerId);
                console.log('RecSync: Backend is logged in:', window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn);
            }
            
            // 1. Check if user is logged in using backend data (HIGHEST PRIORITY)
            if (window.RECSYNC_ANALYTICS_CONFIG && window.RECSYNC_ANALYTICS_CONFIG.isLoggedIn && window.RECSYNC_ANALYTICS_CONFIG.customerId) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log('RecSync: User is logged in (backend), using customer ID:', window.RECSYNC_ANALYTICS_CONFIG.customerId);
                }
                // User is logged in - use backend customer ID
                const loggedInId = window.RECSYNC_ANALYTICS_CONFIG.customerId.toString();
                
                // Check if there was a previous anonymous ID and store it as reference
                const previousAnonymousId = localStorage.getItem('dl_anon_user_id');
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log('RecSync: Previous anonymous ID found:', previousAnonymousId);
                }
                
                if (previousAnonymousId && previousAnonymousId !== loggedInId) {
                    // Store the previous anonymous ID as reference for conversion tracking
                    localStorage.setItem('dl_user_id_reference', previousAnonymousId);
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log('RecSync: User conversion detected and stored:', previousAnonymousId, '->', loggedInId);
                        console.log('RecSync: user_id_reference set to:', previousAnonymousId);
                    }
                }
                
                // Clear the anonymous ID since user is now logged in
                localStorage.removeItem('dl_anon_user_id');
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log('RecSync: Cleared dl_anon_user_id from localStorage');
                }
                
                return loggedInId;
            }
            
            // 2. Check if user is logged in to PrestaShop (FALLBACK)
            if (typeof prestashop !== "undefined" && prestashop.customer) {
                // Handle Vue.js reactive objects - try to access the actual value
                let customerId = null;
                
                // Method 1: Direct access
                if (prestashop.customer.id !== undefined) {
                    customerId = prestashop.customer.id;
                }
                // Method 2: Try to access through Vue.js reactive object
                else if (prestashop.customer.__ob__ && prestashop.customer.__ob__.value) {
                    customerId = prestashop.customer.__ob__.value.id;
                }
                // Method 3: Try to access through getter if it exists
                else if (typeof prestashop.customer.id === 'function') {
                    customerId = prestashop.customer.id();
                }
                // Method 4: Try to access through Object.getOwnPropertyDescriptor
                else {
                    const descriptor = Object.getOwnPropertyDescriptor(prestashop.customer, 'id');
                    if (descriptor && descriptor.get) {
                        customerId = descriptor.get.call(prestashop.customer);
                    }
                }
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log('RecSync: Customer ID found (frontend):', customerId);
                    console.log('RecSync: Customer object structure:', {
                        hasId: prestashop.customer.id !== undefined,
                        hasOb: prestashop.customer.__ob__ !== undefined,
                        idType: typeof prestashop.customer.id,
                        isFunction: typeof prestashop.customer.id === 'function'
                    });
                }
                
                if (customerId) {
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log('RecSync: User is logged in (frontend), using customer ID:', customerId);
                    }
                    // User is logged in - use PrestaShop customer ID without prefix
                    const loggedInId = customerId.toString();
                    
                    // Check if there was a previous anonymous ID and store it as reference
                    const previousAnonymousId = localStorage.getItem('dl_anon_user_id');
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log('RecSync: Previous anonymous ID found:', previousAnonymousId);
                    }
                    
                    if (previousAnonymousId && previousAnonymousId !== loggedInId) {
                        // Store the previous anonymous ID as reference for conversion tracking
                        localStorage.setItem('dl_user_id_reference', previousAnonymousId);
                        if (RECSYNC_CONFIG.debugEnabled) {
                            console.log('RecSync: User conversion detected and stored:', previousAnonymousId, '->', loggedInId);
                            console.log('RecSync: user_id_reference set to:', previousAnonymousId);
                        }
                    }
                    
                    // Clear the anonymous ID since user is now logged in
                    localStorage.removeItem('dl_anon_user_id');
                    if (RECSYNC_CONFIG.debugEnabled) {
                        console.log('RecSync: Cleared dl_anon_user_id from localStorage');
                    }
                    
                    return loggedInId;
                }
            }
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log('RecSync: User is not logged in, checking localStorage');
            }
            
            // 3. Use the user_id centralizado de analytics.js si está disponible
            if (window.data_analytics && window.data_analytics.getUserId) {
                return window.data_analytics.getUserId();
            }
            
            // 4. Fallback: usar la misma lógica que analytics.js (only if not logged in)
            const existingId = localStorage.getItem('dl_anon_user_id');
            if (existingId) {
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log('RecSync: Using existing anonymous ID:', existingId);
                }
                return existingId;
            }
            
            const newId = crypto.randomUUID();
            localStorage.setItem('dl_anon_user_id', newId);
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Created new user ID:", newId);
            }
            
            return newId;
        }
        
        getSessionId() {
            // Crear un session ID persistente para la sesión actual
            let sessionId = localStorage.getItem("dl_session_id");
            
            // Si no existe, crear uno nuevo
            if (!sessionId) {
                const timestamp = Date.now();
                const random = Math.random().toString(36).substr(2, 9);
                sessionId = "s_" + timestamp + "_" + random;
                
                // Guardar en localStorage para persistencia
                localStorage.setItem("dl_session_id", sessionId);
                
                if (RECSYNC_CONFIG.debugEnabled) {
                    console.log("RecSync: Created new session ID:", sessionId);
                }
            }
            
            return sessionId;
        }
    }
    
    // Inicializar solo en páginas de producto
    function initRecSyncProductEvents() {
        // Verificar si estamos en una página de producto
        const isProductPage = window.location.pathname.includes("/product/") || 
                             window.location.pathname.includes(".html") ||
                             document.querySelector(".product-details, .product-main, [data-id-product]");
        
        if (isProductPage && typeof window.RecSyncProductEvents === "undefined") {
            window.RecSyncProductEvents = new RecSyncProductEvents();
            
            if (RECSYNC_CONFIG.debugEnabled) {
                console.log("RecSync: Product events initialized");
            }
        }
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRecSyncProductEvents);
    } else {
        initRecSyncProductEvents();
    }
    
    // También inicializar en eventos de PrestaShop
    if (typeof prestashop !== "undefined") {
        prestashop.on("updatedProduct", initRecSyncProductEvents);
        prestashop.on("updatedCart", initRecSyncProductEvents);
    }
    
})();
