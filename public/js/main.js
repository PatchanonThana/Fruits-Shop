// ============================================
// FRUIT SHOP - Main JavaScript
// ============================================

const isPositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
};

const safeParseInt = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : NaN;
};

const postJson = async (url, data) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.redirected) {
            window.location.href = response.url;
            return null;
        }

        const json = await response.json();

        if (!response.ok) {
            console.error('API error:', response.status, json);
            return { error: json.error || 'API Error', status: response.status };
        }

        return json;
    } catch (err) {
        console.error('Network error:', err);
        return { error: 'Network error', status: 0 };
    }
};

const updateBadge = (count) => {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;
    badge.textContent = count;
    badge.style.transform = 'scale(1.25)';
    setTimeout(() => {
        badge.style.transform = 'scale(1)';
    }, 150);
};

const animateButton = (button, message) => {
    if (!button) return;
    const original = button.innerHTML;
    button.innerHTML = message;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.innerHTML = original;
        button.style.transform = 'scale(1)';
    }, 900);
};

const removeCartItem = async (fruitId) => {
    if (!isPositiveInteger(fruitId)) {
        console.error('Invalid fruit ID for removal:', fruitId);
        alert('Error: Invalid fruit ID');
        return;
    }

    const data = await postJson('/api/cart/remove', { fruit_id: fruitId });
    if (!data || data.error) {
        console.error('Failed to remove item:', data ? data.error : 'No response');
        alert('Error: Unable to remove item from cart');
        return;
    }

    updateBadge(data.cartCount || 0);
    window.location.reload();
};

const bindCartButtons = () => {
    document.querySelectorAll('.btn-add-cart').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const fruitId = safeParseInt(btn.getAttribute('data-fruit-id'));
            if (!isPositiveInteger(fruitId)) {
                console.error('Missing or invalid fruit ID on add-cart button');
                alert('Error: Invalid fruit');
                return;
            }

            btn.disabled = true;
            animateButton(btn, '⏳');

            const result = await postJson('/api/cart/update', {
                fruit_id: fruitId,
                quantity: 1
            });

            btn.disabled = false;

            if (result && result.error) {
                console.error('Cart error:', result.error);
                animateButton(btn, '❌');
                return;
            }

            if (result && typeof result.cartCount === 'number') {
                updateBadge(result.cartCount);
                animateButton(btn, '✅');
            } else {
                animateButton(btn, '❌');
            }
        });
    });
};

const bindQuantityControls = () => {
    document.querySelectorAll('.qty-minus, .qty-plus').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const fruitId = safeParseInt(btn.getAttribute('data-id'));
            const quantity = safeParseInt(btn.getAttribute('data-qty'));

            if (!isPositiveInteger(fruitId) || !isPositiveInteger(quantity)) {
                console.error('Invalid cart update values', fruitId, quantity);
                return;
            }

            if (quantity < 1) {
                removeCartItem(fruitId);
                return;
            }

            await postJson('/api/cart/update', {
                fruit_id: fruitId,
                quantity: quantity
            });

            window.location.reload();
        });
    });
};

const bindRemoveButtons = () => {
    document.querySelectorAll('.cart-item-remove').forEach((btn) => {
        btn.addEventListener('click', () => {
            const fruitId = safeParseInt(btn.getAttribute('data-id'));
            if (!isPositiveInteger(fruitId)) {
                console.error('Invalid fruit ID to remove', fruitId);
                return;
            }
            removeCartItem(fruitId);
        });
    });
};

const bindAdminPriceButtons = () => {
    document.querySelectorAll('.btn-update-price').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const fruitId = safeParseInt(btn.getAttribute('data-fruit-id'));
            const input = document.querySelector(`.admin-price-input[data-fruit-id="${fruitId}"]`);
            if (!isPositiveInteger(fruitId) || !input) {
                console.error('Invalid admin price control', fruitId);
                alert('Error: Invalid fruit ID.');
                return;
            }

            const price = parseFloat(input.value);
            if (Number.isNaN(price) || price <= 0) {
                alert('Please enter a valid price greater than 0.');
                return;
            }

            btn.disabled = true;
            btn.textContent = 'Updating...';

            const result = await postJson('/api/admin/fruit/price', {
                fruit_id: fruitId,
                price: price
            });

            if (result && result.error) {
                alert('Error: ' + result.error);
                btn.textContent = 'Save price';
                btn.disabled = false;
                return;
            }

            if (result && result.fruit && typeof result.fruit.price === 'number') {
                const priceLabel = btn.closest('.product-card').querySelector('.product-price');
                if (priceLabel) {
                    priceLabel.textContent = '฿' + result.fruit.price.toFixed(2);
                    input.value = result.fruit.price.toFixed(2);
                }
                btn.textContent = '✅ Saved';
                setTimeout(() => {
                    btn.textContent = 'Save price';
                    btn.disabled = false;
                }, 1500);
            } else {
                alert('Error: Invalid response from server');
                btn.textContent = 'Save price';
                btn.disabled = false;
            }
        });
    });
};

const updateCartTotal = () => {
    const items = document.querySelectorAll('.cart-item');
    let subtotal = 0;

    items.forEach((item) => {
        const price = Number(item.getAttribute('data-price') || 0);
        const qtyEl = item.querySelector('.cart-qty span');
        const qty = safeParseInt(qtyEl ? qtyEl.textContent : 1) || 1;
        subtotal += price * qty;
    });

    const subtotalEl = document.querySelector('.subtotal-amount');
    const totalEl = document.querySelector('.total-amount');
    if (subtotalEl) subtotalEl.textContent = '฿' + subtotal.toFixed(2);
    if (totalEl) totalEl.textContent = '฿' + subtotal.toFixed(2);
};

const setupNavigation = () => {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
};

const setupMobileMenu = () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (!hamburger || !navLinks) {
        return;
    }

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        hamburger.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });
};

const setupAnimations = () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            const children = entry.target.querySelectorAll('.animate-child');
            children.forEach((child, index) => {
                child.style.transitionDelay = (index * 0.1) + 's';
                child.classList.add('visible');
            });
        });
    }, observerOptions);

    document.querySelectorAll('.animate-in').forEach((el) => observer.observe(el));
};

const setupWishlist = () => {
    document.querySelectorAll('.product-wishlist').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = btn.classList.toggle('active');
            btn.innerHTML = isActive ? '❤️' : '🤍';
            btn.style.transform = 'scale(1.3)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        });
    });
};

const setupUserMenu = () => {
    document.addEventListener('click', (e) => {
        const userMenu = document.querySelector('.user-menu');
        if (userMenu && !userMenu.contains(e.target)) {
            userMenu.classList.remove('open');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const userMenu = document.querySelector('.user-menu');
            if (userMenu) {
                userMenu.classList.remove('open');
            }
        }
    });
};

const setupBodyFade = () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.35s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
};

const init = () => {
    setupNavigation();
    setupMobileMenu();
    setupAnimations();
    setupWishlist();
    setupUserMenu();
    setupBodyFade();
    bindCartButtons();
    bindQuantityControls();
    bindRemoveButtons();
    bindAdminPriceButtons();
    updateCartTotal();
    console.log('🍉 Fruit Shop loaded!');
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
