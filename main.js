/* main.js — runs on every storefront page */

function updateCartBadge(){
  const badge = document.querySelector('.cart-count');
  if(!badge) return;
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function showToast(msg){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
}

function initNav(){
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle && links){
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  updateCartBadge();
});
