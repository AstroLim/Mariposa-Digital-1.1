let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount") || "null"); // Handle null properly

function back() {
    if (!accountLogin || Object.keys(accountLogin).length === 0) { 
        // Checks for null, undefined, or an empty object
        window.location.replace("http://127.0.0.1:5500/STRUCTURES/landingPage.html");
    } else {
        window.location.replace("http://127.0.0.1:5500/STRUCTURES/clientHomePage.html");
    }
}
