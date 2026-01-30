let product = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatCategoryLabel(category) {
  if (!category) return 'Product';
  if (category === 'shirts') return 'Shirt';
  if (category === 'hoodie') return 'Hoodie';
  return category.charAt(0).toUpperCase() + category.slice(1);
}

async function loadProduct() {
  const id = getQueryParam('id');
  const container = document.getElementById('product-detail');

  if (!id) {
    if (container) {
      container.innerHTML = '<div class="product-error">Product not found. <a href="./">Back to store</a></div>';
    }
    return;
  }

  try {
    const res = await fetch('http://localhost:5000/api/products');
    const all = await res.json();
    product = all.find((p) => String(p.id) === String(id));

    if (!product) {
      if (container) {
        container.innerHTML = '<div class="product-error">Product not found. <a href="./">Back to store</a></div>';
      }
      return;
    }

    renderProductDetail();
    updateCartCount();
    setupCartEvents();
  } catch (err) {
    console.error(err);
    if (container) {
      container.innerHTML = '<div class="product-error">Could not load product. <a href="./">Back to store</a></div>';
    }
  }
}

function renderProductDetail() {
  const container = document.getElementById('product-detail');
  if (!container || !product) return;

  container.innerHTML = `
    <div class="product-detail-layout">
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy" />
      </div>
      <div class="product-detail-info">
        <p class="product-detail-category">${formatCategoryLabel(product.category)}</p>
        <h1 class="product-detail-name">${product.name}</h1>
        <p class="product-detail-price">$${Number(product.price).toFixed(2)}</p>
        <p class="product-detail-description">
          ${product.description}
        </p>
        <div class="product-detail-actions">
          <button class="btn-outline" type="button" id="detail-add-to-cart">Add to cart</button>
          <button class="btn-primary" type="button" id="detail-buy-now">Buy now</button>
        </div>
      </div>
    </div>
  `;
}

function addToCartFromDetail() {
  if (!product) return;

  const existingItem = cart.find((item) => String(item.id) === String(product.id));

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

function buyNowFromDetail() {
  addToCartFromDetail();
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.classList.remove('hidden');
    displayCart();
  }
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const el = document.getElementById('cart-count');
  if (el) {
    el.textContent = count;
  }
}

function displayCart() {
  const cartItems = document.getElementById('cart-items');

  if (!cartItems) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.textContent = '0.00';
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price} x ${item.quantity}</div>
      </div>
      <button class="remove-btn" onclick="removeFromCart('${item.id}')">
        Remove
      </button>
    </div>
  `
    )
    .join('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = total.toFixed(2);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => String(item.id) !== String(productId));
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

function setupCartEvents() {
  const addBtn = document.getElementById('detail-add-to-cart');
  const buyBtn = document.getElementById('detail-buy-now');
  const cartBtn = document.getElementById('cart-btn');
  const cartModal = document.getElementById('cart-modal');
  const closeCart = document.getElementById('close-cart');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (addBtn) addBtn.addEventListener('click', addToCartFromDetail);
  if (buyBtn) buyBtn.addEventListener('click', buyNowFromDetail);

  if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', function () {
      cartModal.classList.remove('hidden');
      displayCart();
    });
  }

  if (closeCart && cartModal) {
    closeCart.addEventListener('click', function () {
      cartModal.classList.add('hidden');
    });
  }

  if (cartModal) {
    cartModal.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.add('hidden');
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      alert(`Redirecting to PayPal for payment of $${total.toFixed(2)}`);
    });
  }
}

document.addEventListener('DOMContentLoaded', loadProduct);

