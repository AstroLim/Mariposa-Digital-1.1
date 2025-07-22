// Password toggle functionality
function togglePassword() {
    const passwordInput = document.querySelector('#inputPassword');
    const hideIcon = document.querySelector('.hide-icon');
    const showIcon = document.querySelector('.show-icon');
    
    if (passwordInput.type === 'password') {
        // Show password
        passwordInput.type = 'text';
        hideIcon.style.display = 'none';
        showIcon.style.display = 'inline';
    } else {
        // Hide password
        passwordInput.type = 'password';
        hideIcon.style.display = 'inline';
        showIcon.style.display = 'none';
    }
}

// Add event listener when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.querySelector('#passwordToggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', togglePassword);
    }
});

function loginAccount(){
    let loginEmail = document.querySelector('#inputEmail').value.trim();
    let loginPassWord = document.querySelector('#inputPassword').value.trim();

    if(loginEmail[0] == "c"){
        const CourierUsers = JSON.parse(localStorage.getItem("strCourierUsers"))

        for(let i = 0; i < CourierUsers.length; i++){
            if(CourierUsers[i].email === loginEmail && CourierUsers[i].password == loginPassWord){
                alert(`Welcome Back ${CourierUsers[i].firstname}`);
                window.location.replace("http://127.0.0.1:5500/STRUCTURES/courierHomePage.html");
                break;
            }

            else{
                alert(`Invalid Email or Password`);
            }
            
        }
    }

    else if(loginEmail[0] == "s"){
        const StaffUsers = JSON.parse(localStorage.getItem("strStaffUsers"))

        for(let i = 0; i < StaffUsers.length; i++){
            if(StaffUsers[i].email === loginEmail && StaffUsers[i].password == loginPassWord){
                alert(`Welcome Back ${StaffUsers[i].firstname}`);
                window.location.replace("http://127.0.0.1:5500/STRUCTURES/staffHomePage.html");
                break
            }

            else{
                alert(`Invalid Email or Password`);
            }
        }
    }

    else if(loginEmail[0] == "m"){
        const MainAdminUsers = JSON.parse(localStorage.getItem("strMainAdminUsers"))

        for(let i = 0; i < MainAdminUsers.length; i++){
            if(MainAdminUsers[i].email === loginEmail && MainAdminUsers[i].password == loginPassWord){
                alert(`Welcome Back ${MainAdminUsers[i].firstname}`);
                window.location.replace("http://127.0.0.1:5500/STRUCTURES/ma-home-page.html");
                break
            }

            else{
                alert(`Invalid Email or Password`);
            }
        }
    }

    else{
        const Users = JSON.parse(localStorage.getItem("strUsers"))

         for(let i = 0; i < Users.length; i++){
            if(Users[i].email === loginEmail && Users[i].password == loginPassWord){
                alert(`Welcome Back ${Users[i].firstname}`);
                window.location.replace("http://127.0.0.1:5500/STRUCTURES/clientHomePage.html");
                 break
             }

             else{
                 alert(`Invalid Email or Password`);
             }
         } 
     }

}