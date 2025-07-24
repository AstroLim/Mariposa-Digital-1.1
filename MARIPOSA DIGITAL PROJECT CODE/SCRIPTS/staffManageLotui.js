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

// User display
if (user && document.querySelector(".userName")) {
    document.querySelector(".userName").textContent = user.username || "";
}

// Sidebar navigation
const sidebarOptions = document.querySelectorAll(".sidebar-option");
const mainHeaderTitle = document.getElementById("main-header-title");
const mainContentSection = document.getElementById("main-content-section");

// Initial load
window.addEventListener("DOMContentLoaded", () => {
    loadViewLots();
});

// Sidebar click events
sidebarOptions.forEach(btn => {
    btn.addEventListener("click", () => {
        sidebarOptions.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const option = btn.getAttribute("data-option");
        if (option === "view") {
            mainHeaderTitle.textContent = "View Lots";
            loadViewLots();
        } else if (option === "add") {
            mainHeaderTitle.textContent = "Add Lot";
            loadAddLot();
        } else if (option === "edit") {
            mainHeaderTitle.textContent = "Edit Lot";
            loadEditLot();
        } else if (option === "remove") {
            mainHeaderTitle.textContent = "Remove Lot";
            loadRemoveLot();
        }
    });
});

// View Lots
function loadViewLots() {
    mainContentSection.innerHTML = `
        <div class="dashboard-stats">
            <div class="stat-card">
                <h3>Available Lots</h3>
                <div class="stat-number" id="available-count">0</div>
            </div>
            <div class="stat-card">
                <h3>Reserved Lots</h3>
                <div class="stat-number" id="reserved-count">0</div>
            </div>
            <div class="stat-card">
                <h3>Rented Lots</h3>
                <div class="stat-number" id="rented-count">0</div>
            </div>
        </div>
        <div id="lot-list"></div>
    `;
    
    updateDashboardStats();
    loadLotList();
}

// Update dashboard statistics
async function updateDashboardStats() {
    try {
        const lotsSnapshot = await get(ref(db, 'lots'));
        const lots = [];
        lotsSnapshot.forEach((childSnapshot) => {
            lots.push(childSnapshot.val());
        });

        const availableLots = lots.filter(lot => 
            ((lot.status && lot.status.toLowerCase() === "available") ||
             (lot.lotStatus && lot.lotStatus.toLowerCase() === "available"))
        );
        const reservedLots = lots.filter(lot => 
            ((lot.status && lot.status.toLowerCase() === "reserved") ||
             (lot.lotStatus && lot.lotStatus.toLowerCase() === "reserved"))
        );
        const rentedLots = lots.filter(lot => 
            ((lot.status && lot.status.toLowerCase() === "rented") ||
             (lot.lotStatus && lot.lotStatus.toLowerCase() === "rented"))
        );

        document.getElementById("available-count").textContent = availableLots.length;
        document.getElementById("reserved-count").textContent = reservedLots.length;
        document.getElementById("rented-count").textContent = rentedLots.length;
    } catch (error) {
        console.error("Error updating dashboard:", error);
    }
}

// Load lot list
async function loadLotList() {
    const lotList = document.getElementById("lot-list");
    try {
        const snapshot = await get(ref(db, "lots"));
        if (!snapshot.exists()) {
            lotList.innerHTML = "<p>No lots found.</p>";
            return;
        }
        
        let html = "";
        snapshot.forEach(child => {
            const lot = child.val();
            html += `
                <div class="lot-card">
                    <img class="lot-image" src="${lot.lotImages || '../RESOURCES/imgFiles/Logo.png'}" alt="Lot">
                    <div class="lot-details">
                        <h3>${lot.lotNumber || "No Number"}</h3>
                        <p>Size: ${lot.lotSize || "N/A"} sqm</p>
                        <p>Price: ${lot.lotPrice || "N/A"}</p>
                        <p>Status: ${lot.status || lot.lotStatus || "Unknown"}</p>
                        <p>${lot.lotDescription || ""}</p>
                        <div class="lot-actions">
                            <button onclick="editLotPrompt('${child.key}')">Edit</button>
                            <button onclick="removeLotPrompt('${child.key}')">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        });
        lotList.innerHTML = html;
    } catch (error) {
        console.error("Error loading lots:", error);
        lotList.innerHTML = "<p>Error loading lots.</p>";
    }
}

// Add Lot
function loadAddLot() {
    mainContentSection.innerHTML = `
        <form class="form-section" id="add-lot-form">
            <h2>Add New Lot</h2>
            <div class="form-group">
                <label for="add-lot-number">Lot Number</label>
                <input id="add-lot-number" type="text" required>
            </div>
            <div class="form-group">
                <label for="add-lot-size">Lot Size (sqm)</label>
                <input id="add-lot-size" type="number" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="add-lot-price">Monthly Rent</label>
                <input id="add-lot-price" type="number" min="0" step="0.01">
            </div>
            <div class="form-group">
                <label for="add-lot-description">Description</label>
                <textarea id="add-lot-description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label for="add-lot-status">Status</label>
                <select id="add-lot-status">
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="rented">Rented</option>
                </select>
            </div>
            <div class="form-group">
                <label for="add-lot-image">Image URL</label>
                <input id="add-lot-image" type="text" placeholder="Paste image URL or leave blank for default">
            </div>
            <div class="form-actions">
                <button type="submit">Add Lot</button>
            </div>
        </form>
    `;
    
    document.getElementById("add-lot-form").onsubmit = async (e) => {
        e.preventDefault();
        const lotNumber = document.getElementById("add-lot-number").value.trim();
        const lotSize = parseFloat(document.getElementById("add-lot-size").value);
        const lotPrice = document.getElementById("add-lot-price").value.trim();
        const lotDescription = document.getElementById("add-lot-description").value.trim();
        const lotStatus = document.getElementById("add-lot-status").value;
        const lotImages = document.getElementById("add-lot-image").value.trim();
        
        if (!lotNumber || isNaN(lotSize)) {
            alert("Please enter at least the Lot Number and Lot Size.");
            return;
        }
        
        try {
            // Check if lot number already exists
            let isLotFound = false;
            const lotsSnapshot = await get(ref(db, 'lots'));
            lotsSnapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().lotNumber === lotNumber) {
                    isLotFound = true;
                }
            });

            if (isLotFound) {
                alert("Lot number already exists.");
                return;
            }

            const newLot = {
                lotNumber: lotNumber,
                lotPrice: lotPrice ? `₱${lotPrice}` : "",
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
                action: `Lot ${lotNumber} added by staff member ${user.firstName} ${user.lastName}`,
                date: new Date().toUTCString(),
                by: uid,
                staffName: `${user.firstName} ${user.lastName}`,
                staffId: uid
            });

            alert("Lot added!");
            loadViewLots();
            sidebarOptions.forEach(b => b.classList.remove("active"));
            sidebarOptions[0].classList.add("active");
            mainHeaderTitle.textContent = "View Lots";
        } catch (error) {
            console.error("Error adding lot:", error);
            alert("Failed to add lot: " + error.message);
        }
    };
}

// Edit Lot
function loadEditLot(lotId = "") {
    mainContentSection.innerHTML = `
        <form class="form-section" id="edit-lot-search-form">
            <h2>Edit Lot</h2>
            <div class="form-group">
                <label for="edit-lot-id">Enter Lot Number</label>
                <input id="edit-lot-id" type="text" required value="${lotId}">
            </div>
            <div class="form-actions">
                <button type="submit">Load Lot</button>
            </div>
        </form>
        <div id="edit-lot-form-container"></div>
    `;

    // If lotId is provided, auto-load the lot
    if (lotId) {
        loadEditLotForm(lotId);
    }

    document.getElementById("edit-lot-search-form").onsubmit = async (e) => {
        e.preventDefault();
        const lotNumber = document.getElementById("edit-lot-id").value.trim();
        loadEditLotForm(lotNumber);
    };
}

// Helper to load the edit form for a lot
async function loadEditLotForm(lotNumber) {
    try {
        let lotKey = null;
        let lotData = null;
        const lotsSnapshot = await get(ref(db, 'lots'));
        lotsSnapshot.forEach((childSnapshot) => {
            if (childSnapshot.val().lotNumber === lotNumber) {
                lotKey = childSnapshot.key;
                lotData = childSnapshot.val();
            }
        });

        if (!lotKey) {
            alert("Lot not found.");
            return;
        }

        const container = document.getElementById("edit-lot-form-container");
        container.innerHTML = `
            <form class="form-section" id="edit-lot-form">
                <h2>Edit Lot: ${lotData.lotNumber}</h2>
                <div class="form-group">
                    <label for="edit-lot-size">Lot Size (sqm)</label>
                    <input id="edit-lot-size" type="number" min="0" step="0.01" required value="${lotData.lotSize || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-lot-price">Monthly Rent</label>
                    <input id="edit-lot-price" type="number" min="0" step="0.01" value="${lotData.lotPrice ? lotData.lotPrice.replace('₱', '') : ''}">
                </div>
                <div class="form-group">
                    <label for="edit-lot-description">Description</label>
                    <textarea id="edit-lot-description" rows="3">${lotData.lotDescription || ''}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-lot-status">Status</label>
                    <select id="edit-lot-status">
                        <option value="available" ${lotData.lotStatus === 'available' ? 'selected' : ''}>Available</option>
                        <option value="reserved" ${lotData.lotStatus === 'reserved' ? 'selected' : ''}>Reserved</option>
                        <option value="rented" ${lotData.lotStatus === 'rented' ? 'selected' : ''}>Rented</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-lot-image">Image URL</label>
                    <input id="edit-lot-image" type="text" value="${lotData.lotImages || ''}">
                </div>
                <div class="form-actions">
                    <button type="submit">Update Lot</button>
                </div>
            </form>
        `;

        document.getElementById("edit-lot-form").onsubmit = async (e) => {
            e.preventDefault();
            const lotSize = parseFloat(document.getElementById("edit-lot-size").value);
            const lotPrice = document.getElementById("edit-lot-price").value.trim();
            const lotDescription = document.getElementById("edit-lot-description").value.trim();
            const lotStatus = document.getElementById("edit-lot-status").value;
            const lotImages = document.getElementById("edit-lot-image").value.trim();

            if (isNaN(lotSize)) {
                alert("Please enter a valid lot size.");
                return;
            }

            try {
                const updates = {
                    lotSize: lotSize,
                    lotPrice: lotPrice ? `₱${lotPrice}` : "",
                    lotDescription: lotDescription,
                    lotStatus: lotStatus,
                    lotImages: lotImages
                };

                await update(ref(db, `lots/${lotKey}`), updates);
                
                // Log the action
                await push(ref(db, 'logs/lots'), {
                    action: `Lot ${lotData.lotNumber} updated by staff member ${user.firstName} ${user.lastName}`,
                    date: new Date().toUTCString(),
                    by: uid,
                    staffName: `${user.firstName} ${user.lastName}`,
                    staffId: uid
                });

                alert("Lot updated!");
                loadViewLots();
                sidebarOptions.forEach(b => b.classList.remove("active"));
                sidebarOptions[0].classList.add("active");
                mainHeaderTitle.textContent = "View Lots";
            } catch (error) {
                console.error("Error updating lot:", error);
                alert("Failed to update lot: " + error.message);
            }
        };
    } catch (error) {
        console.error("Error loading edit form:", error);
        alert("Error loading lot data.");
    }
}

// Remove Lot
function loadRemoveLot() {
    mainContentSection.innerHTML = `
        <form class="form-section" id="remove-lot-form">
            <h2>Remove Lot</h2>
            <div class="form-group">
                <label for="remove-lot-number">Enter Lot Number</label>
                <input id="remove-lot-number" type="text" required>
            </div>
            <div class="form-actions">
                <button type="submit">Remove Lot</button>
            </div>
        </form>
    `;

    document.getElementById("remove-lot-form").onsubmit = async (e) => {
        e.preventDefault();
        const lotNumber = document.getElementById("remove-lot-number").value.trim();

        if (!lotNumber) {
            alert("Please enter a valid lot number.");
            return;
        }

        try {
            let lotKey = null;
            const lotsSnapshot = await get(ref(db, 'lots'));
            lotsSnapshot.forEach((childSnapshot) => {
                if (childSnapshot.val().lotNumber === lotNumber) {
                    lotKey = childSnapshot.key;
                }
            });

            if (!lotKey) {
                alert("Lot not found. Please enter a valid lot number.");
                return;
            }

            if (confirm(`Are you sure you want to remove lot ${lotNumber}?`)) {
                await remove(ref(db, 'lots/' + lotKey));
                
                // Log the action
                await push(ref(db, 'logs/lots'), {
                    action: `Lot ${lotNumber} removed by staff member ${user.firstName} ${user.lastName}`,
                    date: new Date().toUTCString(),
                    by: uid,
                    staffName: `${user.firstName} ${user.lastName}`,
                    staffId: uid
                });

                alert(`Lot ${lotNumber} has been removed.`);
                loadViewLots();
                sidebarOptions.forEach(b => b.classList.remove("active"));
                sidebarOptions[0].classList.add("active");
                mainHeaderTitle.textContent = "View Lots";
            }
        } catch (error) {
            console.error("Error removing lot:", error);
            alert("Failed to remove lot: " + error.message);
        }
    };
}

// Global functions for lot actions (called from HTML)
window.editLotPrompt = function(lotKey) {
    // Find lot number by key and load edit form
    get(ref(db, `lots/${lotKey}`)).then(snapshot => {
        if (snapshot.exists()) {
            const lotData = snapshot.val();
            sidebarOptions.forEach(b => b.classList.remove("active"));
            sidebarOptions[2].classList.add("active");
            mainHeaderTitle.textContent = "Edit Lot";
            loadEditLot(lotData.lotNumber);
        }
    });
};

window.removeLotPrompt = function(lotKey) {
    // Find lot number by key and load remove form
    get(ref(db, `lots/${lotKey}`)).then(snapshot => {
        if (snapshot.exists()) {
            const lotData = snapshot.val();
            sidebarOptions.forEach(b => b.classList.remove("active"));
            sidebarOptions[3].classList.add("active");
            mainHeaderTitle.textContent = "Remove Lot";
            loadRemoveLot();
            document.getElementById("remove-lot-number").value = lotData.lotNumber;
        }
    });
};