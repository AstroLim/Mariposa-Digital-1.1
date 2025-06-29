// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getDatabase, get , ref} from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const db = getDatabase();

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');

if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'admin') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}

document.querySelector('.nav-user-container div').textContent = `${user.lastName}, ${user.firstName}`;

// --- Fetch and Render Incomplete Orders ---
async function renderShippingOrders() {
  const ordersRef = ref(db, "orders");
  const snap = await get(ordersRef);

  let allOrders = [];
  if (snap.exists()) {
    snap.forEach(userOrdersSnap => {
      const userOrders = userOrdersSnap.val();
      Object.entries(userOrders).forEach(([orderId, order]) => {
        allOrders.push({ ...order, orderId });
      });
    });
  }

  // Filter for orders not completed or cancelled
  const incompleteOrders = allOrders.filter(order => {
    const status = (order.status || "").toLowerCase();
    return status !== "completed" && status !== "cancelled" && status !== "canceled";
  });

  // Update number in shipping
  document.querySelector('.order-interface-header span').textContent = incompleteOrders.length;

  // Render orders
  const container = document.querySelector('.order-interface-products');
  container.innerHTML = ""; // Clear existing

  if (incompleteOrders.length === 0) {
    container.innerHTML = `<div style="color:white;padding:32px;">No orders in shipping.</div>`;
    return;
  }

  incompleteOrders.forEach(order => {
    const orderName = order.orderId;
    const status = order.status || "N/A";
    const productImg = (order.productDetails && order.productDetails[0] && order.productDetails[0].productImage) || "";
    const clientName = order.clientName || "N/A";
    const clientContact = order.clientContactDetails || "N/A";
    const clientAddress = order.addressOfClient || "N/A";
    const courierContact = order.courierContactDetails || "N/A";
    const courierId = order.courierId || "N/A";
    const eta = order.eta || "N/A";
    const deliveryOption = order.deliveryOption || "N/A";
    const paidWith = order.paidWith || "N/A";
    const subtotal = order.subtotal !== undefined ? `₱${order.subtotal.toLocaleString()}` : "N/A";
    const shippingFee = order.shippingFee !== undefined ? `₱${order.shippingFee.toLocaleString()}` : "N/A";
    const total = order.total !== undefined ? `₱${order.total.toLocaleString()}` : "N/A";

    const html = `
      <div class="order-interface-products-container shipping-card">
        <h1 class="order-interface-products-container-header">${orderName}</h1>
        <div class="order-interface-products-container-info-box">
          <div class="order-info-section">
            <div class="info-title">Order Info</div>
            <div><b>ETA:</b> ${eta}</div>
            <div><b>Status:</b> <span class="order-interface-products-container-status-sign">${status}</span></div>
            <div><b>Subtotal:</b> ${subtotal}</div>
            <div><b>Shipping Fee:</b> ${shippingFee}</div>
            <div><b>Total:</b> ${total}</div>
            <div><b>Delivery Option:</b> ${deliveryOption}</div>
            <div><b>Paid With:</b> ${paidWith.toUpperCase()}</div>
          </div>
          <div class="client-info-section">
            <div class="info-title">Client Info</div>
            <div><b>Name:</b> ${clientName}</div>
            <div><b>Contact:</b> ${clientContact}</div>
            <div><b>Address:</b> ${clientAddress}</div>
          </div>
          <div class="courier-info-section">
            <div class="info-title">Courier Info</div>
            <div><b>Courier ID:</b> ${courierId}</div>
            <div><b>Contact:</b> ${courierContact}</div>
          </div>
          <div class="order-interface-products-container-info-box-img">
            <img src="${productImg}" alt="product" style="max-width:80px;max-height:80px;">
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  });
}

// Run on page load
document.addEventListener("DOMContentLoaded", renderShippingOrders);