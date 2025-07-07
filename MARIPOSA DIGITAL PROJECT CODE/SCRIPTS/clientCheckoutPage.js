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

  // Set username in navbar
  if (userData && userData.username && document.querySelector('.userName')) {
    document.querySelector('.userName').innerHTML = `<p>${userData.username}</p>`;
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
  const provinceSelect = document.getElementById('province-select');
  const deliveryOptionElem = document.getElementById('delivery-option');

  function updateShippingAndEta() {
    const province = provinceSelect ? provinceSelect.value : "";
    const deliveryOption = deliveryOptionElem ? deliveryOptionElem.value : "";
    if (!province || !deliveryOption) {
      document.getElementById('eta-display').textContent = "";
      return;
    }

    const region = getRegionByProvince(province);
    const { fee, eta } = getShippingAndEta(region, deliveryOption);
    shippingFee = fee;

    // Update summary
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += (item.pricePerKilo || item.pricePerSack) * item.weight * item.quantity;
    });
    const total = subtotal + shippingFee;

    document.getElementById('summary-shipping').textContent = `₱${shippingFee.toLocaleString()}`;
    document.getElementById('summary-total').textContent = `₱${total.toLocaleString()}`;

    // --- ETA Display ---
    const etaDisplay = document.getElementById('eta-display');
    if (etaDisplay) {
      if (deliveryOption === "pickup") {
        etaDisplay.textContent = "ETA: Ready for pickup today";
      } else if (eta > 0) {
        etaDisplay.textContent = `ETA: ${eta} day${eta > 1 ? "s" : ""} after confirmation`;
      } else {
        etaDisplay.textContent = "";
      }
    }

  checkOrderRequirements();
}

  // Listen for changes
  provinceSelect?.addEventListener('change', updateShippingAndEta);
  deliveryOptionElem?.addEventListener('change', updateShippingAndEta);
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

  // ETA Calculation based on province and delivery option
    const province = provinceSelect ? provinceSelect.value : "";
    const region = getRegionByProvince(province);
    const { eta: etaDays } = getShippingAndEta(region, deliveryOption);

    let eta = "";
    const now = new Date();
    if (etaDays > 0) {
      const etaDate = new Date(now);
      etaDate.setDate(now.getDate() + etaDays);
      eta = etaDate.toLocaleDateString();
    } else {
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

  // --- Assign a courier using alternating pattern ---
  let assignedCourier = null;
  try {
    // Get courier assignment counter
    const counterRef = ref(db, "system/courierAssignmentCounter");
    const counterSnap = await get(counterRef);
    let currentIndex = counterSnap.exists() ? counterSnap.val().index || 0 : 0;
    
    // Get all available couriers
    const usersSnap = await get(ref(db, "users"));
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      // Filter couriers
      const couriers = Object.entries(users)
        .filter(([id, user]) => user.accessLevel && user.accessLevel.toLowerCase() === "courier")
        .map(([id, user]) => ({ id, ...user }));
      
      if (couriers.length > 0) {
        // Assign courier in alternating pattern
        assignedCourier = couriers[currentIndex % couriers.length];
        
        // Update counter for next assignment
        const nextIndex = (currentIndex + 1) % couriers.length;
        await set(counterRef, { index: nextIndex });
        
        console.log(`Assigned courier: ${assignedCourier.username} (Index: ${currentIndex}, Total couriers: ${couriers.length})`);
        console.log(`Courier details:`, assignedCourier);
      } else {
        console.log("No couriers found in the system");
      }
    }
  } catch (err) {
    console.error("Courier assignment error:", err);
    // If courier assignment fails, assignedCourier stays null
  }

  // --- Use Firebase push key as orderId ---
  const newOrderRef = push(ref(db, `orders/${uid}`));
  const orderId = newOrderRef.key;

  // Get courier name with fallbacks
  let courierName = "Not assigned";
  let courierContact = "N/A";
  
  if (assignedCourier) {
    // Try different name formats
    courierName = assignedCourier.username || 
                  (assignedCourier.firstName && assignedCourier.lastName ? 
                   `${assignedCourier.firstName} ${assignedCourier.lastName}` : 
                   assignedCourier.firstName || 
                   assignedCourier.lastName || 
                   "Courier");
    
    // Get contact details with fallbacks
    courierContact = assignedCourier.phone || 
                     assignedCourier.mobilenumber || 
                     assignedCourier.email || 
                     "N/A";
  }

  console.log(`Final courier assignment for order ${orderId}:`, {
    courierId: assignedCourier ? assignedCourier.id : "N/A",
    courierName: courierName,
    courierContact: courierContact
  });

  const orderData = {
    status: "Pending",
    clientName: clientName,
    clientId: uid,
    clientContactDetails: user.phone,
    courierId: assignedCourier ? assignedCourier.id : "N/A",
    courierName: courierName,
    courierContactDetails: courierContact,
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

        // --- Inventory update log ---
        await push(ref(db, 'logs/inventory'), {
          action: `Inventory reduced for product ${productId} due to order ${orderId}`,
          date: new Date().toUTCString(),
          by: uid,
          orderId: orderId,
          productId: productId,
          oldQuantity: currentQty,
          newQuantity: newQty
        });
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

function getRegionByProvince(province) {
  // Luzon
  const luzon = [
    "Abra","Apayao","Aurora","Bataan","Batanes","Batangas","Benguet","Bulacan","Cagayan","Camarines Norte","Camarines Sur","Catanduanes","Cavite","Ifugao","Ilocos Norte","Ilocos Sur","Isabela","Kalinga","La Union","Laguna","Mountain Province","Nueva Ecija","Nueva Vizcaya","Occidental Mindoro","Oriental Mindoro","Pampanga","Pangasinan","Quezon","Quirino","Rizal","Romblon","Sorsogon","Tarlac","Zambales","Metro Manila"
  ];
  // Visayas
  const visayas = [
    "Aklan","Antique","Biliran","Bohol","Capiz","Cebu","Eastern Samar","Guimaras","Iloilo","Leyte","Negros Occidental","Negros Oriental","Northern Samar","Samar","Siquijor","Southern Leyte","Western Samar"
  ];
  // Mindanao
  const mindanao = [
    "Agusan del Norte","Agusan del Sur","Basilan","Bukidnon","Camiguin","Compostela Valley","Cotabato","Davao de Oro","Davao del Norte","Davao del Sur","Davao Occidental","Davao Oriental","Dinagat Islands","Lanao del Norte","Lanao del Sur","Maguindanao","Misamis Occidental","Misamis Oriental","North Cotabato","Sarangani","South Cotabato","Sultan Kudarat","Sulu","Surigao del Norte","Surigao del Sur","Tawi-Tawi","Zamboanga del Norte","Zamboanga del Sur","Zamboanga Sibugay"
  ];
  if (luzon.includes(province)) return "Luzon";
  if (visayas.includes(province)) return "Visayas";
  if (mindanao.includes(province)) return "Mindanao";
  return "Other";
}

function getShippingAndEta(region, deliveryOption) {
  // You can adjust these values as needed
  if (region === "Luzon") {
    if (deliveryOption === "standard") return { fee: 80, eta: 3 };
    if (deliveryOption === "express") return { fee: 150, eta: 1 };
    if (deliveryOption === "pickup") return { fee: 0, eta: 0 };
  }
  if (region === "Visayas") {
    if (deliveryOption === "standard") return { fee: 120, eta: 5 };
    if (deliveryOption === "express") return { fee: 200, eta: 2 };
    if (deliveryOption === "pickup") return { fee: 0, eta: 0 };
  }
  if (region === "Mindanao") {
    if (deliveryOption === "standard") return { fee: 180, eta: 7 };
    if (deliveryOption === "express") return { fee: 250, eta: 3 };
    if (deliveryOption === "pickup") return { fee: 0, eta: 0 };
  }
  // Default fallback
  return { fee: 200, eta: 7 };
}