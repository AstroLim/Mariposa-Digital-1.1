// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, deleteUser  } from "firebase/auth";
import { getDatabase, onValue , ref, set } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

try {
  const registerButton = document.querySelector('.sec-registerBtn');
  registerButton.addEventListener('click', (e) => {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;
    const phone = document.getElementById('mobNumber').value;

    if (!username || !email || !password || !firstName || !lastName || !phone) {
      alert('Please enter all fields.');
      return;
    }

    alert('Registering user...');

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        try {
          sendEmailVerification(user); 
          const date = new Date(Date.now())
          set(ref(db, 'users/' + user.uid), {
            username: username,
            email: email,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            registrationTimestamp: date.toUTCString(),
            accessLevel: 'user'
          }); 
          let newUser = new Object();
          let listOfContractSigningDates = []
    localStorage.setItem("strListOfContractSigningDates", JSON.stringify(listOfContractSigningDates));
          newUser.username = username.value;
          newUser.password = password.value;
          newUser.email = email.value;
          newUser.firstname = firstName.value;
          newUser.lastname = lastName.value;
          newUser.mobilenumber = phone.value;
          newUser.clientCart = [];
          newUser.reservedLots = [];
          newUser.checkoutProducts = [];
          newUser.lotContractSigningDates = [];
          newUser.pendingOrders = [];

          let registeredUsers = JSON.parse(localStorage.getItem("strRegisteredUsers"));

          if (!registeredUsers) {
              registeredUsers = [];
          }
          registeredUsers.push(newUser);
        } catch (e) {
          deleteUser(user).then(() => {
            console.log('User deleted');
          }).catch((error) => {
            console.log(error);
          });
          alert('Error registering user. Please try again.');
          return
        }
        
        console.log(user);
        alert(`Successfully registered user
  Please check your email for verification link.`);
        document.querySelectorAll('.registerBox-main input').forEach(input => {
          if (input.classList.contains('registerBox-main--invalid')) {
            input.classList.remove('registerBox-main--invalid');
          }
        })
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        let registerMessage = document.getElementById('register-message');
        registerMessage.innerText = errorMessage.replace('Firebase:', '');
        registerMessage.style.display = 'block';
        document.querySelectorAll('.registerBox-main input').forEach(input => {
          if (!input.classList.contains('registerBox-main--invalid')) {
            input.classList.add('registerBox-main--invalid');
          }
        })

      });
  }); 
} catch (error) {};


try {
  const loginButton = document.querySelector('.loginBtn');
    loginButton.addEventListener('click', (e) => {
    const email = document.getElementById('inputEmail').value;
    const password = document.getElementById('inputPassword').value;



    alert('Logging in...');

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        if (user.emailVerified) {
          alert('Login successful!');
          let registeredUsers = JSON.parse(localStorage.getItem("strRegisteredUsers"));
          onValue(ref(db, 'users/' + user.uid), (snapshot) => {
            const data = snapshot.val();
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('uid', user.uid);

            // Use this to access user data to other pages
            // const user = JSON.parse(localStorage.getItem('user'));
            // const uid = localStorage.getItem('uid');
            

            directPage(data.accessLevel);
          }, {
            onlyOnce: true
          });
          // window.location.href = 'clientHomePage.html';
        } else {
          alert('Please verify your email address before logging in.');
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        const loginMessage = document.getElementById('login-message');
        loginMessage.innerText = errorMessage.replace('Firebase:', '');
        loginMessage.style.display = 'block';
        document.querySelectorAll('main div input').forEach(input => {
          if (!input.classList.contains('loginBox-main--invalid')) {
            input.classList.add('loginBox-main--invalid');
          }
        })
      });
  });
} catch (error) {};

const directPage = (accessLevel) => {
  if (accessLevel === 'admin') {
    window.location.href = 'ma-home-page.html';
  } else if (accessLevel === 'staff') {
    window.location.href = 'staffHomePage.html';
  } else if (accessLevel === 'courier') {
    window.location.href = 'courierHomePage.html';
  } else if (accessLevel === 'user') {
    window.location.href = 'clientHomePage.html';
  } else {
    alert('Invalid access level. Please contact the administrator.');
  }
}
