import { addToCart, cart, clearCart } from './cart.js';
import { formatCurrency } from './utils/money-format.js';

async function loadProducts() {
  const res = await fetch('./data.json');
  const datas = await res.json();

  return datas;
}

// This script is written as a JavaScript module.
// Using `type="module"` in the HTML ensures that:
// Top-level `await` is allowed, so you can directly use `await` outside functions.
let products = await loadProducts();

const productList = document.querySelector('.product-list');

let productHTML = '';

products.forEach(product => {
  const safeName = product.name.replace(/\s+/g, "-");

  productHTML += `
    <div class="product-card">
      <div class="contain-img">
        <picture>
          <source media="(min-width: 26rem)" srcset="${product.image.desktop}">

          <img class="product-img" id="product-img-${safeName}" src="${product.image.mobile}" alt="">
        </picture>

        <div class="add-to-cart-btn-selected" id="add-to-cart-btn-selected-${safeName}">
          <button class="decrement-btn" id="decrement-btn-${safeName}" data-product-name="${safeName}">
            <img src="assets/images/icon-decrement-quantity.svg" alt="">
          </button>

          <p id="quantity-${safeName}">0</p>
          
          <button class="increment-btn" id="increment-btn-${safeName}" data-product-name="${safeName}">
            <img src="assets/images/icon-increment-quantity.svg" alt="">
          </button> 
        </div>

        <button class="add-to-cart-btn"
        id="add-to-cart-btn-${safeName}" data-product-name="${safeName}" 
        data-product-price="${product.price}">
          <img class="cart-icon" src="assets/images/icon-add-to-cart.svg">
          Add to Cart
        </button>
      </div>

      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <p class="product-name">${product.name}</p>
        <div class="product-price">$${formatCurrency(product.price)}</div>
      </div>

    </div>
  `;
});

productList.innerHTML = productHTML;

renderOrderSummary();

function renderOrderSummary() {
  const containOrderListEl = document.querySelector('.contain-order-list');
  const orderSummaryBottomEl = document.getElementById('order-summary-botom-section');
  const quantityTotalEl = document.getElementById('quantity-total');

  if (cart.length === 0) {
    containOrderListEl.innerHTML = `
      <div class="empty-cart">
        <img src="assets/images/illustration-empty-cart.svg">
        <p>Your added items will appear here</p>
      </div>
    `;

    quantityTotalEl.textContent = 0;
    orderSummaryBottomEl.innerHTML = '';
  } else {
    let orderHTML = '';

    let total = 0;
    let quantityTotal = 0;

    cart.forEach(item => {
      total += item.quantity * item.productPrice;
      quantityTotal += item.quantity;


      const safeName = item.productName.replace(/\s+/g, "-");


      orderHTML += `
        <div class="order">

          <div class="contain-info">
            <p class="order-name">${item.productName}</p>
            <div class="order-info">
              <span class="quantity">${item.quantity}x</span>
              <p class="price">@ $${formatCurrency(item.productPrice)}</p>
              <p class="total">$${formatCurrency(item.productPrice * item.quantity)}</p>
            </div>
          </div>

          <button class="remove-btn" data-product-name="${safeName}">
            <img src="assets/images/icon-remove-item.svg" alt="">
          </button>

        </div>
      `;
    })

    quantityTotalEl.textContent = quantityTotal;

    containOrderListEl.innerHTML = orderHTML

    orderSummaryBottomEl.innerHTML = `
      <div class="order-total">
        <p class="title-total">Order Total</p>
        <div class="price-total">$${formatCurrency(total)}</div>
      </div>

      <div class="carbon-neutral-delivery">
        <img src="assets/images/icon-carbon-neutral.svg" alt="">
        <p>This is a <span>carbon neutral</span> delivery</p>
      </div>

      <button class="confirm-btn" id="confirmed-btn">Confirm Order</button>
    `;

  }

}

function renderOrderConfirmed() {
  const orderConfirmedListEl = document.getElementById("order-confirmed-list");
  const coverEl = document.getElementById('cover');
  const priceTotalEl = document.getElementById('price-total');

  let orderConfirmedHTML = '';

  let total = 0;

  cart.forEach(item => {
    const matchingItemIndex = products.findIndex(product => product.name === item.productName);

    total += item.quantity * item.productPrice;

    orderConfirmedHTML += `
    <div class="order">
      <div class="order-confirmed">
        <img src="${products[matchingItemIndex].image.thumbnail}" alt="">


        <div class="order-confirmed-info">
          <p class="order-name">${products[matchingItemIndex].name}</p>

          <div>
            <span class="quantity">${item.quantity}x</span>
            <p class="price"><span class="at-sign-symbol">@</span> $${formatCurrency(item.productPrice)}</p>
          </div>
        </div>
      </div>

      <p class="total">$${formatCurrency(item.quantity * item.productPrice)}</p>
    </div>
    `
  });

  orderConfirmedListEl.innerHTML = orderConfirmedHTML;

  priceTotalEl.textContent = `$${formatCurrency(total)}`;

  coverEl.classList.add('active');

}

// Event Listener

document.addEventListener('click', e => {
  // Add to Cart button
  if (e.target.closest('.add-to-cart-btn')) {
    const button = e.target.closest('.add-to-cart-btn');

    const { productName, productPrice } = button.dataset;

    const addToCartBtnById = document.getElementById(`add-to-cart-btn-${productName}`);

    const addToCartBtnSelected = document.getElementById(`add-to-cart-btn-selected-${productName}`);
    const productImg = document.getElementById(`product-img-${productName}`);

    productImg.classList.add("product-img-selected");
    addToCartBtnById.style.display = "none";
    addToCartBtnSelected.style.display = "flex";

    // Add to Cart
    const quantityEl = document.getElementById(`quantity-${productName}`);
    quantityEl.textContent = 1;

    addToCart(1, productName, productPrice);

    renderOrderSummary();
  }

  // decrement button

  if (e.target.closest('.decrement-btn')) {
    const button = e.target.closest('.decrement-btn');
    const { productName } = button.dataset;

    const quantityEl = document.getElementById(`quantity-${productName}`);

    let quantity = Number(quantityEl.textContent);

    if (quantity > 1) {
      quantity--;
      quantityEl.textContent = quantity;
      addToCart(quantity, productName);

    } else if (quantity <= 1) {
      const addToCartBtnEl = document.getElementById(`add-to-cart-btn-${productName}`);

      const addToCartBtnSelected = document.getElementById(`add-to-cart-btn-selected-${productName}`);
      const productImg = document.getElementById(`product-img-${productName}`);

      productImg.classList.remove("product-img-selected");
      addToCartBtnEl.style.display = "flex";
      addToCartBtnSelected.style.display = "none";

      // Add to Cart

      addToCart(0, productName);

    }

    renderOrderSummary();
  }

  // increment button

  if (e.target.closest('.increment-btn')) {
    const button = e.target.closest('.increment-btn');
    const { productName } = button.dataset;

    const quantityEl = document.getElementById(`quantity-${productName}`);

    let quantity = Number(quantityEl.textContent);

    quantity++
    quantityEl.textContent = quantity;
    addToCart(quantity, productName);

    renderOrderSummary();
  }

  // remove button

  if (e.target.closest('.remove-btn')) {
    const button = e.target.closest('.remove-btn');
    const { productName } = button.dataset;

    const addToCartBtnEl = document.getElementById(`add-to-cart-btn-${productName}`);

    const addToCartBtnSelected = document.getElementById(`add-to-cart-btn-selected-${productName}`);
    const productImg = document.getElementById(`product-img-${productName}`);

    productImg.classList.remove("product-img-selected");
    addToCartBtnEl.style.display = "flex";
    addToCartBtnSelected.style.display = "none";

    addToCart(0, productName);

    renderOrderSummary();
  }

  // Confirmed btn

  if (e.target.closest('#confirmed-btn')) {
    renderOrderConfirmed();
  }

  // start new button

  if (e.target.closest('#start-new-btn')) {
    clearCart();

    const coverEl = document.getElementById('cover');

    coverEl.classList.remove('active');

    const addToCartBtnEl = document.querySelectorAll(`.add-to-cart-btn`);

    const addToCartBtnSelected = document.querySelectorAll(`.add-to-cart-btn-selected`);
    const productImgs = document.querySelectorAll(`.product-img`);

    productImgs.forEach(img => img.classList.remove('product-img-selected'));
    addToCartBtnEl.forEach(btn => btn.style.display = 'flex');
    addToCartBtnSelected.forEach(btn => btn.style.display = 'none');

    renderOrderSummary();
  }
})