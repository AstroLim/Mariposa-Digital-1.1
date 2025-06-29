import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, query, orderByChild, equalTo, remove } from "firebase/database";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get logged-in user info
const user = JSON.parse(localStorage.getItem("user"));
const uid = localStorage.getItem("uid");

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
if (user && user.username && document.querySelector(".userName")) {
  document.querySelector(".userName").innerHTML = `<p>${user.username}</p>`;
}

// Load and display reserved lots from Firebase
async function loadClientReservedLots() {
  const section = document.getElementById("lots-list") || document.querySelector(".lots-grid") || document.querySelector(".MainSection-mainCont");
  if (!section) return;
  section.innerHTML = "<p>Loading your reserved lots...</p>";

  // Query reserveLots where uid == current user
  const reserveLotsRef = ref(db, "reserveLots");
  const q = query(reserveLotsRef, orderByChild("uid"), equalTo(uid));
  const snapshot = await get(q);

  if (!snapshot.exists()) {
    section.innerHTML = `<p>You have no reserved lots.</p>`;
    return;
  }

  const lots = [];
  snapshot.forEach(child => {
    lots.push({ ...child.val(), key: child.key });
  });

  if (lots.length === 0) {
    section.innerHTML = `<p>You have no reserved lots.</p>`;
    return;
  }

  section.innerHTML = "";
  lots.forEach((lot, i) => {
    const images = Array.isArray(lot.lotImages) ? lot.lotImages : [];
    // Format price correctly even if it has commas
    let priceDisplay = "N/A";
    if (lot.lotPrice && !isNaN(Number(lot.lotPrice.toString().replace(/,/g, "")))) {
      priceDisplay = Number(lot.lotPrice.toString().replace(/,/g, "")).toLocaleString();
    }
    // Show reservation fee if available
    let feeDisplay = "";
    if (lot.reservationFee && !isNaN(Number(lot.reservationFee))) {
      feeDisplay = `<p class="lot-fee">Reservation Fee: ₱${Number(lot.reservationFee).toLocaleString()}</p>`;
    }

    section.innerHTML += `
      <div class="lot-card">
        <div class="lot-images">
          ${images.map(img => `<img src="${img}" alt="Lot Image" class="lot-image">`).join('')}
        </div>
        <div class="lot-details">
          <h2>Lot #${lot.lotNumber || ""}</h2>
          <div class="lot-info">
            <p>${lot.lotDescription || ""}</p>
            <p>Size: ${lot.lotSize || ""}</p>
            <p>Price: ₱${priceDisplay}</p>
            ${feeDisplay}
            <p>Contract Signing Date: ${lot.contractSigningDate || "Not set"}</p>
          </div>
          <div class="lot-actions">
            <button class="cancelReservation" data-key="${lot.key}">Cancel Reservation</button>
          </div>
        </div>
      </div>
    `;
  });

  // Add event listeners for cancel buttons
  document.querySelectorAll(".cancelReservation").forEach(btn => {
    btn.onclick = async () => {
      const key = btn.getAttribute("data-key");
      if (!key) return;
      if (!confirm("Are you sure you want to cancel this reservation?")) return;

      // Remove reservation from reserveLots
      await remove(ref(db, `reserveLots/${key}`));

      // Optionally, update the lot's status back to available
      // Find the lotKey from the reservation
      const lot = lots.find(l => l.key === key);
      if (lot && lot.lotKey) {
        const lotRef = ref(db, `lots/${lot.lotKey}`);
        await import("firebase/database").then(({ update }) =>
          update(lotRef, { status: "available", reservedBy: null })
        );
      }

      // Refund 90% of the reservation fee if available
      if (lot && lot.reservationFee && !isNaN(Number(lot.reservationFee))) {
        const refund = Math.round(Number(lot.reservationFee) * 0.9);
        alert(`Reservation canceled. ₱${refund.toLocaleString()} will be refunded to you (90% of the reservation fee).`);
      } else {
        alert("Reservation canceled.");
      }

      loadClientReservedLots();
    };
  });
}

// Call on page load
loadClientReservedLots();