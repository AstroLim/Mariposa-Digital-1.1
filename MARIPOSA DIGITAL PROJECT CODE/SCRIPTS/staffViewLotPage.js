// Import Firebase SDKs
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, get, ref } from 'firebase/database';

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

// Making Client Home Page Username Content Dynamic based on who's logged in
if (user) { 
    const userName = `${user.username}`;
    document.querySelector(".userName").innerHTML = `<p>${userName}</p>`;
}

// Set username in navbar
window.addEventListener('DOMContentLoaded', () => {
  const userDiv = document.querySelector('.userName');
  if (user && user.username && userDiv) {
    userDiv.innerHTML = `<p>${user.username}</p>`;
  }
  loadLots();
});

// Function that loads lots from Firebase
async function loadLots() {
    let section = document.querySelector(".MainSection-mainCont");
    section.innerHTML = '<p>Loading lots...</p>';
    try {
        const lotsSnapshot = await get(ref(db, 'lots'));
        let allLots = [];
        if (lotsSnapshot.exists()) {
            lotsSnapshot.forEach(childSnapshot => {
                allLots.push(childSnapshot.val());
            });
        }
        section.innerHTML = allLots.length === 0 
            ? `<p>No lots at the moment.</p>` 
            : "";
        allLots.forEach((lot) => {
            // Format price with comma if needed
            let priceDisplay = lot.lotPrice;
            if (typeof priceDisplay === "string") {
                priceDisplay = Number(priceDisplay.replace(/,/g, ''));
                priceDisplay = isNaN(priceDisplay) ? lot.lotPrice : priceDisplay.toLocaleString();
            } else if (typeof priceDisplay === "number") {
                priceDisplay = priceDisplay.toLocaleString();
            }
            section.innerHTML += `
                <div class="lot-card">
                    <h2>Lot: ${lot.lotNumber || ""}</h2>
                    <div><strong>Price:</strong> ₱${priceDisplay || "N/A"}</div>
                    <div><strong>Size:</strong> ${lot.lotSize || "N/A"}</div>
                    <div><strong>Status:</strong> ${lot.lotStatus || lot.status || "N/A"}</div>
                    <div><strong>Description:</strong> ${lot.lotDescription || ""}</div>
                </div>`;
        });
    } catch (error) {
        section.innerHTML = `<p style='color:red;'>Failed to load lots: ${error.message}</p>`;
        console.error('Error loading lots from Firebase:', error);
    }
}

localStorage.removeItem('strLoginAccount');
