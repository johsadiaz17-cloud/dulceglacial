// ========================================
// CARRITO CON CHECKOUT - DULCE GLACIAL
// ========================================

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let tempProduct = null;
let flavorCount = 0;
let selectedFlavors = [];

// Productos que ofrecen michelado (+$2.000) - LISTA DIRECTA
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

const LISTA_DESECHABLE = [
    "Glacial Mango", "Glacial Fresa", "Glacial Banana", "Fusión Chocolate",
    "Brownie con Helado", "Banana Split", "Copa Galaxi", "Copa Oreo",
    "Copa Milo", "Gusanito", "Buhito", "Pulpito",
    "Frutiglacial Grande", "Frutiglacial Pequeña", "Fresabanana",
    "Waffle Tentación", "Candywaffles",
    "Hamburguesa", "Hamburguesa Especial", "Hamburguesa de Pollo",
    "Perro Súper", "Chorriperro", "Perro Sencillo",
    "Picada Especial Personal", "Picada Especial Para dos", "Picada Especial Familiar",
    "Picada para Compartir Personal", "Picada para Compartir Para dos", "Picada para Compartir Familiar",
    "Choricascos", "Pechuga a la Plancha", "Pechuga Gratinada",
    "Salchipapa Personal", "Choripapa Personal"
];

let checkoutState = {
    step: 'choose',
    delivery: null,
    conosJuntas: null,
    mesa: null,
    direccion: ''
};

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

// ============ CHECKOUT ============
function sendOrder() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío 🛒');
        return;
    }
    closeCart();
    checkoutState = { step: 'choose', delivery: null, conosJuntas: null, mesa: null, direccion: '' };
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.add('active');
        renderCheckoutStep();
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('active');
}

function contarConos() {
    let units = 0, balls = 0;
    cart.forEach(item => {
        if (item.name.startsWith('Cono 1 bola')) { units += item.qty; balls += item.qty * 1; }
        else if (item.name.startsWith('Cono 2 bolas')) { units += item.qty; balls += item.qty * 2; }
    });
    return { units, balls };
}

function esProductoDesechable(name) {
    const base = name.replace(/\s*\([^)]*\)\s*$/, '').trim();
    return LISTA_DESECHABLE.includes(name) || LISTA_DESECHABLE.includes(base);
}

function renderCheckoutStep() {
    const title = document.getElementById('checkout-title');
    const body = document.getElementById('checkout-body');
    if (!title || !body) return;

    if (checkoutState.step === 'choose') {
        title.textContent = '¿Cómo quieres tu pedido?';
        body.innerHTML =
            '<button class="checkout-btn" onclick="selectDelivery(true)">🛵 A domicilio</button>' +
            '<button class="checkout-btn" onclick="selectDelivery(false)">🍽️ Para mesa</button>';

    } else if (checkoutState.step === 'cones') {
        const conos = contarConos();
        title.textContent = '¿Cómo quieres los conos?';
        body.innerHTML =
            '<p class="checkout-info">Tienes ' + conos.units + ' cono(s) con ' + conos.balls + ' bola(s) en tu pedido.</p>' +
            '<button class="checkout-btn" onclick="selectConos(true)">🍦 Todas las bolas juntas</button>' +
            '<button class="checkout-btn" onclick="selectConos(false)">🍦 Bolas separadas</button>';

    } else if (checkoutState.step === 'table') {
        title.textContent = '¿Qué número de mesa?';
        body.innerHTML =
            '<p class="checkout-info">Selecciona tu mesa</p>' +
            '<div class="table-grid">' +
                [1,2,3,4,5,6].map(n => '<button class="table-btn" onclick="selectMesa(' + n + ')">' + n + '</button>').join('') +
            '</div>';

    } else if (checkoutState.step === 'address') {
        title.textContent = '📍 Escribe tu dirección';
        body.innerHTML =
            '<p class="checkout-info">Escribe tu dirección completa para la entrega</p>' +
            '<textarea id="address-input" class="address-input" placeholder="Ej: Calle 12 #34-56, Barrio Centro, Casa blanca de 2 pisos..." rows="4"></textarea>' +
            '<button class="checkout-btn" style="margin-top:15px;" onclick="confirmAddress()">Continuar ➡️</button>';

    } else if (checkoutState.step === 'confirm') {
        const r = calcularPedido();
        title.textContent = 'Confirmar pedido';
        let html = '<div class="checkout-resumen">';
        r.items.forEach(i => {
            html += '<div>' + i.qty + 'x ' + i.name + ' — $' + i.lineTotal.toLocaleString('es-CO') + '</div>';
        });
        html += '<div style="margin-top:10px;"><strong>Subtotal:</strong> $' + r.subtotal.toLocaleString('es-CO') + '</div>';
        if (r.domicilio > 0) html += '<div><strong>Domicilio:</strong> $' + r.domicilio.toLocaleString('es-CO') + '</div>';
        if (r.desechable > 0) html += '<div><strong>Desechables:</strong> $' + r.desechable.toLocaleString('es-CO') + '</div>';
        if (r.delivery && r.direccion) html += '<div style="margin-top:8px;"><strong>🛵 Dirección:</strong><br>' + r.direccion + '</div>';
        if (r.mesa) html += '<div style="margin-top:8px;"><strong>🍽️ Mesa:</strong> ' + r.mesa + '</div>';
        html += '<div class="total-line"><span>TOTAL:</span><span>$' + r.total.toLocaleString('es-CO') + '</span></div>';
        html += '</div>';
        html += '<button class="checkout-btn" style="margin-top:15px;" onclick="enviarPedidoFinal()">📲 Enviar por WhatsApp</button>';
        body.innerHTML = html;
    }
}

function selectDelivery(isDelivery) {
    checkoutState.delivery = isDelivery;
    if (isDelivery && contarConos().units > 0) {
        checkoutState.step = 'cones';
    } else if (isDelivery) {
        checkoutState.step = 'address';
    } else {
        checkoutState.step = 'table';
    }
    renderCheckoutStep();
}

function selectConos(juntas) {
    checkoutState.conosJuntas = juntas;
    checkoutState.step = 'address';
    renderCheckoutStep();
}

function selectMesa(n) {
    checkoutState.mesa = n;
    checkoutState.step = 'confirm';
    renderCheckoutStep();
}

function confirmAddress() {
    const input = document.getElementById('address-input');
    const dir = (input ? input.value : '').trim();
    if (!dir) {
        alert('Por favor escribe tu dirección');
        return;
    }
    checkoutState.direccion = dir;
    checkoutState.step = 'confirm';
    renderCheckoutStep();
}

function calcularPedido() {
    let items = [], subtotal = 0, domicilio = 0, desechable = 0;

    cart.forEach(item => {
        const lt = item.price * item.qty;
        subtotal += lt;
        items.push({ name: item.name, qty: item.qty, price: item.price, lineTotal: lt });
    });

    const conos = contarConos();

    if (checkoutState.delivery) {
        let hasSpecialOrCono = false;
        let specialUnits = 0;

        cart.forEach(item => {
            if (esProductoDesechable(item.name)) {
                hasSpecialOrCono = true;
                specialUnits += item.qty;
            }
            if (item.name.startsWith('Cono')) hasSpecialOrCono = true;
        });

        if (hasSpecialOrCono) {
            domicilio = 500;
            desechable = specialUnits * 500;

            if (conos.units > 0) {
                if (checkoutState.conosJuntas) {
                    desechable += Math.ceil(conos.balls / 4) * 500;
                } else {
                    desechable += conos.units * 500;
                }
            }
        }
    }

    const total = subtotal + domicilio + desechable;
    return { items: items, subtotal: subtotal, domicilio: domicilio, desechable: desechable, total: total, mesa: checkoutState.mesa, delivery: checkoutState.delivery, conosJuntas: checkoutState.conosJuntas, direccion: checkoutState.direccion };
}

function enviarPedidoFinal() {
    const r = calcularPedido();
    const phone = '573014494093';
    let message = '¡Hola Dulce Glacial! 🍦\n\n';
    message += '📋 *Mi pedido:*\n';
    r.items.forEach(i => {
        message += '• ' + i.qty + 'x ' + i.name + ' — $' + i.lineTotal.toLocaleString('es-CO') + '\n';
    });
    message += '\n*Subtotal: $' + r.subtotal.toLocaleString('es-CO') + '*\n';
    if (r.domicilio > 0) message += 'Domicilio: $' + r.domicilio.toLocaleString('es-CO') + '\n';
    if (r.desechable > 0) message += 'Desechables: $' + r.desechable.toLocaleString('es-CO') + '\n';
    message += '\n💰 *TOTAL: $' + r.total.toLocaleString('es-CO') + '*\n\n';
    if (r.delivery) {
        message += '🛵 *Entrega a domicilio*\n';
        message += '📍 Dirección: ' + r.direccion + '\n';
        if (r.conosJuntas === true) message += '_(Conos con todas las bolas juntas)_\n';
        if (r.conosJuntas === false) message += '_(Conos con bolas separadas)_\n';
    } else if (r.mesa) {
        message += '🍽️ *Mesa #' + r.mesa + '*\n';
    }
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank');
    closeCheckoutModal();
    closeCart();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}

// ============ INYECTAR MODAL DE CHECKOUT ============
function inyectarCheckoutHTML() {
    if (document.getElementById('checkout-modal')) return;

    const style = document.createElement('style');
    style.textContent =
        '.checkout-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:260;justify-content:center;align-items:center;padding:20px;}' +
        '.checkout-modal.active{display:flex;}' +
        '.checkout-panel{background:white;width:100%;max-width:440px;border-radius:20px;animation:pop 0.3s ease;max-height:90vh;overflow-y:auto;}' +
        '@keyframes pop{from{transform:scale(0.9);opacity:0;}to{transform:scale(1);opacity:1;}}' +
        '.checkout-header{padding:20px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;}' +
        '.checkout-header h3{color:#ff4d6d;font-size:18px;}' +
        '.checkout-close{background:none;border:none;font-size:28px;cursor:pointer;color:#999;line-height:1;}' +
        '.checkout-body{padding:20px;}' +
        '.checkout-btn{display:block;width:100%;padding:16px;margin-bottom:10px;border:2px solid #ff4d6d;background:#fff0f4;color:#333;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;font-family:inherit;transition:0.2s;}' +
        '.checkout-btn:hover{background:#ff4d6d;color:white;}' +
        '.checkout-info{text-align:center;color:#666;font-size:14px;margin-bottom:15px;}' +
        '.table-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;}' +
        '.table-btn{padding:20px;border:2px solid #ff4d6d;background:white;color:#ff4d6d;border-radius:12px;font-size:22px;font-weight:bold;cursor:pointer;font-family:inherit;transition:0.2s;}' +
        '.table-btn:hover{background:#ff4d6d;color:white;}' +
        '.address-input{width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:15px;font-family:inherit;resize:vertical;min-height:100px;}' +
        '.address-input:focus{outline:none;border-color:#ff4d6d;}' +
        '.checkout-resumen{background:#f9f9f9;padding:15px;border-radius:10px;font-size:14px;line-height:1.8;}' +
        '.checkout-resumen strong{color:#333;}' +
        '.checkout-resumen .total-line{display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:2px solid #ddd;font-weight:bold;font-size:16px;color:#ff4d6d;}';
    document.head.appendChild(style);

    const modalHTML =
        '<div class="checkout-modal" id="checkout-modal">' +
            '<div class="checkout-panel">' +
                '<div class="checkout-header">' +
                    '<h3 id="checkout-title">Finalizar pedido</h3>' +
                    '<button class="checkout-close" onclick="closeCheckoutModal()">×</button>' +
                '</div>' +
                '<div class="checkout-body" id="checkout-body"></div>' +
            '</div>' +
        '</div>';

    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
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
    inyectarCheckoutHTML();
    updateCartUI();
    injectAgotadoStyles();
    applyAvailability();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}
