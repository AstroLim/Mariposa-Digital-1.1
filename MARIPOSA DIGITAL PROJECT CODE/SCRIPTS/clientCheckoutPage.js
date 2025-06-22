import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

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

  // Load cart for checkout
  loadCheckoutCart();
});

async function loadCheckoutCart() {
  const section = document.querySelector(".review-order-list");
  if (!section) return; // Prevents error if element is missing
  section.innerHTML = "<p>Loading checkout...</p>";

  const cartRef = ref(db, `cart/${uid}`);
  const snap = await get(cartRef);

  cartItems = [];
  cartKeys = [];

  if (!snap.exists()) {
    section.innerHTML = `<p>Your cart is empty. <a href="clientViewProductsPage.html">Go shopping</a></p>`;
    // Also clear summary if empty
    const summarySection = document.querySelector(".order-summary-details");
    if (summarySection) summarySection.innerHTML = "";
    return;
  }

  Object.entries(snap.val()).forEach(([key, value]) => {
    cartItems.push(value);
    cartKeys.push(key);
  });

  if (cartItems.length === 0) {
    section.innerHTML = `<p>Your cart is empty. <a href="clientViewProductsPage.html">Go shopping</a></p>`;
    const summarySection = document.querySelector(".order-summary-details");
    if (summarySection) summarySection.innerHTML = "";
    return;
  }

  let subtotal = 0;
  section.innerHTML = ``;
  cartItems.forEach((item, i) => {
    const price = (item.pricePerKilo || item.pricePerSack) * item.weight * item.quantity;
    subtotal += price;
    section.innerHTML += `
      <div class="lot-box">
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
      </div>
    `;
  });

  // Render order summary
  const summarySection = document.querySelector(".order-summary-details");
  if (summarySection) {
    const shipping = 0;
    const tax = 0;
    const total = subtotal + shipping + tax;

    summarySection.innerHTML = `
      <div class="summary-row">
        <span>Subtotal</span>
        <span>₱${subtotal.toLocaleString()}</span>
      </div>
      <div class="summary-row">
        <span>Shipping</span>
        <span>FREE</span>
      </div>
      <div class="summary-row">
        <span>Tax</span>
        <span>₱${tax.toLocaleString()}</span>
      </div>
      <div class="summary-row total">
        <span>Order Total</span>
        <span>₱${total.toLocaleString()}</span>
      </div>
    `;
  }
}

// Handle payment method selection
function handlePaymentMethod(e) {
  const method = e.target.getAttribute("data-method");
  // Redirect to payment steps (replace with your actual payment page/routes)
  if (method === "gcash") {
    window.location.href = "payment-gcash.html";
  } else if (method === "cod") {
    window.location.href = "payment-cod.html";
  } else {
    alert("Payment method not implemented.");
  }
}