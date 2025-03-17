//Intializing the currently login user 
let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));


// Making Client Home Page Username Content Dynamic based on whos login
if (accountLogin) { 
    const accountLoginName = `${accountLogin.username}`;
    document.querySelector(".userName").innerHTML = `<p>${accountLoginName}</p>`;
} 

