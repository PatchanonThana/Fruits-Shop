// ============================================
// FRUIT SHOP - Main JavaScript (FIXED)
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // NAVBAR — Scroll effect
    // ============================================
    var navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ============================================
    // HAMBURGER — Mobile menu toggle
    // ============================================
    var hamburger = document.querySelector('.hamburger');
    var navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('open');
            hamburger.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================
    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                var children = entry.target.querySelectorAll('.animate-child');
                children.forEach(function(child, index) {
                    child.style.transitionDelay = (index * 0.1) + 's';
                    child.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-in').forEach(function(el) {
        observer.observe(el);
    });

    // ============================================
    // WISHLIST TOGGLE
    // ============================================
    document.querySelectorAll('.product-wishlist').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var isActive = btn.classList.toggle('active');
            btn.innerHTML = isActive ? '❤️' : '🤍';
            btn.style.transform = 'scale(1.3)';
            setTimeout(function() {
                btn.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // ============================================
    // USER DROPDOWN — Toggle + Close on outside click
    // ============================================
    document.addEventListener('click', function(e) {
        var userMenu = document.querySelector('.user-menu');
        if (userMenu && !userMenu.contains(e.target)) {
            userMenu.classList.remove('open');
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var userMenu = document.querySelector('.user-menu');
            if (userMenu) {
                userMenu.classList.remove('open');
            }
        }
    });

    // ============================================
    // ADD TO CART — From product cards
    // ============================================
    document.querySelectorAll('.btn-add-cart').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            var fruitId = btn.getAttribute('data-fruit-id');

            console.log('Adding to cart, fruit_id:', fruitId);

            if (!fruitId) {
                console.error('No fruit ID found on button!');
                return;
            }

            // Floating cart animation
            var rect = btn.getBoundingClientRect();
            var floater = document.createElement('div');
            floater.innerHTML = '🛒';
            floater.style.cssText =
                'position:fixed;' +
                'top:' + rect.top + 'px;' +
                'left:' + rect.left + 'px;' +
                'font-size:1.5rem;' +
                'z-index:9999;' +
                'pointer-events:none;' +
                'transition:all 0.8s cubic-bezier(0.2,0,0.2,1);';
            document.body.appendChild(floater);

            var cartIcon = document.querySelector('.nav-cart');
            if (cartIcon) {
                var cartRect = cartIcon.getBoundingClientRect();
                requestAnimationFrame(function() {
                    floater.style.top = cartRect.top + 'px';
                    floater.style.left = cartRect.left + 'px';
                    floater.style.opacity = '0';
                    floater.style.transform = 'scale(0.3)';
                });
            }
            setTimeout(function() { floater.remove(); }, 900);

            // ✅ CORRECT API URL
            fetch('/api/cart/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fruit_id: parseInt(fruitId),
                    quantity: 1
                })
            })
            .then(function(res) {
                if (res.redirected) {
                    window.location.href = '/login-page?notLoginYet=1';
                    return null;
                }
                return res.json();
            })
            .then(function(data) {
                if (data) {
                    console.log('Cart updated:', data);

                    // Update badge number
                    var badge = document.querySelector('.cart-badge');
                    if (badge && data.cartCount !== undefined) {
                        badge.textContent = data.cartCount;
                        badge.style.transform = 'scale(1.4)';
                        setTimeout(function() {
                            badge.style.transform = 'scale(1)';
                        }, 200);
                    }

                    // Button success feedback
                    var originalHTML = btn.innerHTML;
                    btn.innerHTML = '✅';
                    setTimeout(function() {
                        btn.innerHTML = originalHTML;
                    }, 1000);
                }
            })
            .catch(function(err) {
                console.error('Add to cart error:', err);
            });

            // Button press effect
            btn.style.transform = 'scale(0.85)';
            setTimeout(function() {
                btn.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // ============================================
    // CART PAGE — Quantity +/- buttons
    // ============================================
    document.querySelectorAll('.qty-minus, .qty-plus').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var fruitId = this.getAttribute('data-id');
            var newQty = parseInt(this.getAttribute('data-qty'));

            console.log('Update cart, fruit_id:', fruitId, 'new qty:', newQty);

            if (newQty < 1) {
                removeCartItem(fruitId);
                return;
            }

            // ✅ CORRECT API URL
            fetch('/api/cart/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fruit_id: parseInt(fruitId),
                    quantity: newQty
                })
            })
            .then(function(res) {
                if (res.ok) {
                    window.location.reload();
                }
            })
            .catch(function(err) {
                console.error('Update error:', err);
            });
        });
    });

    // ============================================
    // CART PAGE — Remove item
    // ============================================
    document.querySelectorAll('.cart-item-remove').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var fruitId = this.getAttribute('data-id');
            removeCartItem(fruitId);
        });
    });

    function removeCartItem(fruitId) {
        console.log('Removing from cart, fruit_id:', fruitId);

        // ✅ CORRECT API URL
        fetch('/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fruit_id: parseInt(fruitId)
            })
        })
        .then(function(res) {
            if (res.ok) {
                return res.json();
            }
        })
        .then(function(data) {
            if (data) {
                console.log('Removed:', data);

                // Update badge
                var badge = document.querySelector('.cart-badge');
                if (badge && data.cartCount !== undefined) {
                    badge.textContent = data.cartCount;
                }

                // Reload to refresh the cart page
                window.location.reload();
            }
        })
        .catch(function(err) {
            console.error('Remove error:', err);
        });
    }

    // ============================================
    // CART PAGE — Update totals
    // ============================================
    function updateCartTotal() {
        var items = document.querySelectorAll('.cart-item');
        var subtotal = 0;

        items.forEach(function(item) {
            var price = parseFloat(item.getAttribute('data-price') || 0);
            var qtyEl = item.querySelector('.cart-qty span');
            var qty = qtyEl ? parseInt(qtyEl.textContent) : 1;
            subtotal += price * qty;
        });

        var subtotalEl = document.querySelector('.subtotal-amount');
        var totalEl = document.querySelector('.total-amount');
        if (subtotalEl) subtotalEl.textContent = '฿' + subtotal.toFixed(2);
        if (totalEl) totalEl.textContent = '฿' + subtotal.toFixed(2);
    }

    // ============================================
    // Page load
    // ============================================
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    requestAnimationFrame(function() {
        document.body.style.opacity = '1';
    });

    // ============================================
    // HERO — Subtle parallax
    // ============================================
    var hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            var scrolled = window.scrollY;
            var banner = hero.querySelector('.hero-banner');
            if (banner && scrolled < window.innerHeight) {
                banner.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)';
            }
        });
    }

    console.log('🍉 Fruit Shop loaded! Fresh fruits await you!');
});