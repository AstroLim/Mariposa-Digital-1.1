import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update } from "firebase/database";

// Firebase config (reuse your config)
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');

if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'courier') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}

// Get orderId and clientId from URL
const params = new URLSearchParams(window.location.search);
const orderId = params.get("orderId");
const clientId = params.get("clientId");

const orderDetailsDiv = document.getElementById("order-details");
const statusForm = document.getElementById("status-form");
const statusSelect = document.getElementById("status");
const feedbackDiv = document.getElementById("feedback");

async function loadOrder() {
  if (!orderId || !clientId) {
    orderDetailsDiv.innerHTML = "<p>Order not found.</p>";
    statusForm.style.display = "none";
    return;
  }
  const orderRef = ref(db, `orders/${clientId}/${orderId}`);
  const snap = await get(orderRef);
  if (!snap.exists()) {
    orderDetailsDiv.innerHTML = "<p>Order not found.</p>";
    statusForm.style.display = "none";
    return;
  }
  const order = snap.val();
  orderDetailsDiv.innerHTML = `
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Client Name:</strong> ${order.clientName || "Unknown Client"}</p>
    <p><strong>Client Contact:</strong> ${order.clientContactDetails || "No contact provided"}</p>
    <p><strong>Client Address:</strong> ${order.addressOfClient}</p>
    <p><strong>Status:</strong> <span id="current-status">${order.status}</span></p>
    <p><strong>Products:</strong></p>
    <ul>
      ${(order.productDetails || []).map(prod => `
        <li>
          <strong>${prod.productName || "Product"}</strong>
          (${prod.weight || 0}kg x ${prod.quantity || 1}) - ₱${((prod.pricePerKilo || prod.pricePerSack || 0) * (prod.weight || 0) * (prod.quantity || 1)).toLocaleString()}
        </li>
      `).join("")}
    </ul>
  `;
  statusSelect.value = order.status || "Pick-Up";
}

statusForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!orderId || !clientId) return;
  const newStatus = statusSelect.value;
  const orderRef = ref(db, `orders/${clientId}/${orderId}`);
  try {
    await update(orderRef, { status: newStatus });
    document.getElementById("current-status").textContent = newStatus;
    feedbackDiv.textContent = "Order status updated!";
    feedbackDiv.style.color = "#1e7d34";
  } catch (err) {
    feedbackDiv.textContent = "Failed to update status: " + err.message;
    feedbackDiv.style.color = "#B61718";
  }
});

loadOrder();