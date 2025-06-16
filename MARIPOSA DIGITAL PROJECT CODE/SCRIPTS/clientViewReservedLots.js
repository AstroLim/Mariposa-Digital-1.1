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

// Set username in header
if (user && user.username && document.querySelector(".userName")) {
  document.querySelector(".userName").innerHTML = `<p>${user.username}</p>`;
}

// Load and display reserved lots from Firebase
async function loadClientReservedLots() {
  const section = document.getElementById("lots-list") || document.querySelector(".MainSection-mainCont");
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
    section.innerHTML += `
      <div class="lot-card">
        <div class="lot-images">
          ${images.map(img => `<img src="${img}" alt="Lot Image" class="lot-image">`).join('')}
        </div>
        <h2>Lot #${lot.lotNumber || ""}</h2>
        <p>${lot.lotDescription || ""}</p>
        <p>Size: ${lot.lotSize || ""}</p>
        <p>Price: ₱${typeof lot.lotPrice === "number" ? lot.lotPrice.toLocaleString() : "N/A"}</p>
        <p>Contract Signing Date: ${lot.contractSigningDate || "Not set"}</p>
        <button class="cancelReservation" data-key="${lot.key}">Cancel Reservation</button>
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

      alert("Reservation canceled.");
      loadClientReservedLots();
    };
  });
}

// Call on page load
loadClientReservedLots();