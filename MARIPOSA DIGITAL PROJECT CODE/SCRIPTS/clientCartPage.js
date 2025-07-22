import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, set, update, remove, push } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAeBsyXVezC_JEe0X4CWbH43rM0Vx3CtSs",
  authDomain: "mariposa-digital-fb.firebaseapp.com",
  databaseURL: "https://mariposa-digital-fb-default-rtdb.firebaseio.com",
  projectId: "mariposa-digital-fb",
  storageBucket: "mariposa-digital-fb.firebasestorage.app",
  messagingSenderId: "638381416350",
  appId: "1:638381416350:web:b8144202dea97b283a808f",
  measurementId: "G-E8S6TD7XK0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let uid = null;
let cartItems = [];
let cartKeys = [];

// Auth check and cart load
onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    document.body.innerHTML = '';
    alert('Please log in to access this page.');
    window.location.href = 'landingPage.html';
    return;
  }
  uid = firebaseUser.uid;

  // Check access level
  const userSnap = await get(ref(db, `users/${uid}`));
  const userData = userSnap.val();
  if (!userData || userData.accessLevel.toLowerCase() !== 'user') {
    document.body.innerHTML = '';
    alert('You do not have permission to access this page.');
    window.location.href = 'landingPage.html';
    return;
  }

  // Set username in navbar
  if (userData && userData.username && document.querySelector('.userName')) {
    document.querySelector('.userName').innerHTML = `<p>${userData.username}</p>`;
  }

  // Load cart
  loadClientCart();
});

// Load cart from Firebase
async function loadClientCart() {
  const section = document.querySelector(".cart-items-list");
  if (!section) return; // Prevents error if element is missing
  section.innerHTML = "<p>Loading cart...</p>";

  const cartRef = ref(db, `cart/${uid}`);
  const snap = await get(cartRef);

  cartItems = [];
  cartKeys = [];

  if (!snap.exists()) {
    section.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  // Prepare cart items and keys for reference
  Object.entries(snap.val()).forEach(([key, value]) => {
    cartItems.push(value);
    cartKeys.push(key);
  });

  if (cartItems.length === 0) {
    section.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  section.innerHTML = "";
  cartItems.forEach((item, i) => {
    section.innerHTML += `
      <div class="cart-item-box">
        <div class="cart-item-img" style="width: 80px; height: 80px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
          <span style="font-size: 1.5rem;">🌾</span>
        </div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.productName}</div>
          <div class="cart-item-desc">${item.productDescription || item.description}</div>
          <div class="cart-item-meta">₱${item.pricePerKilo || item.pricePerSack} per kg &middot; ${item.weight} kg &middot; Qty: ${item.quantity}</div>
          <div class="cart-item-meta"><strong>Total: ₱${(item.pricePerKilo || item.pricePerSack) * item.weight * item.quantity}</strong></div>
        </div>
        <div class="cart-item-actions">
          <button class="cart-action-btn removeFromCartBTN" data-index="${i}">Remove</button>
          <button class="cart-action-btn removeOneBTN" data-index="${i}">Remove 1</button>
          <label>
            Weight:
            <select class="weight-selector" data-index="${i}">
              <option value="5" ${item.weight == 5 ? "selected" : ""}>5 kg</option>
              <option value="10" ${item.weight == 10 ? "selected" : ""}>10 kg</option>
              <option value="25" ${item.weight == 25 ? "selected" : ""}>25 kg</option>
              <option value="50" ${item.weight == 50 ? "selected" : ""}>50 kg</option>
            </select>
          </label>
          <label>
            Quantity:
            <input type="number" min="1" class="quantity-input" data-index="${i}" value="${item.quantity}">
          </label>
        </div>
      </div>
    `;
  });

  // Attach event listeners
  document.querySelectorAll(".removeFromCartBTN").forEach(btn => {
    btn.addEventListener("click", removeFromCart);
  });
  document.querySelectorAll(".removeOneBTN").forEach(btn => {
    btn.addEventListener("click", removeOneFromCart);
  });
  document.querySelectorAll(".quantity-input").forEach(input => {
    input.addEventListener("input", updateQuantity);
  });
  document.querySelectorAll(".weight-selector").forEach(select => {
    select.addEventListener("change", updateWeight);
  });
}

// Remove entire product
async function removeFromCart(e) {
  const i = parseInt(e.target.getAttribute("data-index"));
  const key = cartKeys[i];
  await remove(ref(db, `cart/${uid}/${key}`));
  loadClientCart();
}

// Remove one quantity, or remove product if quantity is 1
async function removeOneFromCart(e) {
  const i = parseInt(e.target.getAttribute("data-index"));
  const key = cartKeys[i];
  const item = cartItems[i];
  if (item.quantity > 1) {
    await update(ref(db, `cart/${uid}/${key}`), { quantity: item.quantity - 1 });
  } else {
    await remove(ref(db, `cart/${uid}/${key}`));
  }
  loadClientCart();
}

// Update quantity and price
async function updateQuantity(e) {
  const i = parseInt(e.target.getAttribute("data-index"));
  let val = parseInt(e.target.value);
  if (isNaN(val) || val < 1) val = 1;
  const key = cartKeys[i];
  await update(ref(db, `cart/${uid}/${key}`), { quantity: val });
  updatePrice(i);
}

// Update weight and price
async function updateWeight(e) {
  const i = parseInt(e.target.getAttribute("data-index"));
  const val = parseInt(e.target.value);
  const key = cartKeys[i];
  await update(ref(db, `cart/${uid}/${key}`), { weight: val });
  updatePrice(i);
}

// Update price display for a product
function updatePrice(i) {
  const item = cartItems[i];
  // Update local value for instant UI feedback
  const quantityInput = document.querySelector(`.quantity-input[data-index="${i}"]`);
  const weightSelect = document.querySelector(`.weight-selector[data-index="${i}"]`);
  const quantity = quantityInput ? parseInt(quantityInput.value) : item.quantity;
  const weight = weightSelect ? parseInt(weightSelect.value) : item.weight;
  const price = (item.pricePerKilo || item.pricePerSack) * weight * quantity;
  document.getElementById(`price-${i}`).textContent = price;
}