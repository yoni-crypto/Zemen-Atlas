let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let activeCategory = 'all';
let activeSearch = '';

async function loadProducts() {
  try {
    const response = await fetch('http://localhost:5000/api/products');
    products = await response.json();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  await loadProducts();
  if (document.getElementById('products-grid')) {
    displayProducts();
  }
  if (document.getElementById('recommendations-row')) {
    displayRecommendations();
  }
  updateCartCount();
  setupEventListeners();
});

function goToProduct(productId) {
  if (!productId) return;
  window.location.href = './product.html?id=' + encodeURIComponent(productId);
}

function formatCategoryLabel(category) {
  if (!category) return '';
  if (category === 'shirts') return 'Shirt';
  if (category === 'hoodie') return 'Hoodie';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getFilteredProducts() {
  let result = products.slice();

  if (activeCategory !== 'all') {
    result = result.filter((product) => product.category === activeCategory);
  }

  if (activeSearch.trim() !== '') {
    const term = activeSearch.toLowerCase();
    result = result.filter((product) => {
      return (
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
    });
  }

  return result;
}

function displayProducts() {
  const grid = document.getElementById('products-grid');
  const countEl = document.getElementById('product-count');

  if (!grid) return;

  const items = getFilteredProducts();

  if (countEl) {
    countEl.textContent = items.length;
  }

  grid.innerHTML = items
    .map((product) => {
      const categoryLabel = formatCategoryLabel(product.category);
      return `
      <article class="product-card" onclick="goToProduct('${product.id}')">
        <div class="product-image-wrapper">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <span class="product-tag">${categoryLabel}</span>
        </div>
        <div class="product-header">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">ETB ${Number(product.price).toFixed(2)}</div>
        </div>
        <p class="product-description">${product.description.length > 60 ? product.description.substring(0, 60) + '...' : product.description}</p>
        <div class="product-actions">
          <button class="btn-outline" type="button" onclick="event.stopPropagation(); addToCart('${product.id}')">
            Add to cart
          </button>
          <button class="btn-primary" type="button" onclick="event.stopPropagation(); buyNow('${product.id}')">
            Buy now
          </button>
        </div>
      </article>
    `;
    })
    .join('');
}

function displayRecommendations() {
  const row = document.getElementById('recommendations-row');
  if (!row || !products.length) return;

  const featured = products.slice(0, 4);

  row.innerHTML = featured
    .map((product) => {
      const categoryLabel = formatCategoryLabel(product.category);
      return `
      <article class="recommendation-card" onclick="goToProduct('${product.id}')">
        <div class="product-image-wrapper">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <span class="product-tag">${categoryLabel}</span>
        </div>
        <div class="product-header">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price">ETB ${Number(product.price).toFixed(2)}</div>
        </div>
        <div class="product-meta">Handpicked for you</div>
        <div class="product-actions">
          <button class="btn-outline" type="button" onclick="event.stopPropagation(); addToCart('${product.id}')">
            Add to cart
          </button>
          <button class="btn-primary" type="button" onclick="event.stopPropagation(); buyNow('${product.id}')">
            Buy now
          </button>
        </div>
      </article>
    `;
    })
    .join('');
}

function addToCart(productId) {
  const product = products.find((p) => String(p.id) === String(productId));

  if (!product) return;

  const existingItem = cart.find((item) => String(item.id) === String(productId));

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: String(product.id),
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image || null,
      category: product.category || null
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();

  alert(`${product.name} added to cart!`);
}

function buyNow(productId) {
  addToCart(productId);
  window.location.href = '../cart/';
}

function removeFromCart(productId) {
  cart = cart.filter((item) => String(item.id) !== String(productId));
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

function setupEventListeners() {
  // Sidebar category filters
  document.querySelectorAll('.sidebar-filter').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.sidebar-filter').forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      activeCategory = this.getAttribute('data-category') || 'all';
      displayProducts();
    });
  });

  // Search
  const searchForm = document.getElementById('store-search-form');
  const searchInput = document.getElementById('store-search-input');

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      activeSearch = searchInput.value || '';
      displayProducts();
    });

    searchInput.addEventListener('input', function () {
      activeSearch = searchInput.value || '';
      displayProducts();
    });
  }
}

async function proceedToCheckout() {
  try {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await auth.createOrder(cart, total);
    
    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    alert(`Order placed successfully! Total: ETB ${total.toFixed(2)}`);
  } catch (error) {
    alert('Failed to place order. Please try again.');
  }
}