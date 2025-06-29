import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get, push, set, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAeBsyXVezC_JEe0X4CWbH43rM0Vx3CtSs",
  authDomain: "mariposa-digital-fb.firebaseapp.com",
  databaseURL: "https://mariposa-digital-fb-default-rtdb.firebaseio.com",
  projectId: "mariposa-digital-fb",
  storageBucket: "mariposa-digital-fb.appspot.com",
  messagingSenderId: "638381416350",
  appId: "1:638381416350:web:b8144202dea97b283a808f",
  measurementId: "G-E8S6TD7XK0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let uid = null;
let cartItems = [];
let cartKeys = [];
let selectedPayment = null;

const gcashBtn = document.querySelector(".gCash");
const debitBtn = document.querySelector(".debitCard");
const loyaltyDisplay = document.getElementById("loyalty-display");

async function checkAndInitializeLoyaltyPoints(userId) {
  const loyaltyRef = ref(db, `loyalty/${userId}`);
  const loyaltySnap = await get(loyaltyRef);
  if (!loyaltySnap.exists()) {
    await set(loyaltyRef, { points: 0 });
    return 0;
  }
  return loyaltySnap.val().points || 0;
}

async function updateLoyaltyUI() {
  const points = await checkAndInitializeLoyaltyPoints(uid);
  loyaltyDisplay.textContent = `Loyalty Points: ${points}`;

  // Payment method buttons
  const gcashBtn = document.querySelector(".gCash");
  const debitBtn = document.querySelector(".debitCard");
  const codBtn = document.querySelector(".COD");

  if (points < 10) {
    gcashBtn.style.display = "block";
    debitBtn.style.display = "block";
    codBtn.style.display = "none";
  } else {
    gcashBtn.style.display = "block";
    debitBtn.style.display = "block";
    codBtn.style.display = "block";
  }
}

onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    alert("Please log in to access this page.");
    window.location.href = 'landingPage.html';
    return;
  }

  uid = firebaseUser.uid;
  await updateLoyaltyUI();

  const userSnap = await get(ref(db, `users/${uid}`));
  const userData = userSnap.val();
  if (!userData || userData.accessLevel.toLowerCase() !== 'user') {
    alert('You do not have permission to access this page.');
    window.location.href = 'landingPage.html';
    return;
  }

  loadCheckoutCart();
});

async function loadCheckoutCart() {
  const section = document.querySelector(".review-order-list");
  const cartRef = ref(db, `cart/${uid}`);
  const snap = await get(cartRef);

  cartItems = [];
  cartKeys = [];

  if (!snap.exists()) {
    section.innerHTML = `<p>Your cart is empty. <a href="clientViewProducts.html">Go shopping</a></p>`;
    return;
  }

  Object.entries(snap.val()).forEach(([key, value]) => {
    cartItems.push(value);
    cartKeys.push(key);
  });

  section.innerHTML = cartItems.map(item => {
    const price = (item.pricePerKilo || item.pricePerSack) * item.weight * item.quantity;
    return `<div class="lot-box">
      <img src="${item.image || '../RESOURCES/imgFiles/lot1.jpg'}" alt="${item.productName}">
      <h3>${item.productName}</h3>
      <div class="lot-container">
        <div class="description">
          <p><strong>Description:</strong> ${item.productDescription || item.description}</p>
        </div>
        <div class="details">
          <p><strong>Price:</strong> ₱${price.toLocaleString()}</p>
          <p><strong>Weight:</strong> ${item.weight} kg</p>
          <p><strong>Quantity:</strong> ${item.quantity}</p>
        </div>
      </div>
    </div>`;
  }).join('');
}

document.querySelectorAll('.pmc-sec-bot button[data-method]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pmc-sec-bot button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedPayment = btn.getAttribute('data-method');
  });
});

document.getElementById("completeOrderBtn")?.addEventListener("click", async () => {
  if (!selectedPayment) return alert("Select a payment method.");
  if (!cartItems || cartItems.length === 0) {
    alert("Your cart is empty. Please add items before completing your order.");
    return;
  }
  // Delivery option check
  const deliveryOptionElem = document.getElementById('delivery-option');
  const deliveryOption = deliveryOptionElem ? deliveryOptionElem.value : "";
  if (!deliveryOption) {
    alert("Please select a delivery option.");
    deliveryOptionElem?.focus();
    return;
  }

const clientNameInput = document.querySelector('.client-name');
const addressInputs = document.querySelectorAll('.address-input');
const addressValues = Array.from(addressInputs).map(input => input.value.trim());
const clientName = clientNameInput.value.trim();

// Address validation
if (!clientName) {
  alert("Please enter your full name.");
  clientNameInput.focus();
  return;
}
if (addressValues.some(val => !val)) {
  alert("Please fill in all address fields.");
  const firstEmpty = Array.from(addressInputs).find(input => !input.value.trim());
  firstEmpty && firstEmpty.focus();
  return;
}
const address = addressValues.join(", ");

  // ETA Calculation
  let eta = "";
  const now = new Date();
  if (deliveryOption === "standard") {
    const etaDate = new Date(now);
    etaDate.setDate(now.getDate() + 4); // average 4 days
    eta = etaDate.toLocaleDateString();
  } else if (deliveryOption === "express") {
    const etaDate = new Date(now);
    etaDate.setDate(now.getDate() + 1); // average 1 day
    eta = etaDate.toLocaleDateString();
  } else if (deliveryOption === "pickup") {
    eta = now.toLocaleDateString();
  }

  const subtotal = cartItems.reduce((acc, item) => acc + ((item.pricePerKilo || item.pricePerSack) * item.weight * item.quantity), 0);
  const total = subtotal;

  const newOrderRef = push(ref(db, `orders/${uid}`));
  const orderId = newOrderRef.key;
  const orderData = {
    status: "Pending",
    clientName,
    clientId: uid,
    addressOfClient: address,
    productDetails: cartItems,
    orderId,
    subtotal,
    total,
    paidWith: selectedPayment,
    deliveryOption,
    eta
  };

  try {
    await set(newOrderRef, orderData);

    // --- Inventory update START ---
    for (const item of cartItems) {
      const productId = item.productId || item.key; // Ensure cartItems have productId or key
      const qtyOrdered = item.quantity;
      const invRef = ref(db, `inventory/${productId}`);
      const invSnap = await get(invRef);
      if (invSnap.exists()) {
        const currentQty = invSnap.val().quantity || 0;
        await set(invRef, { productId, quantity: Math.max(0, currentQty - qtyOrdered) });
      }
    }
    // --- Inventory update END ---

    await remove(ref(db, `cart/${uid}`));

    // Increment loyalty points
    const loyaltyRef = ref(db, `loyalty/${uid}`);
    const snap = await get(loyaltyRef);
    const current = snap.exists() ? snap.val().points || 0 : 0;
    await set(loyaltyRef, { points: current + 1 });

    // --- Log successful order ---
    await push(ref(db, 'logs/orders'), {
      action: `Order ${orderId} placed by ${clientName}`,
      date: new Date().toUTCString(),
      by: uid,
      orderId: orderId,
      eta: eta,
      deliveryOption: deliveryOption
    });

    alert("Order placed! Loyalty Points: " + (current + 1));
    await updateLoyaltyUI();
    window.location.href = "clientViewOrders.html";
  } catch (e) {
    alert("Order failed: " + e.message);
  }
});