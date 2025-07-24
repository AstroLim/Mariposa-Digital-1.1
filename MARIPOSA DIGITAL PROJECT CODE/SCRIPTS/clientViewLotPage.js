import { initializeApp } from "firebase/app";
import { getDatabase, ref as realRef, get, push, update, set } from "firebase/database";
import emailjs from "@emailjs/browser";

emailjs.init("jPowbOSrYKngXnPVD"); // Use your public key here

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

// --- Firebase DB instance test ---
console.log("Firebase DB instance:", db);
try {
  const testRef = realRef(db, 'test');
  console.log("Test ref:", testRef);
} catch (e) {
  console.error("Firebase ref error:", e);
}

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');
let selectedLot = null;
let scrolledToBottom = false;

// Modal setup
const modal = document.getElementById('contract-modal');
const closeModalBtns = document.querySelectorAll('.modal-close-btn');
closeModalBtns.forEach(btn => {
  btn.onclick = () => { modal.style.display = 'none'; };
});
const contractDateInput = document.getElementById('contract-date');
const step1 = document.getElementById('modal-step-1');
const step2 = document.getElementById('modal-step-2');
const step3 = document.getElementById('modal-step-3');
const nextToPayment = document.getElementById('next-to-payment');
const nextToDate = document.getElementById('next-to-date');
const nextToPay = document.getElementById('next-to-pay'); // New button for contract date -> payment
const acceptTermsCheckbox = document.getElementById('accept-terms-checkbox');
const termsScrollbox = document.getElementById('terms-scrollbox');

// Payment method selection (modern design)
let selectedPaymentMethod = '';
const paymentMethodBtns = document.querySelectorAll('.payment-method-btn-modern');
const selectedMethodSummary = document.getElementById('selected-method-summary');
const selectedMethodLabel = document.getElementById('selected-method-label');
const confirmPaymentBtn = document.getElementById('confirm-payment-btn'); // <-- Use the correct ID

if (paymentMethodBtns && confirmPaymentBtn && selectedMethodSummary && selectedMethodLabel) {
  confirmPaymentBtn.disabled = true;
  paymentMethodBtns.forEach(btn => {
    btn.onclick = () => {
      paymentMethodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPaymentMethod = btn.getAttribute('data-method');
      selectedMethodLabel.textContent = btn.textContent.trim();
      selectedMethodSummary.style.display = '';
      confirmPaymentBtn.disabled = false; // Enable when a method is selected
    };
  });
}

// Show modal
function showModal(lot) {
  selectedLot = lot;
  contractDateInput.value = '';
  if (step1 && step2 && step3) {
    step1.style.display = '';
    step2.style.display = 'none';
    step3.style.display = 'none';
  }
  if (termsScrollbox) {
    termsScrollbox.scrollTop = 0;
    scrolledToBottom = termsScrollbox.scrollHeight <= termsScrollbox.clientHeight;
  }
  if (acceptTermsCheckbox) acceptTermsCheckbox.checked = false;
  if (nextToPayment) nextToPayment.disabled = true;
  if (paymentMethodBtns) paymentMethodBtns.forEach(b => b.classList.remove('selected'));
  if (selectedMethodSummary) selectedMethodSummary.style.display = 'none';
  selectedPaymentMethod = '';
  if (nextToDate) nextToDate.disabled = true;
  modal.style.display = 'flex';

  // Show reservation fee
  const feeDisplay = document.getElementById('reservation-fee-display');
  if (feeDisplay) {
    let fee = 0;
    if (lot.lotPrice) {
      const priceNum = Number(lot.lotPrice.toString().replace(/,/g, ""));
      fee = 5000; // Example: fixed fee
      feeDisplay.textContent = `Reservation Fee: ₱${fee.toLocaleString()}`;
      selectedLot.reservationFee = fee;
    } else {
      feeDisplay.textContent = "Reservation Fee: N/A";
    }
  }

  // Update button state after resetting modal
  if (typeof updateNextButtonState === "function") updateNextButtonState();
}

// Hide modal on close (click outside)
window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

// Load lots from database
function loadLots() {
  const section = document.getElementById("lots-list");
  if (!section) return;
  section.innerHTML = "<p>Loading lots...</p>";

  const lotsRef = realRef(db, 'lots');
  get(lotsRef).then(snapshot => {
    if (!snapshot.exists()) {
      section.innerHTML = "<p>No available lots at the moment.</p>";
      return;
    }
    const lotsObj = snapshot.val();
    const availableLots = Object.entries(lotsObj)
        .filter(([key, lot]) => {
            const status = (lot.status || "").toString().trim().toLowerCase();
            return status === "" || status === "available";
        });

    if (availableLots.length === 0) {
      section.innerHTML = `<p>No available lots at the moment.</p>`;
      return;
    }

    section.innerHTML = "";
    availableLots.forEach(([key, lot]) => {
      console.log(lot); // Debug: log the lot object to inspect its fields
      const images = Array.isArray(lot.lotImages) ? lot.lotImages : [];
      // Calculate price for debug
      let priceValue = lot.lotPrice
        ? Number(lot.lotPrice.replace(/[^\d.]/g, "")).toLocaleString()
        : (lot.price
            ? Number(lot.lotPrice.replace(/[^\d.]/g, "")).toLocaleString()
            : "N/A");
      console.log('Calculated price for lot', lot.lotNumber, ':', priceValue);
      console.log('Raw lotPrice:', lot.lotPrice);
      console.log('Stripped lotPrice:', lot.lotPrice ? lot.lotPrice.replace(/[^\d.]/g, "") : "undefined");
      console.log('Number conversion:', lot.lotPrice ? Number(lot.lotPrice.replace(/[^\d.]/g, "")) : "undefined");
      section.innerHTML += `
        <div class="lot-card">
          <h2>Lot #${lot.lotNumber}</h2>
          <p>${lot.lotDescription}</p>
          <p>Size: ${lot.lotSize}</p>
          <p>Price: ₱${
  lot.lotPrice && !isNaN(Number(lot.lotPrice.toString().replace(/,/g, "")))
    ? Number(lot.lotPrice.toString().replace(/,/g, "")).toLocaleString()
    : "N/A"
}</p>
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
    if (contractDateInput) contractDateInput.setAttribute('min', formattedToday);

    document.querySelectorAll('.reserveLotBTN').forEach(btn => {
      btn.onclick = () => {
        const lotKey = btn.getAttribute('data-key');
        const lot = lotsObj[lotKey];
        showModal({ ...lot, lotKey });
      };
    });
  });
}

// --- Modal Step 1: Terms scroll and checkbox logic ---
document.addEventListener('DOMContentLoaded', function() {
  const nextToContractDate = document.getElementById('next-to-contract-date');
  const acceptTermsCheckbox = document.getElementById('accept-terms-checkbox');
  const termsScrollbox = document.getElementById('terms-scrollbox');
  let scrolledToBottom = false;

  function updateNextButtonState() {
      if (nextToContractDate)
          nextToContractDate.disabled = !(scrolledToBottom && acceptTermsCheckbox && acceptTermsCheckbox.checked);
  }

  if (termsScrollbox && nextToContractDate && acceptTermsCheckbox) {
      nextToContractDate.disabled = true;
      scrolledToBottom = false;

      termsScrollbox.addEventListener('scroll', function() {
          if (termsScrollbox.scrollTop + termsScrollbox.clientHeight >= termsScrollbox.scrollHeight - 2) {
              scrolledToBottom = true;
              updateNextButtonState();
          }
      });

      acceptTermsCheckbox.addEventListener('change', updateNextButtonState);

      // If terms already fit, enable immediately
      if (termsScrollbox.scrollHeight <= termsScrollbox.clientHeight) {
          scrolledToBottom = true;
          updateNextButtonState();
      }
  }

  // Step 1: Terms -> Step 2: Contract Date
  if (nextToContractDate) {
      nextToContractDate.addEventListener('click', function() {
          document.getElementById('modal-step-1').style.display = 'none';
          document.getElementById('modal-step-2').style.display = '';
      });
  }

  const contractDateInput = document.getElementById('contract-date');
  const nextToPayment = document.getElementById('next-to-payment');
  if (contractDateInput && nextToPayment) {
    nextToPayment.disabled = true;
    contractDateInput.addEventListener('input', function() {
      nextToPayment.disabled = !contractDateInput.value;
    });
    // Optional: also enable if value is already set (e.g., browser autofill)
    if (contractDateInput.value) nextToPayment.disabled = false;

    // Step 2: Contract Date -> Step 3: Payment
    nextToPayment.addEventListener('click', function() {
      document.getElementById('modal-step-2').style.display = 'none';
      document.getElementById('modal-step-3').style.display = '';
    });
  }

  if (confirmPaymentBtn) {
    confirmPaymentBtn.addEventListener('click', async function() {
      if (!selectedPaymentMethod) {
        alert('Please select a payment method.');
        return;
      }
      if (!contractDateInput.value) {
        alert('Please select a contract signing date.');
        return;
      }
      // Generate a unique reference number
      let refNum;
      let isUnique = false;
      while (!isUnique) {
        refNum = `MP${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
        const snapshot = await get(realRef(db, `payments/lots/${uid}/${refNum}`));
        if (!snapshot.exists()) isUnique = true;
      }

      // Prepare payment details
      const paymentDetails = {
        lotKey: selectedLot.lotKey,
        lotNumber: selectedLot.lotNumber,
        amount: selectedLot.reservationFee,
        paymentMethod: selectedPaymentMethod,
        referenceNumber: refNum,
        paidAt: new Date().toISOString(),
        status: "completed",
        userId: uid,
        userName: user.username || "",
        lotDescription: selectedLot.lotDescription || "",
        lotSize: selectedLot.lotSize || "",
        lotPrice: selectedLot.lotPrice || "",
        contractSigningDate: contractDateInput.value
      };

      // Prepare reservation data
      const reservation = {
        ...selectedLot,
        uid: uid,
        contractSigningDate: contractDateInput.value,
        reservedAt: new Date().toISOString(),
        reservationPaymentMethod: selectedPaymentMethod,
        paymentReferenceNumber: refNum
      };

      // Write both records
      const paymentDbRef = realRef(db, `payments/lots/${uid}/${refNum}`);
      await set(paymentDbRef, paymentDetails);

      const reserveRef = realRef(db, 'reserveLots');
      const lotRef = realRef(db, `lots/${selectedLot.lotKey}`);

      // Write both records
      await set(paymentDbRef, paymentDetails);
      await push(reserveRef, reservation);
      await update(lotRef, { status: "reserved", reservedBy: uid });

      // --- Send EmailJS notification ---
      emailjs.send("service_4hc3h0c", "template_9kcskto", {
        to_email: user.email,
        to_name: user.username,
        reference_number: paymentDetails.referenceNumber,
        amount: paymentDetails.amount,
        lot_number: paymentDetails.lotNumber,
        lot_description: paymentDetails.lotDescription,
        payment_method: paymentDetails.paymentMethod,
        contract_signing_date: paymentDetails.contractSigningDate,
        description: "Thank you for your payment! Here are your transaction details:",
        subject: "Payment Received"
      }).then(function(response) {
        console.log("Reservation payment email sent!", response.status, response.text);
      }, function(error) {
        console.error("Reservation payment email failed:", error);
      });

      alert(`Payment successful! Reference Number: ${refNum}`);
      modal.style.display = 'none';
      loadLots();
    });
  }
});

// Access check (run after DOMContentLoaded to ensure elements exist)
if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'user') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
} else {
  if (user.username && document.querySelector(".userName")) {
    document.querySelector(".userName").innerHTML = `<p>${user.username}</p>`;
  }
  loadLots();
}