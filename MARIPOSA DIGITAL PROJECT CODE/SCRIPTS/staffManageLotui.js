// Import Firebase SDKs
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

// Get uid from localStorage (still needed for logging actions)
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

// Function to update the dashboard data
async function toggleDashboard() {
    try {
        const lotsSnapshot = await get(ref(db, 'lots'));
        const lots = [];
        lotsSnapshot.forEach((childSnapshot) => {
            lots.push(childSnapshot.val());
        });

        // Debug: Log all lots and their statuses to see what we're working with
        console.log("All lots:", lots);
        lots.forEach(lot => {
            console.log(`Lot ${lot.lotNumber}: status = "${lot.status}"`);
        });

        // Filter lots by status (case-insensitive and handle variations)
        const availableLots = lots.filter(lot => 
            lot.status && lot.status.toLowerCase() === "available"
        );
        const reservedLots = lots.filter(lot => 
            lot.status && lot.status.toLowerCase() === "reserved"
        );
        const rentedLots = lots.filter(lot => 
            lot.status && lot.status.toLowerCase() === "rented"
        );

        console.log("Available lots:", availableLots.length);
        console.log("Reserved lots:", reservedLots.length);
        console.log("Rented lots:", rentedLots.length);

        // Update the dashboard with correct counts
        document.querySelector(".availableLotsStat-sec-bot > div > p").textContent = availableLots.length;
        document.querySelector(".reservedLotsStat-sec-bot > div > p").textContent = reservedLots.length;
        document.querySelector(".rentedLotsStat-sec-bot > div > p").textContent = rentedLots.length;
    } catch (error) {
        console.error("Error updating dashboard:", error);
    }
}

// Function to add a Lot
async function addLot() {
    const lotName = document.querySelector(".lotNumber").value.trim();
    const lotDescription = document.querySelector(".lotDescription").value.trim();
    const lotSize = parseFloat(document.querySelector(".lotSize").value);
    const lotMonthlyRent = document.querySelector(".lotPrice").value.trim();
    const lotImages = document.querySelector(".lotImages").value.trim();
    let lotStatus = document.querySelector(".lotStatus").value;

    // Only require Lot Number and Lot Size
    if (!lotName || isNaN(lotSize)) {
        alert("Please enter at least the Lot Number and Lot Size.");
        return;
    }

    // Default status to 'Available' if not set
    if (!lotStatus) lotStatus = "Available";

    try {
        // Check if lot number already exists
        let isLotFound = false;
        const lotsSnapshot = await get(ref(db, 'lots'));
        lotsSnapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().lotNumber === lotName) {
                isLotFound = true;
            }
        });

        if (isLotFound) {
            alert("Lot number already exists.");
            return;
        }

        // Use correct property names for saving
        const newLot = {
            lotNumber: lotName,
            lotPrice: lotMonthlyRent ? `₱${lotMonthlyRent}` : "",
            lotDescription: lotDescription || "",
            lotSize: lotSize,
            lotStatus: lotStatus,
            lotOwner: "",
            contractDuration: "",
            lotImages: lotImages || ""
        };

        await push(ref(db, 'lots'), newLot);
        
        // Log the action with staff information
        await push(ref(db, 'logs/lots'), {
            action: `Lot ${lotName} added by staff member ${user.firstName} ${user.lastName}`,
            date: new Date().toUTCString(),
            by: uid,
            staffName: `${user.firstName} ${user.lastName}`,
            staffId: uid
        });

        alert("New Lot has been added.");
        
        // Clear the form fields after successful submission
        clearAddLotForm();
        
        await toggleDashboard();
    } catch (error) {
        console.error("Error adding lot:", error);
        alert("Failed to add lot: " + error.message);
    }
}

// Function to clear the add lot form
function clearAddLotForm() {
    const lotNumberField = document.querySelector(".lotNumber");
    const lotDescriptionField = document.querySelector(".lotDescription");
    const lotSizeField = document.querySelector(".lotSize");
    const lotPriceField = document.querySelector(".lotPrice");
    const lotImagesField = document.querySelector(".lotImages");
    const lotStatusField = document.querySelector(".lotStatus");

    if (lotNumberField) lotNumberField.value = "";
    if (lotDescriptionField) lotDescriptionField.value = "";
    if (lotSizeField) lotSizeField.value = "";
    if (lotPriceField) lotPriceField.value = "";
    if (lotImagesField) lotImagesField.value = "";
    if (lotStatusField) lotStatusField.value = "available";
}

// Function to Remove Lot
async function removeLot() {
    const lotNumberInput = document.querySelector(".lotnumber").value.trim();

    if (!lotNumberInput) {
        alert("Please enter a valid lot number.");
        return;
    }

    try {
        let lotKey = null;
        const lotsSnapshot = await get(ref(db, 'lots'));
        lotsSnapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().lotNumber === lotNumberInput) {
                lotKey = childSnapshot.key;
            }
        });

        if (!lotKey) {
            alert("Lot not found. Please enter a valid lot number.");
            return;
        }

        await remove(ref(db, 'lots/' + lotKey));
        
        // Log the action with staff information
        await push(ref(db, 'logs/lots'), {
            action: `Lot ${lotNumberInput} removed by staff member ${user.firstName} ${user.lastName}`,
            date: new Date().toUTCString(),
            by: uid,
            staffName: `${user.firstName} ${user.lastName}`,
            staffId: uid
        });

        alert(`Lot ${lotNumberInput} has been removed.`);
        await toggleDashboard();
    } catch (error) {
        console.error("Error removing lot:", error);
        alert("Failed to remove lot: " + error.message);
    }
}

// Function to render Add Lot UI
function addLotui() {
    const lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot');
    const rightSec = document.querySelector('.MainSection-Content-right-sec');

    lotManagementBoxSecBot.innerHTML = `
        <button class="addLotBtn" onclick="addLotui()">Add Lot</button>
        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
        <button class="back" onclick="backToDashBoard()">Back</button>
    `;

    rightSec.innerHTML = `
        <div class="addLotBox">
            <div class="addLotBox-sec-top">
                <h1>Add Lot</h1>
                <button class="addLotBox-header-btn" onclick="addLot()">Confirm ADD LOT</button>
            </div>
            <div class="addLotBox-sec-bot addLotBox-cols">
                <div class="addLotCol">
                    <label for="lotNumber">Lot Number:</label>
                    <input type="text" id="lotNumber" class="lotNumber" value="">
                    <label for="lotSize">Lot Size (sqm):</label>
                    <input type="number" id="lotSize" class="lotSize" value="">
                    <label for="lotImages">Lot Images (URL or text):</label>
                    <input type="text" id="lotImages" class="lotImages" value="">
                </div>
                <div class="addLotCol">
                    <label for="lotDescription">Description:</label>
                    <input type="text" id="lotDescription" class="lotDescription" value="">
                    <label for="lotPrice">Lot Price (₱):</label>
                    <input type="text" id="lotPrice" class="lotPrice" value="">
                    <label for="lotStatus">Lot Status:</label>
                    <select id="lotStatus" class="lotStatus">
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="rented">Rented</option>
                    </select>
                </div>
            </div>
        </div>
    `;
    
    // Ensure form is cleared when UI is loaded
    setTimeout(() => {
        clearAddLotForm();
    }, 100);
}

// Function to render Remove Lot UI
function removeLotui() {
    const lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot');
    const rightSec = document.querySelector('.MainSection-Content-right-sec');

    lotManagementBoxSecBot.innerHTML = `
        <button class="addLotBtn" onclick="addLotui()">Add Lot</button>
        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
        <button class="back" onclick="backToDashBoard()">Back</button>
    `;

    rightSec.innerHTML = `
        <div class="removeLotBox">
            <div class="removeLotBox-sec-top">
                <h1>Removing Lot</h1>
            </div>
            <div class="removeLotBox-sec-bot">
                <label for="lotnumber">Lot Number:</label>
                <input type="text" id="lotnumber" class="lotnumber">
            </div>
            <footer class="removeLotBox-sec-footer">
                <button onclick="removeLot()">Confirm Remove LOT</button>
            </footer>
        </div>
    `;
}

// Function to render Dashboard UI
function backToDashBoard() {
    const lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot');
    const rightSec = document.querySelector('.MainSection-Content-right-sec');

    lotManagementBoxSecBot.innerHTML = `
        <button class="addLotBtn" onclick="addLotui()">Add Lot</button>
        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
    `;

    rightSec.innerHTML = `
        <div class="right-sec-topContent">
            <div class="availableLotsStat-container">
                <div class="availableLotsStat-sec-top">
                    <h1>Available Lots</h1>
                </div>
                <div class="availableLotsStat-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Number of Lots:</h1><p class="stat">0</p></div>
                </div>
            </div>

            <div class="reservedLotsStat-container">
                <div class="reservedLotsStat-sec-top">
                    <h1>Reserved Lots</h1>
                </div>
                <div class="reservedLotsStat-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Number of Lots:</h1><p class="stat">0</p></div>
                </div>
            </div>
        </div>

        <div class="right-sec-botContent">
            <div class="rentedLotsStat-container">
                <div class="rentedLotsStat-sec-top">
                    <h1>Rented Lots</h1>
                </div>
                <div class="rentedLotsStat-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Number of Lots:</h1><p class="stat">0</p></div>
                </div>
            </div>
        </div>
    `;

    // Refresh dashboard data
    toggleDashboard();
}

// Make functions globally available for onclick handlers
window.addLot = addLot;
window.removeLot = removeLot;
window.addLotui = addLotui;
window.removeLotui = removeLotui;
window.backToDashBoard = backToDashBoard;
window.clearAddLotForm = clearAddLotForm;

// Initialize dashboard on page load
toggleDashboard();

// Set staff username in navbar
if (user && user.username && document.querySelector('.userName')) {
  document.querySelector('.userName').textContent = user.username;
}