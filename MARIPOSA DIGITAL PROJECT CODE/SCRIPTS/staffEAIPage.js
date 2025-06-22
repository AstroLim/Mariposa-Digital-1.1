import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update } from "firebase/database";

// Firebase config (same as reserved lots)
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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);



const staffUid = localStorage.getItem('uid');
const user = JSON.parse(localStorage.getItem('user'));

if (!staffUid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'staff') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}

let staff = null;

// Load staff data from Firebase and update localStorage
async function loadStaffData() {
  try {
    const staffRef = ref(db, `users/${staffUid}`);
    const snapshot = await get(staffRef);
    if (!snapshot.exists()) {
      throw new Error("Staff data not found.");
    }
    staff = snapshot.val();
    localStorage.setItem('user', JSON.stringify(staff));

    // Set username in header
    if (staff.username && document.querySelector(".userName")) {
      document.querySelector(".userName").textContent = staff.username;
    }

    // Set placeholders
    document.querySelector("#username").placeholder = staff.username || "";
    document.querySelector("#firstname").placeholder = staff.firstname || staff.firstName || "";
    document.querySelector("#lastname").placeholder = staff.lastname || staff.lastName || "";
    document.querySelector("#mobilenumber").placeholder = staff.mobilenumber || staff.phone || "";
    document.querySelector("#email").placeholder = staff.email || "";

    // Set original email for reverification logic
    originalEmail = staff.email || "";
  } catch (err) {
    document.body.innerHTML = '';
    alert('Failed to load staff data: ' + err.message);
    window.location.href = 'landingPage.html';
  }
}

let originalEmail = "";

// Call loadStaffData on DOMContentLoaded
window.addEventListener("DOMContentLoaded", loadStaffData);

// Show reverification button if email is changed
const emailInput = document.getElementById("email");
const sendReverificationBtn = document.getElementById("sendReverification");

emailInput.addEventListener("input", () => {
  if (emailInput.value.trim() !== "" && emailInput.value.trim() !== originalEmail) {
    sendReverificationBtn.style.display = "inline-block";
  } else {
    sendReverificationBtn.style.display = "none";
  }
});

// Dummy reverification handler (replace with your actual logic)
sendReverificationBtn.addEventListener("click", () => {
  alert("A reverification email has been sent to " + (emailInput.value.trim() || originalEmail));
  sendReverificationBtn.style.display = "none";
});

// Update account info in Firebase
document.getElementById("editAccountForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!staffUid) {
    alert("User not logged in.");
    return;
  }

  // Only update fields that are filled in
  const updatedData = {};
  const username = document.querySelector("#username").value.trim();
  const firstname = document.querySelector("#firstname").value.trim();
  const lastname = document.querySelector("#lastname").value.trim();
  const mobilenumber = document.querySelector("#mobilenumber").value.trim();
  const email = document.querySelector("#email").value.trim();

  if (username) updatedData.username = username;
  if (firstname) updatedData.firstName = firstname;
  if (lastname) updatedData.lastName = lastname;
  if (mobilenumber) updatedData.phone = mobilenumber;
  if (email) updatedData.email = email;

  if (Object.keys(updatedData).length === 0) {
    alert("No changes to save.");
    return;
  }

  try {
    const staffRef = ref(db, `users/${staffUid}`);
    await update(staffRef, updatedData);

    // Reload latest data from Firebase and update localStorage/placeholders
    await loadStaffData();

    alert("Account information updated successfully.");
  } catch (err) {
    alert("Failed to update account: " + err.message);
  }
});