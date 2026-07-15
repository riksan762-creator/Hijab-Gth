/* product.js — product detail page */

let pdState = { product:null, color:null, size:null, qty:1, imgIndex:0 };

function renderProductDetail(){
  const root = document.getElementById('pd-root');
  if(!root) return;
  const id = new URLSearchParams(location.search).get('id');
  const p = getProduct(id);

  if(!p){
    root.innerHTML = `<div class="empty-state"><div class="icon">🔍</div>
      <h3 style="font-family:var(--font-display); font-size:20px;">Produk tidak ditemukan</h3>
      <a href="shop.html" class="btn btn-primary" style="margin-top:16px;">Kembali ke Toko</a></div>`;
    return;
  }

  pdState.product = p;
  pdState.color = p.colors[0];
  pdState.size = p.sizes[0];

  document.title = p.name + ' — Hijab AR';

  const images = (p.images && p.images.length ? p.images : [productImage(p)]);
  root.innerHTML = `
    <div>
      <div class="pd-gallery-main"><img id="pd-main-img" src="${images[0]}" alt="${p.name}"></div>
      <div class="pd-thumbs">
        ${images.map((src,i) => `<img src="${src}" class="${i===0?'active':''}" onclick="pdSwitchImage(${i})">`).join('')}
      </div>
    </div>
    <div class="pd-info">
      <div class="eyebrow">${p.category}</div>
      <h1>${p.name}</h1>
      <div class="pd-price price">${formatIDR(p.price)}</div>
      <p class="pd-desc">${p.desc}</p>

      <div class="pd-row">
        <div>
          <div class="field" style="margin-bottom:0;"><label>Warna</label>
            <div class="swatches">
              ${p.colors.map((c,i) => `<span class="swatch ${i===0?'active':''}" style="background:${c}" onclick="pdSetColor('${c}', this)"></span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="pd-row">
        <div class="field" style="margin-bottom:0;"><label>Ukuran</label>
          <select id="pd-size">${p.sizes.map(s => `<option value="${s}">${s}</option>`).join('')}</select>
        </div>
        <div class="field" style="margin-bottom:0;"><label>Jumlah</label>
          <div class="qty-control">
            <button onclick="pdChangeQty(-1)">−</button><span id="pd-qty">1</span><button onclick="pdChangeQty(1)">+</button>
          </div>
        </div>
      </div>

      <div class="pd-actions">
        <button class="btn btn-primary" onclick="pdAddToCart()" ${p.stock===0?'disabled':''}>
          ${p.stock===0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
        </button>
        <button class="btn btn-outline" onclick="document.getElementById('ar-panel').scrollIntoView({behavior:'smooth'})">Coba AR ✨</button>
      </div>

      <div class="pd-meta">
        <div><strong>Bahan:</strong> ${p.material}</div>
        <div><strong>Stok:</strong> ${p.stock > 0 ? p.stock + ' tersedia' : 'Habis, akan segera restock'}</div>
      </div>
    </div>
  `;

  arSetOverlay(images[0]);

  // related products
  const related = document.getElementById('related-grid');
  if(related){
    const others = getProducts().filter(x => x.id !== p.id && x.category === p.category).slice(0,4);
    related.innerHTML = others.map(productCardHTML).join('') || getProducts().filter(x=>x.id!==p.id).slice(0,4).map(productCardHTML).join('');
  }
}

function pdSwitchImage(i){
  const p = pdState.product;
  const images = (p.images && p.images.length ? p.images : [productImage(p)]);
  document.getElementById('pd-main-img').src = images[i];
  document.querySelectorAll('.pd-thumbs img').forEach((el,idx) => el.classList.toggle('active', idx===i));
  arSetOverlay(images[i]);
}
function pdSetColor(c, el){
  pdState.color = c;
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}
function pdChangeQty(d){
  pdState.qty = Math.max(1, pdState.qty + d);
  document.getElementById('pd-qty').textContent = pdState.qty;
}
function pdAddToCart(){
  const size = document.getElementById('pd-size').value;
  addToCart(pdState.product.id, { color: pdState.color, size, qty: pdState.qty });
}

document.addEventListener('DOMContentLoaded', renderProductDetail);
