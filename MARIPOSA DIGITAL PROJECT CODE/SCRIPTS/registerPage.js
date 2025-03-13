let Users = []
let CourierUsers = []
let StaffUsers = []
let MainAdminUsers = []

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
    
    //Build In Accounts
    const courierTestAcc = {
        email: "courierTestAcc@mariposaCourier.com",
        password:12345,
        firstName: "Vincent"
    }

    const staffTestAcc = {
        email: "staffTestAcc@mariposaStaff.com",
        password:12345,
        firstName: "Aaron"
    }

    const mainAdminTestAcc = {
        email: "mainAdminTestAcc@mariposaMainAdmin.com",
        password:12345,
        firstName: "Lander"
    }

    Users.push(newUser)
    CourierUsers.push(courierTestAcc)
    StaffUsers.push(staffTestAcc)
    MainAdminUsers.push(mainAdminTestAcc)

    let strClientUsers = JSON.stringify(Users)
    localStorage.setItem("strUsers", strClientUsers)

    let strCourierUsers = JSON.stringify(CourierUsers)
    localStorage.setItem("strCourierUsers", strCourierUsers)

    let strStaffUsers = JSON.stringify(StaffUsers)
    localStorage.setItem("strStaffUsers", strStaffUsers)

    let strMainAdminUsers = JSON.stringify(MainAdminUsers)
    localStorage.setItem("strMainAdminUsers", strMainAdminUsers)
}


function remItem(){
    localStorage.removeItem("")
}


