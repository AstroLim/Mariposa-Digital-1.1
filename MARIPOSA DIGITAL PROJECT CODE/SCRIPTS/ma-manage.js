// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateEmail, updatePassword, deleteUser} from "firebase/auth";
import { getDatabase, onValue, ref, set, update, get, child, push} from "firebase/database";
import jsPDF from "jspdf";
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
    let viewUsersDisplay = '';

    onValue(ref(db, 'users'), (snapshot) => {
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
              <button onclick="">Edit</button>
              <button>Remove</button>
            </div>
          </div>
        `
        });
        interfaceElement.innerHTML = `
          <div class="view-users">
            <div class="view-users-search">
              <input type="text" placeholder="Search for users...">
              <button>Search</button>
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
        <form id="edit-user-form">
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
          <button onClick="addUser(event); event.preventDefault();">Add User</button>
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
          <button onClick="removeUser(event); event.preventDefault();" type="submit">Remove User</button>
        </form>
      </div>
    `
  } else if (selected === 'Edit User') {
    interfaceElement.innerHTML = `
      <div class="edit-user">
        <h2>Edit User</h2>
        <form id="edit-user-form">
          <div class="edit-user-form-group">
            <label for="user-uid">User ID:</label>
            <input id="user-uid" type="text" placeholder="Enter user name">
            <button onclick="event.preventDefault(); loadUser();" class="load-user">Load User</button>
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
          <button id="edit-user-button" onClick="editUser(event); event.preventDefault();">Edit User</button>
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
    document.getElementById('edit-pass').disabled = true;

  } else if (selected === 'Logs') {

    let logHTML;

    onValue(ref(db, 'logs/users'), (snapshot) => {
      snapshot.forEach(logs => {
        const log = logs.val();
        logHTML += `
          <div class="account-logs-log-entry">
            <p><strong>Date:</strong> ${log.date}</p>
            <p><strong>Action:</strong> ${log.action}</p>
            <p><strong>User:</strong> ${log.userID}</p>
            <p><strong>By UserID:</strong>${log.by}</p>
          </div>
        `
      })
      interfaceElement.innerHTML = `
      <div class="account-logs">
        <div class="account-logs-header">
          <label for="log-date">Filter by Date:</label>
          <input id="log-date" type="date">
          <button onclick="downloadAccountLogs(event); event.preventDefault();">Download Logs</button>
        </div>
        ${logHTML}
        </div>
      </div>
    `
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

const loadUser = async () => {
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
  event.preventDefault();
  const logsRef = ref(db, 'logs/users');
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
  const downloadDate = now.toLocaleDateString();

  // Add a title
  doc.setFontSize(18);
  doc.text(`Account Logs - ${month} ${year}`, 105, 10, null, null, 'center');

  // Add a horizontal line
  doc.setLineWidth(0.5);
  doc.line(10, 15, 200, 15);

  // Set font size for the logs
  doc.setFontSize(12);

  let y = 20; // Starting y position for the text
  Object.entries(logs).forEach(([key, log]) => {
    doc.text(`Date: ${new Date(log.date).toLocaleString()}`, 10, y);
    y += 10;
    doc.text(`Action: ${log.action}`, 10, y);
    y += 10;
    doc.text(`User: ${log.userID}`, 10, y);
    y += 10;
    doc.text(`By UserID: ${log.by}`, 10, y);
    y += 20; // Add extra space between logs

    // Add a horizontal line between logs
    doc.line(10, y - 10, 200, y - 10);
  });

  doc.save(`account_logs(${month} ${year}).pdf`);
};

window.downloadAccountLogs = downloadAccountLogs;
window.addUser = addUser;
window.editUser = editUser;
window.loadUser = loadUser;
window.removeUser = removeUser;