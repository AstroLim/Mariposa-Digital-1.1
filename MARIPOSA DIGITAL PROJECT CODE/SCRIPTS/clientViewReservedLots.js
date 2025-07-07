import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, query, orderByChild, equalTo, remove, set, update } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAeBsyXVezC_JEe0X4CWbH43rM0Vx3CtSs",
  authDomain: "mariposa-digital-fb.firebaseapp.com",
  databaseURL: "https://mariposa-digital-fb-default-rtdb.firebaseio.com",
  projectId: "mariposa-digital-fb",
  storageBucket: "mariposa-digital-fb.appspot.com",
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

// Tab logic
const lotsListSection = document.getElementById("lots-list");
const tabReserved = document.getElementById("tab-reserved");
const tabOwned = document.getElementById("tab-owned");
const tabPayments = document.getElementById("tab-payments");

function setActiveTab(tab) {
  tabReserved.classList.remove("active");
  tabOwned.classList.remove("active");
  if (tabPayments) tabPayments.classList.remove("active");
  tab.classList.add("active");
}

// Load reserved lots
async function loadClientReservedLots() {
  if (!lotsListSection) return;
  lotsListSection.innerHTML = "<p>Loading your reserved lots...</p>";

  const reserveLotsRef = ref(db, "reserveLots");
  const q = query(reserveLotsRef, orderByChild("uid"), equalTo(uid));
  const snapshot = await get(q);

  // Fetch all payments for this user
  const paymentsRef = ref(db, `payments/lots/${uid}`);
  const paymentsSnap = await get(paymentsRef);
  const payments = paymentsSnap.exists() ? Object.values(paymentsSnap.val()) : [];

  if (!snapshot.exists()) {
    lotsListSection.innerHTML = `<p>You have no reserved lots.</p>`;
    return;
  }

  const lots = [];
  snapshot.forEach(child => {
    lots.push({ ...child.val(), key: child.key });
  });

  if (lots.length === 0) {
    lotsListSection.innerHTML = `<p>You have no reserved lots.</p>`;
    return;
  }

  lotsListSection.innerHTML = "";
  lots.forEach((lot, i) => {
    const images = Array.isArray(lot.lotImages) ? lot.lotImages : [];
    let priceDisplay = "N/A";
    if (lot.lotPrice && !isNaN(Number(lot.lotPrice.toString().replace(/,/g, "")))) {
      priceDisplay = Number(lot.lotPrice.toString().replace(/,/g, "")).toLocaleString();
    }
    let feeDisplay = "";
    if (lot.reservationFee && !isNaN(Number(lot.reservationFee))) {
      feeDisplay = `<p class="lot-fee">Reservation Fee: ₱${Number(lot.reservationFee).toLocaleString()}</p>`;
    }

    // Check if full payment exists for this lot
    const hasFullPayment = payments.some(
      p => p.lotKey === lot.lotKey &&
        p.paymentType === "full" &&
        (p.status === "pending" || p.status === "completed")
    );

    lotsListSection.innerHTML += `
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
            ${!hasFullPayment ? `<button class="payReservation pay-btn" data-lot='${JSON.stringify(lot)}'>Pay Full Price</button>` : `<button class="pay-btn" disabled>Full Price Paid</button>`}
          </div>
        </div>
      </div>
    `;
  });

  // Cancel reservation logic
  document.querySelectorAll(".cancelReservation").forEach(btn => {
    btn.onclick = async () => {
      const key = btn.getAttribute("data-key");
      if (!key) return;
      if (!confirm("Are you sure you want to cancel this reservation?")) return;

      await remove(ref(db, `reserveLots/${key}`));

      // Find the lot and related payments
      const lot = lots.find(l => l.key === key);

      // Find full payment if exists
      const fullPayment = payments.find(
        p => p.lotKey === lot.lotKey &&
          p.paymentType === "full" &&
          (p.status === "pending" || p.status === "completed")
      );

      let refundAmount = 0;
      let refundType = "reservation";
      let originalAmount = 0;

      if (fullPayment) {
        originalAmount = Number(fullPayment.amount) || 0;
        refundAmount = Math.round(originalAmount * 0.9);
        refundType = "full";
      } else if (lot && lot.reservationFee && !isNaN(Number(lot.reservationFee))) {
        originalAmount = Number(lot.reservationFee);
        refundAmount = Math.round(originalAmount * 0.9);
      }

      // Record refund as a negative payment
      if (refundAmount > 0) {
        let refundRefNum = `RFND${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
        const refundDetails = {
          lotKey: lot.lotKey,
          lotNumber: lot.lotNumber,
          amount: -refundAmount,
          paymentMethod: fullPayment ? fullPayment.paymentMethod : "reservation",
          referenceNumber: refundRefNum,
          paidAt: new Date().toISOString(),
          status: "refunded",
          userId: uid,
          userName: user.username || "",
          lotDescription: lot.lotDescription || "",
          lotSize: lot.lotSize || "",
          lotPrice: lot.lotPrice || "",
          contractSigningDate: lot.contractSigningDate || "",
          paymentType: refundType
        };
        await set(ref(db, `payments/lots/${uid}/${refundRefNum}`), refundDetails);
      }

      // Optionally, update the lot's status back to available
      if (lot && lot.lotKey) {
        const lotRef = ref(db, `lots/${lot.lotKey}`);
        await update(lotRef, { status: "available", reservedBy: null });
      }

      alert(`Reservation canceled. ₱${refundAmount.toLocaleString()} will be refunded to you (90% of the ${refundType === "full" ? "full price" : "reservation fee"}).`);
      loadClientReservedLots();
    };
  });

  // Payment logic
  document.querySelectorAll(".payReservation").forEach(btn => {
    btn.onclick = () => {
      const lot = JSON.parse(btn.getAttribute("data-lot"));
      showPaymentMethodModal(lot);
    };
  });
}

// Payment method modal logic (modern design)
function showPaymentMethodModal(lot) {
  const modal = document.getElementById('payment-modal');
  const closeBtn = document.getElementById('close-payment-modal');
  const feeDisplay = document.getElementById('payment-fee-display');
  const paymentMethodBtns = document.querySelectorAll('.payment-method-btn');
  const selectedMethodSummary = document.getElementById('selected-method-summary');
  const selectedMethodLabel = document.getElementById('selected-method-label');
  const submitBtn = document.getElementById('submit-payment-btn');
  let selectedPaymentMethod = '';

  // Reset
  if (paymentMethodBtns) paymentMethodBtns.forEach(b => b.classList.remove('selected'));
  if (selectedMethodSummary) selectedMethodSummary.style.display = 'none';
  selectedPaymentMethod = '';
  submitBtn.disabled = true;

  // Show full lot price for payment
  // Calculate remaining balance (lot price - reservation fee)
  const lotPrice = Number(lot.lotPrice && !isNaN(Number(lot.lotPrice.toString().replace(/,/g, ""))) ? lot.lotPrice.toString().replace(/,/g, "") : 0);
  const reservationFee = Number(lot.reservationFee && !isNaN(Number(lot.reservationFee)) ? lot.reservationFee : 0);
  const remainingBalance = lotPrice - reservationFee;
  feeDisplay.textContent = `Remaining Balance: ₱${remainingBalance.toLocaleString()}`;
  modal.style.display = "flex";

  paymentMethodBtns.forEach(btn => {
    btn.onclick = () => {
      paymentMethodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPaymentMethod = btn.getAttribute('data-method');
      selectedMethodLabel.textContent = btn.textContent.trim();
      selectedMethodSummary.style.display = '';
      submitBtn.disabled = false;
    };
  });

  closeBtn.onclick = () => {
    modal.style.display = "none";
    if (paymentMethodBtns) paymentMethodBtns.forEach(b => b.classList.remove('selected'));
    if (selectedMethodSummary) selectedMethodSummary.style.display = 'none';
    selectedPaymentMethod = '';
    submitBtn.disabled = true;
  };

  submitBtn.onclick = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    submitBtn.disabled = true;

    try {
      // Generate a unique reference number
      let refNum;
      let isUnique = false;
      while (!isUnique) {
        refNum = `MP${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
        const snapshot = await get(ref(db, `payments/lots/${uid}/${refNum}`));
        if (!snapshot.exists()) isUnique = true;
      }

      // Prepare payment details for full lot price
      const paymentDetails = {
        lotKey: lot.lotKey,
        lotNumber: lot.lotNumber,
        amount: remainingBalance,
        paymentMethod: selectedPaymentMethod,
        referenceNumber: refNum,
        paidAt: new Date().toISOString(),
        status: "pending", // Staff/admin will verify and move to owned
        userId: uid,
        userName: user.username || "",
        lotDescription: lot.lotDescription || "",
        lotSize: lot.lotSize || "",
        lotPrice: lot.lotPrice || "",
        contractSigningDate: lot.contractSigningDate || "",
        paymentType: "full" // Optional: mark as full payment
      };

      // Save to database
      const paymentDbRef = ref(db, `payments/lots/${uid}/${refNum}`);
      await set(paymentDbRef, paymentDetails);

      alert(`Full payment submitted! Reference Number: ${refNum}\nYour payment will be reviewed by staff.`);
      modal.style.display = "none";
      loadClientPayments();
    } catch (err) {
      alert("Payment failed: " + err.message);
      console.error(err);
      submitBtn.disabled = false;
    }
  };
}

// Load owned lots (unchanged)
async function loadClientOwnedLots() {
  if (!lotsListSection) return;
  lotsListSection.innerHTML = "<p>Loading your owned lots...</p>";

  const lotsRef = ref(db, "lots");
  const q = query(lotsRef, orderByChild("reservedBy"), equalTo(uid));
  const snapshot = await get(q);

  if (!snapshot.exists()) {
    lotsListSection.innerHTML = `<p>You have no owned lots.</p>`;
    return;
  }

  const lots = [];
  snapshot.forEach(child => {
    const lot = child.val();
    if ((lot.status || '').toLowerCase() === 'owned') {
      lots.push({ ...lot, key: child.key });
    }
  });

  if (lots.length === 0) {
    lotsListSection.innerHTML = `<p>You have no owned lots.</p>`;
    return;
  }

  lotsListSection.innerHTML = "";
  lots.forEach((lot, i) => {
    const images = Array.isArray(lot.lotImages) ? lot.lotImages : [];
    let priceDisplay = "N/A";
    if (lot.lotPrice && !isNaN(Number(lot.lotPrice.toString().replace(/,/g, "")))) {
      priceDisplay = Number(lot.lotPrice.toString().replace(/,/g, "")).toLocaleString();
    }

    lotsListSection.innerHTML += `
      <div class="lot-card owned">
        <div class="lot-images">
          ${images.map(img => `<img src="${img}" alt="Lot Image" class="lot-image">`).join('')}
        </div>
        <div class="lot-details">
          <h2>Lot #${lot.lotNumber || ""} <span class="owned-badge">Owned</span></h2>
          <div class="lot-info">
            <p>${lot.lotDescription || ""}</p>
            <p>Size: ${lot.lotSize || ""}</p>
            <p>Price: ₱${priceDisplay}</p>
            <p>Ownership Date: ${lot.ownershipDate || "N/A"}</p>
          </div>
        </div>
      </div>
    `;
  });
}

// Load payments (unchanged)
async function loadClientPayments() {
  if (!lotsListSection) return;
  lotsListSection.innerHTML = "<p>Loading your payments...</p>";

  const paymentsRef = ref(db, `payments/lots/${uid}`);
  const paymentsSnap = await get(paymentsRef);
  const payments = paymentsSnap.exists() ? Object.values(paymentsSnap.val()) : [];

  if (!paymentsSnap.exists()) {
    lotsListSection.innerHTML = `<p>You have no payments recorded.</p>`;
    return;
  }

  lotsListSection.innerHTML = "";
  Object.values(payments).forEach(payment => {
    lotsListSection.innerHTML += `
      <div class="payment-card">
        <h2>Lot #${payment.lotNumber}</h2>
        <p>Amount: ₱${Number(payment.amount).toLocaleString()}</p>
        <p>Reference Number: ${payment.referenceNumber}</p>
        <p>Payment Method: ${payment.paymentMethod}</p>
        <p>Status: ${payment.status}</p>
        <p>Date Paid: ${new Date(payment.paidAt).toLocaleString()}</p>
      </div>
    `;
  });
}

// Tab event listeners
if (tabReserved && tabOwned && tabPayments) {
  tabReserved.onclick = () => {
    setActiveTab(tabReserved);
    loadClientReservedLots();
  };
  tabOwned.onclick = () => {
    setActiveTab(tabOwned);
    loadClientOwnedLots();
  };
  tabPayments.onclick = () => {
    setActiveTab(tabPayments);
    loadClientPayments();
  };
}

// Initial load
if (tabReserved) {
  setActiveTab(tabReserved);
  loadClientReservedLots();
} else {
  loadClientReservedLots();
}