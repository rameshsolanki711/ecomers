// Frontend logic for ShopLite
const API_BASE = 'http://localhost:4000/api';

// Ensure a persistent cartId in localStorage
function ensureCartId() {
  let id = localStorage.getItem('cartId');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem('cartId', id);
  }
  return id;
}
const CART_ID = ensureCartId();

function headers() {
  return {
    'Content-Type': 'application/json',
    'X-Cart-Id': CART_ID
  };
}

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(n);
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

async function loadProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const search = document.getElementById('search').value.trim();
  const category = document.getElementById('category').value;
  const sortSel = document.getElementById('sort').value;
  const [sort, order] = sortSel.split('_');

  const params = new URLSearchParams({ sort, order, limit: 100 });
  if (search) params.set('search', search);
  if (category) params.set('category', category);

  const data = await fetchJSON(`${API_BASE}/products?${params.toString()}`);
  grid.innerHTML = '';

  data.items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${p.title}"/>
      <h3>${p.title}</h3>
      <p>${p.description?.slice(0, 80) || ''}</p>
      <div class="price">₹ ${formatINR(p.price)}</div>
      <div class="actions">
        <button class="btn primary" data-id="${p._id}">Add to Cart</button>
        <button class="btn secondary" data-id="${p._id}" data-view="1">View</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;

    if (e.target.getAttribute('data-view')) {
      // Could open a modal; for simplicity just alert
      const prod = await fetchJSON(`${API_BASE}/products/${id}`);
      alert(`${prod.title}\n\n${prod.description}\n\n₹ ${formatINR(prod.price)}`);
      return;
    }

    if (e.target.matches('button')) {
      await fetchJSON(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ productId: id, qty: 1 })
      });
      await refreshCartCount();
    }
  }, { once: true });
}

async function refreshCartCount() {
  const span = document.getElementById('cartCount');
  if (!span) return;
  const cart = await fetchJSON(`${API_BASE}/cart`, { headers: headers() });
  const count = cart.items.reduce((sum, i) => sum + i.qty, 0);
  span.textContent = count;
}

async function loadCart() {
  const list = document.getElementById('cartItems');
  if (!list) return;

  const cart = await fetchJSON(`${API_BASE}/cart`, { headers: headers() });
  list.innerHTML = '';

  let subtotal = 0;
  cart.items.forEach(i => {
    const p = i.product;
    subtotal += p.price * i.qty;
    const node = document.createElement('div');
    node.className = 'cart-item';
    node.innerHTML = `
      <img src="${p.image || 'https://via.placeholder.com/80'}" alt="${p.title}"/>
      <div>
        <h4>${p.title}</h4>
        <div class="muted">₹ ${formatINR(p.price)} × 
          <input type="number" min="1" value="${i.qty}" data-id="${p._id}" style="width:64px; padding:6px; border-radius:8px; border:1px solid #2a3566; background:#0f1733; color:#fff;">
        </div>
      </div>
      <div class="row">
        <button class="btn secondary" data-id="${p._id}" data-update="1">Update</button>
        <button class="btn danger" data-id="${p._id}" data-remove="1">Remove</button>
      </div>
    `;
    list.appendChild(node);
  });

  const delivery = subtotal > 0 ? 49 : 0;
  const total = subtotal + delivery;
  document.getElementById('subtotal').textContent = formatINR(subtotal);
  document.getElementById('delivery').textContent = formatINR(delivery);
  document.getElementById('total').textContent = formatINR(total);

  list.addEventListener('click', async (e) => {
    const id = e.target.getAttribute('data-id');
    if (!id) return;
    if (e.target.getAttribute('data-remove')) {
      await fetchJSON(`${API_BASE}/cart/${id}`, { method: 'DELETE', headers: headers() });
      await loadCart();
      await refreshCartCount();
    }
    if (e.target.getAttribute('data-update')) {
      const input = list.querySelector(`input[data-id="${id}"]`);
      const qty = Number(input.value || 1);
      await fetchJSON(`${API_BASE}/cart/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify({ qty }) });
      await loadCart();
      await refreshCartCount();
    }
  }, { once: true });
}

// Clear & Place order buttons
async function wireActions() {
  const clearBtn = document.getElementById('clearCart');
  if (clearBtn) {
    clearBtn.onclick = async () => {
      await fetchJSON(`${API_BASE}/cart`, { method: 'DELETE', headers: headers() });
      await loadCart();
      await refreshCartCount();
    };
  }

  const placeBtn = document.getElementById('placeOrder');
  if (placeBtn) {
    placeBtn.onclick = async () => {
      alert('Order placed (demo)! Payment gateway not implemented.');
    };
  }

  const apply = document.getElementById('applyFilters');
  if (apply) {
    apply.onclick = () => loadProducts();
  }

  document.getElementById('year').textContent = new Date().getFullYear();
}

// Initialize
(async function init() {
  await wireActions();
  await refreshCartCount();
  await loadProducts();
  await loadCart();
})();
