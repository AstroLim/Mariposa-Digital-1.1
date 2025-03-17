// Initializing the currently logged-in user
let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

// Making Client Home Page Username Content Dynamic based on who's logged in
if (accountLogin) {
    const accountLoginName = `${accountLogin.username}`;
    document.querySelector(".userName").innerHTML = `<p>${accountLoginName}</p>`;
}

// Logout Function
function logoutClient() {
    localStorage.removeItem("strLoginAccount");
    let accountLogin = "";
    localStorage.setItem("strLoginAccount", accountLogin);
    window.location.replace("http://127.0.0.1:5500/STRUCTURES/landingPage.html");
}

function updateAccountInfo() {
    let registeredCourierAccounts = JSON.parse(localStorage.getItem("strRegisteredCourierUsers"));
    let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

    if (!registeredCourierAccounts || !registeredCourierAccounts.length) {
        console.error("No registered accounts found.");
        return;
    }

    let userIndex = registeredCourierAccounts.findIndex(acc => acc.email === accountLogin.email);
    if (userIndex === -1) {
        console.error("User not found in registered accounts.");
        return;
    }
    let user = registeredCourierAccounts[userIndex];

    let username = document.querySelector("#username");
    let password = document.querySelector("#password");
    let email = document.querySelector("#email");
    let firstname = document.querySelector("#firstname");
    let lastname = document.querySelector("#lastname");
    let mobileNumber = document.querySelector("#mobilenumber");

    if (
        !username.value.trim() ||
        !password.value.trim() ||
        !email.value.trim() ||
        !firstname.value.trim() ||
        !lastname.value.trim() ||
        !mobileNumber.value.trim()
    ) {
        alert("All fields must be filled before updating the account.");
        return;
    } else {
        user.username = username.value.trim();
        user.password = password.value.trim();
        user.email = email.value.trim();
        user.firstname = firstname.value.trim();
        user.lastname = lastname.value.trim();
        user.mobilenumber = mobileNumber.value.trim();

        // Save updated registered accounts back to localStorage
        localStorage.setItem("strRegisteredCourierUsers", JSON.stringify(registeredCourierAccounts));

        // Also update the currently logged-in account details in localStorage
        localStorage.setItem("strLoginAccount", JSON.stringify(user));
        alert("Account information updated successfully.");
    }
}

// Function to display pending orders
function displayPendingOrders() {
    let pendingOrders = [];
    try {
        pendingOrders = JSON.parse(localStorage.getItem("pendingOrders")) || [];
    } catch (error) {
        console.error("Error parsing pending orders:", error);
        return;
    }

    const section = document.querySelector(".MainSection-Row");
    section.innerHTML = ""; // Clear existing content

    document.getElementById("orderCount").textContent = `Number of Orders: ${pendingOrders.length}`;

    if (!pendingOrders.length) {
        section.innerHTML = "<p>No pending orders.</p>";
        return;
    }

    pendingOrders.forEach(order => {
        const orderContainer = document.createElement("div");
        orderContainer.classList.add("order-container");

        orderContainer.innerHTML = `<div class="order-sec-top">
            <h1>${order.itemName}</h1>
        </div>
        <div class="order-sec-bot">
            <p class="order-sec-bot-btn" onclick="toggleAddress(${order.orderId})">View Address ${order.address}</p>
            <div>
                <label for="pickUp-${order.orderId}">Pick-Up</label>
                <input type="radio" id="pickUp-${order.orderId}" name="orderStatus-${order.orderId}" value="Pick-Up" ${order.status === 'Pick-Up' ? 'checked' : ''}>
                <label for="otw-${order.orderId}">On The Way</label>
                <input type="radio" id="otw-${order.orderId}" name="orderStatus-${order.orderId}" value="On The Way" ${order.status === 'On The Way' ? 'checked' : ''}>
                <label for="delivered-${order.orderId}">Delivered</label>
                <input type="radio" id="delivered-${order.orderId}" name="orderStatus-${order.orderId}" value="Delivered" ${order.status === 'Delivered' ? 'checked' : ''}>
            </div>
        </div>`;

        section.appendChild(orderContainer);

        // Add event listeners for status change
        document.querySelectorAll(`input[name="orderStatus-${order.orderId}"]`).forEach(input => {
            input.addEventListener('change', (event) => updateOrderStatus(order.orderId, event.target.value));
        });
    });
}

// Function to toggle the display of the address
function toggleAddress(orderId) {
    const addressDiv = document.getElementById(`address-${orderId}`);
    if (addressDiv) {
        addressDiv.style.display = addressDiv.style.display === 'none' ? 'block' : 'none';
    }
}

// Function to update the status of an order
function updateOrderStatus(orderId, newStatus) {
    // Retrieve pending orders from localStorage
    let pendingOrders = JSON.parse(localStorage.getItem("pendingOrders")) || [];

    // Find the order by orderId
    const orderIndex = pendingOrders.findIndex(order => order.orderId === orderId);
    if (orderIndex !== -1) {
        // Update the status of the found order
        pendingOrders[orderIndex].status = newStatus;

        // Save the updated orders back to localStorage
        localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));

        // Optionally, provide feedback to the user
        alert(`Order ${orderId} status updated to ${newStatus}.`);
    } else {
        console.error(`Order with ID ${orderId} not found.`);
    }S
}

// Call displayPendingOrders on page load
displayPendingOrders();

// Example usage of updateAccountInfo (assuming it's called from a button click or similar)
// document.getElementById('updateButton').addEventListener('click', updateAccountInfo);