//Intializing the currently login user 
let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));


// Making Client Home Page Username Content Dynamic based on whos login
if (accountLogin) { 
    const accountLoginName = `${accountLogin.username}`;
    document.querySelector(".userName").innerHTML = `<p>${accountLoginName}</p>`;
} 

//Gets the list of registered clients
let registeredUsers = JSON.parse(localStorage.getItem("strRegisteredUsers")) || [];

//find who is currently login 
for(let i=0; i<registeredUsers.length; i++){
    if(registeredUsers[i].email === accountLogin.email){
        var clientCart = registeredUsers[i].clientCart
        var clientCheckoutProducts = registeredUsers[i].checkoutProducts
        break
    }
}


//Function that load products inside cart of user login
function loadClientCart() {
    let section = document.querySelector(".MainSection-mainCont");

    //Prevents Content Duplication 
    section.innerHTML = "";

    if (clientCart.length === 0) {
        section.innerHTML = `<p>Your cart is empty.</p>`;
        return;
    }

    for (let i = 0; i < clientCart.length; i++) {
        section.innerHTML += `<div class="lot-box">
                                    <img src="${clientCart[i].image || 'default-image.jpg'}" alt="${clientCart[i].name}">
                                    <h3>${clientCart[i].name}</h3>
                                    <p>Description: ${clientCart[i].description}</p>
                                    <p>Price: ₱${clientCart[i].pricePerKilo}</p>
                                    <div style="display: flex; gap: 20px;">
                                        <label>
                                            <p>Weight: ${clientCart[i].weight}kg</p>
                                        </label>
                                        <label>
                                            <p>Quantity: ${clientCart[i].quantity}</p>
                                        </label>
                                    </div>
                                    <div class="button-container">
                                        <button class="checkOutProductBTN" data-index="${i}">Check Out</button>
                                        <button class="removeFromCartBTN" data-index="${i}">Remove</button>
                                    </div>
                                </div>`;
    }

    // Add event listeners for the dynamically created buttons
    document.querySelectorAll(".removeFromCartBTN").forEach((button) => {
        button.addEventListener("click", removeFromCart);
    });

    document.querySelectorAll(".checkOutProductBTN").forEach((button) => {
        button.addEventListener("click", checkoutProduct);
    });
}


// Function to remove an item from the cart
function removeFromCart(event) {
    let index = event.target.getAttribute("data-index");
    clientCart.splice(index, 1);

    // Update local storage
    for (let i = 0; i < registeredUsers.length; i++) {
        if (registeredUsers[i].email === accountLogin.email) {
            registeredUsers[i].clientCart = clientCart;
            localStorage.setItem("strRegisteredUsers", JSON.stringify(registeredUsers));
            break;
        }
    }

    loadClientCart(); // Reload the cart
}

// Function to check out a product
function checkoutProduct(event) {
    let index = event.target.getAttribute("data-index");
    let productToCheckout = clientCart.splice(index, 1)[0]; 

    // Update local storage with modified cart and checkout products
    for (let i = 0; i < registeredUsers.length; i++) {
        if (registeredUsers[i].email === accountLogin.email) {

            registeredUsers[i].clientCart = clientCart;
            registeredUsers[i].checkoutProducts.push(productToCheckout);

            alert(`${productToCheckout.name} is ready for checkout.`);

            localStorage.setItem("strRegisteredUsers", JSON.stringify(registeredUsers));
            break;
        }


    }


    // Reload the cart UI
    loadClientCart();
}

// Load the cart when the page loads
loadClientCart();
