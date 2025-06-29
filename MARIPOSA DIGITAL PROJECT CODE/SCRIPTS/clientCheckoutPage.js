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

const user = JSON.parse(localStorage.getItem('user'));

let uid = null;
let cartItems = [];
let cartKeys = [];
let selectedPayment = null;
let shippingFee = 0; // Track shipping fee globally

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
    checkOrderRequirements();
    return;
  }

  Object.entries(snap.val()).forEach(([key, value]) => {
    cartItems.push({ ...value, productId: key }); // Attach productId to each item
    cartKeys.push(key);
  });

  let subtotal = 0;
  cartItems.forEach(item => {
    subtotal += (item.pricePerKilo || item.pricePerSack) * item.weight * item.quantity;
  });
  // Use the current shippingFee value
  const total = subtotal + shippingFee;

  // Update order summary
  document.getElementById('summary-subtotal').textContent = `₱${subtotal.toLocaleString()}`;
  document.getElementById('summary-shipping').textContent = `₱${shippingFee.toLocaleString()}`;
  document.getElementById('summary-total').textContent = `₱${total.toLocaleString()}`;

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
  checkOrderRequirements();
}

// --- Payment method selection ---
document.querySelectorAll('.pmc-sec-bot button[data-method]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.pmc-sec-bot button').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedPayment = btn.getAttribute('data-method');
    checkOrderRequirements();
  });
});

// --- Delivery option selection and shipping fee update ---
document.getElementById('delivery-option').addEventListener('change', function() {
  if (this.value === "standard") shippingFee = 80;
  else if (this.value === "express") shippingFee = 150;
  else if (this.value === "pickup") shippingFee = 0;

  let subtotal = 0;
  cartItems.forEach(item => {
    subtotal += (item.pricePerKilo || item.pricePerSack) * item.weight * item.quantity;
  });
  const total = subtotal + shippingFee;

  document.getElementById('summary-shipping').textContent = `₱${shippingFee.toLocaleString()}`;
  document.getElementById('summary-total').textContent = `₱${total.toLocaleString()}`;
  checkOrderRequirements();
});

// --- Consent and form validation logic ---
function checkOrderRequirements() {
  const consentChecked = document.getElementById('consent-checkbox')?.checked;
  const deliveryOptionElem = document.getElementById('delivery-option');
  const deliveryOption = deliveryOptionElem ? deliveryOptionElem.value : "";
  const clientNameInput = document.querySelector('.client-name');
  const addressInputs = document.querySelectorAll('.address-input');
  const clientName = clientNameInput?.value.trim();
  const addressValues = Array.from(addressInputs).map(input => input.value.trim());
  const paymentSelected = !!selectedPayment;
  const cartNotEmpty = cartItems && cartItems.length > 0;

  // All requirements must be met
  const allValid = consentChecked && deliveryOption && clientName && addressValues.every(val => val) && paymentSelected && cartNotEmpty;

  const btn = document.getElementById("completeOrderBtn");
  if (btn) {
    btn.disabled = !allValid;
    btn.classList.toggle('disabled', !allValid);
  }
}

// Listen to all relevant fields
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('consent-checkbox')?.addEventListener('change', checkOrderRequirements);
  document.getElementById('delivery-option')?.addEventListener('change', checkOrderRequirements);
  document.querySelector('.client-name')?.addEventListener('input', checkOrderRequirements);
  document.querySelectorAll('.address-input').forEach(input => input.addEventListener('input', checkOrderRequirements));
  document.querySelectorAll('.pmc-sec-bot button[data-method]').forEach(btn => btn.addEventListener('click', checkOrderRequirements));
  checkOrderRequirements();
});

// --- Complete Order Handler ---
document.getElementById("completeOrderBtn")?.addEventListener("click", async () => {
  // All requirements should be met due to button disabling, but double-check:
  const consentChecked = document.getElementById('consent-checkbox')?.checked;
  if (!consentChecked) {
    alert("You must agree to the privacy policy and terms of service before completing your order.");
    document.getElementById('consent-checkbox').focus();
    return;
  }
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

  // Gather address and cart info
  const address = Array.from(document.querySelectorAll('.address-input')).map(input => input.value).join(", ");
  if (!address) {
    alert("Please enter your delivery address.");
    return;
  }

  // Recalculate totals with current shippingFee
  let subtotal = 0;
  cartItems.forEach(item => {
    subtotal += (item.pricePerKilo || item.pricePerSack) * item.weight * item.quantity;
  });
  const total = subtotal + shippingFee;

  // --- Assign a courier ---
  let assignedCourier = null;
  try {
    const usersSnap = await get(ref(db, "users"));
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      // Filter couriers
      const couriers = Object.entries(users)
        .filter(([id, user]) => user.accessLevel && user.accessLevel.toLowerCase() === "courier")
        .map(([id, user]) => ({ id, ...user }));
      if (couriers.length > 0) {
        // Randomly assign a courier
        assignedCourier = couriers[Math.floor(Math.random() * couriers.length)];
      }
    }
  } catch (err) {
    // If courier assignment fails, assignedCourier stays null
  }

  // --- Use Firebase push key as orderId ---
  const newOrderRef = push(ref(db, `orders/${uid}`));
  const orderId = newOrderRef.key;

  const orderData = {
    status: "Pending",
    clientName: clientName,
    clientId: uid,
    clientContactDetails: user.phone,
    courierId: assignedCourier ? assignedCourier.id : "N/A",
    courierContactDetails: assignedCourier ? (assignedCourier.phone || assignedCourier.mobilenumber || assignedCourier.email || "N/A") : "N/A",
    addressOfClient: address,
    productDetails: cartItems,
    orderId,
    subtotal,
    shippingFee,
    total,
    paidWith: selectedPayment,
    deliveryOption,
    eta
  };

  try {
    await set(newOrderRef, orderData);

    // --- Inventory update START ---
    for (const item of cartItems) {
      const productId = item.productId;
      const qtyOrdered = item.quantity;
      const invRef = ref(db, `inventory/${productId}`);
      const invSnap = await get(invRef);
      if (invSnap.exists()) {
        const currentQty = invSnap.val().quantity || 0;
        const newQty = Math.max(0, currentQty - qtyOrdered);
        console.log(`Updating inventory for ${productId}: ${currentQty} -> ${newQty}`);
        await set(invRef, { productId, quantity: newQty });
      } else {
        console.warn(`Inventory item not found for productId: ${productId}`);
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