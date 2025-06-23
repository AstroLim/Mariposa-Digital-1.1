// Initialize Firebase
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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');

// Redirect if not logged in or not a courier
if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'courier') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}
  
// Update UI with username
if (user.username && document.querySelector(".userName")) {
  document.querySelector(".userName").textContent = user.username;
}

// Logout function
function logoutClient() {
  localStorage.removeItem("user");
  localStorage.removeItem("uid");
  window.location.replace("landingPage.html");
}
window.logoutClient = logoutClient;

// Prefill form with current user data
window.addEventListener("DOMContentLoaded", () => {
  if (!user) return;
  const fields = {
    '#username': user.username,
    '#firstname': user.firstName, 
    '#lastname': user.lastName,
    '#mobilenumber': user.phone,
    '#email': user.email
  };
  
  Object.entries(fields).forEach(([selector, value]) => {
    if (value) document.querySelector(selector).value = value;
  });
});

// Update existing user in Firebase
function updateAccountInfo() {
  const updatedData = {
    username: document.querySelector("#username").value.trim(),
    firstName: document.querySelector("#firstname").value.trim(),
    lastName: document.querySelector("#lastname").value.trim(),
    phone: document.querySelector("#mobilenumber").value.trim(),
    email: document.querySelector("#email").value.trim(),
    accessLevel: 'courier' // Maintain user type
  };

  // Validation
  if (Object.values(updatedData).some(val => !val && val !== '')) {
    alert("Required fields cannot be empty");
    return;
  }

  const userRef = firebase.database().ref(`users/${uid}`);
  const authUser = auth.currentUser;
  const newPassword = document.querySelector("#password").value.trim();

  // Transaction ensures we update properly
  userRef.transaction(currentData => {
    if (currentData) {
      return { ...currentData, ...updatedData };
    }
    return currentData; // Don't create if doesn't exist
  })
  .then(() => {
    const updates = [];
    
    // Update email if changed
    if (updatedData.email !== user.email) {
      updates.push(authUser.updateEmail(updatedData.email));
    }
    
    // Update password if changed
    if (newPassword) {
      updates.push(authUser.updatePassword(newPassword));
    }
    
    return Promise.all(updates);
  })
  .then(() => {
    // Update local storage
    localStorage.setItem('user', JSON.stringify({...user, ...updatedData}));
    alert('Account updated successfully!');
  })
  .catch(error => {
    console.error("Update failed:", error);
    alert('Update failed: ' + error.message);
  });
}
window.updateAccountInfo = updateAccountInfo;
