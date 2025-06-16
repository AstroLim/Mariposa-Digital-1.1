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
  if (!userData || userData.accessLevel !== 'user') {
    document.body.innerHTML = '';
    alert('You do not have permission to access this page.');
    window.location.href = 'landingPage.html';
    return;
  }

  // Load cart
  loadClientCart();
});

// Load cart from Firebase
async function loadClientCart() {
  const section = document.querySelector(".MainSection-mainCont");
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
      <div class="lot-box">
        <img src="${item.image || 'default-image.jpg'}" alt="${item.productName}">
        <h3>${item.productName}</h3>
        <p>Description: ${item.productDescription || item.description}</p>
        <p>Price: ₱<span id="price-${i}">${item.pricePerSack * item.weight * item.quantity}</span></p>
        <div style="display: flex; gap: 20px;">
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
        <div class="button-container">
          <button class="removeFromCartBTN" data-index="${i}">Remove</button>
          <button class="removeOneBTN" data-index="${i}">Remove 1</button>
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