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

onAuthStateChanged(auth, async (firebaseUser) => {
  if (!firebaseUser) {
    alert("Please log in as a courier.");
    window.location.href = "landingPage.html";
    return;
  }
  const courierId = firebaseUser.uid;
  const loadsSection = document.getElementById("assigned-loads");
  loadsSection.innerHTML = "<p>Loading assigned loads...</p>";

  // Fetch all orders for all users
  const ordersSnap = await get(ref(db, "orders"));
  let assignedOrders = [];
  if (ordersSnap.exists()) {
    ordersSnap.forEach(userOrdersSnap => {
      userOrdersSnap.forEach(orderSnap => {
        const order = orderSnap.val();
        if (order.courierId === courierId) {
          assignedOrders.push({ ...order, clientId: userOrdersSnap.key });
        }
      });
    });
  }

  loadsSection.innerHTML = "";
  if (assignedOrders.length === 0) {
    loadsSection.innerHTML = "<p>No assigned loads.</p>";
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
        <p>Client Name: ${order.clientName || "Unknown Client"}</p>
        <p>Client Address: ${order.addressOfClient}</p>
        <p>Status: ${order.status}</p>
        <a href="courierManageLoadPage.html?orderId=${order.orderId}&clientId=${order.clientId}">
          <button class="manage-load-btn">Manage Load</button>
        </a>
      </div>
    `;
    loadsSection.appendChild(div);
  });
});