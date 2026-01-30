document.addEventListener('DOMContentLoaded', function() {
  if (!auth.isLoggedIn()) {
    window.location.href = '../store/';
    return;
  }

  updateUserAvatar();
  loadOrders();
});

function updateUserAvatar() {
  const avatar = document.getElementById('user-avatar');
  const user = auth.getUser();
  if (avatar && user) {
    avatar.textContent = user.name.charAt(0).toUpperCase();
  }
}

async function loadOrders() {
  const container = document.getElementById('orders-list');
  const emptyOrders = document.getElementById('empty-orders');
  const ordersContent = document.querySelector('.orders-content');
  
  try {
    const orders = await auth.getOrders();
    
    if (orders.length === 0) {
      if (ordersContent) ordersContent.style.display = 'none';
      if (emptyOrders) emptyOrders.style.display = 'block';
      return;
    }

    if (ordersContent) ordersContent.style.display = '';
    if (emptyOrders) emptyOrders.style.display = 'none';

    container.innerHTML = orders.map(order => `
      <tr class="order-row">
        <td class="col-order">
          <div class="order-id">Order #${order._id.slice(-8)}</div>
        </td>
        <td class="col-date">
          <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
        </td>
        <td class="col-items">
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                <span class="order-item-name">${item.name}</span>
                <span class="order-item-qty">x${item.quantity}</span>
              </div>
            `).join('')}
          </div>
        </td>
        <td class="col-total">
          <div class="order-total">ETB ${order.total.toFixed(2)}</div>
        </td>
        <td class="col-status">
          <span class="order-status">${order.status}</span>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    if (ordersContent) ordersContent.style.display = 'none';
    if (emptyOrders) {
      emptyOrders.style.display = 'block';
      emptyOrders.innerHTML = '<h2>Failed to load orders</h2><p>Please try again later</p>';
    }
  }
}