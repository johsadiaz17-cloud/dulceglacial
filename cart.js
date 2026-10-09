// ========================================
// CARRITO CON SABORES Y MICHELADO - DULCE GLACIAL
// ========================================

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let tempProduct = null;
let flavorCount = 0;
let selectedFlavors = [];

// Cervezas y sodas que ofrecen michelado (+$2.000)
const PRODUCTOS_MICHELADO = [
    "Cerveza Andina Light",
    "Cerveza Águila Light",
    "Cerveza Corona",
    "Cerveza Coronita",
    "Cerveza Club Colombia",
    "Soda Paraíso Cítrico",
    "Soda Frutos Rojos",
    "Soda Blue Passion"
];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function isAgotado(name) {
    if (typeof AGOTADOS === 'undefined') return false;
    const baseName = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
    return AGOTADOS.includes(name) || AGOTADOS.includes(baseName);
}

function esBebidaMichelable(name) {
    return PRODUCTOS_MICHELADO.includes(name);
}

function addToCart(name, price) {
    if (isAgotado(name)) {
        showToast('Este producto está agotado 🚫');
        return;
    }
    if (esBebidaMichelable(name)) {
        tempProduct = { name: name, price: price };
        openMicheladoModal();
        return;
    }
    if (typeof PRODUCTOS_CON_SABOR !== 'undefined' && PRODUCTOS_CON_SABOR[name]) {
        startFlavorSelection(name, price);
        return;
    }
    addDirectToCart(name, price);
}

function openMicheladoModal() {
    const modal = document.getElementById('flavor-modal');
    const flavorsList = document.getElementById('flavors-list');
    const title = document.getElementById('flavor-title');
    if (!modal || !flavorsList || !tempProduct) return;

    title.textContent = '¿Deseas michelado? +$2.000';
    flavorsList.innerHTML =
        '<button class="flavor-btn" onclick="selectMichelado(true)">Sí, michelado (+$2.000)</button>' +
        '<button class="flavor-btn" style="background:#f0f0f0;border-color:#ccc;" onclick="selectMichelado(false)">No, normal</button>';

    modal.classList.add('active');
}

function selectMichelado(conMichelado) {
    if (!tempProduct) return;
    const name = tempProduct.name;
    const price = tempProduct.price;
    closeFlavorModal();

    if (conMichelado) {
        addDirectToCart(name + ' (Michelado)', price + 2000);
    } else {
        addDirectToCart(name, price);
    }
}

function startFlavorSelection(name, price) {
    tempProduct = { name: name, price: price };
    flavorCount = PRODUCTOS_CON_SABOR[name];
    selectedFlavors = [];
    openFlavorModal();
}

function addDirectToCart(name, price, flavor) {
    const fullName = flavor ? name + ' (' + flavor + ')' : name;
    const existing = cart.find(i => i.name === fullName);
    if (existing) existing.qty++;
    else cart.push({ name: fullName, price: price, qty: 1 });
    saveCart();
    updateCartUI();
    renderCartItems();
    showToast(fullName + ' agregado 🛒');
}

function openFlavorModal() {
    const modal = document.getElementById('flavor-modal');
    const flavorsList = document.getElementById('flavors-list');
    const title = document.getElementById('flavor-title');
    if (!modal || !flavorsList || !tempProduct) return;

    let titleText = '';
    if (flavorCount === 1) {
        titleText = 'Elige el sabor de: ' + tempProduct.name;
    } else {
        const current = selectedFlavors.length + 1;
        titleText = 'Sabor ' + current + ' de ' + flavorCount + ': ' + tempProduct.name;
    }
    title.textContent = titleText;

    const selectedInfo = selectedFlavors.length > 0
        ? '<p style="text-align:center;font-size:13px;color:#666;margin-bottom:12px;">Ya elegiste: <strong>' + selectedFlavors.join(', ') + '</strong></p>'
        : '';

    const disponibles = (typeof SABORES !== 'undefined' ? SABORES : []).filter(s => s.disponible);

    if (disponibles.length === 0) {
        flavorsList.innerHTML = selectedInfo + '<p style="text-align:center;color:#999;padding:20px;">No hay sabores disponibles 😔</p>';
    } else {
        flavorsList.innerHTML = selectedInfo + disponibles.map(s =>
            '<button class="flavor-btn" onclick="selectFlavor(\'' + s.nombre + '\')">' + s.nombre + '</button>'
        ).join('');
    }

    modal.classList.add('active');
}

function selectFlavor(flavor) {
    if (!tempProduct) return;
    selectedFlavors.push(flavor);

    if (selectedFlavors.length >= flavorCount) {
        const product = tempProduct;
        const flavorStr = selectedFlavors.join(', ');
        closeFlavorModal();
        addDirectToCart(product.name, product.price, flavorStr);
    } else {
        openFlavorModal();
    }
}

function closeFlavorModal() {
    const modal = document.getElementById('flavor-modal');
    if (modal) modal.classList.remove('active');
    tempProduct = null;
    flavorCount = 0;
    selectedFlavors = [];
}

function removeFromCart(name) {
    const idx = cart.findIndex(i => i.name === name);
    if (idx > -1) {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
    }
    saveCart();
    updateCartUI();
    renderCartItems();
}

function updateCartUI() {
    const count = cart.reduce((s, i) => s + i.qty, 0);
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
    document.querySelectorAll('.cart-total').forEach(el => el.textContent = '$' + total.toLocaleString('es-CO'));
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#999;padding:30px 0;">Tu carrito está vacío 🛒</p>';
        return;
    }
    container.innerHTML = cart.map(item => {
        const safeName = item.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return '<div class="cart-item">' +
            '<div class="cart-item-info"><strong>' + item.name + '</strong><span>$' + item.price.toLocaleString('es-CO') + ' c/u</span></div>' +
            '<div class="cart-item-qty">' +
                '<button onclick="removeFromCart(\'' + safeName + '\')">−</button>' +
                '<span>' + item.qty + '</span>' +
                '<button onclick="addToCart(\'' + safeName + '\', ' + item.price + ')">+</button>' +
            '</div>' +
            '<div class="cart-item-total">$' + (item.price * item.qty).toLocaleString('es-CO') + '</div>' +
        '</div>';
    }).join('');
}

function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.add('active');
        renderCartItems();
    }
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) modal.classList.remove('active');
}

function clearCart() {
    if (confirm('¿Vaciar el carrito?')) {
        cart = [];
        saveCart();
        updateCartUI();
        renderCartItems();
    }
}

function sendOrder() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío 🛒');
        return;
    }
    const phone = '573014494093';
    let message = '¡Hola Dulce Glacial! 🍦\nQuiero hacer el siguiente pedido:\n\n';
    cart.forEach(item => {
        message += '• ' + item.qty + 'x ' + item.name + ' — $' + (item.price * item.qty).toLocaleString('es-CO') + '\n';
    });
    const total = cart.reduce((s, i) => s + i.qty * i.price, 0);
    message += '\n*Total: $' + total.toLocaleString('es-CO') + '*';
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// ============ APLICAR AGOTADOS ============
function injectAgotadoStyles() {
    const style = document.createElement('style');
    style.textContent =
        '.btn-agotado{background:#bbb !important;cursor:not-allowed !important;pointer-events:none !important;color:#fff !important;}' +
        '.producto-agotado{position:relative;}' +
        '.producto-agotado::after{content:"AGOTADO";position:absolute;top:12px;right:12px;background:#e63956;color:white;padding:5px 14px;border-radius:20px;font-weight:bold;font-size:11px;letter-spacing:1px;z-index:10;box-shadow:0 2px 8px rgba(0,0,0,0.3);}' +
        '.producto-agotado img{filter:grayscale(60%);opacity:0.75;}';
    document.head.appendChild(style);
}

function applyAvailability() {
    if (typeof AGOTADOS === 'undefined') return;
    document.querySelectorAll('.card').forEach(card => {
        const buttons = card.querySelectorAll('.btn-agregar');
        if (buttons.length === 0) return;
        let allAgotados = true;

        buttons.forEach(btn => {
            const onclick = btn.getAttribute('onclick') || '';
            const match = onclick.match(/addToCart\('([^']+)'/);
            if (!match) { allAgotados = false; return; }
            const name = match[1];
            if (AGOTADOS.includes(name)) {
                btn.disabled = true;
                btn.classList.add('btn-agotado');
                btn.textContent = '🚫 Agotado';
            } else {
                allAgotados = false;
            }
        });

        if (allAgotados) card.classList.add('producto-agotado');
    });
}

function initCart() {
    updateCartUI();
    injectAgotadoStyles();
    applyAvailability();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}
