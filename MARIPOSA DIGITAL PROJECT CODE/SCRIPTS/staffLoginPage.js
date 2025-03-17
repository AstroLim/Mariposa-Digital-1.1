let staffUser = {
    courierID:1,
    username:"Aaron Celles",
    password: "12345",
    email: "celles@gmail.com",
    firstname:"Aaron",
    lastname: "Celles",
    mobilenumber: "01896445342",
}

let registeredStaffUsers = []
registeredStaffUsers.push(staffUser);
localStorage.setItem("strRegisteredStaffUser", JSON.stringify(registeredStaffUsers));

function loginAccount() {
    let loginEmail = document.querySelector('#inputEmail').value.trim();
    let loginPassWord = document.querySelector('#inputPassword').value.trim();

    let registeredStaffUsers = JSON.parse(localStorage.getItem("strRegisteredStaffUser"));

    if (registeredStaffUsers) {
        for (let i = 0; i < registeredStaffUsers.length; i++) {
            if (registeredStaffUsers [i].email === loginEmail && registeredStaffUsers [i].password === loginPassWord) {
                alert(`Welcome Back Sir ${registeredStaffUsers[i].firstname}`);
                localStorage.setItem("strLoginAccount", JSON.stringify(registeredStaffUsers[i])); 
                window.location.href = "http://127.0.0.1:5500/STRUCTURES/staffHomePage.html";
                return;
            }
        }

        alert(`Invalid Email or Password`); 
    } 

    else {
        alert("No staff account found."); 
    }
}
