// Елементи для роботи з фільтрами
const filtersToggle = document.getElementById('filtersToggle');
const filtersContainer = document.getElementById('filtersContainer');
const priceMinInput = document.getElementById('priceMin');
const priceMaxInput = document.getElementById('priceMax');
const sortSelect = document.getElementById('sortSelect');
const applyFiltersBtn = document.getElementById('applyFilters');
const resetFiltersBtn = document.getElementById('resetFilters');
const productsGrid = document.getElementById('productsGrid');
const productCards = document.querySelectorAll('.product-card');

if (productsGrid && productCards.length > 0) {
    const allProducts = Array.from(productCards);

    // Переключення видимості фільтрів
    if (filtersToggle && filtersContainer) {
        filtersToggle.addEventListener('click', function() {
            if (filtersContainer.style.display === 'none') {
                filtersContainer.style.display = 'flex';
                filtersToggle.textContent = '🔼 Приховати фільтри';
            } else {
                filtersContainer.style.display = 'none';
                filtersToggle.textContent = '🔽 Фільтри';
            }
        });
    }

    // Застосування фільтрів
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }

    // Скидання фільтрів
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            if (priceMinInput) priceMinInput.value = '0';
            if (priceMaxInput) priceMaxInput.value = '100000';
            if (sortSelect) sortSelect.value = '';
            applyFilters();
        });
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', applyFilters);
    }

    function applyFilters() {
        const priceMin = priceMinInput ? parseFloat(priceMinInput.value) || 0 : 0;
        const priceMax = priceMaxInput ? parseFloat(priceMaxInput.value) || Infinity : Infinity;
        const sortType = sortSelect ? sortSelect.value : '';

        let filteredProducts = allProducts.filter(product => {
            const price = parseFloat(product.getAttribute('data-price')) || 0;
            return price >= priceMin && price <= priceMax;
        });

        if (sortType === 'price-asc') {
            filteredProducts.sort((a, b) => parseFloat(a.getAttribute('data-price')) - parseFloat(b.getAttribute('data-price')));
        } else if (sortType === 'price-desc') {
            filteredProducts.sort((a, b) => parseFloat(b.getAttribute('data-price')) - parseFloat(a.getAttribute('data-price')));
        } else if (sortType === 'name') {
            filteredProducts.sort((a, b) => {
                const nameA = a.querySelector('h3').textContent.toUpperCase();
                const nameB = b.querySelector('h3').textContent.toUpperCase();
                return nameA.localeCompare(nameB, 'uk');
            });
        }

        productsGrid.innerHTML = '';

        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 18px; color: #999;">Товарів не знайдено за вашими критеріями</div>';
            return;
        }

        filteredProducts.forEach(product => {
            productsGrid.appendChild(product.cloneNode(true));
        });
    }

    if (priceMinInput) {
        priceMinInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') applyFilters();
        });
    }

    if (priceMaxInput) {
        priceMaxInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') applyFilters();
        });
    }

    applyFilters();
}

// ======= Simple shopping cart (localStorage) =======
(function() {
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const cart = getCart();
        const count = cart.reduce((s, it) => s + (it.qty || 1), 0);
        const cartLink = document.querySelector('a[href="cart.html"]');
        if (cartLink) {
            // show count in parentheses
            const base = 'кошик';
            cartLink.textContent = count > 0 ? `${base} (${count})` : base;
        }
    }

    function addToCartItem(item) {
        const cart = getCart();
        const key = item.id || (item.name + '|' + item.price);
        const existing = cart.find(c => c.key === key);
        if (existing) {
            existing.qty = (existing.qty || 1) + (item.qty || 1);
        } else {
            cart.push({ key, name: item.name, price: item.price, img: item.img || '', qty: item.qty || 1 });
        }
        saveCart(cart);
    }

    // attach click handlers on Add to cart buttons
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('.add-to-cart');
        if (!btn) return;
        const card = btn.closest('.product-card');
        if (!card) return;
        const nameEl = card.querySelector('h3');
        const priceEl = card.querySelector('.price');
        const imgEl = card.querySelector('img');
        const name = nameEl ? nameEl.textContent.trim() : 'Товар';
        let price = 0;
        if (priceEl) {
            const m = priceEl.textContent.replace(/[^\n0-9,.]/g, '').replace(',', '.');
            price = parseFloat(m) || parseFloat(card.getAttribute('data-price')) || 0;
        } else {
            price = parseFloat(card.getAttribute('data-price')) || 0;
        }
        const img = imgEl ? imgEl.getAttribute('src') : '';
        addToCartItem({ name, price, img, qty: 1 });
        // simple feedback
        btn.textContent = 'додано';
        setTimeout(() => btn.textContent = 'додати в кошик', 900);
    });

    // Cart page rendering and actions
    function renderCartPage() {
        const cartContainer = document.getElementById('cartItems');
        const totalEl = document.getElementById('cartTotal');
        if (!cartContainer) return;
        const cart = getCart();
        cartContainer.innerHTML = '';
        if (cart.length === 0) {
            cartContainer.innerHTML = '<p>Кошик порожній</p>';
            if (totalEl) totalEl.textContent = '0 грн';
            return;
        }
        let total = 0;
        cart.forEach((it, idx) => {
            total += (it.price || 0) * (it.qty || 1);
            const item = document.createElement('div');
            item.className = 'cart-item';
            item.innerHTML = `
                <img src="${it.img}" alt="" />
                <div class="cart-item-info">
                    <div class="cart-item-name">${it.name}</div>
                    <div class="cart-item-price">${(it.price || 0).toLocaleString('uk-UA')} грн</div>
                    <div class="cart-item-controls">
                        <button class="cart-decrease" data-idx="${idx}">-</button>
                        <span class="cart-qty">${it.qty || 1}</span>
                        <button class="cart-increase" data-idx="${idx}">+</button>
                        <button class="cart-remove" data-idx="${idx}">видалити</button>
                    </div>
                </div>
            `;
            cartContainer.appendChild(item);
        });
        if (totalEl) totalEl.textContent = total.toLocaleString('uk-UA') + ' грн';
    }

    // handle cart page button clicks
    document.addEventListener('click', function(e) {
        const inc = e.target.closest('.cart-increase');
        const dec = e.target.closest('.cart-decrease');
        const rem = e.target.closest('.cart-remove');
        const clearBtn = e.target.closest('#clearCart');
        const checkoutBtn = e.target.closest('#checkout');
        if (inc || dec || rem || clearBtn || checkoutBtn) {
            const cart = getCart();
            if (inc) {
                const i = parseInt(inc.dataset.idx, 10);
                if (cart[i]) { cart[i].qty = (cart[i].qty || 1) + 1; saveCart(cart); renderCartPage(); }
            }
            if (dec) {
                const i = parseInt(dec.dataset.idx, 10);
                if (cart[i]) { cart[i].qty = Math.max(1, (cart[i].qty || 1) - 1); saveCart(cart); renderCartPage(); }
            }
            if (rem) {
                const i = parseInt(rem.dataset.idx, 10);
                if (cart[i]) { cart.splice(i,1); saveCart(cart); renderCartPage(); }
            }
            if (clearBtn) {
                localStorage.removeItem('cart'); updateCartCount(); renderCartPage();
            }
            if (checkoutBtn) {
                alert('Дякуємо за замовлення! (це демо)');
                localStorage.removeItem('cart'); updateCartCount(); renderCartPage();
            }
        }
    });

    // init
    updateCartCount();
    if (document.getElementById('cartItems')) {
        renderCartPage();
    }
})();

(function() {
    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem('usersList') || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem('usersList', JSON.stringify(users));
    }

    function showMessage(element, text, type) {
        if (!element) return;
        element.textContent = text;
        element.classList.remove('auth-message--error', 'auth-message--success');
        if (type === 'success') element.classList.add('auth-message--success');
        if (type === 'error') element.classList.add('auth-message--error');
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('loginEmail').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;
            const loginMessage = document.getElementById('loginMessage');
            if (!email || !password) {
                showMessage(loginMessage, 'Будь ласка, заповніть всі поля.', 'error');
                return;
            }
            const users = getUsers();
            const user = users.find(u => u.email === email);
            if (!user) {
                showMessage(loginMessage, 'Користувач не знайдено. Перевірте email або зареєструйтесь.', 'error');
                return;
            }
            if (user.password !== password) {
                showMessage(loginMessage, 'Неправильний пароль.', 'error');
                return;
            }
            localStorage.setItem('currentUser', JSON.stringify(user));
            showMessage(loginMessage, 'Ви успішно увійшли! Перенаправлення...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 900);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim().toLowerCase();
            const password = document.getElementById('registerPassword').value;
            const confirm = document.getElementById('registerConfirm').value;
            const registerMessage = document.getElementById('registerMessage');
            if (!name || !email || !password || !confirm) {
                showMessage(registerMessage, 'Будь ласка, заповніть всі поля.', 'error');
                return;
            }
            if (password.length < 6) {
                showMessage(registerMessage, 'Пароль має бути щонайменше 6 символів.', 'error');
                return;
            }
            if (password !== confirm) {
                showMessage(registerMessage, 'Паролі не співпадають.', 'error');
                return;
            }
            const users = getUsers();
            if (users.some(u => u.email === email)) {
                showMessage(registerMessage, 'Цей email вже використовується.', 'error');
                return;
            }
            const newUser = { name, email, password };
            users.push(newUser);
            saveUsers(users);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            showMessage(registerMessage, 'Реєстрація успішна! Ви увійшли в систему.', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 900);
        });
    }
})();

