let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

// Making Client Home Page Username Content Dynamic based on whos login
if (accountLogin) { 
    const accountLoginName = `${accountLogin.username}`;
    document.querySelector(".userName").innerHTML = `<p>${accountLoginName}</p>`;
}

let storedProducts = JSON.parse(localStorage.getItem("strListOfProducts"))

if(!storedProducts){
    alert("No Lots Available, Add new Lots")
}

// Function to compute rice price
function computeRicePrice(pricePerKilo, weight, quantity) {
    return (pricePerKilo * weight) * quantity;
}

// Loads the currently available rice products for sale
function loadProducts() {
    const productSection = document.querySelector(".MainSection-mainCont");
    let listOfProducts = JSON.parse(localStorage.getItem("strListOfProducts"));

    listOfProducts.forEach((product, index) => {
        productSection.innerHTML += `
                                        <div class="lot-box">
                                            <img src="lot1.jpg" alt="Lot Image">
                                            <h3>${product.name}</h3>
                                            <p>${product.description}</p>
                                            <p id="price-${index}">Price: ₱0.00</p>

                                            <label for="weight-${index}">Weight:</label>
                                            <select id="weight-${index}" class="weight-selector">
                                                <option value="5">5 kg</option>
                                                <option value="10">10 kg</option>
                                                <option value="25">25 kg</option>
                                                <option value="50">50 kg</option>
                                            </select>

                                            <label for="quantity-${index}">Quantity:</label>
                                            <input type="number" id="quantity-${index}" class="quantity-input" min="1" value="1">

                                            <button class="addToCartBTN" data-index="${index}">Add to Cart</button>
                                        </div>
                                    `;
    });

// Attach event listeners after the elements are created
    listOfProducts.forEach((product, index) => {
        let weightSelect = document.querySelector(`#weight-${index}`);
        let quantityInput = document.querySelector(`#quantity-${index}`);
        let priceDisplay = document.querySelector(`#price-${index}`);

        function updatePrice() {
            let weight = weightSelect.value;
            let quantity = quantityInput.value;
            let totalPrice = computeRicePrice(product.pricePerKilo, weight, quantity);
            priceDisplay.innerHTML = `Price: ₱${totalPrice.toFixed(2)}`;
        }

        weightSelect.addEventListener("change", updatePrice);
        quantityInput.addEventListener("input", updatePrice);

        // Initialize price display
        updatePrice();
    });

    document.querySelectorAll(".addToCartBTN").forEach((button) => {
        button.addEventListener("click", function () {
            let index = this.getAttribute("data-index");
            let selectedProduct = listOfProducts[index];

            let weight = document.querySelector(`#weight-${index}`).value;
            let quantity = document.querySelector(`#quantity-${index}`).value;

            addToCart(selectedProduct, weight, quantity);
        });
    });
}

// Calling loadProducts() function
loadProducts();

//Add to Cart Function
function addToCart(product,weight, quantity){
    let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));
    let registeredUsers = JSON.parse(localStorage.getItem("strRegisteredUsers"));

    if (!accountLogin) {
        alert("Please log in to add items to your cart.");
        return;
    }

    for(let i = 0; i<registeredUsers.length; i++){
        if(accountLogin.email === registeredUsers[i].email){
            product.weight = weight
            product.quantity = quantity
            registeredUsers[i].clientCart.push(product)
            break
        }
    }
    
    localStorage.setItem("strRegisteredUsers", JSON.stringify(registeredUsers));
    alert(`${product.name} (${weight}kg x ${quantity}) has been added to your cart`);
}

