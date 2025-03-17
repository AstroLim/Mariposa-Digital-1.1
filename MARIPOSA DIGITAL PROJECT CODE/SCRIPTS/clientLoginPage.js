function loginAccount() {
    let loginEmail = document.querySelector('#inputEmail').value.trim();
    let loginPassWord = document.querySelector('#inputPassword').value.trim();

    let registeredUsers = JSON.parse(localStorage.getItem("strRegisteredUsers"));

    if (registeredUsers) {
        for (let i = 0; i < registeredUsers.length; i++) {
            if (registeredUsers[i].email === loginEmail && registeredUsers[i].password === loginPassWord) {
                alert(`Welcome Back ${registeredUsers[i].firstname}`);
                localStorage.setItem("strLoginAccount", JSON.stringify(registeredUsers[i])); 
                window.location.href = "http://127.0.0.1:5500/STRUCTURES/clientHomePage.html";
                return;
            }
        }

        alert(`Invalid Email or Password`); 
    } 

    else {
        alert("No registered users found."); 
    }
}