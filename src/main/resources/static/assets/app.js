(() => {
  'use strict';

  const SETTINGS_KEY = 'nova-preferences-v1';
  const CART_KEY = 'nova-cart-v1';
  const defaults = Object.freeze({ theme: 'dark', accent: '#00e5ff', accentSecondary: '#8b5cf6', fontSize: 16, radius: 16, density: 'comfortable', columns: 3, animationSpeed: 1, threeD: 65, particles: true, reducedMotion: false });
  const root = document.documentElement;
  const state = { settings: loadSettings(), cart: loadCart(), products: [] };
  let searchTimer, toastTimer;

  function validHex(value) { return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value); }
  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (!saved || typeof saved !== 'object') return { ...defaults };
      return sanitizeSettings({ ...defaults, ...saved });
    } catch { return { ...defaults }; }
  }
  function sanitizeSettings(value) {
    return {
      theme: ['dark', 'light', 'system'].includes(value.theme) ? value.theme : defaults.theme,
      accent: validHex(value.accent) ? value.accent : defaults.accent,
      accentSecondary: validHex(value.accentSecondary) ? value.accentSecondary : defaults.accentSecondary,
      fontSize: clampNumber(value.fontSize, 14, 20, defaults.fontSize), radius: clampNumber(value.radius, 4, 28, defaults.radius),
      density: ['comfortable', 'compact'].includes(value.density) ? value.density : defaults.density,
      columns: clampNumber(value.columns, 2, 5, defaults.columns), animationSpeed: clampNumber(value.animationSpeed, 0, 2, defaults.animationSpeed),
      threeD: clampNumber(value.threeD, 0, 100, defaults.threeD), particles: Boolean(value.particles), reducedMotion: Boolean(value.reducedMotion)
    };
  }
  function clampNumber(value, min, max, fallback) { const number = Number(value); return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback; }
  function loadCart() { try { const parsed = JSON.parse(localStorage.getItem(CART_KEY)); return Array.isArray(parsed) ? parsed.filter(item => item && Number.isInteger(item.id) && item.quantity > 0) : []; } catch { return []; } }
  function persistSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings)); }
  function persistCart() { localStorage.setItem(CART_KEY, JSON.stringify(state.cart)); }
  function effectiveTheme(theme) { return theme === 'system' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : theme; }
  function applySettings() {
    const s = state.settings, theme = effectiveTheme(s.theme);
    root.dataset.theme = theme;
    const speed = Math.max(s.animationSpeed, 0.1);
    root.style.setProperty('--accent', s.accent); root.style.setProperty('--accent-2', s.accentSecondary); root.style.setProperty('--base', `${s.fontSize}px`); root.style.setProperty('--radius', `${s.radius}px`); root.style.setProperty('--columns', s.columns); root.style.setProperty('--mobile-columns', Math.min(2, s.columns)); root.style.setProperty('--motion', s.reducedMotion ? 0 : s.animationSpeed); root.style.setProperty('--depth', s.threeD); root.style.setProperty('--particle-duration', `${12 / speed}s`); root.style.setProperty('--orb-duration', `${14 / speed}s`); root.style.setProperty('--orbit-duration', `${10 / speed}s`);
    root.style.colorScheme = theme;
    if (theme === 'light') { root.style.setProperty('--bg', '#f6f8fc'); root.style.setProperty('--surface', '#ffffff'); root.style.setProperty('--surface-2', '#e9eef8'); root.style.setProperty('--text', '#102038'); root.style.setProperty('--muted', '#53657f'); root.style.setProperty('--shadow', '0 20px 50px rgba(25,45,80,.16)'); }
    else { root.style.setProperty('--bg', '#070b14'); root.style.setProperty('--surface', '#101827'); root.style.setProperty('--surface-2', '#151f32'); root.style.setProperty('--text', '#f8fafc'); root.style.setProperty('--muted', '#9aa8bc'); root.style.setProperty('--shadow', '0 20px 50px rgba(0,0,0,.28)'); }
    document.body.classList.toggle('compact', s.density === 'compact'); document.body.classList.toggle('no-particles', !s.particles); document.body.classList.toggle('reduced-motion', s.reducedMotion); document.body.classList.toggle('animation-off', s.animationSpeed === 0);
    syncSettingsForm();
  }
  function syncSettingsForm() {
    document.querySelectorAll('[data-setting]').forEach(control => { const key = control.dataset.setting; if (control.type === 'checkbox') control.checked = state.settings[key]; else control.value = state.settings[key]; });
    document.querySelectorAll('[data-output]').forEach(output => { const key = output.dataset.output, value = state.settings[key]; output.textContent = key === 'fontSize' ? `${value}px` : key === 'radius' ? `${value}px` : key === 'columns' ? String(value) : key === 'animationSpeed' ? (value === 0 ? 'Off' : `${value}×`) : `${value}%`; });
  }
  function updateSetting(control) { const key = control.dataset.setting; let value = control.type === 'checkbox' ? control.checked : control.value; if (['fontSize', 'radius', 'columns', 'animationSpeed', 'threeD'].includes(key)) value = Number(value); state.settings = sanitizeSettings({ ...state.settings, [key]: value }); persistSettings(); applySettings(); }

  function openDrawer(id) { document.querySelectorAll('.drawer').forEach(drawer => { drawer.classList.toggle('open', drawer.id === id); drawer.setAttribute('aria-hidden', String(drawer.id !== id)); }); document.getElementById('scrim').hidden = false; document.querySelector(`#${id} button`)?.focus(); }
  function closeDrawers() { document.querySelectorAll('.drawer').forEach(drawer => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }); document.getElementById('scrim').hidden = true; }
  function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400); }
  function currency(value) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }
  function escapeHtml(value) { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; }

  async function loadProducts() {
    const q = document.getElementById('search').value.trim(), category = document.getElementById('category').value, minPrice = document.getElementById('min-price').value, maxPrice = document.getElementById('max-price').value, inStock = document.getElementById('in-stock').checked, sort = document.getElementById('sort').value;
    const params = new URLSearchParams({ size: '24', sort }); if (q) params.set('q', q); if (category) params.set('category', category); if (minPrice) params.set('minPrice', minPrice); if (maxPrice) params.set('maxPrice', maxPrice); if (inStock) params.set('inStock', 'true');
    const host = document.getElementById('products'), empty = document.getElementById('empty-state'); host.setAttribute('aria-busy', 'true');
    try { const response = await fetch(`/api/products?${params}`); if (!response.ok) throw new Error('catalog unavailable'); const page = await response.json(); state.products = page.content || []; renderProducts(); document.getElementById('result-count').textContent = `${page.totalElements} product${page.totalElements === 1 ? '' : 's'} found`; empty.hidden = state.products.length > 0; }
    catch { state.products = []; host.innerHTML = ''; empty.hidden = false; empty.textContent = 'The catalogue is unavailable. Start NOVA with MySQL configured, then refresh.'; document.getElementById('result-count').textContent = 'Catalogue unavailable'; }
    finally { host.removeAttribute('aria-busy'); }
  }
  function renderProducts() {
    const host = document.getElementById('products'); host.innerHTML = state.products.map(product => {
      const unavailable = product.stock < 1, original = product.originalPrice ? `<s>${currency(product.originalPrice)}</s>` : '';
      return `<article class="product-card"><img class="product-image" src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" loading="lazy"><div class="product-info"><div class="product-meta"><span>${escapeHtml(product.category)}</span><span>★ ${product.rating.toFixed(1)}</span></div><h3>${escapeHtml(product.name)}</h3><div class="price-row"><b>${currency(product.price)}</b>${original}</div><button class="add-cart" data-product-id="${product.id}" ${unavailable ? 'disabled' : ''}>${unavailable ? 'Out of stock' : 'Add to bag'}</button></div></article>`;
    }).join('');
  }
  function addToCart(id) { const product = state.products.find(item => item.id === id); if (!product || product.stock < 1) return; const existing = state.cart.find(item => item.id === id); if (existing) { if (existing.quantity >= product.stock) return showToast('That is the available quantity.'); existing.quantity++; } else state.cart.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, stock: product.stock, quantity: 1 }); persistCart(); renderCart(); showToast(`${product.name} added to your bag.`); }
  function changeQuantity(id, delta) { const item = state.cart.find(row => row.id === id); if (!item) return; item.quantity = Math.min(item.stock, item.quantity + delta); if (item.quantity < 1) state.cart = state.cart.filter(row => row.id !== id); persistCart(); renderCart(); }
  function renderCart() { const items = document.getElementById('cart-items'), summary = document.getElementById('cart-summary'), count = state.cart.reduce((total, item) => total + item.quantity, 0), subtotal = state.cart.reduce((total, item) => total + item.price * item.quantity, 0), shipping = subtotal === 0 || subtotal >= 250 ? 0 : 12; document.getElementById('cart-count').textContent = count;
    items.innerHTML = state.cart.length ? state.cart.map(item => `<div class="cart-item"><img src="${escapeHtml(item.imageUrl)}" alt=""><div><h3>${escapeHtml(item.name)}</h3><p>${currency(item.price)}</p><div class="quantity"><button data-cart-change="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-cart-change="${item.id}" data-delta="1" aria-label="Increase quantity">+</button></div></div><button class="remove" data-cart-change="${item.id}" data-delta="-${item.quantity}">Remove</button></div>`).join('') : '<p class="empty-state">Your bag is waiting for something remarkable.</p>';
    summary.innerHTML = state.cart.length ? `<div class="summary-row"><span>Subtotal</span><b>${currency(subtotal)}</b></div><div class="summary-row"><span>Shipping</span><span>${shipping ? currency(shipping) : 'Free'}</span></div><div class="summary-row"><b>Total</b><b>${currency(subtotal + shipping)}</b></div><button class="button primary checkout" id="checkout">Simulated checkout</button><p class="settings-note">Development demo only. No payment is collected.</p>` : '';
  }
  function simulatedCheckout() { if (!state.cart.length) return; state.cart = []; persistCart(); renderCart(); closeDrawers(); showToast('Demo order confirmed. No payment was processed.'); }
  function clearFilters() { ['search', 'min-price', 'max-price'].forEach(id => document.getElementById(id).value = ''); document.getElementById('category').value = ''; document.getElementById('in-stock').checked = false; document.getElementById('sort').value = 'newest'; loadProducts(); }

  document.addEventListener('DOMContentLoaded', () => {
    applySettings(); renderCart(); document.getElementById('year').textContent = new Date().getFullYear(); loadProducts();
    document.getElementById('settings-open').addEventListener('click', () => openDrawer('settings-panel')); document.getElementById('cart-open').addEventListener('click', () => openDrawer('cart-panel')); document.querySelectorAll('.close-drawer').forEach(button => button.addEventListener('click', closeDrawers)); document.getElementById('scrim').addEventListener('click', closeDrawers);
    document.querySelectorAll('[data-setting]').forEach(control => { control.addEventListener('input', () => updateSetting(control)); control.addEventListener('change', () => updateSetting(control)); }); document.getElementById('restore-defaults').addEventListener('click', () => { state.settings = { ...defaults }; persistSettings(); applySettings(); showToast('Appearance settings restored.'); });
    document.getElementById('search').addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadProducts, 250); }); ['category', 'min-price', 'max-price', 'in-stock', 'sort'].forEach(id => document.getElementById(id).addEventListener('change', loadProducts)); document.getElementById('clear-filters').addEventListener('click', clearFilters); document.getElementById('reload-products').addEventListener('click', loadProducts);
    document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => { document.getElementById('category').value = button.dataset.category; document.getElementById('shop').scrollIntoView({ behavior: state.settings.reducedMotion ? 'auto' : 'smooth' }); loadProducts(); }));
    document.getElementById('products').addEventListener('click', event => { const button = event.target.closest('[data-product-id]'); if (button) addToCart(Number(button.dataset.productId)); }); document.getElementById('cart-panel').addEventListener('click', event => { const change = event.target.closest('[data-cart-change]'); if (change) changeQuantity(Number(change.dataset.cartChange), Number(change.dataset.delta)); if (event.target.id === 'checkout') simulatedCheckout(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeDrawers(); }); matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { if (state.settings.theme === 'system') applySettings(); });
  });
})();
