let courierUser = {
    courierID:1,
    username:"Vincent Lusung",
    password: "12345",
    email: "lusung@gmail.com",
    firstname:"Vincent",
    lastname: "Lusung",
    mobilenumber: "09815643451",
}

let registeredCourierUsers = []
registeredCourierUsers.push(courierUser);
localStorage.setItem("strRegisteredCourierUsers", JSON.stringify(registeredCourierUsers));


function loginAccount() {
    let loginEmail = document.querySelector('#inputEmail').value.trim();
    let loginPassWord = document.querySelector('#inputPassword').value.trim();

    let registeredCourierUsers = JSON.parse(localStorage.getItem("strRegisteredCourierUsers"));

    if (registeredCourierUsers) {
        for (let i = 0; i < registeredCourierUsers.length; i++) {
            if (registeredCourierUsers[i].email === loginEmail && registeredCourierUsers[i].password === loginPassWord) {
                alert(`Welcome Back Sir ${registeredCourierUsers[i].firstname}`);
                localStorage.setItem("strLoginAccount", JSON.stringify(registeredCourierUsers[i])); 
                window.location.href = "http://127.0.0.1:5500/STRUCTURES/courierHomePage.html";
                return;
            }
        }

        alert(`Invalid Email or Password`); 
    } 

    else {
        alert("No courier account found."); 
    }
}