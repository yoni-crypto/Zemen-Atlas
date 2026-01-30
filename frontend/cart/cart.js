let cart = JSON.parse(localStorage.getItem('cart')) || [];

function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatCategoryLabel(category) {
  if (!category) return 'Product';
  if (category === 'shirts') return 'Shirt';
  if (category === 'hoodie') return 'Hoodie';
  return String(category).charAt(0).toUpperCase() + String(category).slice(1);
}

document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  displayCart();
  setupEventListeners();
  
  if (auth.isLoggedIn()) {
    const viewOrdersBtn = document.getElementById('view-orders-btn');
    if (viewOrdersBtn) {
      viewOrdersBtn.style.display = 'block';
    }
  }
});

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = count;
  }
}

function displayCart() {
  const cartItemsEl = document.getElementById('cart-items');
  const emptyCartEl = document.getElementById('empty-cart');
  const cartContent = document.querySelector('.cart-content');

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = 'none';
    if (emptyCartEl) emptyCartEl.style.display = 'block';
    return;
  }

  if (cartContent) cartContent.style.display = '';
  if (emptyCartEl) emptyCartEl.style.display = 'none';

  if (cartItemsEl) {
    cartItemsEl.innerHTML = cart.map(item => {
      const name = escapeHtml(item.name);
      const category = escapeHtml(formatCategoryLabel(item.category));
      const imageUrl = (item.image && item.image.trim()) ? item.image.trim() : 'https://via.placeholder.com/100?text=Product';
      const price = Number(item.price);
      const subtotal = (price * item.quantity).toFixed(2);
      const id = escapeHtml(String(item.id));
      return `
      <tr class="cart-item">
        <td class="col-product">
          <div class="cart-item-product">
            <div class="cart-item-image">
              <img src="${imageUrl}" alt="${name}" loading="lazy" />
            </div>
            <div class="cart-item-info">
              <div class="cart-item-name">${name}</div>
              <div class="cart-item-category">${category}</div>
            </div>
          </div>
        </td>
        <td class="col-price">ETB ${price.toFixed(2)}</td>
        <td class="col-qty">
          <div class="quantity-controls">
            <button class="quantity-btn" type="button" onclick="updateQuantity('${id}', -1)">−</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" type="button" onclick="updateQuantity('${id}', 1)">+</button>
          </div>
        </td>
        <td class="col-subtotal">ETB ${subtotal}</td>
        <td class="col-actions">
          <button class="remove-btn" type="button" onclick="removeFromCart('${id}')">Remove</button>
        </td>
      </tr>
    `;
    }).join('');
  }

  updateCartSummary();
}

function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal; 

  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = `ETB ${subtotal.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `ETB ${total.toFixed(2)}`;
}

function updateQuantity(productId, change) {
  const item = cart.find(item => String(item.id) === String(productId));
  if (!item) return;

  item.quantity += change;
  
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => String(item.id) !== String(productId));
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  displayCart();
}

function setupEventListeners() {
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      
      if (!auth.isLoggedIn()) {
        document.getElementById('auth-modal').classList.remove('hidden');
        return;
      }
      
      proceedToCheckout();
    });
  }

  const cartBtn = document.getElementById('cart-btn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

async function proceedToCheckout() {
  try {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await auth.createOrder(cart, total);
    
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    displayCart();
    
    alert(`Order placed successfully! Total: ETB ${total.toFixed(2)}`);
  } catch (error) {
    alert('Failed to place order. Please try again.');
  }
}