// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, deleteUser  } from "firebase/auth";
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

try {
  const registerButton = document.querySelector('.sec-registerBtn');
  registerButton.addEventListener('click', (e) => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  alert('Registering user...');

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      try {
        sendEmailVerification(user);  
      } catch (e) {
        deleteUser(user).then(() => {
          console.log('User deleted');
        }).catch((error) => {
          console.log(error);
        });
      }
      
      window.localStorage.setItem('emailForSignIn', email);
      console.log(user);
      alert(`Successfully registered user
Please check your email for verification link.`);
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
