import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');

if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'user') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}

// Set username in header
function setUserName() {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData && userData.username && document.querySelector(".userName")) {
        document.querySelector(".userName").textContent = userData.username;
    }
}
setUserName();

// Global variables to store orders and current filter
let allOrders = [];
let currentFilter = 'all';

// Function to normalize status for comparison
function normalizeStatus(status) {
    if (!status) return 'pending';
    return status.toLowerCase().trim();
}

// Function to render orders based on current filter
function renderOrders() {
    const ordersList = document.getElementById("orders-list");
    console.log('Rendering orders with filter:', currentFilter);
    console.log('Total orders:', allOrders.length);
    
    // Filter orders based on current selection
    let filteredOrders = allOrders;
    if (currentFilter !== 'all') {
        filteredOrders = allOrders.filter(order => {
            const orderStatus = normalizeStatus(order.status);
            const filterStatus = normalizeStatus(currentFilter);
            console.log('Comparing:', orderStatus, 'with', filterStatus);
            return orderStatus === filterStatus;
        });
    }

    console.log('Filtered orders:', filteredOrders.length);

    // Sort orders by most recent
    filteredOrders.sort((a, b) => (b.orderId || 0) - (a.orderId || 0));

    if (filteredOrders.length === 0) {
        const filterText = currentFilter === 'all' ? 'All Orders' : currentFilter;
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #B61718; font-family: Grenze, serif; font-size: 1.2rem;">
                ${currentFilter === 'all' ? 'You have no orders yet.' : `No orders with status "${filterText}" found.`}
            </div>
        `;
        return;
    }

    ordersList.innerHTML = "";
    for (const order of filteredOrders) {
        const orderStatus = order.status || "Pending";
        ordersList.innerHTML += `
        <div class="order-card">
            <div class="order-card-header">
                <span class="order-id">Order #${order.orderId || "N/A"}</span>
                <span class="order-status">
                    Status:
                    <span class="order-status-badge" data-status="${orderStatus}">${orderStatus}</span>
                </span>
            </div>
            <div class="order-card-body">
                <div class="order-card-row"><span class="label">Client Name:</span> <span>${order.clientName || "Unknown Client"}</span></div>
                <div class="order-card-row"><span class="label">Client Contact:</span> <span>${order.clientContactDetails || "No contact provided"}</span></div>
                <div class="order-card-row"><span class="label">Client ID:</span> <span>${order.clientId}</span></div>
                <div class="order-card-row"><span class="label">Courier Contact:</span> <span>${order.courierContactDetails}</span></div>
                <div class="order-card-row"><span class="label">Address:</span> <span>${order.addressOfClient || "N/A"}</span></div>
                <div class="order-card-row"><span class="label">Paid with:</span> <span>${order.paidWith || "N/A"}</span></div>
                <div class="order-card-row"><span class="label">Delivery Option:</span> <span>${order.deliveryOption || "N/A"}</span></div>
                <div class="order-card-row"><span class="label">ETA:</span> <span>${order.eta ? order.eta : "N/A"}</span></div>
                <div class="order-card-row"><span class="label">Subtotal:</span> <span>₱${(order.subtotal || 0).toLocaleString()}</span></div>
                <div class="order-card-row"><span class="label">Shipping:</span> <span>₱${(order.shippingFee || 0).toLocaleString()}</span></div>
                <div class="order-card-row"><span class="label">Total:</span> <span>₱${(order.total || 0).toLocaleString()}</span></div>
                <div class="order-card-products">
                    <div class="order-card-products-title">Products:</div>
                    <ul class="order-card-products-list">
                        ${(order.productDetails || []).map(prod => `
                            <li>
                                <strong>${prod.productName || "Product"}</strong>
                                (${prod.weight || 0}kg x ${prod.quantity || 1}) - ₱${((prod.pricePerKilo || prod.pricePerSack || 0) * (prod.weight || 0) * (prod.quantity || 1)).toLocaleString()}
                            </li>
                        `).join("")}
                    </ul>
                </div>
            </div>
            <div class="order-card-footer">
                <span>Order ID: ${order.orderId || "N/A"}</span>
                <span>${orderStatus}</span>
            </div>
        </div>
        `;
    }
}

// Function to setup filter event listener
function setupFilter() {
    console.log('Setting up filter...');
    const statusFilter = document.getElementById('status-filter');
    console.log('Status filter element:', statusFilter);
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            console.log('Filter changed to:', this.value);
            currentFilter = this.value;
            renderOrders();
        });
        console.log('Filter event listener added successfully');
    } else {
        console.error('Status filter element not found!');
    }
}

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up filter...');
    setupFilter();
});

// Load orders for the current user
onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
        document.body.innerHTML = '';
        alert('Please log in to access this page.');
        window.location.href = 'landingPage.html';
        return;
    }
    const uid = firebaseUser.uid;
    const ordersList = document.getElementById("orders-list");
    ordersList.innerHTML = "<p style='color:#B61718;font-family:Grenze,serif;font-size:1.2rem;'>Loading your orders...</p>";

    try {
        const ordersSnap = await get(ref(db, `orders/${uid}`));
        if (!ordersSnap.exists()) {
            ordersList.innerHTML = "<p style='color:#B61718;font-family:Grenze,serif;font-size:1.1rem;'>You have no orders yet.</p>";
            return;
        }
        
        // Store all orders globally
        allOrders = [];
        ordersSnap.forEach(child => {
            allOrders.push(child.val());
        });

        console.log('Loaded orders:', allOrders.length);
        console.log('Sample order statuses:', allOrders.map(o => o.status));

        // Setup filter functionality
        setupFilter();
        
        // Render orders with current filter
        renderOrders();
        
    } catch (err) {
        console.error('Error loading orders:', err);
        ordersList.innerHTML = `<p style='color:#B61718;font-family:Grenze,serif;font-size:1.1rem;'>Failed to load orders: ${err.message}</p>`;
    }
});