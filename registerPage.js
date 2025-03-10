let users = []

function registerUser(){
    let userName = document.querySelector('#username')
    let passWord = document.querySelector('#password')
    let email = document.querySelector('#email')
    let firstName = document.querySelector('#fName')
    let lastName = document.querySelector('#lName')
    let mobNumber = document.querySelector('#mobNumber')

    let newUser = new Object();

    newUser.username = userName.value
    newUser.password = passWord.value
    newUser.email = email.value
    newUser.firstname = firstName.value
    newUser.lastname = lastName.value
    newUser.mobilenumber = mobNumber.value

    users.push(newUser)

    let strUsers = JSON.stringify(users)
    localStorage.setItem("registeredUsers", strUsers)
}

