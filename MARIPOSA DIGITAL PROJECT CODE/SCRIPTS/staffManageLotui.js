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

        const reservedLots = lots.filter(lot => lot.status === "Reserved");
        // Assuming rented lots are tracked in a separate path; adjust as needed
        const rentedLotsSnapshot = await get(ref(db, 'rentedLots')); // Update path if different
        const rentedLots = [];
        if (rentedLotsSnapshot.exists()) {
            rentedLotsSnapshot.forEach((childSnapshot) => {
                rentedLots.push(childSnapshot.val());
            });
        }

        document.querySelector(".availableLotsStat-sec-bot > div > p").textContent = lots.length;
        document.querySelector(".reservedLotsStat-sec-bot > div > p").textContent = reservedLots.length;
        document.querySelector(".rentedLotsStat-sec-bot > div > p").textContent = rentedLots.length || "0";
    } catch (error) {
        console.error("Error updating dashboard:", error);
        alert("Failed to load dashboard data.");
    }
}

// Function to add a Lot
async function addLot() {
    const lotName = document.querySelector(".lotNumber").value.trim();
    const lotDescription = document.querySelector(".lotDescription").value.trim();
    const lotSize = parseFloat(document.querySelector(".lotSize").value);
    const lotMonthlyRent = document.querySelector(".lotPrice").value.trim();

    if (!lotName || !lotDescription || isNaN(lotMonthlyRent) || isNaN(lotSize)) {
        alert("Please fill in all product details correctly.");
        return;
    }

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

        const newLot = {
            lotNumber: lotName,
            name: `Lot ${lotName}`,
            price: `₱${lotMonthlyRent}/month`,
            description: lotDescription,
            size: lotSize,
            status: "Available",
            lotOwner: "",
            contractDuration: "",
            lotImages: "" // Placeholder for image URL
        };

        await push(ref(db, 'lots'), newLot);
        await push(ref(db, 'logs/lots'), {
            action: `Lot ${lotName} added`,
            date: new Date().toUTCString(),
            by: uid
        });

        alert("New Lot has been added.");
        await toggleDashboard();
    } catch (error) {
        console.error("Error adding lot:", error);
        alert("Failed to add lot: " + error.message);
    }
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
        await push(ref(db, 'logs/lots'), {
            action: `Lot ${lotNumberInput} removed`,
            date: new Date().toUTCString(),
            by: uid
        });

        alert(`Lot ${lotNumberInput} has been removed.`);
        await toggleDashboard();
    } catch (error) {
        console.error("Error removing lot:", error);
        alert("Failed to remove lot: " + error.message);
    }
}

// Function to Manage Contract Schedule UI
async function manageContractScheduleui() {
    const lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot');
    const rightSec = document.querySelector('.MainSection-Content-right-sec');

    lotManagementBoxSecBot.innerHTML = `
        <button class="addLotBtn" onclick="addLotui()">Add Lot</button>
        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
        <button class="back" onclick="backToDashBoard()">Back</button>
    `;

    try {
        const contractSnapshot = await get(ref(db, 'contractSigningDates')); // Adjust path if different
        const listOfContractSigningDates = [];
        contractSnapshot.forEach((childSnapshot) => {
            listOfContractSigningDates.push({ key: childSnapshot.key, ...childSnapshot.val() });
        });

        let contractScheduleHtml = `
            <div class="manageContractScheduleBox"> 
                <div class="manageContractScheduleBox-sec-top">
                    <h1>Lot Contract Signing Dates</h1>
                </div>
                <div class="manageContractScheduleBox-sec-bot">
        `;

        listOfContractSigningDates.forEach((contract, index) => {
            contractScheduleHtml += `
                <div class="contractLotInfoBox">
                    <header><h1>${contract.lotName}</h1></header>
                    <main>
                        <div class="main-contractLotInfoBox-leftSec">
                            <div><p>Lot Number: ${contract.lotName}</p></div>
                            <div><p>User: ${contract.user || "N/A"}</p></div>
                            <div><p>Date: ${contract.scheduleDate}</p></div>
                            <button class="confirmSchedule" data-key="${contract.key}">Confirm Schedule</button>
                            <button class="cancelSchedule" data-key="${contract.key}">Cancel Schedule</button>
                        </div>
                        <div class="main-contractLotInfoBox-rightSec">
                            <img src="${contract.lotImage || ''}" class="lotImg" alt="img of Lot">
                        </div>
                    </main>
                </div>
            `;
        });

        contractScheduleHtml += `</div></div>`;
        rightSec.innerHTML = contractScheduleHtml;

        // Add event listeners for confirm and cancel schedule buttons
        document.querySelectorAll(".cancelSchedule").forEach(button => {
            button.addEventListener("click", async (event) => {
                const key = event.target.dataset.key;
                try {
                    await remove(ref(db, `contractSigningDates/${key}`));
                    await push(ref(db, 'logs/contracts'), {
                        action: `Contract schedule for lot ${key} cancelled`,
                        date: new Date().toUTCString(),
                        by: uid
                    });
                    await manageContractScheduleui(); // Re-render UI
                } catch (error) {
                    alert("Failed to cancel schedule: " + error.message);
                }
            });
        });

        document.querySelectorAll(".confirmSchedule").forEach(button => {
            button.addEventListener("click", async (event) => {
                const key = event.target.dataset.key;
                try {
                    await update(ref(db, `contractSigningDates/${key}`), { confirmed: true });
                    await push(ref(db, 'logs/contracts'), {
                        action: `Contract schedule for lot ${key} confirmed`,
                        date: new Date().toUTCString(),
                        by: uid
                    });
                    await manageContractScheduleui(); // Re-render UI
                } catch (error) {
                    alert("Failed to confirm schedule: " + error.message);
                }
            });
        });
    } catch (error) {
        console.error("Error loading contract schedules:", error);
        alert("Failed to load contract schedules.");
        rightSec.innerHTML = `<div class="manageContractScheduleBox"><p>No schedules available.</p></div>`;
    }
}

// Function to render Add Lot UI
function addLotui() {
    const lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot');
    const rightSec = document.querySelector('.MainSection-Content-right-sec');

    lotManagementBoxSecBot.innerHTML = `
        <button class="addLotBtn" onclick="addLotui()">Add Lot</button>
        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
        <button class="back" onclick="backToDashBoard()">Back</button>
    `;

    rightSec.innerHTML = `
        <div class="addLotBox">
            <div class="addLotBox-sec-top">
                <h1>Add Lot</h1>
            </div>
            <div class="addLotBox-sec-bot">
                <div class="sec-bot-leftSec">
                    <label for="lotNumber">Lot Number:</label>
                    <label for="lotDescription">Description:</label>
                    <label for="lotSize">Lot Size:</label>
                    <label for="lotPrice">Lot Price:</label>
                    <label for="lotImages">Lot Images</label>
                </div>
                <div class="sec-bot-rightSec">
                    <input type="text" id="lotNumber" class="lotNumber">
                    <input type="text" id="lotDescription" class="lotDescription">
                    <input type="text" id="lotSize" class="lotSize">
                    <input type="number" id="lotPrice" class="lotPrice">
                    <input type="text" id="lotImages" class="lotImages">
                </div>
            </div>
            <footer class="addLotBox-sec-footer">
                <button onclick="addLot()">Confirm ADD LOT</button>
            </footer>
        </div>
    `;
}

// Function to render Remove Lot UI
function removeLotui() {
    const lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot');
    const rightSec = document.querySelector('.MainSection-Content-right-sec');

    lotManagementBoxSecBot.innerHTML = `
        <button class="addLotBtn" onclick="addLotui()">Add Lot</button>
        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
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
        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
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
                    <div class="statContainer"><h1 class="statLabel">Number of Reserved Lots:</h1><p class="stat">0</p></div>
                </div>
            </div>
            <div class="rentedLotsStat-container">
                <div class="rentedLotsStat-sec-top">
                    <h1>Rented Lots</h1>
                </div>
                <div class="rentedLotsStat-sec-bot">
                    <div class="statContainer"><h1 class="statLabel">Number of Rented Lots:</h1><p class="stat">0</p></div>
                </div>
            </div>
        </div>
    `;

    // Refresh dashboard data
    toggleDashboard();
}

// Export functions to be available globally
window.addLot = addLot;
window.removeLot = removeLot;
window.manageContractScheduleui = manageContractScheduleui;
window.addLotui = addLotui;
window.removeLotui = removeLotui;
window.backToDashBoard = backToDashBoard;

// Initialize dashboard on page load
toggleDashboard();