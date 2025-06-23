import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, update } from "firebase/database";
import { sendEmailVerification, updateEmail, getAuth } from "firebase/auth";

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
const auth = getAuth(app);
const db = getDatabase(app);

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');

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
  document.querySelector(".userName").textContent = user.username;
}

// Logout Function
function logoutClient() {
  localStorage.removeItem("user");
  localStorage.removeItem("uid");
  window.location.replace("landingPage.html");
}
window.logoutClient = logoutClient;

// Prefill form with user data
window.addEventListener("DOMContentLoaded", () => {
  if (!user) return;
  document.querySelector("#username").value = user.username || "";
  document.querySelector("#firstname").value = user.firstName || "";
  document.querySelector("#lastname").value = user.lastName || "";
  document.querySelector("#mobilenumber").value = user.phone || "";
  document.querySelector("#email").value = user.email || "";
});

// Show reverification button if email is changed
// const emailInput = document.getElementById("email");
// const sendReverificationBtn = document.getElementById("sendReverification");
// let originalEmail = user ? user.email : "";

// emailInput.addEventListener("input", () => {
//   if (emailInput.value.trim() !== originalEmail) {
//     sendReverificationBtn.style.display = "inline-block";
//   } else {
//     sendReverificationBtn.style.display = "none";
//   }
// });

// // Dummy reverification handler (replace with your actual logic)
// sendReverificationBtn.addEventListener("click", () => {
//   sendEmailVerification(user)
//     .then(() => {
//       alert("A reverification email has been sent to " + emailInput.value.trim());
//       sendReverificationBtn.style.display = "none";
//     })
// });

// Update account info in Firebase
document.getElementById("editAccountForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedData = {
    username: document.querySelector("#username").value.trim(),
    firstName: document.querySelector("#firstname").value.trim(),
    lastName: document.querySelector("#lastname").value.trim(),
    phone: document.querySelector("#mobilenumber").value.trim(),
    email: document.querySelector("#email").value.trim()
  };

  // Simple validation
  if (Object.values(updatedData).some(val => !val)) {
    alert("All fields must be filled before updating the account.");
    return;
  }

  try {
    await updateEmail(auth.currentUser, updatedData.email);
    await sendEmailVerification(auth.currentUser);
    const userRef = ref(db, `users/${uid}`);
    await update(userRef, updatedData);

    // Update localStorage for session
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(newUser));

    alert("Account information updated successfully.");
    // Optionally, reload or redirect
  } catch (err) {
    alert("Failed to update account: " + err.message);
  }
});