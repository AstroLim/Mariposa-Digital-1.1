//Intializing the currently login user 
let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

// Making Client Home Page Username Content Dynamic based on whos login
if (accountLogin) { 
    const accountLoginName = `${accountLogin.username}`;
    document.querySelector(".userName").innerHTML = `<p>${accountLoginName}</p>`;
} 

//Logout Function
function logoutClient(){
    localStorage.removeItem("strLoginAccount")
    let accountLogin = ""
    localStorage.setItem("strLoginAccount", accountLogin)
    window.location.replace("../structures/landingPage.html")
}

function updateAccountInfo(){
    let registeredAccounts = JSON.parse(localStorage.getItem("strRegisteredUsers"))
    let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

    if (!registeredAccounts.length) {
        console.error("No registered accounts found.");
        return;
    }

    let userIndex = registeredAccounts.findIndex(acc => acc.email === accountLogin.email);
    let user = registeredAccounts[userIndex];

    let username = document.querySelector("#username")
    let password = document.querySelector("#password")
    let email = document.querySelector("#email")
    let firstname = document.querySelector("#firstname")
    let lastname = document.querySelector("#lastname")
    let mobileNumber = document.querySelector("#mobilenumber")
    let dateOfBirth= document.querySelector("#dateofbirth")
    let sex = document.querySelector("#sex")
    let address = document.querySelector("#address")
    let country = document.querySelector("#country")

    if (
        !username.value.trim() ||
        !password.value.trim() ||
        !email.value.trim() ||
        !firstname.value.trim() ||
        !lastname.value.trim() ||
        !mobileNumber.value.trim() ||
        !dateOfBirth.value ||
        !sex.value ||
        !address.value.trim() ||
        !country.value.trim()
    ) {
        alert("All fields must be filled before updating the account.");
        return;
    }

    else{
        user.username = username.value.trim()
        user.password = password.value.trim()
        user.email = email.value.trim()
        user.firstname = firstname.value.trim()
        user.lastname = lastname.value.trim()
        user.mobilenumber = mobileNumber.value.trim()
        user.dateOfBirth = dateOfBirth.value.trim()
        user.sex = sex.value.trim()
        user.address = address.value.trim()
        user.country = country.value.trim()

        // Save updated registered accounts back to localStorage
        localStorage.setItem("strRegisteredUsers", JSON.stringify(registeredAccounts));

        // Also update the currently logged-in account details in localStorage
        localStorage.setItem("strLoginAccount", JSON.stringify(user));
        alert("Account information updated successfully.");
    }
}

