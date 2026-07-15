/* shop.js — catalog listing + filtering */

function productCardHTML(p){
  const outOfStock = p.stock === 0;
  return `<a href="product.html?id=${p.id}" class="product-card">
    <div class="product-media">
      <img src="${productImage(p)}" alt="${p.name}" loading="lazy">
      <div class="fold-corner"></div>
      ${outOfStock ? '<div class="stock-tag low">Stok Habis</div>' : (p.stock <= 8 ? `<div class="stock-tag low">Sisa ${p.stock}</div>` : '')}
    </div>
    <div class="product-info">
      <div class="product-cat">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-bottom">
        <div class="product-price price">${formatIDR(p.price)}</div>
        <button class="add-btn" title="Tambah ke keranjang" onclick="event.preventDefault(); addToCart('${p.id}',{size:'${p.sizes[0]}'});">+</button>
      </div>
    </div>
  </a>`;
}

function renderShop(){
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  const products = getProducts();
  const params = new URLSearchParams(location.search);
  const activeCat = params.get('cat') || 'Semua';

  const cats = ['Semua', ...new Set(products.map(p => p.category))];
  const filterBar = document.getElementById('filter-bar');
  if(filterBar){
    filterBar.innerHTML = cats.map(c =>
      `<a href="shop.html${c === 'Semua' ? '' : '?cat=' + encodeURIComponent(c)}"
         class="filter-chip ${c === activeCat ? 'active' : ''}">${c}</a>`
    ).join('');
  }

  const list = activeCat === 'Semua' ? products : products.filter(p => p.category === activeCat);
  grid.innerHTML = list.length
    ? list.map(productCardHTML).join('')
    : '<p style="color:var(--ink-soft)">Belum ada produk di kategori ini.</p>';
}

document.addEventListener('DOMContentLoaded', renderShop);
