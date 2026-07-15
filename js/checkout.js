/* checkout.js — order placement */

function renderCheckoutSummary(){
  const box = document.getElementById('checkout-summary');
  if(!box) return;
  const cart = getCart();
  if(cart.length === 0){
    location.href = 'cart.html';
    return;
  }
  const t = cartTotals();
  box.innerHTML = `
    ${cart.map(item => {
      const p = getProduct(item.id);
      if(!p) return '';
      return `<div class="summary-row"><span>${p.name} × ${item.qty}</span><span>${formatIDR(p.price*item.qty)}</span></div>`;
    }).join('')}
    <div class="summary-row"><span>Subtotal</span><span>${formatIDR(t.subtotal)}</span></div>
    <div class="summary-row"><span>Ongkir</span><span>${formatIDR(t.shipping)}</span></div>
    <div class="summary-row total"><span>Total</span><span>${formatIDR(t.total)}</span></div>
  `;
}

function selectPayment(value, el){
  document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('checked'));
  el.classList.add('checked');
  document.getElementById('payment-method').value = value;
}

function placeOrder(e){
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  const cart = getCart();
  if(cart.length === 0) return;

  const t = cartTotals();
  const order = {
    id: 'ORD-' + Date.now().toString(36).toUpperCase(),
    date: new Date().toISOString(),
    customer: { name:data.name, phone:data.phone, address:data.address, city:data.city, postal:data.postal },
    payment: data.payment || 'Transfer Bank',
    items: cart.map(item => {
      const p = getProduct(item.id);
      return { id:item.id, name:p ? p.name : item.id, qty:item.qty, price:p ? p.price : 0, color:item.color, size:item.size };
    }),
    subtotal: t.subtotal, shipping: t.shipping, total: t.total,
    status: 'Menunggu Pembayaran'
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  // decrement stock
  const products = getProducts();
  order.items.forEach(it => {
    const p = products.find(x => x.id === it.id);
    if(p) p.stock = Math.max(0, p.stock - it.qty);
  });
  saveProducts(products);

  saveCart([]);
  updateCartBadge();

  document.getElementById('checkout-form-view').style.display = 'none';
  const successView = document.getElementById('order-success-view');
  successView.style.display = 'block';
  successView.querySelector('.order-id').textContent = order.id;
  successView.querySelector('.order-total').textContent = formatIDR(order.total);
}

document.addEventListener('DOMContentLoaded', renderCheckoutSummary);
