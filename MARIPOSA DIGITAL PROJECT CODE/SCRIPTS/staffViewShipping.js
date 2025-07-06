// staffViewShipping.js
import { initializeApp } from "firebase/app";
import { getDatabase, get, ref, set } from "firebase/database";

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

// Making Staff View Shipping Page Username Content Dynamic based on who's logged in
function updateUsername() {
    if (user) { 
        const userName = user.username || user.firstName + ' ' + user.lastName || 'Staff User';
        const userNameElement = document.querySelector(".userName");
        if (userNameElement) {
            userNameElement.textContent = userName;
        }
    }
}

// Update username when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    updateUsername();
    setupAssignCourierModal();
});

// Test function to check different Firebase paths
async function testFirebasePaths() {
    console.log("=== TESTING FIREBASE PATHS ===");
    
    const paths = [
        "orders",
        "order",
        "Order",
        "Orders",
        "userOrders",
        "user_orders"
    ];
    
    for (const path of paths) {
        try {
            const testRef = ref(db, path);
            const testSnap = await get(testRef);
            console.log(`Path "${path}":`, testSnap.exists() ? "EXISTS" : "NOT FOUND");
            if (testSnap.exists()) {
                console.log(`Data at "${path}":`, testSnap.val());
            }
        } catch (error) {
            console.log(`Path "${path}": ERROR -`, error.message);
        }
    }
    
    // Also check root level
    try {
        const rootRef = ref(db, "");
        const rootSnap = await get(rootRef);
        console.log("Root level keys:", Object.keys(rootSnap.val() || {}));
    } catch (error) {
        console.log("Root level error:", error.message);
    }
}

// Function to show loading state
function showLoading(message = "Loading Orders") {
    const container = document.getElementById('orders-container');
    if (container) {
        container.innerHTML = `
            <div class="loading-container" id="loading-container">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}<span class="loading-dots"></span></div>
                <div class="loading-subtext">Fetching data from Firebase</div>
            </div>
        `;
    }
}

// Function to update missing courier names in existing orders
async function updateMissingCourierNames(orders) {
    try {
        console.log("Checking for orders with missing courier names...");
        
        // Get all users to find courier details
        const usersRef = ref(db, "users");
        const usersSnap = await get(usersRef);
        
        if (!usersSnap.exists()) {
            console.log("No users found, cannot update courier names");
            return orders;
        }
        
        const users = usersSnap.val();
        console.log("All users in system:", Object.keys(users));
        
        const couriers = Object.entries(users)
            .filter(([id, user]) => {
                const isCourier = user.accessLevel && user.accessLevel.toLowerCase() === "courier";
                console.log(`User ${id}: accessLevel = ${user.accessLevel}, isCourier = ${isCourier}`);
                return isCourier;
            })
            .reduce((acc, [id, user]) => {
                acc[id] = user;
                console.log(`Courier found: ${id} - ${user.username || user.firstName || 'No name'}`);
                return acc;
            }, {});
        
        console.log("Available couriers:", Object.keys(couriers));
        console.log("Courier details:", couriers);
        
        // Update orders with missing courier names
        const updatedOrders = orders.map(order => {
            console.log(`Processing order ${order.orderId}:`, {
                courierId: order.courierId,
                courierName: order.courierName,
                status: order.status
            });
            
            // If order has no courier assigned, assign one
            if (!order.courierId || order.courierId === "N/A") {
                const courierIds = Object.keys(couriers);
                if (courierIds.length > 0) {
                    // Simple round-robin assignment based on order ID
                    const courierIndex = parseInt(order.orderId) % courierIds.length;
                    const assignedCourierId = courierIds[courierIndex];
                    const assignedCourier = couriers[assignedCourierId];
                    
                    console.log(`Assigning courier ${assignedCourierId} to order ${order.orderId}`);
                    
                    return {
                        ...order,
                        courierId: assignedCourierId,
                        courierName: assignedCourier.username || assignedCourier.firstName || "Courier",
                        courierContactDetails: assignedCourier.phone || assignedCourier.mobilenumber || assignedCourier.email || "N/A"
                    };
                }
            }
            
            // If order has courier ID but no name, fix the name
            if (order.courierName === "Not assigned" && order.courierId && order.courierId !== "N/A") {
                const courier = couriers[order.courierId];
                if (courier) {
                    const courierName = courier.username || 
                                       (courier.firstName && courier.lastName ? 
                                        `${courier.firstName} ${courier.lastName}` : 
                                        courier.firstName || 
                                        courier.lastName || 
                                        "Courier");
                    
                    console.log(`Updating order ${order.orderId} courier name from "Not assigned" to "${courierName}"`);
                    
                    return {
                        ...order,
                        courierName: courierName,
                        courierContactDetails: courier.phone || courier.mobilenumber || courier.email || "N/A"
                    };
                } else {
                    console.log(`Courier ${order.courierId} not found in couriers list`);
                }
            }
            
            return order;
        });
        
        return updatedOrders;
    } catch (error) {
        console.error("Error updating courier names:", error);
        return orders;
    }
}

// Fetch and render shipping orders for staff
async function renderStaffShippingOrders() {
    try {
        console.log("Fetching orders from Firebase...");
        showLoading("Connecting to Firebase");
        
        // First, let's test different paths
        await testFirebasePaths();
        
        showLoading("Loading Orders");
        
        const ordersRef = ref(db, "orders");
        const snap = await get(ordersRef);
        let allOrders = [];
        
        if (snap.exists()) {
            console.log("Orders found, processing...");
            console.log("Raw orders data:", snap.val());
            
            showLoading("Processing Orders");
            
            snap.forEach(userOrdersSnap => {
                const clientId = userOrdersSnap.key;
                const userOrders = userOrdersSnap.val();
                console.log(`Processing client ${clientId}:`, userOrders);
                
                // Handle the Firebase data structure properly
                if (userOrders && typeof userOrders === 'object') {
                    Object.entries(userOrders).forEach(([orderId, order]) => {
                        console.log(`Processing order ${orderId}:`, order);
                        if (order && typeof order === 'object') {
                            allOrders.push({ 
                                ...order, 
                                orderId: order.orderId || orderId, 
                                clientId,
                                firebaseOrderId: orderId 
                            });
                        }
                    });
                }
            });
        } else {
            console.log("No orders found in Firebase");
        }

        console.log(`Total orders found: ${allOrders.length}`);
        console.log("All orders array:", allOrders);

        // Update missing courier names
        showLoading("Updating Courier Information");
        allOrders = await updateMissingCourierNames(allOrders);

        // Filter for orders not completed or cancelled
        const incompleteOrders = allOrders.filter(order => {
            const status = (order.status || "").toLowerCase();
            const isIncomplete = status !== "completed" && status !== "cancelled" && status !== "canceled" && status !== "delivered";
            console.log(`Order ${order.orderId} status: "${status}" - Incomplete: ${isIncomplete}`);
            return isIncomplete;
        });

        console.log(`Incomplete orders: ${incompleteOrders.length}`);
        console.log("Incomplete orders array:", incompleteOrders);

        // Update order count in header
        const orderCountElem = document.getElementById('order-count');
        if (orderCountElem) {
            orderCountElem.textContent = incompleteOrders.length;
        }

        // Render orders
        const container = document.getElementById('orders-container');
        if (!container) {
            console.error("Orders container not found!");
            return;
        }
        
        container.innerHTML = "";

        if (incompleteOrders.length === 0) {
            container.innerHTML = `
                <div style="color: white; text-align: center; padding: 4rem 2rem; font-size: 1.2rem; font-family: 'Grenze', serif;">
                    <div style="margin-bottom: 1rem;">📦</div>
                    <div>No orders in shipping at the moment.</div>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;">All orders have been completed or are not yet in shipping.</div>
                </div>
            `;
            return;
        }

        incompleteOrders.forEach(order => {
            const orderName = order.orderId || order.firebaseOrderId || "N/A";
            const status = order.status || "Pending";
            const clientName = order.clientName || "N/A";
            const clientAddress = order.addressOfClient || "N/A";
            const courierName = order.courierName || "Not assigned";
            const courierContact = order.courierContactDetails || "Not assigned";
            const paidWith = order.paidWith || "N/A";
            const deliveryOption = order.deliveryOption || "N/A";
            const eta = order.eta || "N/A";
            const subtotal = order.subtotal !== undefined ? `₱${order.subtotal.toLocaleString()}` : "N/A";
            const shippingFee = order.shippingFee !== undefined ? `₱${order.shippingFee.toLocaleString()}` : "N/A";
            const total = order.total !== undefined ? `₱${order.total.toLocaleString()}` : "N/A";
            
            const productsList = (order.productDetails || []).map(prod => `
                <li><strong>${prod.productName || "Product"}</strong> (${prod.weight || 0}kg x ${prod.quantity || 1}) - ₱${((prod.pricePerKilo || prod.pricePerSack || 0) * (prod.weight || 0) * (prod.quantity || 1)).toLocaleString()}</li>
            `).join("");

            const html = `
                <div class="order-card">
                    <div class="order-card-header">
                        <span class="order-id">Order #${orderName}</span>
                        <span class="order-status">
                            Status:
                            <span class="order-status-badge" data-status="${status}">${status}</span>
                        </span>
                    </div>
                    <div class="order-card-body">
                        <div class="order-card-row"><span class="label">Client Name:</span> <span>${clientName}</span></div>
                        <div class="order-card-row"><span class="label">Client Address:</span> <span>${clientAddress}</span></div>
                        <div class="order-card-row"><span class="label">Courier Name:</span> <span>${courierName}</span></div>
                        <div class="order-card-row"><span class="label">Courier Contact:</span> <span>${courierContact}</span></div>
                        <div class="order-card-row"><span class="label">Paid with:</span> <span>${paidWith}</span></div>
                        <div class="order-card-row"><span class="label">Delivery Option:</span> <span>${deliveryOption}</span></div>
                        <div class="order-card-row"><span class="label">ETA:</span> <span>${eta}</span></div>
                        <div class="order-card-row"><span class="label">Subtotal:</span> <span>${subtotal}</span></div>
                        <div class="order-card-row"><span class="label">Shipping:</span> <span>${shippingFee}</span></div>
                        <div class="order-card-row"><span class="label">Total:</span> <span>${total}</span></div>
                        <div class="order-card-products">
                            <div class="order-card-products-title">Products:</div>
                            <ul class="order-card-products-list">${productsList}</ul>
                        </div>
                    </div>
                    <div class="order-card-footer">
                        <span>Order ID: ${orderName}</span>
                        <span>${status}</span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        console.log("Orders rendered successfully!");
    } catch (error) {
        console.error("Error fetching orders:", error);
        const container = document.getElementById('orders-container');
        if (container) {
            container.innerHTML = `
                <div style="color: white; text-align: center; padding: 4rem 2rem; font-size: 1.2rem; font-family: 'Grenze', serif;">
                    <div style="margin-bottom: 1rem;">⚠️</div>
                    <div>Error loading orders</div>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;">Please check your connection and try again.</div>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #B61718; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: 'Grenze', serif;">Retry</button>
                </div>
            `;
        }
    }
}

// Load orders when page loads
document.addEventListener("DOMContentLoaded", renderStaffShippingOrders); 

// Function to manually assign couriers to orders and save to Firebase
async function manuallyAssignCouriers() {
    try {
        console.log("Manually assigning couriers to orders...");
        
        // Get all users to find courier details
        const usersRef = ref(db, "users");
        const usersSnap = await get(usersRef);
        
        if (!usersSnap.exists()) {
            alert("No users found in the system");
            return;
        }
        
        const users = usersSnap.val();
        const couriers = Object.entries(users)
            .filter(([id, user]) => user.accessLevel && user.accessLevel.toLowerCase() === "courier")
            .reduce((acc, [id, user]) => {
                acc[id] = user;
                return acc;
            }, {});
        
        if (Object.keys(couriers).length === 0) {
            alert("No couriers found in the system");
            return;
        }
        
        console.log("Available couriers for assignment:", Object.keys(couriers));
        
        // Get all orders
        const ordersRef = ref(db, "orders");
        const ordersSnap = await get(ordersRef);
        
        if (!ordersSnap.exists()) {
            alert("No orders found");
            return;
        }
        
        let assignmentCount = 0;
        const courierIds = Object.keys(couriers);
        let currentCourierIndex = 0;
        
        // Process each client's orders
        ordersSnap.forEach(userOrdersSnap => {
            const clientId = userOrdersSnap.key;
            const userOrders = userOrdersSnap.val();
            
            Object.entries(userOrders).forEach(async ([orderId, order]) => {
                // Check if order needs courier assignment
                if (!order.courierId || order.courierId === "N/A" || order.courierName === "Not assigned") {
                    const assignedCourierId = courierIds[currentCourierIndex % courierIds.length];
                    const assignedCourier = couriers[assignedCourierId];
                    
                    const updatedOrder = {
                        ...order,
                        courierId: assignedCourierId,
                        courierName: assignedCourier.username || assignedCourier.firstName || "Courier",
                        courierContactDetails: assignedCourier.phone || assignedCourier.mobilenumber || assignedCourier.email || "N/A"
                    };
                    
                    // Save back to Firebase
                    const orderRef = ref(db, `orders/${clientId}/${orderId}`);
                    await set(orderRef, updatedOrder);
                    
                    console.log(`Assigned courier ${assignedCourierId} to order ${orderId}`);
                    assignmentCount++;
                    
                    currentCourierIndex++;
                }
            });
        });
        
        alert(`Successfully assigned couriers to ${assignmentCount} orders!`);
        
        // Reload the page to show updated data
        location.reload();
        
    } catch (error) {
        console.error("Error manually assigning couriers:", error);
        alert("Error assigning couriers: " + error.message);
    }
}

// Show the assign courier modal for all orders (or just those with Not assigned)
async function showAssignCourierModal() {
    const modal = document.getElementById('assign-courier-modal');
    const modalContent = document.getElementById('assign-courier-modal-content');
    if (!modal || !modalContent) return;
    modalContent.innerHTML = '<div style="color:#B61718;">Loading orders and couriers...</div>';
    modal.style.display = 'flex';

    // Fetch couriers
    const usersSnap = await get(ref(db, 'users'));
    let couriers = [];
    if (usersSnap.exists()) {
        couriers = Object.entries(usersSnap.val())
            .filter(([id, user]) => user.accessLevel && user.accessLevel.toLowerCase() === 'courier')
            .map(([id, user]) => ({
                id,
                name: user.username || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || 'Courier'),
                contact: user.phone || user.mobilenumber || user.email || 'N/A',
            }));
    }
    if (couriers.length === 0) {
        modalContent.innerHTML = '<div style="color:#B61718;">No couriers found in the system.</div>';
        return;
    }

    // Fetch all orders
    const ordersSnap = await get(ref(db, 'orders'));
    let orders = [];
    if (ordersSnap.exists()) {
        ordersSnap.forEach(userOrdersSnap => {
            const clientId = userOrdersSnap.key;
            const userOrders = userOrdersSnap.val();
            Object.entries(userOrders).forEach(([orderId, order]) => {
                orders.push({ ...order, orderId, clientId });
            });
        });
    }
    // Only show orders with Not assigned or allow all orders to be reassigned
    // const filteredOrders = orders.filter(order => order.courierName === 'Not assigned' || !order.courierId || order.courierId === 'N/A');
    const filteredOrders = orders; // Show all for flexibility
    if (filteredOrders.length === 0) {
        modalContent.innerHTML = '<div style="color:#B61718;">No orders found.</div>';
        return;
    }

    // Build the modal content
    modalContent.innerHTML = filteredOrders.map(order => {
        const currentCourier = couriers.find(c => c.id === order.courierId);
        return `
            <div style="margin-bottom:1.5rem; border-bottom:1px solid #eee; padding-bottom:1rem;">
                <div style="font-weight:600; color:#222;">Order #${order.orderId}</div>
                <div style="font-size:0.95rem; color:#444; margin-bottom:0.3rem;">Client: ${order.clientName || 'N/A'}</div>
                <label style="font-size:0.95rem; color:#222;">Assign Courier:
                    <select data-order-id="${order.orderId}" data-client-id="${order.clientId}" style="margin-left:0.5rem; padding:0.2rem 0.5rem; border-radius:4px; border:1px solid #ccc;">
                        <option value="">-- Select Courier --</option>
                        ${couriers.map(courier => `
                            <option value="${courier.id}" ${order.courierId === courier.id ? 'selected' : ''}>${courier.name}</option>
                        `).join('')}
                    </select>
                </label>
                <div style="font-size:0.9rem; color:#888; margin-top:0.2rem;">Current: ${currentCourier ? currentCourier.name : (order.courierName || 'Not assigned')}</div>
                <button class="assign-courier-save-btn" data-order-id="${order.orderId}" data-client-id="${order.clientId}" style="margin-top:0.5rem; padding:0.3rem 1rem; background:#B61718; color:white; border:none; border-radius:4px; font-family:'Grenze',serif; cursor:pointer;">Save</button>
            </div>
        `;
    }).join('');

    // Add event listeners for save buttons
    Array.from(modalContent.querySelectorAll('.assign-courier-save-btn')).forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const orderId = btn.getAttribute('data-order-id');
            const clientId = btn.getAttribute('data-client-id');
            const select = modalContent.querySelector(`select[data-order-id="${orderId}"][data-client-id="${clientId}"]`);
            const selectedCourierId = select.value;
            if (!selectedCourierId) {
                alert('Please select a courier.');
                return;
            }
            const courier = couriers.find(c => c.id === selectedCourierId);
            if (!courier) {
                alert('Courier not found.');
                return;
            }
            // Update order in Firebase
            const orderRef = ref(db, `orders/${clientId}/${orderId}`);
            // Fetch the latest order data
            const orderSnap = await get(orderRef);
            if (!orderSnap.exists()) {
                alert('Order not found.');
                return;
            }
            const orderData = orderSnap.val();
            const updatedOrder = {
                ...orderData,
                courierId: courier.id,
                courierName: courier.name,
                courierContactDetails: courier.contact
            };
            await set(orderRef, updatedOrder);
            alert(`Assigned ${courier.name} to Order #${orderId}`);
            // Optionally, update the UI or reload
            btn.textContent = 'Saved!';
            btn.disabled = true;
        });
    });
}

// Modal open/close logic
function setupAssignCourierModal() {
    const assignCouriersBtn = document.getElementById('assign-couriers-btn');
    const modal = document.getElementById('assign-courier-modal');
    const closeBtn = document.getElementById('close-assign-courier-modal');
    if (assignCouriersBtn) {
        assignCouriersBtn.addEventListener('click', showAssignCourierModal);
    }
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
}

