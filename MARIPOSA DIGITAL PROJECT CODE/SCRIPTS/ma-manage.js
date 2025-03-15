// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getDatabase} from "firebase/database";
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
} else if (user.accessLevel !== 'admin') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}

document.querySelector('.nav-user-container div').textContent = `${user.lastName}, ${user.firstName}`;

const manageLotSelectedOpt = (selected) => {
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
    interfaceElement.innerHTML = `
    <div class="view-lots">
      <div class="view-lots-container">
        <h2 class="view-lots-container-header">Lot 1</h2>
        <div class="view-lots-container-info">
          <div class="view-lots-container-info-left">
            <div class="view-lots-container-info-left-description">Description</div>
            <button class="view-lots-container-info-left-button">Edit Lot</button>
          </div>
          <div>
            <img src="" alt="lot1">  
          </div>
        </div>
      </div>
      <div class="view-lots-container">
        <h2 class="view-lots-container-header">Lot 2</h2>
        <div class="view-lots-container-info">
          <div class="view-lots-container-info-left">
            <div class="view-lots-container-info-left-description">Description</div>
            <button class="view-lots-container-info-left-button">Edit Lot</button>
          </div>
          <div>
            <img src="" alt="lot1">  
          </div>
        </div>
      </div>
      <div class="view-lots-container">
        <h2 class="view-lots-container-header">Lot 3</h2>
        <div class="view-lots-container-info">
          <div class="view-lots-container-info-left">
            <div class="view-lots-container-info-left-description">Description</div>
            <button class="view-lots-container-info-left-button">Edit Lot</button>
          </div>
          <div>
            <img src="" alt="lot1">  
          </div>
        </div>
      </div>
      <div class="view-lots-container">
        <h2 class="view-lots-container-header">Lot 4</h2>
        <div class="view-lots-container-info">
          <div class="view-lots-container-info-left">
            <div class="view-lots-container-info-left-description">Description</div>
            <button class="view-lots-container-info-left-button">Edit Lot</button>
          </div>
          <div>
            <img src="" alt="lot1">  
          </div>
        </div>
      </div>
    </div>`;
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
            <button>Add Lot</button>
          </div>
        </div>
      </div>
    </div> 
    `
  } else if (selected === 'Remove Lot') {
    interfaceElement.innerHTML = `
    <div class="remove-lot">
      <h2>Removing Lot</h2>
      <div class="remove-lot-form-group">
        <label for="lot-number">Lot Number: </label>
        <input type="text" id="lot-number" class="remove-lot-form-control">
      </div>
      <button class="remove-lot-button">Remove Lot</button>
    </div>
    `
  } else if (selected === 'Lot Reservation') {
    interfaceElement.innerHTML = `
      <div class="lot-reservation">
        <div class="lot-reservation-container">
          <div class="lot-reservation-container-header">List of Cancel Request</div>
          <div class="lot-reservation-container-box-layout">
            <div class="lot-reservation-container-box">
              <div class="lot-reservation-container-box-img">
                <img src="" alt="lot">
              </div>
              <div>Lot Number: <span>1</span></div>
              <div>Reason: <span>N/A</span></div>
              <div>Name: <span>John Doe</span></div>
              <div>Contact: <span>123-456-7890</span></div>
              <button>Accept Cancel Request</button>
            </div>
            <div class="lot-reservation-container-box">
              <div class="lot-reservation-container-box-img">
                <img src="" alt="lot">
              </div>
              <div>Lot Number: <span>1</span></div>
              <div>Reason: <span>N/A</span></div>
              <div>Name: <span>John Doe</span></div>
              <div>Contact: <span>123-456-7890</span></div>
              <button>Accept Cancel Request</button>
            </div>
            <div class="lot-reservation-container-box">
              <div class="lot-reservation-container-box-img">
                <img src="" alt="lot">
              </div>
              <div>Lot Number: <span>1</span></div>
              <div>Reason: <span>N/A</span></div>
              <div>Name: <span>John Doe</span></div>
              <div>Contact: <span>123-456-7890</span></div>
              <button>Accept Cancel Request</button>
            </div>
            <div class="lot-reservation-container-box">
              <div class="lot-reservation-container-box-img">
                <img src="" alt="lot">
              </div>
              <div>Lot Number: <span>1</span></div>
              <div>Reason: <span>N/A</span></div>
              <div>Name: <span>John Doe</span></div>
              <div>Contact: <span>123-456-7890</span></div>
              <button>Accept Cancel Request</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (selected === 'Contract Schedule') {
    interfaceElement.innerHTML = `
      <div class="contract-schedule">
        <div class="contract-schedule-layout">
          <div class="contract-schedule-layout-header">Lot Contract Signing Dates</div>
          <div class="contract-schedule-layout-box-container">
            <div class="contract-schedule-layout-box">
              <h2>Lot 1</h2>
              <div class="contract-schedule-layout-box-info">
                <div class="contract-schedule-layout-box-info-left">
                  <div>Date Req: <span>1/24/2025</span></div>
                  <button>Confirm Schedule</button>
                  <button>Cancel Schedule</button>
                </div>
                <div>
                  <img src="" alt="lot">
                </div>
              </div>
            </div>
            <div class="contract-schedule-layout-box">
              <h2>Lot 1</h2>
              <div class="contract-schedule-layout-box-info">
                <div class="contract-schedule-layout-box-info-left">
                  <div>Date Req: <span>1/24/2025</span></div>
                  <button>Confirm Schedule</button>
                  <button>Cancel Schedule</button>
                </div>
                <div>
                  <img src="" alt="lot">
                </div>
              </div>
            </div>
            <div class="contract-schedule-layout-box">
              <h2>Lot 1</h2>
              <div class="contract-schedule-layout-box-info">
                <div class="contract-schedule-layout-box-info-left">
                  <div>Date Req: <span>1/24/2025</span></div>
                  <button>Confirm Schedule</button>
                  <button>Cancel Schedule</button>
                </div>
                <div>
                  <img src="" alt="lot">
                </div>
              </div>
            </div>
            <div class="contract-schedule-layout-box">
              <h2>Lot 1</h2>
              <div class="contract-schedule-layout-box-info">
                <div class="contract-schedule-layout-box-info-left">
                  <div>Date Req: <span>1/24/2025</span></div>
                  <button>Confirm Schedule</button>
                  <button>Cancel Schedule</button>
                </div>
                <div>
                  <img src="" alt="lot">
                </div>
              </div>
            </div>  
          </div>
        </div>
      </div>
    `
  } else if (selected === 'Logs') {
    interfaceElement.innerHTML = `
      <div class="lot-logs">
        <div class="lot-logs-header">
          <label for="log-date">Filter by Date:</label>
          <input id="log-date" type="date">
          <button onclick="downloadLogs()">Download Logs</button>
        </div>
        <div class="lot-logs-content">
          <div class="log-entry">
            <p><strong>Lot Log ID: </strong><span>N/A</span></p>
            <p><strong>Date:</strong> 2025-03-14</p>
            <p><strong>Action:</strong> Lot 1 added</p>
            <p><strong>User:</strong> John Doe</p>
          </div>
          <div class="log-entry">
            <p><strong>Lot Log ID: </strong><span>N/A</span></p>
            <p><strong>Date:</strong> 2025-03-13</p>
            <p><strong>Action:</strong> Lot 2 removed</p>
            <p><strong>User:</strong> Jane Smith</p>
          </div>
          <!-- Add more log entries as needed -->
        </div>
      </div>
    `
  }
}

const manageProductSelectedOpt = (selected) => {
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
    interfaceElement.innerHTML = `
      <div class="view-products">
        <div class="view-products-container">
          <h2 class="view-products-container-header">Rice 1</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <button class="view-products-container-info-left-description">Edit Description</button>
              <button class="view-products-container-info-left-button">Remove Product</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Rice 2</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <button class="view-products-container-info-left-description">Edit Description</button>
              <button class="view-products-container-info-left-button">Remove Product</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Rice 3</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <button class="view-products-container-info-left-description">Edit Description</button>
              <button class="view-products-container-info-left-button">Remove Product</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Rice 4</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <button class="view-products-container-info-left-description">Edit Description</button>
              <button class="view-products-container-info-left-button">Remove Product</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
      </div>
    `
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
          <label for="product-img">Product IMG</label>
          <input id="product-img" type="file">
          <button>Add Product</button>
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
        <button class="remove-product-button">Remove Product</button>
      </div>
    `
  } else if (selected === 'Logs') {
    interfaceElement.innerHTML = `
      <div class="product-logs">
        <button>Download Logs</button>
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
    interfaceElement.innerHTML = `
      <div class="view-orders">
        <div class="view-orders-container">
          <h2 class="view-orders-container-header">Order Name</h2>
          <div class="view-orders-container-info">
            <div class="view-orders-container-info-left">
              <div class="view-orders-container-info-left-description">Description</div>
              <button class="view-orders-container-info-left-button">Order Status</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Order Name</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <div class="view-products-container-info-left-description">Description</div>
              <button class="view-products-container-info-left-button">Order Status</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Order Name</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <div class="view-products-container-info-left-description">Description</div>
              <button class="view-products-container-info-left-button">Order Status</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Order Name</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <div class="view-products-container-info-left-description">Description</div>
              <button class="view-products-container-info-left-button">Order Status</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
      </div>
    `
  } else if (selected === 'Update Order') {
    interfaceElement.innerHTML = `
      <div class="update-order"> 
        <div>
          <label for="order-id">Order ID: </label>
          <input id="order-id" type="text" placeholder="Search Order">  
        </div>
        <div>
          <label for="order-status">Order Status: </label>
          <select id="order-status" name="Search Order">
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipping">Shipping</option>
            <option value="Delivered">Delivered</option>
          </select>  
        </div>
        <button>Cancel Order</button>
      </div>
    `
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
    interfaceElement.innerHTML = `
    <div class="remove-order">
      <div class="remove-order-search">
        <input type="text" placeholder="Search Order ID">
        <button>Search</button>  
      </div>
      
      <div class="remove-order-container">
        <div>
          Order ID: <span>N/A</span>
        </div>
        <div>
          Type: <span>N/A</span>
        </div>
        <div>
          Date: <span>N/A</span>
        </div>
        <button>Remove</button>
      </div>
      <div class="remove-order-container">
        <div>
          Order ID: <span>N/A</span>
        </div>
        <div>
          Type: <span>N/A</span>
        </div>
        <div>
          Date: <span>N/A</span>
        </div>
        <button>Remove</button>
      </div>
    </div>
  `
  } else if (selected === 'Logs') {
    interfaceElement.innerHTML = `
      <div class="order-logs">
        <div class="order-logs-header">
          <label for="log-date">Filter by Date:</label>
          <input id="log-date" type="date">
          <button onclick="downloadOrderLogs()">Download Logs</button>
        </div>
        <div class="order-logs-content">
          <div class="log-entry">
            <p><strong>Date:</strong> 2025-03-14</p>
            <p><strong>Action:</strong> Order 1 added</p>
            <p><strong>User:</strong> John Doe</p>
          </div>
          <div class="log-entry">
            <p><strong>Date:</strong> 2025-03-13</p>
            <p><strong>Action:</strong> Order 2 removed</p>
            <p><strong>User:</strong> Jane Smith</p>
          </div>
          <!-- Add more log entries as needed -->
        </div>
      </div>
    `
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
    interfaceElement.innerHTML = `
      <div class="view-users">
        <div class="view-users-search">
          <input type="text" placeholder="Search for users...">
          <button>Search</button>
        </div>
        <div class="user-card">
          <div class="user-info">
            <h3>John Doe</h3>
            <p>Email: john.doe@example.com</p>
            <p>Role: Admin</p>
            <p>User ID: <span>N/A</span></p>
          </div>
          <div class="user-actions">
            <button onclick="">Edit</button>
            <button>Remove</button>
          </div>
        </div>
        <div class="user-card">
          <div class="user-info">
            <h3>Jane Smith</h3>
            <p>Email: jane.smith@example.com</p>
            <p>Role: User</p>
            <p>User ID: <span>N/A</span></p>
          </div>
          <div class="user-actions">
            <button>Edit</button>
            <button>Remove</button>
          </div>
        </div>
        <!-- TBC -->
      </div>
    `
  } else if (selected === 'Add User') {
    interfaceElement.innerHTML = `
      <div class="add-user">
        <h2>Add User</h2>
        <form id="add-user-form">
          <div>Account ID: <span>N/A</span></div>
          <div class="add-user-form-group">
            <label for="user-name">User Name:</label>
            <input id="user-name" type="text" placeholder="Enter user name">
          </div>
          <div class="add-user-form-group">
            <label for="user-email">Email:</label>
            <input id="user-email" type="email" placeholder="Enter user email">
          </div>
          <div class="add-user-form-group">
            <label for="user-role">Role:</label>
            <select id="user-role">
              <option value="Admin">Admin</option>
              <option value="User">Staff</option>
              <option value="User">Courier</option>
              <option value="User">User</option>
            </select>
          </div>
          <button type="submit">Add User</button>
        </form>
      </div>
    `
  } else if (selected === 'Remove User') {
    interfaceElement.innerHTML = `
      <div class="remove-user">
        <h2>Remove User</h2>
        <form id="remove-user-form">
          <div class="remove-user-form-group">
            <label for="user-id">User ID:</label>
            <input id="user-id" type="text" placeholder="Enter user ID">
          </div>
          <button type="submit">Remove User</button>
        </form>
      </div>
    `
  } else if (selected === 'Edit User') {
    interfaceElement.innerHTML = `
      <div class="edit-user">
        <h2>Edit User</h2>
        <form id="edit-user-form">
          <div class="edit-user-form-group">
            <label for="edit-user-id">User ID:</label>
            <input id="edit-user-id" type="text" placeholder="Existing user">
          </div>
          <div class="edit-user-form-group">
            <label for="edit-user-name">User Name:</label>
            <input id="edit-user-name" type="text" placeholder="Enter user name">
          </div>
          <div class="edit-user-form-group">
            <label for="edit-user-email">Email:</label>
            <input id="edit-user-email" type="email" placeholder="Enter user email">
          </div>
          <div class="edit-user-form-group">
            <label for="edit-user-role">Role:</label>
            <select id="edit-user-role">
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Courier">Courier</option>
              <option value="User">User</option>
            </select>
          </div>
          <button type="submit">Edit User</button>
        </form>
      </div>
    `
  } else if (selected === 'Logs') {
    interfaceElement.innerHTML = `
      <div class="account-logs">
        <div class="account-logs-header">
          <label for="log-date">Filter by Date:</label>
          <input id="log-date" type="date">
          <button onclick="downloadAccountLogs()">Download Logs</button>
        </div>
        <div class="account-logs-content">
          <div class="account-logs-log-entry">
            <p><strong>Date:</strong> 2025-03-14</p>
            <p><strong>Action:</strong> User John Doe added</p>
            <p><strong>User:</strong> Admin</p>
          </div>
          <div class="account-logs-log-entry">
            <p><strong>Date:</strong> 2025-03-13</p>
            <p><strong>Action:</strong> User Jane Smith removed</p>
            <p><strong>User:</strong> Admin</p>
          </div>
          <!-- Add more log entries as needed -->
        </div>
      </div>
    `
  }
}

window.manageLotSelectedOpt = manageLotSelectedOpt;
window.manageProductSelectedOpt = manageProductSelectedOpt;
window.manageOrderSelectedOpt = manageOrderSelectedOpt;
window.manageAccountsSelectedOpt = manageAccountsSelectedOpt;