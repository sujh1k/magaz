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

