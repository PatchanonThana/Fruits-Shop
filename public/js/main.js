// ============================================
// FRUIT SHOP - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // === Navbar scroll effect ===
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // === Hamburger menu toggle ===
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            hamburger.classList.toggle('active');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }

    // === Scroll animations ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stagger children animations
                const children = entry.target.querySelectorAll('.animate-child');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    child.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-in').forEach(el => {
        observer.observe(el);
    });

    // === Wishlist toggle ===
    document.querySelectorAll('.product-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = btn.classList.toggle('active');
            btn.innerHTML = isActive ? '❤️' : '🤍';
            
            // Add bounce animation
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // === Add to cart animation ===
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Create floating animation
            const rect = btn.getBoundingClientRect();
            const floater = document.createElement('div');
            floater.innerHTML = '🛒';
            floater.style.cssText = `
                position: fixed;
                top: ${rect.top}px;
                left: ${rect.left}px;
                font-size: 1.5rem;
                z-index: 9999;
                pointer-events: none;
                transition: all 0.8s cubic-bezier(0.2, 0, 0.2, 1);
            `;
            document.body.appendChild(floater);

            // Animate to cart icon
            const cartIcon = document.querySelector('.nav-cart');
            if (cartIcon) {
                const cartRect = cartIcon.getBoundingClientRect();
                requestAnimationFrame(() => {
                    floater.style.top = `${cartRect.top}px`;
                    floater.style.left = `${cartRect.left}px`;
                    floater.style.opacity = '0';
                    floater.style.transform = 'scale(0.3)';
                });
            }

            setTimeout(() => floater.remove(), 900);

            // Update badge
            const badge = document.querySelector('.cart-badge');
            if (badge) {
                const count = parseInt(badge.textContent) + 1;
                badge.textContent = count;
                badge.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    badge.style.transform = 'scale(1)';
                }, 200);
            }

            // Button feedback
            btn.style.transform = 'scale(0.85)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // === Cart quantity controls ===
    document.querySelectorAll('.cart-qty button').forEach(btn => {
        btn.addEventListener('click', () => {
            const qtySpan = btn.parentElement.querySelector('span');
            let qty = parseInt(qtySpan.textContent);
            
            if (btn.classList.contains('qty-minus')) {
                qty = Math.max(1, qty - 1);
            } else {
                qty++;
            }
            
            qtySpan.textContent = qty;
            updateCartTotal();
        });
    });

    // === Update cart total ===
    function updateCartTotal() {
        const items = document.querySelectorAll('.cart-item');
        let subtotal = 0;
        
        items.forEach(item => {
            const price = parseFloat(item.dataset.price || 0);
            const qty = parseInt(item.querySelector('.cart-qty span')?.textContent || 1);
            subtotal += price * qty;
        });

        const subtotalEl = document.querySelector('.subtotal-amount');
        const totalEl = document.querySelector('.total-amount');
        
        if (subtotalEl) subtotalEl.textContent = `฿${subtotal.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `฿${subtotal.toFixed(2)}`;
    }

    // === Remove cart item ===
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.cart-item');
            item.style.transform = 'translateX(100%)';
            item.style.opacity = '0';
            setTimeout(() => {
                item.remove();
                updateCartTotal();

                // Check if cart is empty
                if (document.querySelectorAll('.cart-item').length === 0) {
                    const section = document.querySelector('.cart-items-section');
                    if (section) {
                        section.innerHTML = `
                            <div class="cart-empty">
                                <div class="cart-empty-icon">🛒</div>
                                <h3>Your cart is empty</h3>
                                <p>Looks like you haven't added any fruits yet!</p>
                                <a href="/" class="btn-catalog">Start Shopping</a>
                            </div>
                        `;
                    }
                }
            }, 300);
        });
    });

    // === Category tabs filter ===
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.dataset.category;
            const products = document.querySelectorAll('.product-card[data-category]');

            products.forEach((product, index) => {
                if (category === 'all' || product.dataset.category === category) {
                    product.style.display = 'block';
                    product.style.animation = `fadeInUp 0.4s ease ${index * 0.05}s both`;
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });

    // === Smooth reveal on page load ===
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });

    // === Parallax on hero (subtle) ===
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const banner = hero.querySelector('.hero-banner');
            if (banner && scrolled < window.innerHeight) {
                banner.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        });
    }

    console.log('🍉 Fruit Shop loaded! Fresh fruits await you!');
});