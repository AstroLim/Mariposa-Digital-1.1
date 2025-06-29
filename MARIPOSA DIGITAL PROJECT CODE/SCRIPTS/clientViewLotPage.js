import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, push } from "firebase/database";

// Firebase config (same as checkout page)
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
const db = getDatabase(app);

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');
let selectedLot = null;

// Access check
if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'user') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
} else {
  // Set username in header if needed
  if (user.username && document.querySelector(".userName")) {
    document.querySelector(".userName").innerHTML = `<p>${user.username}</p>`;
  }
  // Load available lots
  loadLots();
}

// Modal setup (make sure these elements exist in your HTML)
const modal = document.getElementById('contract-modal');
const closeModal = document.getElementById('close-modal');
const contractDateInput = document.getElementById('contract-date');
const confirmBtn = document.getElementById('confirm-contract-btn');

// Show modal
function showModal(lot) {
  selectedLot = lot;
  contractDateInput.value = '';
  modal.style.display = 'flex';
}

// Hide modal
if (closeModal) {
  closeModal.onclick = () => { modal.style.display = 'none'; };
}
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

if (confirmBtn) {
  confirmBtn.onclick = async () => {
    if (!contractDateInput.value) {
      alert('Please select a contract signing date.');
      return;
    }
    if (!user || !uid || !selectedLot) return;

    // Prepare reservation data
    const reservation = {
      ...selectedLot,
      uid: uid,
      contractSigningDate: contractDateInput.value,
      reservedAt: new Date().toISOString()
    };

    // Push to reserveLots
    const reserveRef = ref(db, 'reserveLots');
    await push(reserveRef, reservation);

    // Update lot status to 'reserved'
    const lotRef = ref(db, `lots/${selectedLot.lotKey}`);
    const { update } = await import("firebase/database");
    await update(lotRef, { status: "reserved", reservedBy: uid });

    alert('Lot reserved successfully!');
    modal.style.display = 'none';
    loadLots();
  };
}

// Load lots from database
function loadLots() {
  const section = document.getElementById("lots-list");
  if (!section) return;
  section.innerHTML = "<p>Loading lots...</p>";

  const lotsRef = ref(db, 'lots');
  get(lotsRef).then(snapshot => {
    if (!snapshot.exists()) {
      section.innerHTML = "<p>No available lots at the moment.</p>";
      return;
    }
    const lotsObj = snapshot.val();
    // Only show lots where status is missing or exactly "available" (case-insensitive, trimmed)
    const availableLots = Object.entries(lotsObj)
        .filter(([key, lot]) => {
            const status = (lot.status || "").toString().trim().toLowerCase();
            return status === "" || status === "available";
        });
    
    Object.entries(lotsObj).forEach(([key, lot]) => {
        console.log(`Lot ${key} status: "${(lot.status || "").toString().trim().toLowerCase()}"`);
    });

    if (availableLots.length === 0) {
      section.innerHTML = `<p>No available lots at the moment.</p>`;
      return;
    }

    section.innerHTML = ""; // Clear section before loading lots
    availableLots.forEach(([key, lot]) => {
      const images = Array.isArray(lot.lotImages) ? lot.lotImages : [];
      section.innerHTML += `
        <div class="lot-card">
          <h2>Lot #${lot.lotNumber}</h2>
          <p>${lot.lotDescription}</p>
          <p>Size: ${lot.lotSize}</p>
          <p>Price: ₱${typeof lot.lotPrice === "number" ? lot.lotPrice.toLocaleString() : "N/A"}</p>
          <div class="lot-images">
            ${images.map(img => `<img src="${img}" alt="Lot Image" class="lot-image">`).join('')}
          </div>
          <button class="reserveLotBTN" data-key="${key}">Reserve Lot</button>
        </div>
      `;
    });

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;
    contractDateInput.setAttribute('min', formattedToday);

    // Add event listeners for reserve buttons
    document.querySelectorAll('.reserveLotBTN').forEach(btn => {
      btn.onclick = () => {
        const lotKey = btn.getAttribute('data-key');
        const lot = lotsObj[lotKey];
        showModal({ ...lot, lotKey });
      };
    });
  });
}