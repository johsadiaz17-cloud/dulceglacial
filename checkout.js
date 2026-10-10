// ========================================
// CHECKOUT - DULCE GLACIAL
// ========================================
// Sistema de domicilio, mesa, desechables y dirección

const LISTA_DESECHABLE = [
    "Glacial Mango", "Glacial Fresa", "Glacial Banana", "Fusión Chocolate",
    "Brownie con Helado", "Banana Split", "Copa Galaxi", "Copa Oreo",
    "Copa Milo", "Gusanito", "Buhito", "Pulpito",
    "Frutiglacial Grande", "Frutiglacial Pequeña", "Fresabanana",
    "Waffle Tentación", "Candywaffles",
    "Hamburguesa", "Hamburguesa Especial", "Hamburguesa de Pollo",
    "Perro Súper", "Chorriperro", "Perro Sencillo",
    "Picada Especial Personal", "Picada Especial Para dos", "Picada Especial Familiar",
     "Picada Personal", "Picada Para dos", "Picada Familiar",
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

// ============ INICIALIZAR ============
function initCheckout() {
    if (document.getElementById('checkout-modal')) return;

    const style = document.createElement('style');
    style.textContent =
        '.checkout-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:260;justify-content:center;align-items:center;padding:20px;}' +
        '.checkout-modal.active{display:flex;}' +
        '.checkout-panel{background:white;width:100%;max-width:440px;border-radius:20px;animation:checkoutPop 0.3s ease;max-height:90vh;overflow-y:auto;}' +
        '@keyframes checkoutPop{from{transform:scale(0.9);opacity:0;}to{transform:scale(1);opacity:1;}}' +
        '.checkout-header{padding:20px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;}' +
        '.checkout-header h3{color:#ff4d6d;font-size:18px;margin:0;}' +
        '.checkout-close{background:none;border:none;font-size:28px;cursor:pointer;color:#999;line-height:1;}' +
        '.checkout-body{padding:20px;}' +
        '.checkout-btn{display:block;width:100%;padding:16px;margin-bottom:10px;border:2px solid #ff4d6d;background:#fff0f4;color:#333;border-radius:12px;font-size:16px;font-weight:bold;cursor:pointer;font-family:inherit;transition:0.2s;}' +
        '.checkout-btn:hover{background:#ff4d6d;color:white;}' +
        '.checkout-info{text-align:center;color:#666;font-size:14px;margin-bottom:15px;}' +
        '.table-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;}' +
        '.table-btn{padding:20px;border:2px solid #ff4d6d;background:white;color:#ff4d6d;border-radius:12px;font-size:22px;font-weight:bold;cursor:pointer;font-family:inherit;transition:0.2s;}' +
        '.table-btn:hover{background:#ff4d6d;color:white;}' +
        '.address-input{width:100%;padding:12px;border:2px solid #eee;border-radius:10px;font-size:15px;font-family:inherit;resize:vertical;min-height:100px;box-sizing:border-box;}' +
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

// ============ ABRIR MODAL ============
function openCheckout() {
    checkoutState = { step: 'choose', delivery: null, conosJuntas: null, mesa: null, direccion: '' };
    initCheckout();
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

// ============ UTILIDADES ============
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

// ============ RENDERIZAR PASO ============
function renderCheckoutStep() {
    const title = document.getElementById('checkout-title');
    const body = document.getElementById('checkout-body');
    if (!title || !body) return;

    if (checkoutState.step === 'choose') {
        title.textContent = '¿Cómo quieres tu pedido?';
        body.innerHTML =
            '<button class="checkout-btn" onclick="checkoutSelectDelivery(true)">🛵 A domicilio</button>' +
            '<button class="checkout-btn" onclick="checkoutSelectDelivery(false)">🍽️ Para mesa</button>';

    } else if (checkoutState.step === 'cones') {
        const conos = contarConos();
        title.textContent = '¿Cómo quieres los conos?';
        body.innerHTML =
            '<p class="checkout-info">Tienes ' + conos.units + ' cono(s) con ' + conos.balls + ' bola(s) en tu pedido.</p>' +
            '<button class="checkout-btn" onclick="checkoutSelectConos(true)">🍦 Todas las bolas juntas</button>' +
            '<button class="checkout-btn" onclick="checkoutSelectConos(false)">🍦 Bolas separadas</button>';

    } else if (checkoutState.step === 'table') {
        title.textContent = '¿Qué número de mesa?';
        body.innerHTML =
            '<p class="checkout-info">Selecciona tu mesa</p>' +
            '<div class="table-grid">' +
                [1,2,3,4,5,6].map(n => '<button class="table-btn" onclick="checkoutSelectMesa(' + n + ')">' + n + '</button>').join('') +
            '</div>';

    } else if (checkoutState.step === 'address') {
        title.textContent = '📍 Escribe tu dirección';
        body.innerHTML =
            '<p class="checkout-info">Escribe tu dirección completa para la entrega</p>' +
            '<textarea id="address-input" class="address-input" placeholder="Ej: Calle 12 #34-56, Barrio Centro, Casa blanca de 2 pisos..." rows="4"></textarea>' +
            '<button class="checkout-btn" style="margin-top:15px;" onclick="checkoutConfirmAddress()">Continuar ➡️</button>';

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
        html += '<button class="checkout-btn" style="margin-top:15px;" onclick="checkoutEnviarWhatsApp()">📲 Enviar por WhatsApp</button>';
        body.innerHTML = html;
    }
}

// ============ NAVEGACIÓN ============
function checkoutSelectDelivery(isDelivery) {
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

function checkoutSelectConos(juntas) {
    checkoutState.conosJuntas = juntas;
    checkoutState.step = 'address';
    renderCheckoutStep();
}

function checkoutSelectMesa(n) {
    checkoutState.mesa = n;
    checkoutState.step = 'confirm';
    renderCheckoutStep();
}

function checkoutConfirmAddress() {
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

// ============ CÁLCULO ============
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
    return {
        items: items,
        subtotal: subtotal,
        domicilio: domicilio,
        desechable: desechable,
        total: total,
        mesa: checkoutState.mesa,
        delivery: checkoutState.delivery,
        conosJuntas: checkoutState.conosJuntas,
        direccion: checkoutState.direccion
    };
}

// ============ ENVIAR WHATSAPP ============
function checkoutEnviarWhatsApp() {
    const r = calcularPedido();
    const phone = '573014494093';
    let message = 'Hola Dulce Glacial!\n\n';
    message += 'Mi pedido:\n';
    r.items.forEach(i => {
        message += '- ' + i.qty + 'x ' + i.name + ' - $' + i.lineTotal.toLocaleString('es-CO') + '\n';
    });
    message += '\nSubtotal: $' + r.subtotal.toLocaleString('es-CO') + '\n';
    if (r.domicilio > 0) message += 'Domicilio: $' + r.domicilio.toLocaleString('es-CO') + '\n';
    if (r.desechable > 0) message += 'Desechables: $' + r.desechable.toLocaleString('es-CO') + '\n';
    message += '\nTOTAL: $' + r.total.toLocaleString('es-CO') + '\n\n';
    if (r.delivery) {
        message += 'Entrega a domicilio\n';
        message += 'Direccion: ' + r.direccion + '\n';
        if (r.conosJuntas === true) message += '(Conos con todas las bolas juntas)\n';
        if (r.conosJuntas === false) message += '(Conos con bolas separadas)\n';
    } else if (r.mesa) {
        message += 'Mesa #' + r.mesa + '\n';
    }
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank');

    // Limpiar carrito
    cart = [];
    saveCart();
    updateCartUI();
    renderCartItems();
    closeCheckoutModal();
    closeCart();
}

// Cerrar modal si clic fuera
document.addEventListener('click', function(e) {
    const modal = document.getElementById('checkout-modal');
    if (modal && e.target === modal) closeCheckoutModal();
});

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCheckout);
} else {
    initCheckout();
}
