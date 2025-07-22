// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateEmail, updatePassword, deleteUser, sendEmailVerification} from "firebase/auth";
import { getDatabase, onValue, ref, set, update, get, child, push, remove} from "firebase/database";
// jsPDF will be loaded from CDN
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

const manageLotSelectedOpt = async (selected, editLotKey = null) => {
  const interfaceElement = document.querySelector('#manage-mainview-settings-editable');
  const mainviewOptions = document.querySelectorAll('.manage-mainview-settings-options-button');
  const mainviewHeader = document.querySelector('#manage-mainview-settings-header');

  mainviewHeader.textContent = selected;

  mainviewOptions.forEach(option => {
    option.classList.remove('manage-mainview-settings-options--selected');
    if (option.textContent === selected) {
      option.classList.add('manage-mainview-settings-options--selected');
    }
  })

  if (selected === 'View Lots') {
    let viewLotsDisplay = '';

    // Fetch logs for date added
    const logsSnap = await get(ref(db, 'logs/lots'));
    const logs = logsSnap.exists() ? logsSnap.val() : {};

    get(ref(db, '/lots')).then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        const lotKey = childSnapshot.key;

        // Find the first "added" log for this lot
        let dateAdded = 'N/A';
        if (logs) {
          for (const log of Object.values(logs)) {
            if (
              log.action &&
              log.action.includes('added') &&
              log.action.includes(childData.lotNumber)
            ) {
              dateAdded = log.date ? new Date(log.date).toLocaleString() : 'N/A';
              break;
            }
          }
        }

        // Format price with comma if needed
        let priceDisplay = childData.lotPrice;
        if (typeof priceDisplay === "string") {
          // Remove existing commas, parse as float, then format
          priceDisplay = Number(priceDisplay.replace(/,/g, ''));
          priceDisplay = isNaN(priceDisplay) ? childData.lotPrice : priceDisplay.toLocaleString();
        } else if (typeof priceDisplay === "number") {
          priceDisplay = priceDisplay.toLocaleString();
        }

        viewLotsDisplay += `
          <div class="view-lots-container">
            <h2 class="view-lots-container-header">Lot: ${childData.lotNumber}</h2>
            <div class="view-lots-container-info">
              <div class="view-lots-container-info-left">
                <div><strong>Lot ID:</strong> ${lotKey}</div>
                <div><strong>Price:</strong> ₱${priceDisplay}</div>
                <div><strong>Size:</strong> ${childData.lotSize}</div>
                <div><strong>Status:</strong> ${childData.lotStatus || 'N/A'}</div>
                <div class="view-lots-container-info-desc-header"><strong>Description:</strong></div>
                <div class="view-lots-container-info-left-description">${childData.lotDescription}</div>
                <div><strong>Date Added:</strong> ${dateAdded}</div>
                <div class="view-lots-container-actions">
                  <button class="view-lots-container-info-left-button" onclick="editLotFromView('${lotKey}')">Edit Lot</button>
                  <button class="view-lots-container-info-left-button" onclick="removeLotFromView('${lotKey}', '${childData.lotNumber}')">Remove Lot</button>
                </div>
              </div>
              <div>
                <img src="" alt="Lot Image">  
              </div>
            </div>
          </div>
        `;
      });
      interfaceElement.innerHTML = `
        <div class="view-lots">
          ${viewLotsDisplay}
        </div>
      `;
    });
  } else if (selected === 'Add Lot') {
    interfaceElement.innerHTML = `
    <div class="add-lot">
      <div class="add-lot-container">
        <h2 class="add-lot-container-header">Add Lot</h2>
        <div class="add-lot-container-info">
          <div class="add-lot-container-info-left">
            <label for="lot-name">Lot Name:</label>
            <input type="text" id="lot-name" name="lot-name">
            <label for="lot-price">Lot Price:</label>
            <input type="text" id="lot-price" name="lot-price">
            <label for="lot-size">Lot Size:</label>
            <input type="text" id="lot-size" name="lot-size">
            <label for="lot-status">Lot Status:</label>
            <input type="text" id="lot-status" name="lot-status">
          </div>
          <div class="add-lot-container-info-right">
            <label for="lot-description">Lot Description:</label>
            <textarea id="lot-description" name="lot-description"></textarea>
            <label for="lot-image">Lot Image:</label>
            <input type="file" id="lot-image" name="lot-image">
            <button onclick="addLot(event);">Add Lot</button>
          </div>
        </div>
      </div>
    </div> 
    `
  } else if (selected === 'Edit Lot') {
  let lotData = null;

  // Search bar HTML
  let searchHTML = `
    <div class="edit-lot-search">
      <label for="edit-lot-search-input">Enter Lot Number or ID:</label>
      <input id="edit-lot-search-input" type="text" placeholder="Type and press Search or Enter">
      <button type="button" onclick="searchEditLot()">Search</button>
    </div>
  `;

  if (!editLotKey && window._editLotKey) editLotKey = window._editLotKey;

  // Fetch lot data if key is provided
  if (editLotKey) {
    const lotSnap = await get(ref(db, 'lots/' + editLotKey));
    if (lotSnap.exists()) {
      lotData = lotSnap.val();
    }
  }

  interfaceElement.innerHTML = `
    <div class="edit-lot">
      <h2>Edit Lot</h2>
      ${searchHTML}
      <form id="edit-lot-form">
        <label for="edit-lot-id">Lot ID:</label>
        <input id="edit-lot-id" type="text" value="${editLotKey || ''}" disabled>
        <label for="edit-lot-number">Lot Number:</label>
        <input id="edit-lot-number" type="text" value="${lotData ? lotData.lotNumber : ''}">
        <label for="edit-lot-price">Lot Price:</label>
        <input id="edit-lot-price" type="text" value="${lotData ? lotData.lotPrice : ''}">
        <label for="edit-lot-size">Lot Size:</label>
        <input id="edit-lot-size" type="text" value="${lotData ? lotData.lotSize : ''}">
        <label for="edit-lot-status">Lot Status:</label>
        <input id="edit-lot-status" type="text" value="${lotData ? lotData.lotStatus || '' : ''}">
        <label for="edit-lot-description">Description:</label>
        <input id="edit-lot-description" type="text" value="${lotData ? lotData.lotDescription : ''}">
        <button type="button" onclick="saveEditLot('${editLotKey || ''}')">Save Changes</button>
      </form>
    </div>
  `;

  // Autofocus search input if no lot loaded
  if (!lotData) {
    setTimeout(() => {
      document.getElementById('edit-lot-search-input').focus();
      document.getElementById('edit-lot-form').querySelectorAll('input:not([type="button"])').forEach(inp => inp.disabled = true);
    }, 100);
  } else {
    document.getElementById('edit-lot-form').querySelectorAll('input:not([type="button"])').forEach(inp => inp.disabled = false);
    document.getElementById('edit-lot-id').disabled = true;
  }
} else if (selected === 'Remove Lot') {
    interfaceElement.innerHTML = `
    <div class="remove-lot">
      <h2>Removing Lot</h2>
      <div class="remove-lot-form-group">
        <label for="lot-number">Lot Number: </label>
        <input type="text" id="lot-number" class="remove-lot-form-control">
      </div>
      <button onclick="removeLot(event);" class="remove-lot-button">Remove Lot</button>
    </div>
    `
  } else if (selected === 'Lot Reservation') {
    renderReservedLotsAdmin();
  } else if (selected === 'Lots Owned') {
    renderOwnedLotsAdmin();
  } else if (selected === 'Logs') {
    let lotLogsDisplay =  '';

    get(ref(db, 'logs/lots')).then((snapshot) => {
      snapshot.forEach((lots) => {
        // When rendering each log entry for lots:
        lotLogsDisplay += `
          <div class="lot-log-entry">
            <div class="lot-log-date"><strong>Date:</strong> ${lots.val().date}</div>
            <div class="lot-log-action"><strong>Action:</strong> ${lots.val().action}</div>
            <div class="lot-log-by"><strong>By:</strong> ${lots.val().by}</div>
          </div>
        `
      })
      interfaceElement.innerHTML = `
        <div class="lot-logs">
          <div class="lot-logs-header">
            <label for="log-date">Filter by Date:</label>
            <input id="log-date" type="date" onchange="filterLotLogsByDate()">
            <button onclick="downloadLotLogs();">Download Logs</button>
          </div>
          <div class="lot-logs-content">
            ${lotLogsDisplay}
          </div>
        </div>
      `
    })
  }
}

const manageProductSelectedOpt = async (selected, editProductKey = null) => {
  const interfaceElement = document.querySelector('#manage-mainview-settings-editable');
  const mainviewOptions = document.querySelectorAll('.manage-mainview-settings-options-button');
  const mainviewHeader = document.querySelector('#manage-mainview-settings-header');

  mainviewHeader.textContent = selected;

  mainviewOptions.forEach(option => {
    option.classList.remove('manage-mainview-settings-options--selected');
    if (option.textContent === selected) {
      option.classList.add('manage-mainview-settings-options--selected');
    }
  })

  if (selected === 'View Products') {
    let viewProductsDisplay = '';

    // Fetch inventory and logs for quantity and date display
    const [inventorySnap, logsSnap] = await Promise.all([
      get(ref(db, 'inventory')),
      get(ref(db, 'logs/products'))
    ]);
    const inventory = inventorySnap.exists() ? inventorySnap.val() : {};
    const logs = logsSnap.exists() ? logsSnap.val() : {};

    get(ref(db, 'products')).then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        const productKey = childSnapshot.key;
        const quantity = inventory[productKey]?.quantity ?? 'N/A';

        // Find the first "added" log for this product
        let dateAdded = 'N/A';
        if (logs) {
          for (const log of Object.values(logs)) {
            if (
              log.action &&
              log.action.includes('added') &&
              log.action.includes(childData.productName)
            ) {
              dateAdded = log.date ? new Date(log.date).toLocaleString() : 'N/A';
              break;
            }
          }
        }

        // ...inside manageProductSelectedOpt, in the View Products section...
        viewProductsDisplay += `
          <div class="view-products-container">
            <h2 class="view-products-container-header">${childData.productName}</h2>
            <div class="view-products-container-info">
              <div class="view-products-container-info-left">
                <div><strong>Product ID:</strong> ${productKey}</div>
                <div><strong>Price per Sack:</strong> ₱${Number(childData.pricePerSack).toLocaleString()}</div>
                <div class="view-products-container-info-desc-header"><strong>Description:</strong></div>
                <div class="view-products-container-info-left-description">${childData.productDescription}</div>
                <div><strong>Quantity in Inventory:</strong> ${quantity}</div>
                <div><strong>Date Added:</strong> ${dateAdded}</div>
                <div class="view-products-container-actions">
                  <button class="view-products-container-info-left-button" onClick="editProductFromView('${productKey}')">Edit Product</button>
                  <button class="view-products-container-info-left-button" onClick="removeProductFromView('${productKey}', '${childData.productName}')">Remove Product</button>
                </div>
              </div>
              <div>
                <img src="" alt="Product Image">  
              </div>
            </div>
          </div>
        `;
      });
      interfaceElement.innerHTML = `
        <div class="view-products">
          ${viewProductsDisplay}
        </div>
      `;
    });
  } else if (selected === 'Add Products') {
    interfaceElement.innerHTML = `
      <div class="add-products">
        <div class="add-products-container">
          <label for="product-name">Product Name:</label>
          <input id="product-name" type="text">
          <label for="product-price">Price Per Sack</label>
          <input id="product-price" type="text">
          <label for="product-description">Description</label>
          <input id="product-description" type="text">
          <label for="product-quantity">Quantity</label>
          <input id="product-quantity" type="number" min="0">
          <label for="product-img">Product IMG</label>
          <input id="product-img" type="file">
          <button onclick="addProduct(event);">Add Product</button>
        </div>
      </div>
    `
  } else if (selected === 'Remove Products') {
    interfaceElement.innerHTML = `
      <div class="remove-product">
        <h2>Removing Product</h2>
        <div class="remove-product-form-group">
          <label for="product-number">Product Number: </label>
          <input type="text" id="product-number" class="remove-product-form-control">
        </div>
        <button onclick="removeProduct(event);" class="remove-product-button">Remove Product</button>
      </div>
    `
  } else if (selected === 'Edit Product') {
    // If called with a key, load that product. Otherwise, show a search field.
    let productData = null;
    let quantity = '';
    // Fetch inventory for this product
    if (editProductKey) {
      const productSnap = await get(ref(db, 'products/' + editProductKey));
      if (productSnap.exists()) {
        productData = productSnap.val();
      }
      const invSnap = await get(ref(db, 'inventory/' + editProductKey));
      if (invSnap.exists()) {
        quantity = invSnap.val().quantity ?? '';
      }
    }

    // HTML for search field
    let searchHTML = `
      <div class="edit-product-search">
        <label for="edit-product-search-input">Enter Product ID or Name:</label>
        <input id="edit-product-search-input" type="text" placeholder="Type and press Search or Enter">
        <button type="button" onclick="searchEditProduct()">Search</button>
      </div>
    `;

    // If editProductKey is not set, try to get from search input
    if (!editProductKey && window._editProductKey) editProductKey = window._editProductKey;

    // If we have a key, fetch product data
    if (editProductKey) {
      const productSnap = await get(ref(db, 'products/' + editProductKey));
      if (productSnap.exists()) {
        productData = productSnap.val();
      }
    }

    // Render the form
    interfaceElement.innerHTML = `
      <div class="edit-product">
        <h2>Edit Product</h2>
        ${searchHTML}
        <form id="edit-product-form">
          <label for="edit-product-id">Product ID:</label>
          <input id="edit-product-id" type="text" value="${editProductKey || ''}" disabled>
          <label for="edit-product-name">Product Name:</label>
          <input id="edit-product-name" type="text" value="${productData ? productData.productName : ''}">
          <label for="edit-product-price">Price Per Sack:</label>
          <input id="edit-product-price" type="text" value="${productData ? productData.pricePerSack : ''}">
          <label for="edit-product-description">Description:</label>
          <input id="edit-product-description" type="text" value="${productData ? productData.productDescription : ''}">
          <label for="edit-product-quantity">Quantity in Inventory:</label>
          <input id="edit-product-quantity" type="number" min="0" value="${quantity}">
          <button type="button" onclick="saveEditProduct('${editProductKey || ''}')">Save Changes</button>
        </form>
      </div>
    `;

    // Autofocus search input if no product loaded
    if (!productData) {
      setTimeout(() => {
        document.getElementById('edit-product-search-input').focus();
        document.getElementById('edit-product-form').querySelectorAll('input:not([type="button"])').forEach(inp => inp.disabled = true);
      }, 100);
    } else {
      // Enable fields if product loaded
      document.getElementById('edit-product-form').querySelectorAll('input:not([type="button"])').forEach(inp => inp.disabled = false);
      document.getElementById('edit-product-id').disabled = true;
    }
  } else if (selected === 'Logs') {
    interfaceElement.innerHTML = `
      <div class="product-logs">
        <button onClick="downloadProductLogs();">Download Logs</button>
        <section class="logs">
          <div class="logs-container">
            <h2>Number of Products</h2>
            <div>Total: <span class="logs-container-nop">N/A</span></div>
          </div>
          <div class="logs-container">
            <h2>Products Added</h2>
            <div>Total: <span class="logs-container-pa">N/A</span></div>
          </div>
          <div class="logs-container">
            <h2>Number of Sales</h2>
            <div>Total: <span class="logs-container-nos">N/A</span></div>
          </div>
          <div class="logs-container">
            <h2>Products Removed</h2>
            <div>Total: <span class="logs-container-pr">N/A</span></div>
          </div>
          <div class="logs-container">
            <h2>Number of Cancelled Order</h2>
            <div>Total: <span class="logs-container-noco">N/A</span></div>
          </div>
        </section>
      </div>
    `
  }
}

const manageOrderSelectedOpt = (selected) => {
  const interfaceElement = document.querySelector('#manage-mainview-settings-editable');
  const mainviewOptions = document.querySelectorAll('.manage-mainview-settings-options-button');
  const mainviewHeader = document.querySelector('#manage-mainview-settings-header');

  mainviewHeader.textContent = selected;

  mainviewOptions.forEach(option => {
    option.classList.remove('manage-mainview-settings-options--selected');
    if (option.textContent === selected) {
      option.classList.add('manage-mainview-settings-options--selected');
    }
  })

  if (selected === 'View Orders') {
    let ordersDisplay = '';

    // Fetch all orders from the database
    get(ref(db, 'orders')).then((snapshot) => {
      snapshot.forEach((userOrdersSnap) => {
        const userOrders = userOrdersSnap.val();
        userOrdersSnap.forEach((orderSnap) => {
          const order = orderSnap.val();
          // Only show orders that are not completed or delivered
          if (
            order.status &&
            order.status.toLowerCase() !== 'completed' &&
            order.status.toLowerCase() !== 'delivered'
          ) {
            ordersDisplay += `
              <div class="view-orders-container">
                <div class="view-orders-container-header">
                  Order #${order.orderId || orderSnap.key}
                </div>
                <div class="view-orders-container-info">
                  <div class="view-orders-container-info-left">
                    <div><strong>Client Name:</strong> ${order.clientName || "Unknown Client"}</div>
                    <div><strong>Client Contact:</strong> ${order.clientContactDetails || "No contact provided"}</div>
                    <div><strong>Client ID:</strong> ${order.clientId || userOrdersSnap.key}</div>
                    <div><strong>Courier Name:</strong> ${order.courierName || "Not assigned"}</div>
                    <div><strong>Courier Contact:</strong> ${order.courierContactDetails || "Not assigned"}</div>
                    <div><strong>Address:</strong> ${order.addressOfClient || "N/A"}</div>
                    <div><strong>Paid with:</strong> ${order.paidWith || "N/A"}</div>
                    <div><strong>Delivery Option:</strong> ${order.deliveryOption || "N/A"}</div>
                    <div><strong>ETA:</strong> ${order.eta || "N/A"}</div>
                    <div><strong>Subtotal:</strong> ₱${(order.subtotal || 0).toLocaleString()}</div>
                    <div><strong>Shipping:</strong> ₱${(order.shippingFee || 0).toLocaleString()}</div>
                    <div><strong>Total:</strong> ₱${(order.total || 0).toLocaleString()}</div>
                    <div class="view-orders-container-info-left-description">
                      <strong>Products:</strong>
                      <ul>
                        ${(order.productDetails || []).map(prod => `
                          <li><strong>${prod.productName || "Product"}</strong> (${prod.weight || 0}kg x ${prod.quantity || 1}) - ₱${((prod.pricePerKilo || prod.pricePerSack || 0) * (prod.weight || 0) * (prod.quantity || 1)).toLocaleString()}</li>
                        `).join("")}
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="view-orders-container-actions">
                  <span class="order-status-badge">${order.status || "Pending"}</span>
                </div>
              </div>
            `;
          }
        });
      });
      interfaceElement.innerHTML = `
        <div class="view-orders">
          ${ordersDisplay}
        </div>
      `;
    }).catch((error) => {
      console.error("Error fetching orders:", error);
      interfaceElement.innerHTML = "<p>Error loading orders.</p>";
    });
  } else if (selected === 'Update Order') {
    interfaceElement.innerHTML = `
      <div class="update-order"> 
        <div>
          <label for="order-id">Order ID: </label>
          <input id="order-id" type="text" placeholder="Search Order">  
        </div>
        <div>
          <label for="order-status">Order Status: </label>
          <select id="order-status" name="order-status">
            <option value="Pick-Up">Pick-Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivery Soon">Delivery Soon</option>
            <option value="Delivered">Delivered</option>
          </select>  
        </div>
        <button onclick="updateOrderStatus()">Update Order</button>
        <button onclick="cancelOrder()">Cancel Order</button>
      </div>
    `;
  } else if (selected === 'Add Order') {
    interfaceElement.innerHTML = `
      <div class="add-order">
        <h2>Add Order</h2>
        <form class="add-order-form">
          <div class="order-form-group">
            <label for="customer-name">Customer Name:</label>
            <input id="customer-name" type="text" placeholder="Enter customer name">
          </div>
          <div class="order-form-group">
            <label for="product-id">Product ID:</label>
            <input id="product-id" type="text" placeholder="Enter product ID">
          </div>
          <div class="order-form-group">
            <label for="quantity">Quantity:</label>
            <input id="quantity" type="number" placeholder="Enter quantity">
          </div>
          <div class="order-form-group">
            <label for="order-date">Order Date:</label>
            <input id="order-date" type="date">
          </div>
          <button type="submit">Add Order</button>
        </form>
      </div>
    `
  } else if (selected === 'Remove Order') {
    // Fetch all orders and display them
    get(ref(db, 'orders')).then((snapshot) => {
      let ordersHTML = '';
      snapshot.forEach((userOrdersSnap) => {
        userOrdersSnap.forEach((orderSnap) => {
          const order = orderSnap.val();
          // Build product list HTML from productDetails array
          let productsHTML = '';
          if (Array.isArray(order.productDetails)) {
            productsHTML = order.productDetails.map(item => `
              <div>
                <strong>Product:</strong> ${item.productName || 'N/A'}<br>
                <strong>Quantity:</strong> ${item.quantity || 'N/A'}
              </div>
            `).join('<hr>');
          } else {
            productsHTML = `<div>No products found.</div>`;
          }

          ordersHTML += `
            <div class="remove-order-container">
              <div class="remove-order-details">
                <h2 class="view-orders-container-header">Order ID: ${order.orderId || orderSnap.key}</h2>
                <div class="view-orders-container-info">
                  <div class="view-orders-container-info-left">
                    <div class="view-orders-container-info-left-description">
                      ${productsHTML}
                      <strong>Customer:</strong> ${order.addressOfClient || 'N/A'}<br>
                      <strong>Courier Contact:</strong> ${order.courierContactDetails || 'N/A'}<br>
                      <strong>Paid With:</strong> ${order.paidWith || 'N/A'}<br>
                      <strong>Shipping Fee:</strong> ${order.shippingFee || 'N/A'}<br>
                      <strong>Subtotal:</strong> ${order.subtotal || 'N/A'}<br>
                      <strong>Total:</strong> ${order.total || 'N/A'}<br>
                      <strong>Status:</strong> ${order.status || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <img src="" alt="order">
                  </div>
                </div>
              </div>
              <button class="remove-order-btn" onclick="removeOrderFromList('${userOrdersSnap.key}', '${orderSnap.key}', '${order.orderId || orderSnap.key}')">Remove</button>
            </div>
          `;
        });
      });

      interfaceElement.innerHTML = `
        <div class="remove-order">
          <div class="remove-order-search">
            <input type="text" id="remove-order-search" placeholder="Search Order ID" oninput="filterRemoveOrderList()">
          </div>
          <div id="remove-order-list">
            ${ordersHTML || '<p>No orders found.</p>'}
          </div>
        </div>
      `;
    });
  } else if (selected === 'Logs') {
    get(ref(db, 'logs/orders')).then((snapshot) => {
      let logsHTML = '';
      if (snapshot.exists()) {
        // Sort logs by date descending
        const logsArr = [];
        snapshot.forEach(logSnap => {
          logsArr.push({ key: logSnap.key, ...logSnap.val() });
        });
        logsArr.sort((a, b) => new Date(b.date) - new Date(a.date));

        logsArr.forEach(log => {
          logsHTML += `
            <div class="order-log-entry">
              <div class="order-log-date"><strong>Date:</strong> ${log.date ? new Date(log.date).toLocaleString() : 'N/A'}</div>
              <div class="order-log-action"><strong>Action:</strong> ${log.action || 'N/A'}</div>
              <div class="order-log-by"><strong>By:</strong> ${log.by || 'N/A'}</div>
            </div>
          `;
        });
      } else {
        logsHTML = '<p>No order logs found.</p>';
      }

      interfaceElement.innerHTML = `
        <div class="order-logs">
          <div class="order-logs-header">
            <label for="order-log-date">Filter by Date:</label>
            <input id="order-log-date" type="date" onchange="filterOrderLogsByDate()">
            <button onclick="downloadOrderLogs()">Download Logs</button>
          </div>
          <div class="order-logs-content" id="order-logs-content">
            ${logsHTML}
          </div>
        </div>
      `;
    });
  } else if (selected === 'Courier Management') {
    let courierDisplay = '';

    // Fetch courier assignment counter and courier statistics
    Promise.all([
      get(ref(db, 'system/courierAssignmentCounter')),
      get(ref(db, 'users')),
      get(ref(db, 'orders'))
    ]).then(([counterSnap, usersSnap, ordersSnap]) => {
      const counter = counterSnap.exists() ? counterSnap.val() : { index: 0 };
      const users = usersSnap.exists() ? usersSnap.val() : {};
      const orders = ordersSnap.exists() ? ordersSnap.val() : {};

      // Get couriers
      const couriers = Object.entries(users)
        .filter(([id, user]) => user.accessLevel && user.accessLevel.toLowerCase() === "courier")
        .map(([id, user]) => ({ id, ...user }));

      // Count orders per courier
      const courierStats = {};
      couriers.forEach(courier => {
        courierStats[courier.id] = { name: courier.username, total: 0, pending: 0, delivered: 0 };
      });

      // Count orders
      Object.values(orders).forEach(userOrders => {
        Object.values(userOrders).forEach(order => {
          if (order.courierId && courierStats[order.courierId]) {
            courierStats[order.courierId].total++;
            if (order.status && order.status.toLowerCase() === 'delivered') {
              courierStats[order.courierId].delivered++;
            } else if (order.status && order.status.toLowerCase() !== 'completed') {
              courierStats[order.courierId].pending++;
            }
          }
        });
      });

      courierDisplay = `
        <div class="courier-management-section">
          <h2>Courier Assignment System</h2>
          
          <div class="courier-counter-info">
            <h3>Current Assignment Counter: ${counter.index}</h3>
            <p>Next order will be assigned to: ${couriers[counter.index % couriers.length]?.username || 'No couriers available'}</p>
            <button onclick="resetCourierCounter()" class="reset-counter-btn">Reset Counter to 0</button>
          </div>

          <div class="courier-stats">
            <h3>Courier Statistics</h3>
            <div class="courier-stats-grid">
              ${couriers.map((courier, index) => `
                <div class="courier-stat-card">
                  <h4>${courier.username}</h4>
                  <p><strong>Total Orders:</strong> ${courierStats[courier.id]?.total || 0}</p>
                  <p><strong>Pending:</strong> ${courierStats[courier.id]?.pending || 0}</p>
                  <p><strong>Delivered:</strong> ${courierStats[courier.id]?.delivered || 0}</p>
                  <p><strong>Next in Rotation:</strong> ${index === (counter.index % couriers.length) ? 'Yes' : 'No'}</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      interfaceElement.innerHTML = courierDisplay;
    }).catch((error) => {
      console.error("Error fetching courier data:", error);
      interfaceElement.innerHTML = "<p>Error loading courier management data.</p>";
    });
  }
}

const manageAccountsSelectedOpt = (selected) => {
  const interfaceElement = document.querySelector('#manage-mainview-settings-editable');
  const mainviewOptions = document.querySelectorAll('.manage-mainview-settings-options-button');
  const mainviewHeader = document.querySelector('#manage-mainview-settings-header');

  mainviewHeader.textContent = selected;

  mainviewOptions.forEach(option => {
    option.classList.remove('manage-mainview-settings-options--selected');
    if (option.textContent === selected) {
      option.classList.add('manage-mainview-settings-options--selected');
    }
  })

  if (selected === 'View Accounts') {
    let viewUsersDisplay = '';

    get(ref(db, 'users')).then((snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const childData = childSnapshot.val();
        viewUsersDisplay += `
          <div class="user-card">
            <div class="user-info">
              <h3>${childData.lastName}, ${childData.firstName}</h3>
              <p>Email: ${childData.email}</p>
              <p>Role: ${childData.accessLevel}</p>
              <p>User ID: <span>${childSnapshot.key}</span></p>
              <p>Phone: ${childData.phone}</p>
            </div>
            <div class="user-actions">
              <button onclick="prefillEditUser('${childSnapshot.key}')">Edit</button>
              <button onclick="removeUserFromView('${childSnapshot.key}', '${childData.username || ''}')">Remove</button>
            </div>
          </div>
        `;
        });
        interfaceElement.innerHTML = `
          <div class="view-users">
            <div class="view-users-search">
              <input type="text" placeholder="Search for users...">
              <button onclick="filterUserCards()">Search</button>
            </div>
            ${viewUsersDisplay}
          </div>
        `
      }
    );
  } else if (selected === 'Add User') {
    interfaceElement.innerHTML = `
      <div class="add-user">
        <h2>Add User</h2>
        <form onsubmit="return false" id="edit-user-form">
          <div class="add-user-form-group">
            <label for="user-name">User Name:</label>
            <input id="user-name" type="text" placeholder="Enter user name">
          </div>
          <div class="add-user-form-group">
            <label for="user-email">Email:</label>
            <input id="user-email" type="email" placeholder="Enter user email">
          </div>
          <div class="add-user-form-group">
            <label for="user-pass">Password:</label>
            <input id="user-pass" type="text" placeholder="Enter user password">
          </div>
          <div class="add-user-form-group">
            <label for="user-firstName">First Name:</label>
            <input id="user-firstName" type="text" placeholder="Enter user first name">
          </div>
          <div class="add-user-form-group">
            <label for="user-lastName">Last Name:</label>
            <input id="user-lastName" type="text" placeholder="Enter user last name">
          </div>
          <div class="add-user-form-group">
            <label for="user-role">Role:</label>
            <select id="user-role">
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Courier">Courier</option>
              <option value="User">User</option>
            </select>
          </div>
          <div class="add-user-form-group">
            <label for="user-phone">Phone Number:</label>
            <input id="user-phone" type="phone" placeholder="Enter user phone number">
          </div>
          <button type="button" onClick="addUser(event); event.preventDefault();">Add User</button>
        </form>
      </div>
    `
  } else if (selected === 'Remove User') {
    interfaceElement.innerHTML = `
      <div class="remove-user">
        <h2>Remove User</h2>
        <form onsubmit="return false" id="remove-user-form">
          <div class="remove-user-form-group">
            <label for="user-id">User ID:</label>
            <input id="user-id" type="text" placeholder="Enter user ID">
          </div>
          <button type="button" onClick="removeUser(event); event.preventDefault();" type="submit">Remove User</button>
        </form>
      </div>
    `
  } else if (selected === 'Edit User') {
    interfaceElement.innerHTML = `
      <div class="edit-user">
        <h2>Edit User</h2>
        <form onsubmit="return false" id="edit-user-form">
          <div class="edit-user-form-group">
            <label for="user-uid">User ID:</label>
            <input id="user-uid" type="text" placeholder="Enter user name">
            <button type="button" onClick="loadUser(event); event.preventDefault();" class="load-user">Load User</button>
          </div>
          <div class="edit-user-form-group">
            <label for="user-name">User Name:</label>
            <input id="user-name" type="text" placeholder="Enter user name">
          </div>
          <div class="add-user-form-group">
            <label for="user-email">Email</label>
            <input id="user-email" type="email" placeholder="Enter user email">
          </div>
          <div class="add-user-form-group">
            <label for="user-pass">Password</label>
            <input id="user-pass" type="text" placeholder="Enter user password">
          </div>
          <div class="edit-user-form-group">
            <label for="user-firstName">First Name:</label>
            <input id="user-firstName" type="text" placeholder="Enter user first name">
          </div>
          <div class="edit-user-form-group">
            <label for="user-lastName">Last Name:</label>
            <input id="user-lastName" type="text" placeholder="Enter user last name">
          </div>
          <div class="edit-user-form-group">
            <label for="user-role">Role:</label>
            <select id="user-role">
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Courier">Courier</option>
              <option value="User">User</option>
            </select>
          </div>
          <div class="edit-user-form-group">
            <label for="user-phone">Phone Number:</label>
            <input id="user-phone" type="phone" placeholder="Enter user phone number">
          </div>
          <button type="button" id="edit-user-button" onClick="editUser(event); event.preventDefault();">Edit User</button>
        </form>
      </div>
    `
    document.getElementById('user-name').disabled = true;
    document.getElementById('user-firstName').disabled = true;
    document.getElementById('user-lastName').disabled = true;
    document.getElementById('user-phone').disabled = true;
    document.getElementById('user-role').disabled = true;
    document.getElementById('edit-user-button').disabled = true;
    document.getElementById('user-email').disabled = true;
    document.getElementById('user-pass').disabled = true;

  } else if (selected === 'Logs') {

    let logHTML = '';
    get(ref(db, 'logs/users')).then((snapshot) => {
      snapshot.forEach(logs => {
        const log = logs.val();
        logHTML += `
          <div class="account-log-entry">
            <div class="account-log-date"><strong>Date:</strong> ${log.date}</div>
            <div class="account-log-action"><strong>Action:</strong> ${log.action}</div>
            <div class="account-log-user"><strong>User:</strong> ${log.userID || ''}</div>
            <div class="account-log-by"><strong>By:</strong> ${log.by}</div>
          </div>
        `;
      });
      interfaceElement.innerHTML = `
        <div class="account-logs">
          <div class="account-logs-header">
            <label for="log-date">Filter by Date:</label>
            <input id="log-date" type="date" onchange="filterAccountLogsByDate()">
            <button onclick="downloadAccountLogs(event); event.preventDefault();">Download Logs</button>
          </div>
          <div class="account-logs-content">
            ${logHTML}
          </div>
        </div>
      `;
    });
  }
}


window.manageLotSelectedOpt = manageLotSelectedOpt;
window.manageProductSelectedOpt = manageProductSelectedOpt;
window.manageOrderSelectedOpt = manageOrderSelectedOpt;
window.manageAccountsSelectedOpt = manageAccountsSelectedOpt;

const page = document.querySelector('.sidebar-option--selected').textContent;
if (page === 'Lots') {
  manageLotSelectedOpt('View Lots');
} else if (page === 'Products') {
  manageProductSelectedOpt('View Products');
} else if (page === 'Orders') {
  manageOrderSelectedOpt('View Orders');
} else if (page === 'Accounts') {
  manageAccountsSelectedOpt('View Accounts');
}


const addUser = (event) => {
  event.preventDefault();

  const username = document.getElementById('user-name').value;
  const email = document.getElementById('user-email').value;
  const password = document.getElementById('user-pass').value;
  const firstName = document.getElementById('user-firstName').value;
  const lastName = document.getElementById('user-lastName').value;
  const phone = document.getElementById('user-phone').value
  const role = document.getElementById('user-role').value;
  
  if (!firstName || !lastName || !phone || !email || !password || !role) {
    alert('Please fill in all fields');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Signed in 
      const user = userCredential.user;
      const date = new Date(Date.now())
      set(ref(db, 'users/' + user.uid), {
        accessLevel: role,
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        registrationTimestamp: date.toUTCString(),
        username: username
      })

      sendEmailVerification(user);

      await get(ref(db, 'logs'))
        .then(snapshot => {
          const date = new Date(Date.now())
          push(ref(db, 'logs/users/'), {
            action: 'User ' + username + ' added',
            date: date.toUTCString(),
            userID: user.uid,
            by: uid
          })
        });
      alert('User added successfully');
      event.preventDefault();
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
    });
}

const loadUser = async (event) => {
  event.preventDefault();
  const userUID = document.getElementById('user-uid').value;
  try {
    const response = await fetch(`http://localhost:3000/getUser?uid=${userUID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    if (response.ok) {
      const { userRecord, userData } = result;
      document.getElementById('user-name').disabled = false;
      document.getElementById('user-firstName').disabled = false;
      document.getElementById('user-lastName').disabled = false;
      document.getElementById('user-phone').disabled = false;
      document.getElementById('user-role').disabled = false;
      document.getElementById('edit-user-button').disabled = false;
      document.getElementById('user-email').disabled = false;
      document.getElementById('user-pass').disabled = false;

      document.getElementById('user-name').placeholder = userData.username;
      document.getElementById('user-firstName').placeholder = userData.firstName;
      document.getElementById('user-lastName').placeholder = userData.lastName;
      document.getElementById('user-phone').placeholder = userData.phone;
      document.getElementById('user-email').placeholder = userRecord.email;
    } else {
      document.getElementById('user-name').placeholder = 'Username';
      document.getElementById('user-firstName').placeholder = 'First Name';
      document.getElementById('user-lastName').placeholder = 'Last Name';
      document.getElementById('user-phone').placeholder = 'Phone Number';
      document.getElementById('edit-user-button').placeholder = 'Edit User';
      document.getElementById('user-email').placeholder = 'Email';
      document.getElementById('edit-pass').placeholder = 'Password';
      throw new Error(result.error);
    }
  } catch (error) {
    alert('Error loading user: ' + error.message);
  }
}

const editUser = async (event) => {
  event.preventDefault();
  const userUID = document.getElementById('user-uid').value;
  const username = document.getElementById('user-name').value;
  const firstName = document.getElementById('user-firstName').value;
  const lastName = document.getElementById('user-lastName').value;
  const phone = document.getElementById('user-phone').value
  const role = document.getElementById('user-role').value;
  const email = document.getElementById('user-email').value;
  const password = document.getElementById('user-pass').value;

  if (!userUID) {
    alert('Please fill in the User ID field');
    return;
  }
  try {
    const userSnapshot = await get(child(ref(db), `users/${userUID}`));
    if (!userSnapshot.exists()) {
      alert('User does not exist');
      return;
    } 
    if (!username && !firstName && !lastName && !phone && !role) {
      alert('Please fill in at least one of the fields');
      return;
    }



    const updates = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (phone) updates.phone = phone;
    if (role) updates.accessLevel = role;
    if (username) updates.username = username;
    if (email) updates.email = email;

    if (password) {
      await fetch('http://localhost:3000/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: userUID, password: password })
      })
    }

    await update(ref(db, 'users/' + userUID), updates);
    const currentUsername = (await get(ref(db, 'users/' + userUID + '/username'))).val();

    const date = new Date(Date.now())
    push(ref(db, 'logs/users/'), {
      action: 'User ' + currentUsername + ' edited',
      date: date.toUTCString(),
      userID: userUID,
      by: uid
    })
    alert('User updated successfully');
    event.preventDefault();
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
  }
}

const removeUser = async (event) => {
  event.preventDefault();
  const userUID = document.getElementById('user-id').value;
  if (!userUID) {
    alert('Please fill in the User ID field');
    return;
  }

  try {
    const username = (await get(ref(db, 'users/' + userUID + '/username'))).val();
    const response = await fetch('http://localhost:3000/deleteUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uid: userUID })
    });

    const result = await response.json();
    if (response.ok) {
      const date = new Date(Date.now())
      push(ref(db, 'logs/users/'), {
        action: 'User ' + username + ' removed',
        date: date.toUTCString(),
        userID: userUID,
        by: uid
      })
      alert(result.message);
      event.preventDefault();
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    alert('Error removing user: ' + error.message);
  }
};

const downloadAccountLogs = async (event) => {
  event && event.preventDefault && event.preventDefault();
  const logsRef = ref(db, 'logs/users');
  const logsSnapshot = await get(logsRef);
  const logs = logsSnapshot.val();

  if (!logs) {
    alert('No logs found');
    return;
  }

  const doc = new window.jspdf.jsPDF();

  // Theme colors
  const red = [182, 23, 24];
  const green = [30, 125, 52];
  const dark = [34, 58, 35];

  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  doc.setFontSize(20);
  doc.setTextColor(...red);
  doc.text(`Account Logs - ${month} ${year}`, 105, 16, { align: 'center' });

  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text(`Downloaded: ${now.toLocaleString()}`, 105, 24, { align: 'center' });

  let y = 34;
  doc.setFillColor(...green);
  doc.setTextColor(255,255,255);
  doc.roundedRect(10, y-8, 190, 10, 2, 2, 'F');
  doc.text('Date', 14, y);
  doc.text('By UserID', 180, y, { align: 'right' });
  doc.text('Action', 14, y+7);

  y += 15;
  doc.setFontSize(11);

  const maxActionWidth = 170;
  Object.values(logs)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((log, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(246, 246, 246);
        doc.rect(10, y-7, 190, 10, 'F');
      }
      doc.setTextColor(...dark);

      const dateStr = log.date ? new Date(log.date).toLocaleString() : 'N/A';
      doc.text(dateStr, 14, y);
      doc.text(log.by ? String(log.by) : '', 180, y, { align: 'right' });

      // Action and User (multi-line, below)
      const actionLines = doc.splitTextToSize(
        (log.action || 'N/A') + (log.userID ? `\nUser: ${log.userID}` : ''),
        maxActionWidth
      );
      doc.text(actionLines, 14, y + 7);

      const rowHeight = 7 + (actionLines.length * 6);

      if (y + rowHeight > 280) {
        doc.addPage();
        y = 20;
        doc.setFillColor(...green);
        doc.setTextColor(255,255,255);
        doc.roundedRect(10, y-8, 190, 10, 2, 2, 'F');
        doc.text('Date', 14, y);
        doc.text('By UserID', 180, y, { align: 'right' });
        doc.text('Action', 14, y+7);
        y += 15;
        doc.setFontSize(11);
      }

      y += rowHeight + 3;
    });

  doc.save(`account_logs(${month}_${year}).pdf`);
};

const filterAccountLogsByDate = function() {
  const filterDate = document.getElementById('log-date').value; // format: YYYY-MM-DD
  document.querySelectorAll('.account-log-entry').forEach(entry => {
    const dateText = entry.querySelector('.account-log-date').textContent;
    const match = dateText.match(/Date:\s*(.*)/);
    let logDate = '';
    if (match && match[1]) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) {
        // Get date in UTC to match the original log date
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        logDate = `${year}-${month}-${day}`;
      }
    }
    if (!filterDate || logDate === filterDate) {
      entry.style.display = '';
    } else {
      entry.style.display = 'none';
    }
  });
};

const prefillEditUser = async function(userUID) {
  manageAccountsSelectedOpt('Edit User');
  setTimeout(async () => {
    document.getElementById('user-uid').value = userUID;
    await loadUser({ preventDefault: () => {} }); // Prefill fields
  }, 100);
};

const removeUserFromView = async function(userUID, username) {
  if (!confirm(`Are you sure you want to remove user "${username || userUID}"?`)) return;
  try {
    // Remove from Firebase Auth via backend, then from DB
    const response = await fetch('http://localhost:3000/deleteUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: userUID })
    });
    const result = await response.json();
    if (response.ok) {
      await remove(ref(db, 'users/' + userUID));
      push(ref(db, 'logs/users/'), {
        action: 'User ' + (username || userUID) + ' removed',
        date: new Date(Date.now()).toUTCString(),
        userID: userUID,
        by: uid
      });
      alert(result.message || 'User removed successfully');
      manageAccountsSelectedOpt('View Accounts');
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    alert('Error removing user: ' + error.message);
  }
};

function filterUserCards() {
  const searchValue = document.querySelector('.view-users-search input[type="text"]').value.trim().toLowerCase();
  document.querySelectorAll('.user-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(searchValue) ? '' : 'none';
  });
}

window.filterUserCards = filterUserCards;
window.filterAccountLogsByDate = filterAccountLogsByDate;
window.downloadAccountLogs = downloadAccountLogs;
window.addUser = addUser;
window.editUser = editUser;
window.loadUser = loadUser;
window.removeUser = removeUser;
window.prefillEditUser = prefillEditUser;
window.removeUserFromView = removeUserFromView;

const removeProductFromView = async function(productKey, productName) {
  if (!confirm(`Are you sure you want to remove "${productName}"?`)) return;

  try {
    // Remove from products
    await remove(ref(db, 'products/' + productKey));
    // Remove from inventory
    await remove(ref(db, 'inventory/' + productKey));

    // Log the removal in inventory logs
    push(ref(db, 'logs/inventory'), {
      action: `Inventory for product ${productName} removed (product deleted)`,
      date: new Date(Date.now()).toUTCString(),
      by: uid
    });

    // Log the removal in product logs
    push(ref(db, 'logs/products'), {
      action: 'Product ' + productName + ' removed',
      date: new Date(Date.now()).toUTCString(),
      by: uid
    });

    alert('Product and inventory removed successfully');
    // Optionally refresh the product list
    manageProductSelectedOpt('View Products');
  } catch (error) {
    alert('Error removing product: ' + error.message);
  }
};

const addProduct = async (event) => {
  event.preventDefault();
  const productName = document.getElementById('product-name').value.trim();
  const productPrice = document.getElementById('product-price').value;
  const productDescription = document.getElementById('product-description').value;
  const productQuantity = parseInt(document.getElementById('product-quantity')?.value, 10);

  if (!productName || !productPrice || !productDescription || isNaN(productQuantity)) {
    alert('Please fill in all fields');
    return;
  }

  // Check if product already exists (by name)
  const productsSnap = await get(ref(db, 'products'));
  let existingProductKey = null;
  if (productsSnap.exists()) {
    productsSnap.forEach(child => {
      const prod = child.val();
      if (prod.productName.trim().toLowerCase() === productName.trim().toLowerCase()) {
        existingProductKey = child.key;
      }
    });
  }

  if (existingProductKey) {
    // Show modal dialog instead of prompt
    const modal = document.getElementById('product-action-modal');
    const msg = document.getElementById('product-action-modal-message');
    msg.textContent = `Product "${productName}" already exists. What would you like to do?`;
    modal.style.display = "flex";

    // Remove previous listeners
    const addBtn = document.getElementById('product-action-add');
    const updateBtn = document.getElementById('product-action-update');
    const cancelBtn = document.getElementById('product-action-cancel');
    addBtn.onclick = null;
    updateBtn.onclick = null;
    cancelBtn.onclick = null;

    addBtn.onclick = async () => {
      modal.style.display = "none";
      await updateInventory(existingProductKey, productName, productQuantity, "add");
    };
    updateBtn.onclick = async () => {
      modal.style.display = "none";
      await updateInventory(existingProductKey, productName, productQuantity, "update");
    };
    cancelBtn.onclick = () => {
      modal.style.display = "none";
      alert("Operation cancelled.");
    };
    return;
  }

  // Product does not exist, add new product and inventory
  const productRef = push(ref(db, 'products/'));
  const productKey = productRef.key;
  await set(productRef, {
    productName: productName,
    pricePerSack: productPrice,
    productDescription: productDescription,
    productImages: 123123
  });

  await set(ref(db, 'inventory/' + productKey), {
    productId: productKey,
    quantity: productQuantity
  });

  // Log inventory addition
  push(ref(db, 'logs/inventory'), {
    action: `Inventory for product ${productName} initialized (qty: ${productQuantity})`,
    date: new Date(Date.now()).toUTCString(),
    by: uid
  });

  alert('Product and inventory added successfully');
  push(ref(db, 'logs/products'), {
    action: 'Product ' + productName + ' added (qty: ' + productQuantity + ')',
    date: new Date(Date.now()).toUTCString(),
    by: uid
  });
};

// Helper function for inventory update
async function updateInventory(existingProductKey, productName, productQuantity, action) {
  const invRef = ref(db, 'inventory/' + existingProductKey);
  const invSnap = await get(invRef);
  let newQty = productQuantity;
  if (invSnap.exists()) {
    const currentQty = invSnap.val().quantity || 0;
    if (action === "add") {
      newQty = currentQty + productQuantity;
    }
  }
  await set(invRef, {
    productId: existingProductKey,
    quantity: newQty
  });

  alert(`Inventory ${action === "add" ? "added to" : "updated"} successfully.`);
  push(ref(db, 'logs/inventory'), {
    action: `Product ${productName} inventory ${action === "add" ? "added to" : "updated"} (qty: ${newQty})`,
    date: new Date(Date.now()).toUTCString(),
    by: uid
  });
}

const removeProduct = async (event) => {
  event.preventDefault();
  const productNumber = document.getElementById('product-number').value;
  if (!productNumber) {
    alert('Please fill in the Product Number field');
    return;
  }

  const productSnap = await get(ref(db, 'products/' + productNumber));
  if (!productSnap.exists()) {
    alert('Product does not exist');
    return;
  }
  const productData = productSnap.val();
  const productName = productData.productName || productNumber;

  try {
    // Remove from products
    await remove(ref(db, 'products/' + productNumber));
    // Remove from inventory
    await remove(ref(db, 'inventory/' + productNumber));

    // Log the removal in inventory logs
    push(ref(db, 'logs/inventory'), {
      action: `Inventory for product ${productName} removed (product deleted)`,
      date: new Date(Date.now()).toUTCString(),
      by: uid
    });

    // Log the removal in product logs
    push(ref(db, 'logs/products'), {
      action: 'Product ' + productName + ' removed',
      date: new Date(Date.now()).toUTCString(),
      by: uid
    });

    alert('Product and inventory removed successfully');
    manageProductSelectedOpt('View Products');
  } catch (error) {
    alert('Error removing product: ' + error.message);
  }
};

async function updateProductStats() {
  // Number of Products
  const productsSnap = await get(ref(db, 'products'));
  const products = productsSnap.exists() ? productsSnap.val() : {};
  const numProducts = Object.keys(products).length;

  // Products Added & Removed
  const logsSnap = await get(ref(db, 'logs/products'));
  let productsAdded = 0;
  let productsRemoved = 0;
  if (logsSnap.exists()) {
    logsSnap.forEach(logSnap => {
      const action = logSnap.val().action || '';
      if (action.includes('added')) productsAdded++;
      if (action.includes('removed')) productsRemoved++;
    });
  }

  // Number of Sales (accumulated orders from all users)
  const ordersSnap = await get(ref(db, 'orders'));
  let numSales = 0;
  if (ordersSnap.exists()) {
    ordersSnap.forEach(userOrdersSnap => {
      userOrdersSnap.forEach(orderSnap => {
        numSales++;
      });
    });
  }

  // Update the DOM
  document.querySelector('.logs-container-nop').textContent = numProducts;
  document.querySelector('.logs-container-pa').textContent = productsAdded;
  document.querySelector('.logs-container-pr').textContent = productsRemoved;
  document.querySelector('.logs-container-nos').textContent = numSales;
  document.querySelector('.logs-container-noco').textContent = "N/A"; // Cancelled orders
}

const downloadProductLogs = async (event) => {
  if (event) event.preventDefault();

  const logsRef = ref(db, 'logs/products');
  const logsSnapshot = await get(logsRef);
  const logs = logsSnapshot.val();

  if (!logs) {
    alert('No product logs found');
    return;
  }

  const doc = new window.jspdf.jsPDF();

  // Theme colors
  const red = [182, 23, 24];
  const green = [30, 125, 52];
  const dark = [34, 58, 35];

  // Title
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  doc.setFontSize(20);
  doc.setTextColor(...red);
  doc.text(`Product Logs - ${month} ${year}`, 105, 16, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text(`Downloaded: ${now.toLocaleString()}`, 105, 24, { align: 'center' });

  // Table headers
  let y = 34;
  doc.setFillColor(...green);
  doc.setTextColor(255,255,255);
  doc.roundedRect(10, y-8, 190, 10, 2, 2, 'F');
  doc.text('Date', 14, y);
  doc.text('By UserID', 180, y, { align: 'right' });
  doc.text('Action', 14, y+7);

  // Table rows
  y += 15;
  doc.setFontSize(11);

  const maxActionWidth = 170; // Wider for action since it's below
  Object.entries(logs).forEach(([key, log], idx) => {
    // Alternate row color
    if (idx % 2 === 0) {
      doc.setFillColor(246, 246, 246);
      doc.rect(10, y-7, 190, 10, 'F');
    }
    doc.setTextColor(...dark);

    // Date and By UserID on the same line
    const dateStr = new Date(log.date).toLocaleString();
    doc.text(dateStr, 14, y);
    doc.text(log.by ? String(log.by) : '', 180, y, { align: 'right' });

    // Action (multi-line, below)
    const actionLines = doc.splitTextToSize(log.action, maxActionWidth);
    doc.text(actionLines, 14, y + 7);

    // Calculate height for this entry
    const rowHeight = 7 + (actionLines.length * 6);

    // Add page break if needed
    if (y + rowHeight > 280) {
      doc.addPage();
      y = 20;
      // Redraw header on new page
      doc.setFillColor(...green);
      doc.setTextColor(255,255,255);
      doc.roundedRect(10, y-8, 190, 10, 2, 2, 'F');
      doc.text('Date', 14, y);
      doc.text('By UserID', 180, y, { align: 'right' });
      doc.text('Action', 14, y+7);
      y += 15;
      doc.setFontSize(11);
    }

    y += rowHeight + 3; // Add spacing after each row
  });

  doc.save(`product_logs(${month}_${year}).pdf`);
};

async function saveEditProduct(productKey) {
  const name = document.getElementById('edit-product-name').value.trim();
  const price = document.getElementById('edit-product-price').value.trim();
  const description = document.getElementById('edit-product-description').value.trim();
  const quantity = parseInt(document.getElementById('edit-product-quantity').value, 10);

  if (!name || !price || !description || isNaN(quantity)) {
    alert('Please fill in all fields');
    return;
  }

  // Duplicate check (exclude current product)
  const productsSnap = await get(ref(db, 'products'));
  let duplicate = false;
  if (productsSnap.exists()) {
    productsSnap.forEach(child => {
      if (
        child.key !== productKey &&
        child.val().productName.trim().toLowerCase() === name.toLowerCase()
      ) {
        duplicate = true;
      }
    });
  }
  if (duplicate) {
    alert('A product with this name already exists.');
    return;
  }

  try {
    // Fetch old values for detailed logging
    const oldProductSnap = await get(ref(db, 'products/' + productKey));
    const oldProduct = oldProductSnap.exists() ? oldProductSnap.val() : {};
    let oldQuantity = 0;
    const invSnap = await get(ref(db, 'inventory/' + productKey));
    if (invSnap.exists()) {
      oldQuantity = invSnap.val().quantity ?? 0;
    }

    // Update product info
    await update(ref(db, 'products/' + productKey), {
      productName: name,
      pricePerSack: price,
      productDescription: description
    });

    // After await update(ref(db, 'products/' + productKey), { ... });

    const cartsSnap = await get(ref(db, 'carts'));
    if (cartsSnap.exists()) {
      cartsSnap.forEach(userCartSnap => {
        const userCart = userCartSnap.val();
        let updated = false;
        // If cart is an array
        if (Array.isArray(userCart)) {
          userCart.forEach((item, idx) => {
            if (item.productId === productKey) {
              userCart[idx] = {
                ...item,
                productName: name,
                pricePerSack: price,
                productDescription: description
              };
              updated = true;
            }
          });
          if (updated) {
            set(ref(db, `carts/${userCartSnap.key}`), userCart);
          }
        }
        // If cart is an object (productId as key)
        else if (typeof userCart === 'object') {
          let cartChanged = false;
          Object.keys(userCart).forEach(pid => {
            if (pid === productKey) {
              userCart[pid] = {
                ...userCart[pid],
                productName: name,
                pricePerSack: price,
                productDescription: description
              };
              cartChanged = true;
            }
          });
          if (cartChanged) {
            set(ref(db, `carts/${userCartSnap.key}`), userCart);
          }
        }
      });
    }

    // Update inventory
    await update(ref(db, 'inventory/' + productKey), {
      productId: productKey,
      quantity: quantity
    });

    // Build detailed action log
    let changes = [];
    if (oldProduct.productName !== name) changes.push(`Name: "${oldProduct.productName}" → "${name}"`);
    if (oldProduct.pricePerSack != price) changes.push(`Price: "${oldProduct.pricePerSack}" → "${price}"`);
    if (oldProduct.productDescription !== description) changes.push(`Description: "${oldProduct.productDescription}" → "${description}"`);
    if (oldQuantity !== quantity) changes.push(`Quantity: "${oldQuantity}" → "${quantity}"`);
    const actionDetail = changes.length
      ? `Product ${name} edited. Changes: ${changes.join(', ')}`
      : `Product ${name} edited (no changes detected)`;

    // Log product edit
    push(ref(db, 'logs/products'), {
      action: actionDetail,
      date: new Date(Date.now()).toUTCString(),
      by: uid
    });

    // Log inventory change if quantity changed
    if (oldQuantity !== quantity) {
      push(ref(db, 'logs/inventory'), {
        action: `Inventory updated for product ${name} (${productKey})`,
        date: new Date(Date.now()).toUTCString(),
        by: uid,
        productId: productKey,
        oldQuantity: oldQuantity,
        newQuantity: quantity
      });
    }

    alert('Product and inventory updated successfully');
    manageProductSelectedOpt('View Products');
  } catch (error) {
    alert('Error updating product: ' + error.message);
  }
}

async function searchEditProduct() {
  const searchVal = document.getElementById('edit-product-search-input').value.trim().toLowerCase();
  if (!searchVal) {
    alert('Please enter a Product ID or Name.');
    return;
  }
  // Try to find by ID first
  let foundKey = null;
  let foundData = null;
  const productsSnap = await get(ref(db, 'products'));
  if (productsSnap.exists()) {
    productsSnap.forEach(child => {
      const prod = child.val();
      if (
        child.key.toLowerCase() === searchVal ||
        (prod.productName && prod.productName.trim().toLowerCase() === searchVal)
      ) {
        foundKey = child.key;
        foundData = prod;
      }
    });
  }
  if (foundKey) {
    window._editProductKey = foundKey;
    manageProductSelectedOpt('Edit Product', foundKey);
  } else {
    alert('Product not found.');
  }
};

function editProductFromView(productKey) {
  window._editProductKey = productKey;
  manageProductSelectedOpt('Edit Product', productKey);
};

window.editProductFromView = editProductFromView;
window.searchEditProduct = searchEditProduct;
window.saveEditProduct = saveEditProduct;
window.removeProductFromView = removeProductFromView;
window.downloadProductLogs = downloadProductLogs;
window.addProduct = addProduct;
window.removeProduct = removeProduct;
window.updateProductStats = updateProductStats;

const addLot = async (event) => {
  event.preventDefault();
  const lotNum = document.getElementById('lot-name').value;
  const lotPrice = document.getElementById('lot-price').value;
  const lotDescription = document.getElementById('lot-description').value;
  const lotSize = document.getElementById('lot-size').value;
  const lotStatus = document.getElementById('lot-status').value;

  if (!lotNum || !lotPrice || !lotDescription || !lotSize || !lotStatus) {
    alert('Please fill in all fields');
    return;
  }

  let isLotFound = false;

  await get(ref(db, 'lots/')).then(async (snapshot) => {
    snapshot.forEach((item) => {
      if (item.val().lotNumber === lotNum) {
        alert('Lot already exists');
        isLotFound = true;
        return;
      }
    })
  });
  if (!isLotFound) {
    await push(ref(db, '/lots'), {
      lotImages: 123123,
      lotNumber: lotNum,
      lotPrice: lotPrice,
      lotDescription: lotDescription,
      lotSize: lotSize,
    }).then(() => {
      alert('Lot added successfully');
      push(ref(db, 'logs/lots'), {
        action: 'Lot ' + lotNum + ' added',
        date: new Date(Date.now()).toUTCString(),
        by: uid
      });
    }).catch((error) => {
      alert('Error adding lot: ' + error.message);
    });
  };
}

const removeLot = async (event) => {
  event.preventDefault();
  const lotNum = document.getElementById('lot-number').value;
  if (!lotNum) {
    alert('Please fill in the Lot Number field');
    return;
  }

  let isLotFound = false;

  await get(ref(db, 'lots/')).then((snapshot) => {
    snapshot.forEach((item) => {
      if (item.val().lotNumber === lotNum) {
          isLotFound = true;
      }
    })
  });

  if (isLotFound) {
    get(ref(db, 'lots/')).then((snapshot) => {
      snapshot.forEach((item) => {
        if (item.val().lotNumber === lotNum) {
          remove(ref(db, 'lots/' + item.key)).then(() => {
            alert('Lot removed successfully');
            push(ref(db, 'logs/lots'), {
              action: 'Lot ' + lotNum + ' removed',
              date: new Date(Date.now()).toUTCString(),
              by: uid
            });
          }).catch((error) => {
            alert('Error removing lot: ' + error.message);
          });
        }
      })
    });
    return;
  } else {
    alert('Lot not found');
  }
}

async function renderReservedLotsAdmin() {
  const interfaceElement = document.querySelector('#manage-mainview-settings-editable');
  let html = `<div class="lot-reservation-admin-list">`;

  // Fetch reserved lots
  const reserveLotsSnap = await get(ref(db, 'reserveLots'));
  if (!reserveLotsSnap.exists()) {
    html += `<p>No reserved lots found.</p></div>`;
    interfaceElement.innerHTML = html;
    return;
  }

  let lots = [];
  reserveLotsSnap.forEach(child => {
    lots.push({ ...child.val(), key: child.key });
  });

  // Fetch user info for each lot
  const usersSnap = await get(ref(db, 'users'));
  const users = usersSnap.exists() ? usersSnap.val() : {};

  lots.forEach(lot => {
    const user = users[lot.uid] || {};
    let priceDisplay = "N/A";
    if (lot.lotPrice && !isNaN(Number(lot.lotPrice.toString().replace(/,/g, "")))) {
      priceDisplay = Number(lot.lotPrice.toString().replace(/,/g, "")).toLocaleString();
    }
    let feeDisplay = lot.reservationFee ? `₱${Number(lot.reservationFee).toLocaleString()}` : "N/A";
    html += `
      <div class="lot-reservation-admin-card">
        <div class="lot-reservation-admin-card-header">
          <span>Lot #${lot.lotNumber || ""}</span>
          <span class="lot-reservation-admin-card-status">Reserved</span>
        </div>
        <div class="lot-reservation-admin-card-details">
          <div>
            <strong>Client:</strong> ${user.firstName || ""} ${user.lastName || ""} <br>
            <strong>Email:</strong> ${user.email || ""} <br>
            <strong>Contact:</strong> ${user.phone || ""}
          </div>
          <div>
            <strong>Price:</strong> ₱${priceDisplay} <br>
            <strong>Reservation Fee:</strong> ${feeDisplay} <br>
            <strong>Contract Date:</strong> ${lot.contractSigningDate || "N/A"}
          </div>
        </div>
        <div class="lot-reservation-admin-card-actions">
          <button class="cancel-reservation-admin-btn" data-key="${lot.key}" data-uid="${lot.uid}" data-fee="${lot.reservationFee}" data-method="${lot.reservationPaymentMethod}">Cancel & Refund</button>
          <button class="mark-contract-signed-btn" data-key="${lot.key}" data-lotkey="${lot.lotKey}" data-uid="${lot.uid}">Mark as Contract Signed</button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  interfaceElement.innerHTML = html;

  // Add event listeners for "Mark as Contract Signed"
  document.querySelectorAll('.mark-contract-signed-btn').forEach(btn => {
    btn.onclick = async () => {
      const lotKey = btn.getAttribute('data-lotkey');
      const uid = btn.getAttribute('data-uid');
      if (!confirm("Mark this lot as contract signed and transfer ownership?")) return;
      await update(ref(db, `lots/${lotKey}`), { status: "rented", reservedBy: uid });
      // Remove the reservation entry
      const reservationKey = btn.getAttribute('data-key');
      await remove(ref(db, `reserveLots/${reservationKey}`));
      push(ref(db, 'logs/lots'), {
        action: `Lot ${lotKey} marked as rented after contract signing.`,
        date: new Date().toUTCString(),
        by: uid
      });
      alert("Lot marked as rented.");
      renderReservedLotsAdmin();
    };
  });

  // Add event listeners for cancel/refund
  document.querySelectorAll('.cancel-reservation-admin-btn').forEach(btn => {
    btn.onclick = async () => {
      const key = btn.getAttribute('data-key');
      const uid = btn.getAttribute('data-uid');
      const fee = Number(btn.getAttribute('data-fee')) || 0;
      const method = btn.getAttribute('data-method') || '';
      if (!confirm("Cancel this reservation and refund the fee?")) return;

      // Remove reservation
      await remove(ref(db, `reserveLots/${key}`));

      // Update lot status to available
      // Find the lotKey from the reservation (if available)
      let lotKey = null;
      const lotSnap = await get(ref(db, `reserveLots/${key}`));
      if (lotSnap.exists()) {
        lotKey = lotSnap.val().lotKey;
      }
      if (lotKey) {
        await update(ref(db, `lots/${lotKey}`), { status: "available", reservedBy: null });
      }

      // Log the action
      push(ref(db, 'logs/lots'), {
        action: `Reservation for Lot ${lotKey || key} cancelled and fee refunded via ${method}`,
        date: new Date().toUTCString(),
        by: uid
      });

      // Simulate refund (in real app, trigger payment API here)
      alert(`Refunded ₱${fee.toLocaleString()} to client via ${method}.`);
      renderReservedLotsAdmin();
    };
  });
}

async function renderOwnedLotsAdmin() {
  const interfaceElement = document.querySelector('#manage-mainview-settings-editable');
  let html = `<div class="owned-lots-admin-list">`;

  // Fetch all lots
  const lotsSnap = await get(ref(db, 'lots'));
  if (!lotsSnap.exists()) {
    html += `<p>No rented lots found.</p></div>`;
    interfaceElement.innerHTML = html;
    return;
  }

  // Fetch users
  const usersSnap = await get(ref(db, 'users'));
  const users = usersSnap.exists() ? usersSnap.val() : {};

  let rentedCount = 0;
  lotsSnap.forEach(child => {
    const lot = child.val();
    if ((lot.status || '').toLowerCase() === 'rented') {
      rentedCount++;
      const owner = users[lot.reservedBy] || {};
      html += `
        <div class="owned-lot-admin-card">
          <div class="owned-lot-admin-card-accent"></div>
          <div class="owned-lot-admin-card-content">
            <div class="owned-lot-admin-card-header">
              <span class="owned-lot-admin-card-lotnum">Lot #${lot.lotNumber || ""}</span>
              <span class="owned-lot-admin-card-status">Rented</span>
            </div>
            <div class="owned-lot-admin-card-details">
              <div class="owned-lot-admin-owner">
                <div class="owned-lot-admin-label">Owner</div>
                <div><strong>Name:</strong> ${owner.firstName || ""} ${owner.lastName || ""}</div>
                <div><strong>Email:</strong> ${owner.email || ""}</div>
                <div><strong>Contact:</strong> ${owner.phone || ""}</div>
              </div>
              <div class="owned-lot-admin-info">
                <div class="owned-lot-admin-label">Lot Details</div>
                <div><strong>Price:</strong> ₱${lot.lotPrice || "N/A"}</div>
                <div><strong>Size:</strong> ${lot.lotSize || "N/A"}</div>
                <div><strong>Description:</strong> ${lot.lotDescription || "N/A"}</div>
              </div>
            </div>
            <div class="owned-lot-admin-card-actions">
              <button class="cancel-contract-btn" data-lotkey="${child.key}" data-owner="${lot.reservedBy}">Cancel Contract</button>
            </div>
          </div>
        </div>
      `;
    }
  });

  if (rentedCount === 0) {
    html += `<p>No rented lots found.</p>`;
  }

  html += `</div>`;
  interfaceElement.innerHTML = html;

  // Add event listeners for cancel contract
  document.querySelectorAll('.cancel-contract-btn').forEach(btn => {
    btn.onclick = async () => {
      const lotKey = btn.getAttribute('data-lotkey');
      const owner = btn.getAttribute('data-owner');
      if (!confirm("Cancel this contract and set lot as available?")) return;
      await update(ref(db, `lots/${lotKey}`), { status: "available", reservedBy: null });
      push(ref(db, 'logs/lots'), {
        action: `Contract for Lot ${lotKey} cancelled by admin.`,
        date: new Date().toUTCString(),
        by: uid
      });
      alert("Contract cancelled and lot is now available.");
      renderOwnedLotsAdmin();
    };
  });
}

const downloadLotLogs = async (event) => {
  const logsRef = ref(db, 'logs/lots');
  const logsSnapshot = await get(logsRef);
  const logs = logsSnapshot.val();

  if (!logs) {
    alert('No logs found');
    return;
  }

  const doc = new window.jspdf.jsPDF();

  // Theme colors
  const red = [182, 23, 24];
  const green = [30, 125, 52];
  const dark = [34, 58, 35];

  // Title
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  doc.setFontSize(20);
  doc.setTextColor(...red);
  doc.text(`Lot Logs - ${month} ${year}`, 105, 16, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text(`Downloaded: ${now.toLocaleString()}`, 105, 24, { align: 'center' });

  // Table headers
  let y = 34;
  doc.setFillColor(...green);
  doc.setTextColor(255,255,255);
  doc.roundedRect(10, y-8, 190, 10, 2, 2, 'F');
  doc.text('Date', 14, y);
  doc.text('By UserID', 180, y, { align: 'right' });
  doc.text('Action', 14, y+7);

  // Table rows
  y += 15;
  doc.setFontSize(11);

  const maxActionWidth = 170;
  Object.values(logs)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((log, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(246, 246, 246);
        doc.rect(10, y-7, 190, 10, 'F');
      }
      doc.setTextColor(...dark);

      const dateStr = log.date ? new Date(log.date).toLocaleString() : 'N/A';
      doc.text(dateStr, 14, y);
      doc.text(log.by ? String(log.by) : '', 180, y, { align: 'right' });

      const actionLines = doc.splitTextToSize(log.action || 'N/A', maxActionWidth);
      doc.text(actionLines, 14, y + 7);

      const rowHeight = 7 + (actionLines.length * 6);

      if (y + rowHeight > 280) {
        doc.addPage();
        y = 20;
        // Redraw header on new page
        doc.setFillColor(...green);
        doc.setTextColor(255,255,255);
        doc.roundedRect(10, y-8, 190, 10, 2, 2, 'F');
        doc.text('Date', 14, y);
        doc.text('By UserID', 180, y, { align: 'right' });
        doc.text('Action', 14, y+7);
        y += 15;
        doc.setFontSize(11);
      }

      y += rowHeight + 3; // Add spacing after each row
    });

  doc.save(`lot_logs(${month}_${year}).pdf`);
};

const filterLotLogsByDate = function() {
  const filterDate = document.getElementById('log-date').value;
  document.querySelectorAll('.lot-log-entry').forEach(entry => {
    const dateText = entry.querySelector('.lot-log-date').textContent;
    const match = dateText.match(/Date:\s*(.*)/);
    let logDate = '';
    if (match && match[1]) {
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        logDate = `${year}-${month}-${day}`;
      }
    }
    if (!filterDate || logDate === filterDate) {
      entry.style.display = '';
    } else {
      entry.style.display = 'none';
    }
  });
};

async function removeLotFromView(lotKey, lotNumber) {
  if (!confirm(`Are you sure you want to remove Lot "${lotNumber}"?`)) return;
  try {
    await remove(ref(db, 'lots/' + lotKey));
    push(ref(db, 'logs/lots'), {
      action: 'Lot ' + lotNumber + ' removed (from View Lots)',
      date: new Date(Date.now()).toUTCString(),
      by: uid
    });
    alert('Lot removed successfully');
    manageLotSelectedOpt('View Lots');
  } catch (error) {
    alert('Error removing lot: ' + error.message);
  }
}

function editLotFromView(lotKey) {
  window._editLotKey = lotKey;
  manageLotSelectedOpt('Edit Lot', lotKey);
};

async function searchEditLot() {
  const searchVal = document.getElementById('edit-lot-search-input').value.trim().toLowerCase();
  if (!searchVal) {
    alert('Please enter a Lot Number or ID.');
    return;
  }
  let foundKey = null;
  const lotsSnap = await get(ref(db, 'lots'));
  if (lotsSnap.exists()) {
    lotsSnap.forEach(child => {
      const lot = child.val();
      if (
        child.key.toLowerCase() === searchVal ||
        (lot.lotNumber && lot.lotNumber.trim().toLowerCase() === searchVal)
      ) {
        foundKey = child.key;
      }
    });
  }
  if (foundKey) {
    window._editLotKey = foundKey;
    manageLotSelectedOpt('Edit Lot', foundKey);
  } else {
    alert('Lot not found.');
  }
};

async function saveEditLot(lotKey) {
  const number = document.getElementById('edit-lot-number').value.trim();
  const price = document.getElementById('edit-lot-price').value.trim();
  const size = document.getElementById('edit-lot-size').value.trim();
  const status = document.getElementById('edit-lot-status').value.trim();
  const description = document.getElementById('edit-lot-description').value.trim();

  if (!number || !price || !size || !description) {
    alert('Please fill in all fields');
    return;
  }

  // Duplicate check (exclude current lot)
  const lotsSnap = await get(ref(db, 'lots'));
  let duplicate = false;
  if (lotsSnap.exists()) {
    lotsSnap.forEach(child => {
      if (child.key !== lotKey && child.val().lotNumber === number) {
        duplicate = true;
      }
    });
  }
  if (duplicate) {
    alert('A lot with this number already exists.');
    return;
  }

  try {
    // Fetch old values for detailed logging
    const oldLotSnap = await get(ref(db, 'lots/' + lotKey));
    const oldLot = oldLotSnap.exists() ? oldLotSnap.val() : {};

    await update(ref(db, 'lots/' + lotKey), {
      lotNumber: number,
      lotPrice: price,
      lotSize: size,
      lotStatus: status,
      lotDescription: description
    });

    // After await update(ref(db, 'lots/' + lotKey), { ... });

    const reserveLotsSnap = await get(ref(db, 'reserveLots'));
    if (reserveLotsSnap.exists()) {
      reserveLotsSnap.forEach(child => {
        const reserve = child.val();
        if (reserve.lotKey === lotKey) {
          update(ref(db, 'reserveLots/' + child.key), {
            lotNumber: number,
            lotPrice: price,
            lotSize: size,
            lotStatus: status,
            lotDescription: description
          });
        }
      });
    }

    // Build detailed action log
    let changes = [];
    if (oldLot.lotNumber !== number) changes.push(`Number: "${oldLot.lotNumber}" → "${number}"`);
    if (oldLot.lotPrice != price) changes.push(`Price: "${oldLot.lotPrice}" → "${price}"`);
    if (oldLot.lotSize !== size) changes.push(`Size: "${oldLot.lotSize}" → "${size}"`);
    if ((oldLot.lotStatus || '') !== status) changes.push(`Status: "${oldLot.lotStatus || ''}" → "${status}"`);
    if (oldLot.lotDescription !== description) changes.push(`Description: "${oldLot.lotDescription}" → "${description}"`);
    const actionDetail = changes.length
      ? `Lot ${number} edited. Changes: ${changes.join(', ')}`
      : `Lot ${number} edited (no changes detected)`;

    // Log lot edit
    push(ref(db, 'logs/lots'), {
      action: actionDetail,
      date: new Date(Date.now()).toUTCString(),
      by: uid
    });

    alert('Lot updated successfully');
    manageLotSelectedOpt('View Lots');
  } catch (error) {
    alert('Error updating lot: ' + error.message);
  }
}

window.saveEditLot = saveEditLot;
window.searchEditLot = searchEditLot;
window.editLotFromView = editLotFromView;
window.removeLotFromView = removeLotFromView;
window.filterLotLogsByDate = filterLotLogsByDate;
window.addLot = addLot;
window.removeLot = removeLot;
window.downloadLotLogs = downloadLotLogs;


const prefillUpdateOrder = function(orderId, status) {
  // Switch to Update Order section
  manageOrderSelectedOpt('Update Order');
  setTimeout(() => {
    document.getElementById('order-id').value = orderId;
    document.getElementById('order-status').value = status || 'Pending';
  }, 100); // Wait for DOM to update
};

const updateOrderStatus = async function() {
  const orderId = document.getElementById('order-id').value;
  const newStatus = document.getElementById('order-status').value;
  if (!orderId) {
    alert('Please enter an Order ID.');
    return;
  }

  // Find the order in all users' orders
  const ordersSnap = await get(ref(db, 'orders'));
  let found = false;
  if (ordersSnap.exists()) {
    ordersSnap.forEach(userOrdersSnap => {
      userOrdersSnap.forEach(orderSnap => {
        if ((orderSnap.val().orderId && orderSnap.val().orderId == orderId) || orderSnap.key == orderId) {
          // Update status
          update(ref(db, `orders/${userOrdersSnap.key}/${orderSnap.key}`), { status: newStatus });
          push(ref(db, 'logs/orders'), {
            action: `Order ${orderId} status updated to ${newStatus}`,
            date: new Date(Date.now()).toUTCString(),
            by: uid
          });
          found = true;
        }
      });
    });
  }
  if (found) {
    alert('Order status updated!');
    manageOrderSelectedOpt('View Orders');
  } else {
    alert('Order not found.');
  }
};

const cancelOrder = async function() {
  const orderId = document.getElementById('order-id').value;
  if (!orderId) {
    alert('Please enter an Order ID.');
    return;
  }
  // Find and remove the order
  const ordersSnap = await get(ref(db, 'orders'));
  let found = false;
  if (ordersSnap.exists()) {
    ordersSnap.forEach(userOrdersSnap => {
      userOrdersSnap.forEach(orderSnap => {
        if ((orderSnap.val().orderId && orderSnap.val().orderId == orderId) || orderSnap.key == orderId) {
          push(ref(db, 'logs/orders'), {
            action: `Order ${orderId} cancelled`,
            date: new Date(Date.now()).toUTCString(),
            by: uid
          });
          remove(ref(db, `orders/${userOrdersSnap.key}/${orderSnap.key}`));
          found = true;
        }
      });
    });
  }
  if (found) {
    alert('Order cancelled!');
    manageOrderSelectedOpt('View Orders');
  } else {
    alert('Order not found.');
  }
};

const removeOrderFromList = async function(userKey, orderKey, orderId) {
  if (!confirm(`Are you sure you want to remove Order "${orderId}"?`)) return;
  try {
    await remove(ref(db, `orders/${userKey}/${orderKey}`));
    // Log the removal
    push(ref(db, 'logs/orders'), {
      action: `Order ${orderId} removed`,
      date: new Date(Date.now()).toUTCString(),
      by: uid
    });
    alert('Order removed successfully!');
    manageOrderSelectedOpt('Remove Order');
  } catch (error) {
    alert('Error removing order: ' + error.message);
  }
};

const filterRemoveOrderList = function() {
  const search = document.getElementById('remove-order-search').value.toLowerCase();
  document.querySelectorAll('.remove-order-container').forEach(card => {
    const orderId = card.querySelector('.view-orders-container-header').textContent.toLowerCase();
    card.style.display = orderId.includes(search) ? '' : 'none';
  });
};

const filterOrderLogsByDate = function() {
  const filterDate = document.getElementById('order-log-date').value; // format: YYYY-MM-DD
  document.querySelectorAll('.order-log-entry').forEach(entry => {
    const dateText = entry.querySelector('.order-log-date').textContent;
    // Extract the date string from "Date: ..." and parse it
    const match = dateText.match(/Date:\s*(.*)/);
    let logDate = '';
    if (match && match[1]) {
      // Try to parse as Date, fallback to hiding if invalid
      const d = new Date(match[1]);
      if (!isNaN(d.getTime())) {
        // Format as YYYY-MM-DD in local time
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        logDate = `${year}-${month}-${day}`;
      }
    }
    // Show if filter is empty or matches
    if (!filterDate || logDate === filterDate) {
      entry.style.display = '';
    } else {
      entry.style.display = 'none';
    }
  });
};

const downloadOrderLogs = async function() {
  const logsRef = ref(db, 'logs/orders');
  const logsSnapshot = await get(logsRef);
  const logs = logsSnapshot.val();

  if (!logs) {
    alert('No order logs found');
    return;
  }

  const doc = new window.jspdf.jsPDF();

  // Theme colors
  const red = [182, 23, 24];
  const green = [30, 125, 52];
  const dark = [34, 58, 35];

  // Title
  const now = new Date();
  const month = now.toLocaleString('default', { month: 'long' });
  const year = now.getFullYear();

  doc.setFontSize(20);
  doc.setTextColor(...red);
  doc.text(`Order Logs - ${month} ${year}`, 105, 16, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text(`Downloaded: ${now.toLocaleString()}`, 105, 24, { align: 'center' });

  // Table headers
  let y = 34;
  doc.setFillColor(...green);
  doc.setTextColor(255,255,255);
  doc.roundedRect(10, y-8, 190, 10, 2, 2, 'F');
  doc.text('Date', 14, y);
  doc.text('By UserID', 180, y, { align: 'right' });
  doc.text('Action', 14, y+7);

  // Table rows
  y += 15;
  doc.setFontSize(11);

  const maxActionWidth = 170; // Wider for action since it's below
  Object.values(logs)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((log, idx) => {
      // Alternate row color
      if (idx % 2 === 0) {
        doc.setFillColor(246, 246, 246);
        doc.rect(10, y-7, 190, 10, 'F');
      }
      doc.setTextColor(...dark);

      // Date and By UserID on the same line
      const dateStr = log.date ? new Date(log.date).toLocaleString() : 'N/A';
      doc.text(dateStr, 14, y);
      doc.text(log.by ? String(log.by) : '', 180, y, { align: 'right' });

      // Action (multi-line, below)
      const actionLines = doc.splitTextToSize(log.action || 'N/A', maxActionWidth);
      doc.text(actionLines, 14, y + 7);

      // Calculate height for this entry
      const rowHeight = 7 + (actionLines.length * 6);

      // Add page break if needed
      if (y + rowHeight > 280) {
        doc.addPage();
        y = 20;
        // Redraw header on new page
        doc.setFillColor(...green);
        doc.setTextColor(255,255,255);
        doc.roundedRect(10, y-8, 190, 10, 2, 2, 'F');
        doc.text('Date', 14, y);
        doc.text('By UserID', 180, y, { align: 'right' });
        doc.text('Action', 14, y+7);
        y += 15;
        doc.setFontSize(11);
      }

      y += rowHeight + 3; // Add spacing after each row
    });

  doc.save(`order_logs(${month}_${year}).pdf`);
};

window.filterOrderLogsByDate = filterOrderLogsByDate;
window.filterRemoveOrderList = filterRemoveOrderList;
window.removeOrderFromList = removeOrderFromList;
window.prefillUpdateOrder = prefillUpdateOrder;
window.updateOrderStatus = updateOrderStatus;
window.cancelOrder = cancelOrder;
window.downloadOrderLogs = downloadOrderLogs;

// --- Dashboard Reports Section ---

function showDashboardSkeletons() {
  // Detailed skeletons for each card
  const cardSkeletons = {
    "total-sales": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line short"></div>`,
    "total-orders": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line"></div>`,
    "avg-order": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line short"></div>`,
    "top-product": `<div class="skeleton-icon"></div><div class="skeleton-text-line"></div><div class="skeleton-text-line short"></div>`,
    "low-stock": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line short"></div>`,
    "active-users": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line"></div>`,
    "pending-orders": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line"></div>`,
    "completed-orders": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line"></div>`,
    "cancelled-orders": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line"></div>`,
    "new-users": `<div class="skeleton-icon"></div><div class="skeleton"></div><div class="skeleton-text-line"></div>`
  };
  Object.entries(cardSkeletons).forEach(([id, html]) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  });
  // Chart skeletons: line for sales, pie for order status/user roles, bar for inventory
  const chartSkeletons = {
    "salesChart-loading": '<div class="skeleton-linechart"></div>',
    "orderStatusChart-loading": '<div class="skeleton-piechart"></div>',
    "inventoryChart-loading": `<div class="skeleton-barchart">
      <div class="skeleton-bar"></div>
      <div class="skeleton-bar"></div>
      <div class="skeleton-bar"></div>
      <div class="skeleton-bar"></div>
      <div class="skeleton-bar"></div>
    </div>`,
    "userActivityChart-loading": '<div class="skeleton-piechart"></div>'
  };
  Object.entries(chartSkeletons).forEach(([id, html]) => {
    const loadingDiv = document.getElementById(id);
    if (loadingDiv) {
      loadingDiv.innerHTML = html;
      loadingDiv.style.display = "block";
    }
  });
}

// --- Dashboard Data Population ---
// Fetch all orders from all users
async function fetchAllOrders() {
  const ordersRef = ref(db, "orders");
  const snap = await get(ordersRef);
  let orders = [];
  if (snap.exists()) {
    snap.forEach(userOrdersSnap => {
      const userOrders = userOrdersSnap.val();
      // userOrders is an object of orderId: orderData
      Object.values(userOrders).forEach(order => orders.push(order));
    });
  }
  return orders;
}

document.addEventListener("DOMContentLoaded", async () => {
  // Only run dashboard functionality on the reports page
  if (!document.querySelector('.dashboard-mainview')) return;

  showDashboardSkeletons();

  // Fetch orders, products, users
  const orders = await fetchAllOrders();

  const productsSnap = await get(ref(db, 'inventory'));
  const usersSnap = await get(ref(db, 'users'));

  // Total Sales, Orders, Avg Order
  document.getElementById("total-sales").textContent = "₱" + orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString();
  document.getElementById("total-orders").textContent = orders.length;
  const avgOrder = orders.length ? (orders.reduce((sum, o) => sum + (o.total || 0), 0) / orders.length) : 0;
  document.getElementById("avg-order").textContent = "₱" + avgOrder.toLocaleString(undefined, {maximumFractionDigits:2});

  // Top Product
  const productSales = {};
  orders.forEach(order => {
    (order.productDetails || []).forEach(prod => {
      const name = prod.productName || "Unknown";
      productSales[name] = (productSales[name] || 0) + (prod.quantity || 0);
    });
  });
  const topProduct = Object.entries(productSales).sort((a,b) => b[1]-a[1])[0];
  document.getElementById("top-product").textContent = topProduct ? topProduct[0] : "N/A";

  // Low Stock
  let lowStock = 0;
  if (productsSnap.exists()) {
    productsSnap.forEach(prodSnap => {
      const qty = prodSnap.val().quantity || 0;
      if (qty < 10) lowStock++;
    });
  }
  document.getElementById("low-stock").textContent = lowStock;

  // Active Users
  let activeUsers = 0;
  let newUsers = 0;
  const now = new Date();
  if (usersSnap.exists()) {
    usersSnap.forEach(userSnap => {
      const val = userSnap.val();
      const role = (val.accessLevel || "").toLowerCase();
      if (role === "user") activeUsers++;
      // New users this month
      if (val.registrationTimestamp) {
        const regDate = new Date(val.registrationTimestamp);
        if (
          regDate.getFullYear() === now.getFullYear() &&
          regDate.getMonth() === now.getMonth()
        ) {
          newUsers++;
        }
      }
    });
  }
  document.getElementById("active-users").textContent = activeUsers;
  document.getElementById("new-users").textContent = newUsers;

  // Pending, Completed, Cancelled Orders
  let pending = 0, completed = 0, cancelled = 0;
  orders.forEach(order => {
    const status = (order.status || "pending").toLowerCase();
    if (status === "pending" || status === "in transit" || status === "pick-up" || status === "delivery soon") pending++;
    else if (status === "completed" || status === "delivered") completed++;
    else if (status === "cancelled" || status === "canceled") cancelled++;
  });
  document.getElementById("pending-orders").textContent = pending;
  document.getElementById("completed-orders").textContent = completed;
  document.getElementById("cancelled-orders").textContent = cancelled;

  // Render charts (each hides its own skeleton)
  await renderSalesChart();
  await renderOrderStatusChart();
  await renderInventoryChart();
  await renderUserActivityChart();
  await renderTopProductsChart();
  await renderMonthlyPaymentMonitoringChart();
  await renderMonthlyPaymentReportsChart();
  await renderLoyalUsersChart();
  await renderTopLoyalUsersTable();
  await renderPaymentsPreview();

  // Render calendar
  renderDashboardCalendar();

  // Inventory modal logic
  const viewAllBtn = document.getElementById('view-all-inventory-btn');
  const modal = document.getElementById('inventory-modal');
  const modalClose = document.getElementById('inventory-modal-close');
  const modalList = document.getElementById('inventory-modal-list');

  if (viewAllBtn && modal && modalClose && modalList) {
    viewAllBtn.onclick = () => {
      // Use the global _allInventoryProducts set by renderInventoryChart
      const products = window._allInventoryProducts || [];
      modalList.innerHTML = products.length
        ? products.map(p => `<div class="inventory-modal-list-item"><span>${p.name}</span><span>Qty: ${p.qty}</span></div>`).join('')
        : '<div>No products in inventory.</div>';
      modal.style.display = 'flex';
    };
    modalClose.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }
});

// --- Chart Functions with Skeleton Handling ---
// --- Top Products Bar Chart ---
async function renderTopProductsChart() {
  const loadingDiv = document.getElementById("topProductsChart-loading");
  if (loadingDiv) loadingDiv.style.display = "block";

  const orders = await fetchAllOrders();
  const productSales = {};
  orders.forEach(order => {
    (order.productDetails || []).forEach(prod => {
      const name = prod.productName || "Unknown";
      productSales[name] = (productSales[name] || 0) + (prod.quantity || 0);
    });
  });

  // Get top 5 products
  const sorted = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const labels = sorted.map(([name]) => name);
  const data = sorted.map(([, qty]) => qty);

  const ctx = document.getElementById('topProductsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Quantity Sold',
        data,
        backgroundColor: '#b61718'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { title: { display: false } },
        y: { beginAtZero: true, title: { display: true, text: 'Quantity Sold' } }
      }
    }
  });

  if (loadingDiv) loadingDiv.style.display = "none";
}

async function renderSalesChart() {
  const loadingDiv = document.getElementById("salesChart-loading");
  if (loadingDiv) loadingDiv.style.display = "block";

  const orders = await fetchAllOrders();
  const salesByDay = {};
  orders.forEach(order => {
    let dateStr = order.datePlaced || order.eta || order.date || "";
    if (dateStr) {
      let d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const key = d.toISOString().slice(0,10);
        salesByDay[key] = (salesByDay[key] || 0) + (order.total || 0);
      }
    }
  });
  const labels = Object.keys(salesByDay).sort();
  const data = labels.map(day => salesByDay[day]);

  const ctx = document.getElementById('salesChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Sales',
        data,
        borderColor: '#b61718',
        backgroundColor: 'rgba(182,23,24,0.08)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  if (loadingDiv) loadingDiv.style.display = "none";
}

async function renderOrderStatusChart() {
  const loadingDiv = document.getElementById("orderStatusChart-loading");
  if (loadingDiv) loadingDiv.style.display = "block";

  const orders = await fetchAllOrders();
  const statusCounts = {};
  orders.forEach(order => {
    const status = (order.status || "Pending").toLowerCase();
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });
  const labels = Object.keys(statusCounts);
  const data = Object.values(statusCounts);

  const ctx = document.getElementById('orderStatusChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#b61718', '#2D5F4D', '#888', '#ccc', '#f5a623', '#f8e71c']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });

  if (loadingDiv) loadingDiv.style.display = "none";
}

async function renderInventoryChart() {
  const loadingDiv = document.getElementById("inventoryChart-loading");
  if (loadingDiv) loadingDiv.style.display = "block";

  // Fetch both inventory and products
  const [productsSnap, inventorySnap] = await Promise.all([
    get(ref(db, 'products')),
    get(ref(db, 'inventory'))
  ]);
  const productsMap = {};
  if (productsSnap.exists()) {
    productsSnap.forEach(prodSnap => {
      const prod = prodSnap.val();
      productsMap[prodSnap.key] = prod.productName || prodSnap.key;
    });
  }

  let productNames = [];
  let inStockData = [], lowStockData = [], outOfStockData = [];
  let allProducts = [];

  if (inventorySnap.exists()) {
    inventorySnap.forEach(invSnap => {
      const inv = invSnap.val();
      const name = productsMap[inv.productId] || inv.productId || invSnap.key;
      const qty = inv.quantity || 0;
      productNames.push(name);
      allProducts.push({ name, qty });
      if (qty === 0) {
        inStockData.push(0);
        lowStockData.push(0);
        outOfStockData.push(qty);
      } else if (qty < 10) {
        inStockData.push(0);
        lowStockData.push(qty);
        outOfStockData.push(0);
      } else {
        inStockData.push(qty);
        lowStockData.push(0);
        outOfStockData.push(0);
      }
    });
  }

  const ctx = document.getElementById('inventoryChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: productNames,
      datasets: [
        {
          label: 'In Stock (≥10)',
          data: inStockData,
          backgroundColor: '#2D5F4D'
        },
        {
          label: 'Low Stock (<10)',
          data: lowStockData,
          backgroundColor: '#b61718'
        },
        {
          label: 'Out of Stock',
          data: outOfStockData,
          backgroundColor: '#ccc'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });

  // Store all products for modal
  window._allInventoryProducts = allProducts;

  if (loadingDiv) loadingDiv.style.display = "none";
}

async function renderUserActivityChart() {
  const loadingDiv = document.getElementById("userActivityChart-loading");
  if (loadingDiv) loadingDiv.style.display = "block";

  const usersSnap = await get(ref(db, 'users'));
  let admins = 0, staff = 0, couriers = 0, regular = 0;
  if (usersSnap.exists()) {
    usersSnap.forEach(userSnap => {
      const role = (userSnap.val().accessLevel || "").toLowerCase();
      if (role === "admin") admins++;
      else if (role === "staff") staff++;
      else if (role === "courier") couriers++;
      else regular++;
    });
  }
  const ctx = document.getElementById('userActivityChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Admins', 'Staff', 'Couriers', 'Users'],
      datasets: [{
        data: [admins, staff, couriers, regular],
        backgroundColor: ['#b61718', '#2D5F4D', '#888', '#ccc']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });

  if (loadingDiv) loadingDiv.style.display = "none";
}

// --- Simple Calendar (current month) ---
function renderDashboardCalendar() {
  const container = document.getElementById('dashboard-calendar');
  if (!container) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  // Get first day of month
  const firstDay = new Date(year, month, 1).getDay();
  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `<div style="width:100%;text-align:center;">
    <div style="font-weight:bold;font-size:1.1em;margin-bottom:8px;">${now.toLocaleString('default', { month: 'long' })} ${year}</div>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <th style="color:#b61718;">Sun</th>
        <th style="color:#b61718;">Mon</th>
        <th style="color:#b61718;">Tue</th>
        <th style="color:#b61718;">Wed</th>
        <th style="color:#b61718;">Thu</th>
        <th style="color:#b61718;">Fri</th>
        <th style="color:#b61718;">Sat</th>
      </tr>
      <tr>
  `;
  let day = 1;
  // Fill initial empty cells
  for (let i = 0; i < firstDay; i++) html += `<td></td>`;
  for (let i = firstDay; i < 7; i++) {
    html += `<td${day === today ? ' style="background:#b61718;color:#fff;border-radius:50%;font-weight:bold;"' : ''}>${day}</td>`;
    day++;
  }
  html += `</tr>`;
  while (day <= daysInMonth) {
    html += `<tr>`;
    for (let i = 0; i < 7 && day <= daysInMonth; i++) {
      html += `<td${day === today ? ' style="background:#b61718;color:#fff;border-radius:50%;font-weight:bold;"' : ''}>${day}</td>`;
      day++;
    }
    html += `</tr>`;
  }
  html += `</table></div>`;
  container.innerHTML = html;
}

// --- Monthly Payment Monitoring Chart ---
async function renderMonthlyPaymentMonitoringChart() {
  const loadingDiv = document.getElementById("monthlyPaymentMonitoring-loading");
  if (loadingDiv) loadingDiv.style.display = "block";

  // Fetch payment data (simulate with random data for now)
  // Replace with your actual Firebase fetch logic
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const payments = months.map(() => Math.floor(Math.random() * 200000) + 50000);

  const ctx = document.getElementById('monthlyPaymentMonitoringChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Total Payments',
        data: payments,
        borderColor: '#2D5F4D',
        backgroundColor: 'rgba(45,95,77,0.08)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  if (loadingDiv) loadingDiv.style.display = "none";
}

// --- Monthly Payment Reports Chart ---
async function renderMonthlyPaymentReportsChart() {
  const loadingDiv = document.getElementById("monthlyPaymentReports-loading");
  if (loadingDiv) loadingDiv.style.display = "block";

  // Fetch payment breakdown data (simulate for now)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const reservationPayments = months.map(() => Math.floor(Math.random() * 50000) + 10000);
  const fullPayments = months.map(() => Math.floor(Math.random() * 150000) + 30000);

  const ctx = document.getElementById('monthlyPaymentReportsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Reservation Payments',
          data: reservationPayments,
          backgroundColor: '#b61718'
        },
        {
          label: 'Full Payments',
          data: fullPayments,
          backgroundColor: '#2D5F4D'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });

  if (loadingDiv) loadingDiv.style.display = "none";
}

// --- Loyal Users Chart ---
async function renderLoyalUsersChart() {
  const loadingDiv = document.getElementById("loyalUsersChart-loading");
  if (loadingDiv) loadingDiv.style.display = "block";

  // Fetch loyal user data (simulate for now)
  // Replace with actual logic: e.g., users with >X payments or reservations
  const labels = ["1-2 Payments", "3-5 Payments", "6+ Payments"];
  const data = [24, 12, 7];

  const ctx = document.getElementById('loyalUsersChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#b61718', '#2D5F4D', '#888']
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });

  if (loadingDiv) loadingDiv.style.display = "none";
}

// Modal open/close logic
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('view-all-payments-btn');
  const modal = document.getElementById('payments-modal');
  const close = document.getElementById('payments-modal-close');
  if (btn && modal && close) {
    btn.onclick = showAllPaymentsModal;
    close.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }
});

async function renderTopLoyalUsersTable() {
  const container = document.getElementById("topLoyalUsersPreview");
  container.innerHTML = '<div class="skeleton"></div>';

  // Fetch loyalty points and users
  const [loyaltySnap, usersSnap] = await Promise.all([
    get(ref(db, 'loyalty')),
    get(ref(db, 'users'))
  ]);
  const loyalty = loyaltySnap.exists() ? loyaltySnap.val() : {};
  const users = usersSnap.exists() ? usersSnap.val() : {};

  // Build array of users with points
  const usersWithPoints = Object.entries(loyalty)
    .map(([uid, data]) => ({
      name: `${users[uid]?.lastName || ''}, ${users[uid]?.firstName || ''}`,
      email: users[uid]?.email || '',
      points: Number(data.points) || 0
    }))
    .filter(u => u.points > 0);

  usersWithPoints.sort((a, b) => b.points - a.points);
  const top = usersWithPoints.slice(0, 5);

  container.innerHTML = top.length
    ? `<table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Loyalty Points</th>
          </tr>
        </thead>
        <tbody>
          ${top.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td style="color:#b61718;font-weight:700;">${u.points}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`
    : '<div>No loyal users found.</div>';
}

async function renderPaymentsPreview() {
  const container = document.getElementById("paymentsPreview");
  container.innerHTML = '<div class="skeleton"></div>';

  // Fetch all payments
  const paymentsSnap = await get(ref(db, 'payments/lots'));
  let payments = [];
  if (paymentsSnap.exists()) {
    paymentsSnap.forEach(userSnap => {
      userSnap.forEach(paymentSnap => {
        payments.push(paymentSnap.val());
      });
    });
  }
  payments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
  const preview = payments.slice(0, 5);

  container.innerHTML = preview.length
    ? `<table>
        <thead>
          <tr>
            <th>User</th>
            <th>Ref #</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${preview.map(p => `
            <tr>
              <td>${p.userName || 'Unknown'}</td>
              <td>${p.referenceNumber}</td>
              <td style="color:#2D5F4D;font-weight:600;">₱${Number(p.amount).toLocaleString()}</td>
              <td>${p.paymentMethod || ''}</td>
              <td>${p.paidAt ? new Date(p.paidAt).toLocaleString() : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`
    : '<div>No payments found.</div>';
}

let allPaymentsData = [];
async function showAllPaymentsModal() {
  const modal = document.getElementById('payments-modal');
  const modalList = document.getElementById('payments-modal-list');
  modalList.innerHTML = '<div class="skeleton"></div>';

  // Fetch all payments if not already loaded
  if (!allPaymentsData.length) {
    const paymentsSnap = await get(ref(db, 'payments/lots'));
    let payments = [];
    if (paymentsSnap.exists()) {
      paymentsSnap.forEach(userSnap => {
        userSnap.forEach(paymentSnap => {
          payments.push(paymentSnap.val());
        });
      });
    }
    payments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));
    allPaymentsData = payments;
  }

  renderPaymentsTable(allPaymentsData);

  // Filtering logic
  document.getElementById('payments-filter-user').oninput =
  document.getElementById('payments-filter-ref').oninput =
  document.getElementById('payments-filter-method').onchange = function() {
    const userVal = document.getElementById('payments-filter-user').value.toLowerCase();
    const refVal = document.getElementById('payments-filter-ref').value.toLowerCase();
    const methodVal = document.getElementById('payments-filter-method').value;

    const filtered = allPaymentsData.filter(p => {
      // User and Ref filtering
      const userMatch = !userVal || (p.userName || '').toLowerCase().includes(userVal);
      const refMatch = !refVal || (p.referenceNumber || '').toLowerCase().includes(refVal);

      // Payment Method/Status filtering
      let methodMatch = true;
      if (methodVal) {
        if (methodVal === "GCash") {
          methodMatch = (p.paymentMethod || '').toLowerCase() === "gcash";
        } else if (methodVal === "Debit Card") {
          methodMatch = (p.paymentMethod || '').toLowerCase() === "debitcard";
        } else if (methodVal === "Reservation") {
          methodMatch = (p.paymentMethod || '').toLowerCase() === "reservation";
        } else if (methodVal === "Refund") {
          methodMatch = (p.status || '').toLowerCase() === "refunded";
        } else if (methodVal === "Completed") {
          methodMatch = (p.status || '').toLowerCase() === "completed";
        } else if (methodVal === "Pending") {
          methodMatch = (p.status || '').toLowerCase() === "pending";
        } else {
          methodMatch = true;
        }
      }

      return userMatch && refMatch && methodMatch;
    });

    renderPaymentsTable(filtered);
  };

  modal.style.display = 'flex';
}

function renderPaymentsTable(payments) {
  const modalList = document.getElementById('payments-modal-list');
  modalList.innerHTML = payments.length
    ? `<table>
        <thead>
          <tr>
            <th>User</th>
            <th>Ref #</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${payments.map(p => {
            // Amount color
            const amountClass = Number(p.amount) < 0 ? 'amount-neg' : 'amount-pos';
            // Status color
            let statusClass = 'status-other';
            if ((p.status || '').toLowerCase() === 'completed') statusClass = 'status-completed';
            else if ((p.status || '').toLowerCase() === 'refunded') statusClass = 'status-refunded';
            else if ((p.status || '').toLowerCase() === 'pending') statusClass = 'status-pending';
            // Method badge
            let method = (p.paymentMethod || '').toLowerCase();
            let methodLabel = p.paymentMethod || '';
            let methodClass = 'method-badge';
            if (method === 'gcash') methodClass += ' gcash';
            else if (method === 'debitcard') methodClass += ' debitcard';
            else if (method === 'reservation') methodClass += ' reservation';
            else if (method === 'refund') methodClass += ' refund';

            return `
              <tr>
                <td>${p.userName || 'Unknown'}</td>
                <td>${p.referenceNumber}</td>
                <td class="${amountClass}">₱${Number(p.amount).toLocaleString()}</td>
                <td><span class="${methodClass}">${methodLabel}</span></td>
                <td>${p.paidAt ? new Date(p.paidAt).toLocaleString() : ''}</td>
                <td class="${statusClass}">${p.status || ''}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>`
    : '<div>No payments found.</div>';
}

// Modal open/close logic (already present)
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('view-all-payments-btn');
  const modal = document.getElementById('payments-modal');
  const close = document.getElementById('payments-modal-close');
  if (btn && modal && close) {
    btn.onclick = showAllPaymentsModal;
    close.onclick = () => { modal.style.display = 'none'; };
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };
  }
});

// --- End Dashboard Reports Section ---

// Add reset courier counter function
window.resetCourierCounter = async function() {
  try {
    await set(ref(db, 'system/courierAssignmentCounter'), { index: 0 });
    alert('Courier assignment counter reset to 0');
    // Refresh the courier management view
    manageOrderSelectedOpt('Courier Management');
  } catch (error) {
    console.error("Error resetting counter:", error);
    alert('Failed to reset counter: ' + error.message);
  }
};