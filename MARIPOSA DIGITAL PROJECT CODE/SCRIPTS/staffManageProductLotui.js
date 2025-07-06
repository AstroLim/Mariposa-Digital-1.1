// Import Firebase SDKs and jsPDF
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase, get, ref, push, remove, update } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

// Firebase configuration
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

// Check user authentication and access level
const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');

if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'staff') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}

// Display username
document.querySelector('.nav-user-container div').textContent = `${user.username}`;

// Function to update dashboard statistics
async function updateDashboard() {
    try {
        // Fetch products
        const productsSnapshot = await get(ref(db, 'products'));
        const products = [];
        productsSnapshot.forEach((childSnapshot) => {
            products.push(childSnapshot.val());
        });

        // Fetch orders
        const ordersSnapshot = await get(ref(db, 'orders')); // Adjust path if different
        const orders = [];
        if (ordersSnapshot.exists()) {
            ordersSnapshot.forEach((childSnapshot) => {
                orders.push(childSnapshot.val());
            });
        }

        // Fetch product logs
        const productLogsSnapshot = await get(ref(db, 'logs/products'));
        let productsAdded = 0;
        let productsRemoved = 0;
        if (productLogsSnapshot.exists()) {
            productLogsSnapshot.forEach((childSnapshot) => {
                const action = childSnapshot.val().action;
                if (action.includes('added')) {
                    productsAdded++;
                } else if (action.includes('removed')) {
                    productsRemoved++;
                }
            });
        }

        // Calculate statistics
        const numberOfProducts = products.length;
        const productsSold = orders.filter(order => order.status === 'Delivered').reduce((sum, order) => sum + (order.quantity || 0), 0);
        const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;

        // Update dashboard UI
        document.querySelector(".numberOfProducts-sec-bot .stat").textContent = numberOfProducts;
        document.querySelector(".numberOfSales-sec-bot .stat").textContent = productsSold;
        document.querySelector(".productsAdded-sec-bot .stat").textContent = productsAdded;
        document.querySelector(".numberOfCanceledOrder-sec-bot .stat").textContent = cancelledOrders;
        document.querySelector(".productsRemoved-sec-bot .stat").textContent = productsRemoved;
    } catch (error) {
        console.error("Error updating dashboard:", error);
        alert("Failed to load dashboard data.");
    }
}

// Function to render Add Product UI
function addProductui() {
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot');
    let rightSec = document.querySelector('.MainSection-Content-right-sec');

    productManagementBoxSecBot.innerHTML = `
        <button class="addProductBtn" onclick="addProductui()">Add Product</button>
        <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>
        <button class="viewPaymentHistoryBtn">View Payment History</button>
        <button class="backBtn" onclick="back()">Back</button>
    `;

    rightSec.innerHTML = `
        <div class="addProductBox">
            <header>
                <h1>Product Description</h1>
            </header>
            <section>
                <div class="addProductBox-leftSec">
                    <label for="productName">Product Name:</label>
                    <label for="pricePerSack">Price:</label>
                    <label for="productDescription">Description:</label>
                    <label for="productImages">Insert Images:</label>
                </div>
                <div class="addProductBox-rightSec">
                    <input type="text" class="productName" id="productName">
                    <input type="number" class="pricePerSack" id="pricePerSack">
                    <input type="text" class="productDescription" id="productDescription">
                    <input type="text" class="productImages" id="productImages">
                </div>
            </section>
            <footer>
                <button class="footerBtn" onclick="addProduct(event)">Confirm Add Products</button>
            </footer>
        </div>
    `;
}

// Function to add a Product
async function addProduct(event) {
    event.preventDefault();
    const productName = document.getElementById('productName').value.trim();
    const pricePerSack = parseFloat(document.getElementById('pricePerSack').value);
    const productDescription = document.getElementById('productDescription').value.trim();
    const productImages = document.getElementById('productImages').value.trim(); // Placeholder for image URL

    if (!productName || isNaN(pricePerSack) || !productDescription) {
        alert('Please fill in all required fields with valid data');
        return;
    }

    try {
        // Check if product name already exists
        let isProductFound = false;
        const productsSnapshot = await get(ref(db, 'products'));
        productsSnapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().productName.toLowerCase() === productName.toLowerCase()) {
                isProductFound = true;
            }
        });

        if (isProductFound) {
            alert('Product name already exists');
            return;
        }

        const newProduct = {
            productName: productName,
            pricePerSack: pricePerSack,
            productDescription: productDescription,
            productImages: productImages || "" // Store image URL or empty string
        };

        const newProductRef = await push(ref(db, 'products'), newProduct);
        await push(ref(db, 'logs/products'), {
            action: `Product ${productName} added by staff member ${user.firstName} ${user.lastName}`,
            date: new Date().toUTCString(),
            by: uid,
            productId: newProductRef.key,
            staffName: `${user.firstName} ${user.lastName}`,
            staffId: uid
        });

        alert('Product added successfully');
        document.getElementById('productName').value = '';
        document.getElementById('pricePerSack').value = '';
        document.getElementById('productDescription').value = '';
        document.getElementById('productImages').value = '';
        await updateDashboard();
    } catch (error) {
        console.error("Error adding product:", error);
        alert('Error adding product: ' + error.message);
    }
}

// Function to render Manage Order UI
function manageOrder() {
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot');
    let rightSec = document.querySelector('.MainSection-Content-right-sec');

    productManagementBoxSecBot.innerHTML = `
        <button class="addProductBtn" onclick="addProductui()">Add Product</button>
        <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>
        <button class="viewPaymentHistoryBtn">View Payment History</button>
        <button class="backBtn" onclick="back()">Back</button>
    `;

    rightSec.innerHTML = `
        <div class="manageOrderBox">
            <header>
                <h1>Manage Client Order</h1>
            </header>
            <section>
                <div class="manageOrderBox-leftSec">
                    <label for="clientId">Client ID:</label>
                </div>
                <div class="manageOrderBox-rightSec">
                    <input type="text" class="clientId" id="clientId">
                </div>
            </section>
            <footer>
                <button class="viewPendingOrdersBtn" id="viewPendingOrdersBtn" onclick="viewPendingOrders()">View Pending Orders</button>
            </footer>
            <main id="pendingOrdersContainer"></main>
        </div>
    `;
}

// Function to view pending orders
async function viewPendingOrders() {
    const clientId = document.getElementById('clientId').value.trim();
    const pendingOrdersContainer = document.getElementById('pendingOrdersContainer');

    if (!clientId) {
        alert('Please enter a Client ID');
        return;
    }

    try {
        const ordersSnapshot = await get(ref(db, 'orders'));
        const pendingOrders = [];
        ordersSnapshot.forEach((childSnapshot) => {
            const order = childSnapshot.val();
            if (order.clientId === clientId && order.status === 'Pending') {
                pendingOrders.push({ key: childSnapshot.key, ...order });
            }
        });

        let ordersHtml = '';
        if (pendingOrders.length === 0) {
            ordersHtml = '<p>No pending orders found for this client.</p>';
        } else {
            pendingOrders.forEach(order => {
                ordersHtml += `
                    <div class="orderInfoBox">
                        <header><h2>Order ID: ${order.orderId}</h2></header>
                        <main>
                            <div class="orderInfoBox-leftSec">
                                <p>Product: ${order.productName}</p>
                                <p>Quantity: ${order.quantity}</p>
                                <p>Order Date: ${order.orderDate}</p>
                                <p>Total Price: ₱${(order.quantity * order.pricePerSack).toFixed(2)}</p>
                                <button class="confirmOrder" data-key="${order.key}">Confirm Order</button>
                                <button class="cancelOrder" data-key="${order.key}">Cancel Order</button>
                            </div>
                            <div class="orderInfoBox-rightSec">
                                <img src="${order.productImages || ''}" class="productImg" alt="Product Image">
                            </div>
                        </main>
                    </div>
                `;
            });
        }

        pendingOrdersContainer.innerHTML = ordersHtml;

        // Add event listeners for confirm and cancel buttons
        document.querySelectorAll('.confirmOrder').forEach(button => {
            button.addEventListener('click', async (event) => {
                const key = event.target.dataset.key;
                try {
                    await update(ref(db, `orders/${key}`), { status: 'Processing' });
                    await push(ref(db, 'logs/orders'), {
                        action: `Order ${key} confirmed by staff member ${user.firstName} ${user.lastName}`,
                        date: new Date().toUTCString(),
                        by: uid,
                        staffName: `${user.firstName} ${user.lastName}`,
                        staffId: uid
                    });
                    alert('Order confirmed successfully');
                    await viewPendingOrders(); // Refresh orders
                    await updateDashboard();
                } catch (error) {
                    alert('Error confirming order: ' + error.message);
                }
            });
        });

        document.querySelectorAll('.cancelOrder').forEach(button => {
            button.addEventListener('click', async (event) => {
                const key = event.target.dataset.key;
                try {
                    await update(ref(db, `orders/${key}`), { status: 'Cancelled' });
                    await push(ref(db, 'logs/orders'), {
                        action: `Order ${key} cancelled by staff member ${user.firstName} ${user.lastName}`,
                        date: new Date().toUTCString(),
                        by: uid,
                        staffName: `${user.firstName} ${user.lastName}`,
                        staffId: uid
                    });
                    alert('Order cancelled successfully');
                    await viewPendingOrders(); // Refresh orders
                    await updateDashboard();
                } catch (error) {
                    alert('Error cancelling order: ' + error.message);
                }
            });
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        pendingOrdersContainer.innerHTML = '<p>Failed to load orders.</p>';
    }
}

// Function to render Dashboard UI
function back() {
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot');
    let rightSec = document.querySelector('.MainSection-Content-right-sec');

    productManagementBoxSecBot.innerHTML = `
        <button class="addProductBtn" onclick="addProductui()">Add Product</button>
        <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>
        <button class="viewPaymentHistoryBtn">View Payment History</button>
    `;

    rightSec.innerHTML = `
        <div class="right-sec-topContent">
            <div class="numberOfProducts-container">
                <div class="numberOfProducts-sec-top">
                    <h1>Number Of Products</h1>
                </div>
                <div class="numberOfProducts-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Total:</h1><p class="stat">0</p></div>
                </div>
            </div>
            <div class="numberOfSales-container">
                <div class="numberOfSales-sec-top">
                    <h1>Products Sold:</h1>
                </div>
                <div class="numberOfSales-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Products Sold:</h1><p class="stat">0</p></div>
                </div>
            </div>
        </div>
        <div class="right-sec-botContent">
            <div class="productsAdded-container">
                <div class="productsAdded-sec-top">
                    <h1>Products Added</h1>
                </div>
                <div class="productsAdded-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Added Products:</h1><p class="stat">0</p></div>
                </div>
            </div>
            <div class="numberOfCanceledOrder-container">
                <div class="numberOfCanceledOrder-sec-top">
                    <h1>Cancelled Orders</h1>
                </div>
                <div class="numberOfCanceledOrder-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Cancelled Orders:</h1><p class="stat">0</p></div>
                </div>
            </div>
            <div class="productsRemoved-container">
                <div class="productsRemoved-sec-top">
                    <h1>Products Removed</h1>
                </div>
                <div class="productsRemoved-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Removed Products:</h1><p class="stat">0</p></div>
                </div>
            </div>
        </div>
    `;

    // Refresh dashboard data
    updateDashboard();
}

// Function to download product logs as PDF
async function downloadProductLogs() {
    try {
        const logsRef = ref(db, 'logs/products');
        const logsSnapshot = await get(logsRef);
        const logs = logsSnapshot.val();

        if (!logs) {
            alert('No logs found');
            return;
        }

        const doc = new jsPDF();
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();

        // Add title
        doc.setFontSize(18);
        doc.text(`Product Logs - ${month} ${year}`, 105, 10, null, null, 'center');

        // Add horizontal line
        doc.setLineWidth(0.5);
        doc.line(10, 15, 200, 15);

        // Set font size for logs
        doc.setFontSize(12);
        let y = 20;

        Object.entries(logs).forEach(([key, log]) => {
            doc.text(`Date: ${new Date(log.date).toLocaleString()}`, 10, y);
            y += 10;
            doc.text(`Action: ${log.action}`, 10, y);
            y += 10;
            doc.text(`By UserID: ${log.by}`, 10, y);
            y += 10;
            doc.text(`Product ID: ${log.productId || 'N/A'}`, 10, y);
            y += 20;
            doc.line(10, y - 10, 200, y - 10);
        });

        doc.save(`product_logs_${month}_${year}.pdf`);
    } catch (error) {
        console.error("Error downloading product logs:", error);
        alert('Error downloading logs: ' + error.message);
    }
}

// Export functions to be available globally
window.addProductui = addProductui;
window.addProduct = addProduct;
window.manageOrder = manageOrder;
window.viewPendingOrders = viewPendingOrders;
window.back = back;
window.downloadProductLogs = downloadProductLogs;

// Initialize dashboard on page load
updateDashboard();