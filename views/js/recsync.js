/**
 * RecSync - Recomendaciones Inteligentes
 * JavaScript functionality for telemetry tracking and UI interactions
 */

(function() {
    'use strict';

    // Configuration
    const RECSYNC_CONFIG = {
        telemetryEnabled: typeof recsyncTelemetryEnabled !== 'undefined' ? recsyncTelemetryEnabled : false,
        telemetryUrl: typeof recsyncTelemetryUrl !== 'undefined' ? recsyncTelemetryUrl : '',
        userId: typeof recsyncUserId !== 'undefined' ? recsyncUserId : null,
        sessionId: typeof recsyncSessionId !== 'undefined' ? recsyncSessionId : null,
        widgetId: typeof recsyncWidgetId !== 'undefined' ? recsyncWidgetId : 'home_main',
        trackingId: typeof recsyncTrackingId !== 'undefined' ? recsyncTrackingId : null
    };

    // Telemetry tracking
    class RecSyncTelemetry {
        constructor() {
            this.trackedImpressions = new Set();
            this.trackedClicks = new Set();
        }

        /**
         * Track impression event
         */
        trackImpression(productExternalId, position) {
            if (!RECSYNC_CONFIG.telemetryEnabled || !RECSYNC_CONFIG.trackingId) {
                return;
            }

            const key = `${productExternalId}_${position}`;
            if (this.trackedImpressions.has(key)) {
                return;
            }

            this.trackedImpressions.add(key);
            this.sendEvent('impression', productExternalId, position);
        }

        /**
         * Track click event
         */
        trackClick(productExternalId, position) {
            if (!RECSYNC_CONFIG.telemetryEnabled || !RECSYNC_CONFIG.trackingId) {
                return;
            }

            const key = `${productExternalId}_${position}`;
            if (this.trackedClicks.has(key)) {
                return;
            }

            this.trackedClicks.add(key);
            this.sendEvent('click', productExternalId, position);
        }

        /**
         * Track add to cart event
         */
        trackAddToCart(productExternalId, position) {
            if (!RECSYNC_CONFIG.telemetryEnabled || !RECSYNC_CONFIG.trackingId) {
                return;
            }

            const key = `add_to_cart_${productExternalId}_${position}`;
            if (this.trackedClicks.has(key)) {
                return;
            }

            this.trackedClicks.add(key);
            this.sendEvent('add_to_cart', productExternalId, position);
        }

        /**
         * Send event to telemetry endpoint
         */
        sendEvent(eventType, productExternalId, position) {
            const payload = {
                event_type: eventType,
                request_id: RECSYNC_CONFIG.trackingId,
                widget_id: RECSYNC_CONFIG.widgetId,
                product_external_id: productExternalId,
                position: position,
                user_id: RECSYNC_CONFIG.userId,
                session_id: RECSYNC_CONFIG.sessionId,
                timestamp: Date.now()
            };

            // Send using fetch with low priority
            if (navigator.sendBeacon) {
                // Use sendBeacon for better performance
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(`${RECSYNC_CONFIG.telemetryUrl}/v1/track/${eventType}`, blob);
            } else {
                // Fallback to fetch
                fetch(`${RECSYNC_CONFIG.telemetryUrl}/v1/track/${eventType}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload),
                    keepalive: true
                }).catch(() => {
                    // Silently fail for telemetry
                });
            }
        }
    }

    // Enhanced Carousel functionality
    class RecSyncCarousel {
        constructor(container) {
            this.container = container;
            this.containerElement = container.querySelector('.recsync-carousel-container');
            this.products = container.querySelectorAll('.recsync-product');
            this.currentIndex = 0;
            this.productsPerView = this.calculateProductsPerView();
            this.maxIndex = Math.max(0, this.products.length - this.productsPerView);
            this.totalSlides = Math.ceil(this.products.length / this.productsPerView);
            this.autoplayInterval = null;
            this.autoplayDelay = 5000; // 5 seconds
            this.isTransitioning = false;
            
            this.init();
        }

        /**
         * Calculate products per view based on screen size
         */
        calculateProductsPerView() {
            const width = window.innerWidth;
            if (width < 576) return 1;
            if (width < 768) return 2;
            if (width < 992) return 3;
            return 4;
        }

        /**
         * Initialize carousel
         */
        init() {
            this.createNavigation();
            this.createIndicators();
            this.updateNavigation();
            this.updateIndicators();
            this.bindEvents();
            this.updateDisplay();
            this.startAutoplay();
        }

        /**
         * Create navigation buttons
         */
        createNavigation() {
            // Only create navigation buttons if arrows are enabled
            if (!this.container.classList.contains('show-arrows')) {
                return;
            }

            const prevBtn = document.createElement('button');
            prevBtn.className = 'recsync-carousel-nav prev';
            prevBtn.setAttribute('aria-label', 'Previous products');
            prevBtn.setAttribute('type', 'button');
            prevBtn.addEventListener('click', () => this.prev());

            const nextBtn = document.createElement('button');
            nextBtn.className = 'recsync-carousel-nav next';
            nextBtn.setAttribute('aria-label', 'Next products');
            nextBtn.setAttribute('type', 'button');
            nextBtn.addEventListener('click', () => this.next());

            this.container.appendChild(prevBtn);
            this.container.appendChild(nextBtn);

            this.prevBtn = prevBtn;
            this.nextBtn = nextBtn;
        }

        /**
         * Create indicators
         */
        createIndicators() {
            // Only create indicators if they are enabled
            if (!this.container.classList.contains('show-indicators')) {
                return;
            }

            if (this.totalSlides <= 1) return;

            const indicatorsContainer = document.createElement('div');
            indicatorsContainer.className = 'recsync-carousel-indicators';
            
            for (let i = 0; i < this.totalSlides; i++) {
                const indicator = document.createElement('button');
                indicator.className = 'recsync-carousel-indicator';
                indicator.setAttribute('type', 'button');
                indicator.setAttribute('aria-label', `Go to slide ${i + 1}`);
                indicator.addEventListener('click', () => this.goToSlide(i));
                indicatorsContainer.appendChild(indicator);
            }
            
            this.container.appendChild(indicatorsContainer);
            this.indicators = indicatorsContainer.querySelectorAll('.recsync-carousel-indicator');
        }

        /**
         * Update navigation state
         */
        updateNavigation() {
            if (this.prevBtn && this.nextBtn) {
                this.prevBtn.style.display = this.currentIndex > 0 ? 'flex' : 'none';
                this.nextBtn.style.display = this.currentIndex < this.maxIndex ? 'flex' : 'none';
            }
        }

        /**
         * Update indicators
         */
        updateIndicators() {
            if (!this.indicators) return;

            this.indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === this.currentIndex);
            });
        }

        /**
         * Bind events
         */
        bindEvents() {
            // Handle window resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const oldProductsPerView = this.productsPerView;
                    this.productsPerView = this.calculateProductsPerView();
                    this.maxIndex = Math.max(0, this.products.length - this.productsPerView);
                    this.totalSlides = Math.ceil(this.products.length / this.productsPerView);
                    
                    // Recalculate current index if needed
                    if (oldProductsPerView !== this.productsPerView) {
                        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
                        this.recreateIndicators();
                    }
                    
                    this.updateDisplay();
                    this.updateNavigation();
                    this.updateIndicators();
                }, 250);
            });

            // Handle keyboard navigation
            this.container.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prev();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.next();
                }
            });

            // Pause autoplay on hover
            this.container.addEventListener('mouseenter', () => this.stopAutoplay());
            this.container.addEventListener('mouseleave', () => this.startAutoplay());

            // Handle touch/swipe events
            this.addTouchSupport();
        }

        /**
         * Add touch support for mobile
         */
        addTouchSupport() {
            let startX = 0;
            let startY = 0;
            let distX = 0;
            let distY = 0;

            this.container.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            });

            this.container.addEventListener('touchmove', (e) => {
                if (!startX || !startY) return;
                
                distX = e.touches[0].clientX - startX;
                distY = e.touches[0].clientY - startY;
            });

            this.container.addEventListener('touchend', () => {
                if (!startX || !startY) return;

                // Check if it's a horizontal swipe
                if (Math.abs(distX) > Math.abs(distY) && Math.abs(distX) > 50) {
                    if (distX > 0) {
                        this.prev();
                    } else {
                        this.next();
                    }
                }

                startX = 0;
                startY = 0;
                distX = 0;
                distY = 0;
            });
        }

        /**
         * Recreate indicators after resize
         */
        recreateIndicators() {
            if (this.indicators) {
                const indicatorsContainer = this.indicators[0].parentNode;
                indicatorsContainer.remove();
                this.createIndicators();
            }
        }

        /**
         * Update display with smooth transition
         */
        updateDisplay() {
            if (this.isTransitioning) return;
            
            this.isTransitioning = true;
            const translateX = -(this.currentIndex * (100 / this.productsPerView));
            this.containerElement.style.transform = `translateX(${translateX}%)`;
            
            setTimeout(() => {
                this.isTransitioning = false;
            }, 400);
        }

        /**
         * Go to specific slide
         */
        goToSlide(index) {
            if (index >= 0 && index <= this.maxIndex && !this.isTransitioning) {
                this.currentIndex = index;
                this.updateDisplay();
                this.updateNavigation();
                this.updateIndicators();
                this.restartAutoplay();
            }
        }

        /**
         * Go to previous slide
         */
        prev() {
            if (this.currentIndex > 0 && !this.isTransitioning) {
                this.currentIndex--;
                this.updateDisplay();
                this.updateNavigation();
                this.updateIndicators();
                this.restartAutoplay();
            }
        }

        /**
         * Go to next slide
         */
        next() {
            if (this.currentIndex < this.maxIndex && !this.isTransitioning) {
                this.currentIndex++;
                this.updateDisplay();
                this.updateNavigation();
                this.updateIndicators();
                this.restartAutoplay();
            } else if (this.currentIndex >= this.maxIndex) {
                // Loop to beginning
                this.currentIndex = 0;
                this.updateDisplay();
                this.updateNavigation();
                this.updateIndicators();
                this.restartAutoplay();
            }
        }

        /**
         * Start autoplay
         */
        startAutoplay() {
            if (this.totalSlides <= 1) return;
            
            this.stopAutoplay();
            this.autoplayInterval = setInterval(() => {
                this.next();
            }, this.autoplayDelay);
        }

        /**
         * Stop autoplay
         */
        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }

        /**
         * Restart autoplay
         */
        restartAutoplay() {
            this.stopAutoplay();
            this.startAutoplay();
        }

        /**
         * Destroy carousel
         */
        destroy() {
            this.stopAutoplay();
            if (this.prevBtn) this.prevBtn.remove();
            if (this.nextBtn) this.nextBtn.remove();
            if (this.indicators) {
                this.indicators[0].parentNode.remove();
            }
        }
    }

    // Main RecSync class
    class RecSync {
        constructor() {
            this.telemetry = new RecSyncTelemetry();
            this.carousels = [];
            this.init();
        }

        /**
         * Initialize RecSync
         */
        init() {
            this.initCarousels();
            this.initTelemetry();
            this.initIntersectionObserver();
        }

        /**
         * Initialize carousels
         */
        initCarousels() {
            const carouselContainers = document.querySelectorAll('.recsync-carousel');
            carouselContainers.forEach(container => {
                this.carousels.push(new RecSyncCarousel(container));
            });
        }

        /**
         * Initialize telemetry tracking
         */
        initTelemetry() {
            if (!RECSYNC_CONFIG.telemetryEnabled) {
                return;
            }

            // Track impressions for visible products
            const products = document.querySelectorAll('.recsync-product');
            products.forEach((product, index) => {
                const externalId = product.dataset.externalId;
                if (externalId) {
                    // Track initial impressions for visible products
                    if (this.isElementInViewport(product)) {
                        this.telemetry.trackImpression(externalId, index + 1);
                    }

                    // Track clicks
                    product.addEventListener('click', () => {
                        this.telemetry.trackClick(externalId, index + 1);
                    });
                }
            });

            // Track add to cart events
            this.initAddToCartTracking();
        }

        /**
         * Initialize add to cart event tracking
         */
        initAddToCartTracking() {
            // Listen for PrestaShop's updateCart event
            if (typeof prestashop !== 'undefined') {
                prestashop.on('updateCart', (event) => {
                    if (event && event.reason && event.reason.linkAction === 'add-to-cart') {
                        const productId = event.reason.idProduct;
                        const productAttributeId = event.reason.idProductAttribute;
                        
                        // Find the product in our recommendations
                        const product = this.findProductInRecommendations(productId, productAttributeId);
                        if (product) {
                            const externalId = product.dataset.externalId;
                            const position = parseInt(product.dataset.position) || 1;
                            
                            if (externalId) {
                                this.telemetry.trackAddToCart(externalId, position);
                            }
                        }
                    }
                });
            }

            // Also listen for direct button clicks as fallback
            document.addEventListener('click', (event) => {
                const addToCartButton = event.target.closest('[data-button-action="add-to-cart"]');
                if (addToCartButton) {
                    const productContainer = addToCartButton.closest('.recsync-product');
                    if (productContainer) {
                        const externalId = productContainer.dataset.externalId;
                        const position = parseInt(productContainer.dataset.position) || 1;
                        
                        if (externalId) {
                            this.telemetry.trackAddToCart(externalId, position);
                        }
                    }
                }
            });
        }

        /**
         * Find product in recommendations by ID
         */
        findProductInRecommendations(productId, productAttributeId = 0) {
            const products = document.querySelectorAll('.recsync-product');
            for (const product of products) {
                const productDataId = product.dataset.productId;
                const productDataAttributeId = product.dataset.productAttributeId || 0;
                
                if (parseInt(productDataId) === parseInt(productId) && 
                    parseInt(productDataAttributeId) === parseInt(productAttributeId)) {
                    return product;
                }
            }
            return null;
        }

        /**
         * Initialize intersection observer for lazy tracking
         */
        initIntersectionObserver() {
            if (!RECSYNC_CONFIG.telemetryEnabled || !window.IntersectionObserver) {
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const product = entry.target;
                        const externalId = product.dataset.externalId;
                        const position = parseInt(product.dataset.position) || 1;
                        
                        if (externalId) {
                            this.telemetry.trackImpression(externalId, position);
                        }
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '50px'
            });

            // Observe all products
            const products = document.querySelectorAll('.recsync-product');
            products.forEach((product, index) => {
                product.dataset.position = index + 1;
                observer.observe(product);
            });
        }

        /**
         * Check if element is in viewport
         */
        isElementInViewport(element) {
            const rect = element.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }

        /**
         * Refresh recommendations (for future use)
         */
        refresh() {
            // This could be used to refresh recommendations via AJAX
            console.log('RecSync: Refresh requested');
        }

        /**
         * Get statistics
         */
        getStats() {
            return {
                impressions: this.telemetry.trackedImpressions.size,
                clicks: this.telemetry.trackedClicks.size,
                carousels: this.carousels.length
            };
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.RecSync = new RecSync();
        });
    } else {
        window.RecSync = new RecSync();
    }

    // Expose to global scope for debugging
    window.RecSyncTelemetry = RecSyncTelemetry;
    window.RecSyncCarousel = RecSyncCarousel;

})();
