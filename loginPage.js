function loginUser(){
    let isUserFound = false;

    let loginEmail = document.querySelector('#inputEmail').value.trim()
    let loginPassWord = document.querySelector('#inputPassword').value.trim()

    const strUsers = JSON.parse(localStorage.getItem("registeredUsers"))

    for(let i = 0; i < strUsers.length; i++){
        if(strUsers[i].email === loginEmail && strUsers[i].password === loginPassWord){
            alert(`Welcome Back ${strUsers[i].firstname}`);
            window.location.replace("http://127.0.0.1:5500/STRUCTURES/clientHomePage.html");
            break
        }

        else{
            alert(`Invalid Email or Password`);
        }
    }
}

