// ========================================
// CARRITO CON SABORES - DULCE GLACIAL
// ========================================

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let tempProduct = null;

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(name, price) {
    if (typeof PRODUCTOS_CON_SABOR !== 'undefined' && PRODUCTOS_CON_SABOR.includes(name)) {
        openFlavorModal(name, price);
        return;
    }
    addDirectToCart(name, price);
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

function openFlavorModal(name, price) {
    tempProduct = { name: name, price: price };
    const modal = document.getElementById('flavor-modal');
    const flavorsList = document.getElementById('flavors-list');
    const title = document.getElementById('flavor-title');
    if (!modal || !flavorsList) return;

    title.textContent = 'Elige el sabor de: ' + name;
    const disponibles = (typeof SABORES !== 'undefined' ? SABORES : []).filter(s => s.disponible);
    
    if (disponibles.length === 0) {
        flavorsList.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No hay sabores disponibles 😔</p>';
    } else {
        flavorsList.innerHTML = disponibles.map(s => 
            '<button class="flavor-btn" onclick="selectFlavor(\'' + s.nombre + '\')">' + s.nombre + '</button>'
        ).join('');
    }
    
    modal.classList.add('active');
}

function closeFlavorModal() {
    const modal = document.getElementById('flavor-modal');
    if (modal) modal.classList.remove('active');
    tempProduct = null;
}

function selectFlavor(flavor) {
    if (!tempProduct) return;
    addDirectToCart(tempProduct.name, tempProduct.price, flavor);
    closeFlavorModal();
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

document.addEventListener('click', function(e) {
    const cartModal = document.getElementById('cart-modal');
    const flavorModal = document.getElementById('flavor-modal');
    if (cartModal && e.target === cartModal) closeCart();
    if (flavorModal && e.target === flavorModal) closeFlavorModal();
});

document.addEventListener('DOMContentLoaded', updateCartUI);
