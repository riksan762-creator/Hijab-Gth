/* cart.js — cart mutation + cart page rendering */

const SHIPPING_FLAT = 15000;

function addToCart(productId, opts){
  opts = opts || {};
  const cart = getCart();
  const color = opts.color || null;
  const size = opts.size || null;
  const qty = opts.qty || 1;
  const existing = cart.find(i => i.id === productId && i.color === color && i.size === size);
  if(existing){
    existing.qty += qty;
  } else {
    cart.push({ id: productId, color, size, qty });
  }
  saveCart(cart);
  updateCartBadge();
  showToast('Ditambahkan ke keranjang ✓');
}

function removeFromCart(index){
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartPage();
  updateCartBadge();
}

function updateCartQty(index, delta){
  const cart = getCart();
  if(!cart[index]) return;
  cart[index].qty = Math.max(1, cart[index].qty + delta);
  saveCart(cart);
  renderCartPage();
  updateCartBadge();
}

function cartTotals(){
  const cart = getCart();
  let subtotal = 0;
  cart.forEach(item => {
    const p = getProduct(item.id);
    if(p) subtotal += p.price * item.qty;
  });
  const shipping = cart.length ? SHIPPING_FLAT : 0;
  return { subtotal, shipping, total: subtotal + shipping, count: cart.length };
}

function renderCartPage(){
  const wrap = document.getElementById('cart-items');
  const summaryWrap = document.getElementById('cart-summary');
  if(!wrap) return;
  const cart = getCart();

  if(cart.length === 0){
    wrap.innerHTML = `<div class="empty-state">
      <div class="icon">🧕</div>
      <h3 style="font-family:var(--font-display); font-size:20px; margin-bottom:8px;">Keranjang kamu masih kosong</h3>
      <p style="margin-bottom:20px;">Yuk mulai belanja koleksi hijab terbaru kami.</p>
      <a href="shop.html" class="btn btn-primary">Belanja Sekarang</a>
    </div>`;
    if(summaryWrap) summaryWrap.style.display = 'none';
    return;
  }

  if(summaryWrap) summaryWrap.style.display = 'block';

  wrap.innerHTML = cart.map((item, idx) => {
    const p = getProduct(item.id);
    if(!p) return '';
    return `<div class="cart-item">
      <img src="${productImage(p)}" alt="${p.name}">
      <div>
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-meta">${item.size || p.sizes[0]} ${item.color ? '· warna dipilih' : ''}</div>
        <div class="qty-control" style="margin-top:8px;">
          <button onclick="updateCartQty(${idx},-1)" aria-label="Kurangi">−</button>
          <span>${item.qty}</span>
          <button onclick="updateCartQty(${idx},1)" aria-label="Tambah">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <div class="price">${formatIDR(p.price * item.qty)}</div>
        <button class="cart-item-remove" onclick="removeFromCart(${idx})">Hapus</button>
      </div>
    </div>`;
  }).join('');

  const t = cartTotals();
  if(summaryWrap){
    summaryWrap.querySelector('.sum-subtotal').textContent = formatIDR(t.subtotal);
    summaryWrap.querySelector('.sum-shipping').textContent = formatIDR(t.shipping);
    summaryWrap.querySelector('.sum-total').textContent = formatIDR(t.total);
  }
}

document.addEventListener('DOMContentLoaded', renderCartPage);
