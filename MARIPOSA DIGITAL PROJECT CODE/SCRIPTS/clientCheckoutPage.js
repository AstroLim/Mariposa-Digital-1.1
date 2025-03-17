// Initializing the currently logged-in user 
let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

// Making Client Home Page Username Content Dynamic based on who's logged in
if (accountLogin) { 
    document.querySelector(".userName").innerHTML = `<p>${accountLogin.username}</p>`;
}

// Gets the list of registered clients
let registeredUsers = JSON.parse(localStorage.getItem("strRegisteredUsers"));

// Find who is currently logged in 
for (let i = 0; i < registeredUsers.length; i++) {
    if (registeredUsers[i].email === accountLogin.email) {
        var clientCheckoutProducts = registeredUsers[i].checkoutProducts;
        var clientCart = registeredUsers[i].clientCart;
        break;
    }
}

// Function that loads products inside the checkout page of the logged-in user
function loadCheckoutProducts() {
    let section = document.querySelector(".mainCont-rightSec");

    // Prevents content duplication
    section.innerHTML = "";

    if (!clientCheckoutProducts || clientCheckoutProducts.length === 0) {
        section.innerHTML = `<p>You have no product to checkout</p>`;
        return;
    }

    for (let i = 0; i < clientCheckoutProducts.length; i++) {
        section.innerHTML += `
            <div class="lot-box">
                <img src="../RESOURCES/imgFiles/lot1.jpg" alt="Rice 1">
                <h3>${clientCheckoutProducts[i].name}</h3>

                <div class="lot-container">
                    <div class="description">
                        <p><strong>Description:</strong> ${clientCheckoutProducts[i].description}</p>
                    </div>
                
                    <div class="details">
                        <p><strong>Price:</strong> ${(clientCheckoutProducts[i].pricePerKilo*clientCheckoutProducts[i].weight)*clientCheckoutProducts[i].quantity}</p>
                        <p><strong>Weight:</strong> ${clientCheckoutProducts[i].weight}</p>
                        <p><strong>Quantity:</strong> ${clientCheckoutProducts[i].quantity}</p>
                    </div>
                </div>

                <div class="button-container">
                    <button class="removeToCheckout" data-index="${i}">Remove from Checkout</button>
                </div>
            </div>`;
    }

    // Add event listeners for dynamically created buttons
    document.querySelectorAll(".removeToCheckout").forEach((button) => {
        button.addEventListener("click", removeToCheckout);
    });
}

// Function to remove an item from checkout
function removeToCheckout(event) {
    let index = parseInt(event.target.getAttribute("data-index"));
    let productName = clientCheckoutProducts[index].name; 

    if (productName) {
        clientCart.push(clientCheckoutProducts[index]);
        clientCheckoutProducts.splice(index, 1); 

        // Update local storage
        for (let i = 0; i < registeredUsers.length; i++) {
            if (registeredUsers[i].email === accountLogin.email) {
                    registeredUsers[i].checkoutProducts = clientCheckoutProducts;
                    registeredUsers[i].clientCart = clientCart;
                    localStorage.setItem("strRegisteredUsers", JSON.stringify(registeredUsers));
                    break;
            }
        }

        alert(`${productName} removed from checkout.`);
    } 
    
    else {
        alert("Error: Unable to remove from checkout.");
    }

    loadCheckoutProducts(); // Reload the checkout products
}

// Load the checkout products on page load
loadCheckoutProducts();
