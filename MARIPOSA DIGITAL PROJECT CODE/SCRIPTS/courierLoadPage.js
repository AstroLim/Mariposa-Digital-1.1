import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
const auth = getAuth(app);

// Set username in navbar with debug logging
const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('strLoginAccount'));
console.log('Loaded user for navbar:', user);
const userNameElem = document.querySelector('.userName');
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

onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    alert("Please log in as a courier.");
    window.location.href = "landingPage.html";
    return;
  }
  
  const loadsSection = document.getElementById("assigned-loads");
  loadsSection.innerHTML = "<p>Loading assigned loads...</p>";

  try {
    // Fetch all orders from Firebase
    const ordersSnap = await get(ref(db, "orders"));
    let assignedOrders = [];
    
    if (ordersSnap.exists()) {
      ordersSnap.forEach(userOrdersSnap => {
        const clientId = userOrdersSnap.key;
        userOrdersSnap.forEach(orderSnap => {
          const order = orderSnap.val();
          // Only include orders assigned to this courier and not completed/delivered
          if (order.courierId === uid && 
              order.status && 
              order.status.toLowerCase() !== 'completed' && 
              order.status.toLowerCase() !== 'delivered') {
            assignedOrders.push({ ...order, clientId });
          }
        });
      });
    }

    loadsSection.innerHTML = "";
    if (assignedOrders.length === 0) {
      loadsSection.innerHTML = "<p style='color: white; text-align: center; padding: 2rem;'>No assigned loads at the moment.</p>";
      document.getElementById("load-count").textContent = "0";
      return;
    }

    document.getElementById("load-count").textContent = assignedOrders.length;

    assignedOrders.forEach(order => {
      const div = document.createElement("div");
      div.className = "order-container";
      div.innerHTML = `
        <div class="order-sec-top">
          <h1>Order #${order.orderId}</h1>
        </div>
        <div class="order-sec-bot">
          <p><strong>Client:</strong> ${order.clientName || "Unknown Client"}</p>
          <p><strong>Address:</strong> ${order.addressOfClient || "No address"}</p>
          <p><strong>Status:</strong> ${order.status || "Pending"}</p>
          <p><strong>ETA:</strong> ${order.eta || "Not set"}</p>
          <p><strong>Total:</strong> ₱${(order.total || 0).toLocaleString()}</p>
          <a href="courierManageLoadPage.html?orderId=${order.orderId}&clientId=${order.clientId}">
            <button class="manage-load-btn">Manage Load</button>
          </a>
        </div>
      `;
      loadsSection.appendChild(div);
    });
  } catch (error) {
    console.error("Error loading assigned loads:", error);
    loadsSection.innerHTML = "<p style='color: white; text-align: center; padding: 2rem;'>Error loading assigned loads. Please try again.</p>";
  }
});