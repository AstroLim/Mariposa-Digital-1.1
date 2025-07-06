import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
const auth = getAuth(app);
const db = getDatabase(app);

// Set username in navbar with debug logging
const userNameElem = document.querySelector('.userName');
const user = JSON.parse(localStorage.getItem('user'));
console.log('Loaded user for navbar:', user);
console.log('Navbar .userName element:', userNameElem);
if (user && user.username && userNameElem) {
    userNameElem.textContent = user.username;
}

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

const ordersContainer = document.getElementById("orders-container");
const feedbackDiv = document.getElementById("feedback");

async function loadAllOrders() {
  try {
    ordersContainer.innerHTML = "<p>Loading orders...</p>";
    
    // Fetch all orders from Firebase
    const ordersRef = ref(db, "orders");
    const ordersSnap = await get(ordersRef);
    
    if (!ordersSnap.exists()) {
      ordersContainer.innerHTML = "<p>No orders found.</p>";
      return;
    }

    ordersContainer.innerHTML = "";
    let orderCount = 0;

    // Iterate through all users' orders
    ordersSnap.forEach(userOrdersSnap => {
      const clientId = userOrdersSnap.key;
      userOrdersSnap.forEach(orderSnap => {
        const orderId = orderSnap.key;
        const order = orderSnap.val();
        
        // Only show orders assigned to this courier
        if (order.courierId === uid) {
          orderCount++;

          const orderDiv = document.createElement("div");
          orderDiv.className = "order-item";
          orderDiv.innerHTML = `
            <div class="order-header">
              <h3>Order #${order.orderId || orderId}</h3>
              <span class="status-badge ${order.status?.toLowerCase().replace(' ', '-')}">${order.status || 'Pending'}</span>
            </div>
            <div class="order-details">
              <p><strong>Client:</strong> ${order.clientName || "Unknown Client"}</p>
              <p><strong>Contact:</strong> ${order.clientContactDetails || "No contact provided"}</p>
              <p><strong>Address:</strong> ${order.addressOfClient || "No address provided"}</p>
              <p><strong>ETA:</strong> ${order.eta || "Not set"}</p>
              <p><strong>Total:</strong> ₱${(order.total || 0).toLocaleString()}</p>
              <p><strong>Products:</strong></p>
              <ul class="products-list">
                ${(order.productDetails || []).map(prod => `
                  <li>${prod.productName || "Product"} (${prod.weight || 0}kg x ${prod.quantity || 1}) - ₱${((prod.pricePerKilo || prod.pricePerSack || 0) * (prod.weight || 0) * (prod.quantity || 1)).toLocaleString()}</li>
                `).join("")}
              </ul>
            </div>
            <div class="order-actions">
              <select class="status-select" data-order-id="${orderId}" data-client-id="${clientId}">
                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Pick-Up" ${order.status === 'Pick-Up' ? 'selected' : ''}>Pick-Up</option>
                <option value="In Transit" ${order.status === 'In Transit' ? 'selected' : ''}>In Transit</option>
                <option value="On The Way" ${order.status === 'On The Way' ? 'selected' : ''}>On The Way</option>
                <option value="Delivery Soon" ${order.status === 'Delivery Soon' ? 'selected' : ''}>Delivery Soon</option>
                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              </select>
              <button class="update-btn" onclick="updateOrderStatus('${orderId}', '${clientId}')">Update Status</button>
            </div>
          `;
          ordersContainer.appendChild(orderDiv);
        }
      });
    });

    if (orderCount === 0) {
      ordersContainer.innerHTML = "<p>No orders assigned to you at the moment.</p>";
    }

  } catch (error) {
    console.error("Error loading orders:", error);
    ordersContainer.innerHTML = "<p>Error loading orders. Please try again.</p>";
  }
}

// Function to update order status
async function updateOrderStatus(orderId, clientId) {
  try {
    const orderDiv = document.querySelector(`[data-order-id="${orderId}"][data-client-id="${clientId}"]`).closest('.order-item');
    const statusSelect = orderDiv.querySelector('.status-select');
    const newStatus = statusSelect.value;
    
    const orderRef = ref(db, `orders/${clientId}/${orderId}`);
    await update(orderRef, { status: newStatus });
    
    // Update the status badge
    const statusBadge = orderDiv.querySelector('.status-badge');
    statusBadge.textContent = newStatus;
    statusBadge.className = `status-badge ${newStatus.toLowerCase().replace(' ', '-')}`;
    
    // Show success feedback
    feedbackDiv.textContent = "Order status updated successfully!";
    feedbackDiv.style.color = "#1e7d34";
    feedbackDiv.style.display = "block";
    
    setTimeout(() => {
      feedbackDiv.style.display = "none";
    }, 3000);
    
  } catch (error) {
    console.error("Error updating order status:", error);
    feedbackDiv.textContent = "Failed to update order status: " + error.message;
    feedbackDiv.style.color = "#B61718";
    feedbackDiv.style.display = "block";
  }
}

// Make the function globally available
window.updateOrderStatus = updateOrderStatus;

// Load orders when page loads
document.addEventListener("DOMContentLoaded", loadAllOrders);