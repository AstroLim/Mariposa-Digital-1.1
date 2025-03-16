// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, updatePassword, updateEmail} from "firebase/auth";
import { getDatabase, update, ref} from "firebase/database";
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

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');

if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel !== 'admin') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}

document.querySelector('.nav-user-container div').textContent = `${user.lastName}, ${user.firstName}`;

document.querySelector('.input-show').addEventListener('click', () => {
  document.querySelector('.input-password').type = document.querySelector('.input-password').type === 'password' ? 'text' : 'password';
});
document.querySelector('.input-username').placeholder = user.username;
document.querySelector('.input-email').placeholder = user.email;
document.querySelector('.input-firstName').placeholder = user.firstName;
document.querySelector('.input-lastName').placeholder = user.lastName;
document.querySelector('.input-phone').placeholder = user.phone;

document.querySelector('.sidebar-logout').addEventListener('click', () => {
  signOut(auth).then(() => {
    alert('You are now logged out.');
    localStorage.removeItem('user');
    localStorage.removeItem('uid');
    window.location.href = 'landingPage.html';
  }).catch((error) => {
    console.error(error);
    alert(`An error occurred while logging out. Please try again.`);
  });
});

document.querySelectorAll('.input-submit').forEach((input) => {
  input.addEventListener('click', () => {
    const header = input.closest('.settings-mainview-content-container').querySelector('h4');
    const headerText = header.textContent;
    console.log(`Header: ${headerText}`);
    handleSubmit(headerText);
  });

  const handleSubmit = (headerText) => {
    if (headerText === 'Username') {
      update(ref(db, 'users/' + uid), {
        username: document.querySelector('.input-username').value
      }).then(() => {
        alert(`Successfully changed your username to ${document.querySelector('.input-username').value}`);
      }).catch((error) => {
        console.error(error);
        alert('An error occurred while submitting the form. Please try again');
      });
    } else if (headerText === 'Email') {
      updateEmail(auth.currentUser, document.querySelector('.input-email').value).then(() => {
        update(ref(db, 'users/' + uid), {
          email: document.querySelector('.input-email').value
        }).then(() => {
          alert(`Successfully changed your ${headerText} to ${document.querySelector('.input-email').value}`);
        }).catch((error) => {
          console.error(error);
          update(ref(db, 'users/' + uid), {
            email: user.email
          })
          alert('An error occurred while submitting the form. Please try again');
        });
      }
      ).catch((error) => {
        console.error(error);
        alert(error.replace('Firebase: ', ''));
      });
    } else if (headerText === 'Password') {
      if (document.querySelector('.input-password').value.length < 6) {
        alert('Please enter a new password with at least 6 characters.');
        return;
      } else {
        showModal();  
      }
    } else if (headerText === 'First Name') {
      update(ref(db, 'users/' + uid), {
        firstName: document.querySelector('.input-firstName').value
      }).then(() => {
        alert(`Successfully changed your ${headerText} to ${document.querySelector('.input-firstName').value}`);
      }).catch((error) => {
        console.error(error);
        alert('An error occurred while submitting the form. Please try again');
      });
    } else if (headerText === 'Last Name') {
      update(ref(db, 'users/' + uid), {
        lastName: document.querySelector('.input-lastName').value
      }).then(() => {
        alert(`Successfully changed your ${headerText} to ${document.querySelector('.input-username').value}`);
      }).catch((error) => {
        console.error(error);
        alert('An error occurred while submitting the form. Please try again');
      });
    } else if (headerText === 'Phone Number') {
      update(ref(db, 'users/' + uid), {
        phone: document.querySelector('.input-phone').value
      }).then(() => {
        alert(`Successfully changed your ${headerText} to ${document.querySelector('.input-phone').value}`);
      }).catch((error) => {
        console.error(error);
        alert('An error occurred while submitting the form. Please try again');
      });
    } else if (headerText === 'Profile Picture') {
      // TODO: Profile Picture
    } else {
      alert('An error occurred while submitting the form. Please try again.');
    }
  }

  const showModal = () => {
    const modal = document.getElementById('passwordModal');
    modal.style.display = 'block';

    const cancelButton = document.getElementById('cancelButton');
    const submitButton = document.getElementById('submitButton');

    cancelButton.onclick = function() {
      modal.style.display = 'none';
    }

    submitButton.onclick = function() {
      const newPassword = document.querySelector('.input-password').value;
      const verifyPassword = document.getElementById('passwordInput').value;

      signInWithEmailAndPassword(auth, user.email, verifyPassword).then(() => {
        alert('Password successfully verified!');
        updatePassword(auth.currentUser, newPassword).then(() => {
          alert('Password successfully updated!');
          modal.style.display = 'none';
        }).catch((error) => {
          console.error(error);
          alert(error.replace('Firebase: ', ''));
        });
      }).catch((error) => {
        console.error(error);
        alert(error.message.replace('Firebase: ', ''));
        return;
      });
    }
  }
});