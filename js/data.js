/* =========================================================
   data.js — single source of truth for storage + seed data
   Storage model (all in localStorage, no backend required):
     hs_products  -> array of product objects
     hs_cart      -> array of {id, size, color, qty}
     hs_orders    -> array of order objects
     hs_admin     -> {passHash}
   ========================================================= */

const STORE = {
  products: 'hs_products',
  cart: 'hs_cart',
  orders: 'hs_orders',
  admin: 'hs_admin',
  session: 'hs_admin_session',
  heroImage: 'hs_hero_image'
};

/** Generate a soft gradient placeholder photo (SVG data URI) so the
 *  catalog looks complete even before an admin uploads real photos. */
function placeholderPhoto(seed, label){
  const palettes = [
    ['#D8CBA8', '#8F3A38'], ['#C9A661', '#5E7A5C'], ['#B58C56', '#20261F'],
    ['#E3D3B8', '#9C7A3C'], ['#D6B9A0', '#4A5245'], ['#CBB994', '#8F3A38']
  ];
  const [a, b] = palettes[seed % palettes.length];
  const initials = (label || 'HB').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='620'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>
    </linearGradient></defs>
    <rect width='480' height='620' fill='url(#g)'/>
    <path d='M0 480 Q120 430 240 480 T480 480 V620 H0 Z' fill='rgba(0,0,0,0.08)'/>
    <path d='M0 520 Q120 470 240 520 T480 520 V620 H0 Z' fill='rgba(0,0,0,0.10)'/>
    <text x='50%' y='52%' font-family='Georgia, serif' font-size='64' fill='rgba(255,255,255,0.55)'
      text-anchor='middle' dominant-baseline='middle'>${initials}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const SEED_PRODUCTS = [
  { id:'hb-001', name:'Bergo Almira', category:'Bergo', price:89000, stock:24,
    colors:['#8F3A38','#20261F','#9C7A3C'], sizes:['All Size'],
    desc:'Bergo instan dua lapis dengan jatuh kain lembut, cocok untuk pemakaian harian maupun kerja.',
    material:'Woolpeach premium', images:[] },
  { id:'hb-002', name:'Pashmina Zahra', category:'Pashmina', price:65000, stock:40,
    colors:['#C9A661','#5E7A5C','#B5615E'], sizes:['170x70 cm'],
    desc:'Pashmina ceruti tebal anti-terawang dengan tekstur bertekstur elegan, mudah dibentuk.',
    material:'Ceruti premium', images:[] },
  { id:'hb-003', name:'Segi Empat Kaila', category:'Segi Empat', price:55000, stock:8,
    colors:['#20261F','#8F3A38'], sizes:['110x110 cm'],
    desc:'Segi empat voal adem dengan motif polos minimalis, ringan untuk cuaca panas.',
    material:'Voal Premium', images:[] },
  { id:'hb-004', name:'Bergo Rania Sport', category:'Bergo', price:75000, stock:30,
    colors:['#5E7A5C','#4A5245','#20261F'], sizes:['All Size'],
    desc:'Bergo olahraga anti slip dengan bahan menyerap keringat, ideal untuk aktivitas aktif.',
    material:'Scuba Premium', images:[] },
  { id:'hb-005', name:'Pashmina Diamond Aisyah', category:'Pashmina', price:98000, stock:5,
    colors:['#9C7A3C','#8F3A38'], sizes:['180x75 cm'],
    desc:'Pashmina diamond italiano dengan jatuhan mewah, favorit untuk acara formal.',
    material:'Diamond Italiano', images:[] },
  { id:'hb-006', name:'Segi Empat Nadhira Motif', category:'Segi Empat', price:62000, stock:18,
    colors:['#B58C56','#8F3A38','#5E7A5C'], sizes:['115x115 cm'],
    desc:'Motif bordir tepi halus dengan kombinasi warna earthy, cocok dipadukan casual.',
    material:'Voal Bordir', images:[] },
  { id:'hb-007', name:'Bergo Maryam Two Tone', category:'Bergo', price:82000, stock:0,
    colors:['#20261F','#C9A661'], sizes:['All Size'],
    desc:'Bergo dua warna dengan potongan modern, tampil beda dari bergo polos biasa.',
    material:'Jersey Premium', images:[] },
  { id:'hb-008', name:'Pashmina Instan Salsabila', category:'Pashmina', price:71000, stock:14,
    colors:['#8F3A38','#20261F','#9C7A3C','#5E7A5C'], sizes:['All Size'],
    desc:'Pashmina instan sekali pakai tanpa peniti, praktis untuk yang baru belajar hijab.',
    material:'Jersey Korea', images:[] },
];

function seedIfEmpty(){
  if(!localStorage.getItem(STORE.products)){
    localStorage.setItem(STORE.products, JSON.stringify(SEED_PRODUCTS));
  }
  if(!localStorage.getItem(STORE.cart)){
    localStorage.setItem(STORE.cart, JSON.stringify([]));
  }
  if(!localStorage.getItem(STORE.orders)){
    localStorage.setItem(STORE.orders, JSON.stringify([]));
  }
  if(!localStorage.getItem(STORE.admin)){
    // default admin password: hijab2026  (changeable inside admin panel)
    localStorage.setItem(STORE.admin, JSON.stringify({ pass:'hijab2026' }));
  }
}
seedIfEmpty();

function getProducts(){ return JSON.parse(localStorage.getItem(STORE.products) || '[]'); }
function saveProducts(list){ localStorage.setItem(STORE.products, JSON.stringify(list)); }
function getProduct(id){ return getProducts().find(p => p.id === id); }

function getCart(){ return JSON.parse(localStorage.getItem(STORE.cart) || '[]'); }
function saveCart(cart){ localStorage.setItem(STORE.cart, JSON.stringify(cart)); }

function getOrders(){ return JSON.parse(localStorage.getItem(STORE.orders) || '[]'); }
function saveOrders(list){ localStorage.setItem(STORE.orders, JSON.stringify(list)); }

function formatIDR(n){
  return 'Rp' + Number(n).toLocaleString('id-ID');
}

function productImage(p, index){
  index = index || 0;
  if(p.images && p.images[index]) return p.images[index];
  return placeholderPhoto(p.id.charCodeAt(p.id.length-1) + index, p.name);
}

function getHeroImage(){ return localStorage.getItem(STORE.heroImage) || ''; }
function saveHeroImage(dataUrl){ localStorage.setItem(STORE.heroImage, dataUrl); }
function resetHeroImage(){ localStorage.removeItem(STORE.heroImage); }
