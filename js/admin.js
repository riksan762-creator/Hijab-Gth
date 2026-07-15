/* admin.js — password-protected admin panel */

function isAdminLoggedIn(){ return sessionStorage.getItem(STORE.session) === 'true'; }

function adminLogin(e){
  e.preventDefault();
  const input = document.getElementById('admin-pass').value;
  const saved = JSON.parse(localStorage.getItem(STORE.admin) || '{}');
  const errorEl = document.getElementById('login-error');
  if(input === saved.pass){
    sessionStorage.setItem(STORE.session, 'true');
    showAdminPanel();
  } else {
    errorEl.textContent = 'Password salah. Coba lagi.';
    errorEl.style.display = 'block';
  }
}

function adminLogout(){
  sessionStorage.removeItem(STORE.session);
  location.reload();
}

function showAdminPanel(){
  document.getElementById('admin-login-view').style.display = 'none';
  document.getElementById('admin-panel-view').style.display = 'block';
  renderAdminStats();
  renderAdminProducts();
  renderAdminOrders();
}

/* ---------- Dashboard stats ---------- */
function renderAdminStats(){
  const products = getProducts();
  const orders = getOrders();
  const revenue = orders.reduce((s,o) => s + o.total, 0);
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 8).length;

  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-revenue').textContent = formatIDR(revenue);
  document.getElementById('stat-lowstock').textContent = lowStock;
}

/* ---------- Product management ---------- */
function renderAdminProducts(){
  const tbody = document.getElementById('admin-product-list');
  if(!tbody) return;
  const products = getProducts();
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${productImage(p)}" alt="${p.name}" class="admin-thumb"></td>
      <td>
        <div style="font-weight:700">${p.name}</div>
        <div style="font-size:12px;color:var(--ink-soft)">${p.category}</div>
      </td>
      <td class="price">${formatIDR(p.price)}</td>
      <td>${p.stock === 0 ? '<span class="badge-out">Habis</span>' : p.stock}</td>
      <td>
        <button class="mini-btn" onclick="openProductForm('${p.id}')">Edit</button>
        <button class="mini-btn danger" onclick="deleteProduct('${p.id}')">Hapus</button>
      </td>
    </tr>
  `).join('');
}

let currentPhotoDataUrls = [];

function openProductForm(id){
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  form.reset();
  currentPhotoDataUrls = [];
  document.getElementById('photo-preview-list').innerHTML = '';

  if(id){
    const p = getProduct(id);
    form.elements['id'].value = p.id;
    form.elements['name'].value = p.name;
    form.elements['category'].value = p.category;
    form.elements['price'].value = p.price;
    form.elements['stock'].value = p.stock;
    form.elements['material'].value = p.material;
    form.elements['sizes'].value = p.sizes.join(', ');
    form.elements['colors'].value = p.colors.join(', ');
    form.elements['desc'].value = p.desc;
    currentPhotoDataUrls = p.images ? [...p.images] : [];
    renderPhotoPreview();
    document.getElementById('modal-title').textContent = 'Edit Produk';
  } else {
    form.elements['id'].value = '';
    document.getElementById('modal-title').textContent = 'Tambah Produk Baru';
  }
  modal.classList.add('open');
}

function closeProductForm(){
  document.getElementById('product-modal').classList.remove('open');
}

function handlePhotoUpload(input){
  const files = Array.from(input.files || []);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      currentPhotoDataUrls.push(reader.result);
      renderPhotoPreview();
    };
    reader.readAsDataURL(file);
  });
  input.value = '';
}

function renderPhotoPreview(){
  const wrap = document.getElementById('photo-preview-list');
  wrap.innerHTML = currentPhotoDataUrls.map((src, i) => `
    <div class="photo-thumb">
      <img src="${src}">
      <button type="button" onclick="removePhoto(${i})">×</button>
    </div>
  `).join('') || '<p style="font-size:12.5px;color:var(--ink-soft)">Belum ada foto diunggah. Tanpa foto, produk akan memakai gambar bawaan.</p>';
}
function removePhoto(i){
  currentPhotoDataUrls.splice(i,1);
  renderPhotoPreview();
}

function saveProductForm(e){
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const id = fd.get('id') || 'hb-' + Date.now().toString(36);
  const products = getProducts();
  const existingIndex = products.findIndex(p => p.id === id);

  const product = {
    id,
    name: fd.get('name').trim(),
    category: fd.get('category').trim(),
    price: Number(fd.get('price')),
    stock: Number(fd.get('stock')),
    material: fd.get('material').trim(),
    sizes: fd.get('sizes').split(',').map(s => s.trim()).filter(Boolean),
    colors: fd.get('colors').split(',').map(s => s.trim()).filter(Boolean),
    desc: fd.get('desc').trim(),
    images: currentPhotoDataUrls
  };

  if(existingIndex >= 0) products[existingIndex] = product;
  else products.push(product);

  saveProducts(products);
  closeProductForm();
  renderAdminProducts();
  renderAdminStats();
  showToast('Produk tersimpan ✓');
}

function deleteProduct(id){
  if(!confirm('Hapus produk ini? Tindakan tidak bisa dibatalkan.')) return;
  saveProducts(getProducts().filter(p => p.id !== id));
  renderAdminProducts();
  renderAdminStats();
  showToast('Produk dihapus');
}

/* ---------- Orders ---------- */
function renderAdminOrders(){
  const tbody = document.getElementById('admin-order-list');
  if(!tbody) return;
  const orders = getOrders();
  tbody.innerHTML = orders.length ? orders.map(o => `
    <tr>
      <td class="price">${o.id}</td>
      <td>${o.customer.name}<div style="font-size:12px;color:var(--ink-soft)">${o.customer.phone}</div></td>
      <td>${o.items.reduce((s,i)=>s+i.qty,0)} item</td>
      <td class="price">${formatIDR(o.total)}</td>
      <td>
        <select onchange="updateOrderStatus('${o.id}', this.value)">
          ${['Menunggu Pembayaran','Diproses','Dikirim','Selesai','Dibatalkan'].map(s =>
            `<option ${s===o.status?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" style="color:var(--ink-soft); padding:20px;">Belum ada pesanan masuk.</td></tr>';
}

function updateOrderStatus(id, status){
  const orders = getOrders();
  const o = orders.find(x => x.id === id);
  if(o){ o.status = status; saveOrders(orders); showToast('Status pesanan diperbarui'); }
}

/* ---------- Settings ---------- */
function changeAdminPassword(e){
  e.preventDefault();
  const newPass = document.getElementById('new-pass').value.trim();
  if(newPass.length < 4){ showToast('Password minimal 4 karakter'); return; }
  localStorage.setItem(STORE.admin, JSON.stringify({ pass:newPass }));
  showToast('Password admin diperbarui ✓');
  e.target.reset();
}

document.addEventListener('DOMContentLoaded', () => {
  if(!document.getElementById('admin-login-view')) return;
  if(isAdminLoggedIn()) showAdminPanel();
});
