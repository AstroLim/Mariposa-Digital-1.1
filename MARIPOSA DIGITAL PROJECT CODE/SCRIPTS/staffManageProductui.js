// Retrieving the currently logged-in user from localStorage
let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

// Displaying the username dynamically
if (accountLogin) { 
    document.querySelector(".userName").innerHTML = `<p>${accountLogin.username}</p>`;
}

//Sample Data
let pendingOrders = [
    {
        orderId: 1,
        itemName: "Maia Rice",
        buyerEmail: "evan@gmail.com",
        amountDue: 730,
        quantity: 146,
        address: "123 venturanza St, tarlac City, Phillipines"
    },
    {
        orderId: 2,
        itemName: "Bulaklak Rice",
        buyerEmail: "lander@gmail.com",
        amountDue: 350,
        quantity: 1,
        address: "123 venturanza St, tarlac City, Phillipines"
    }
];

localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));

// Retrieving product lists from localStorage or initializing them
let listOfProducts = JSON.parse(localStorage.getItem("strListOfProducts")) || [];
let listofProductsSold = JSON.parse(localStorage.getItem("strListofProductsSold")) || [];
let listofProductsAdded = JSON.parse(localStorage.getItem("strListofProductsAdded")) || [];
let listofCancelledOrders = JSON.parse(localStorage.getItem("strListofCancelledOrders")) || [];
let listofProductsRemoved = JSON.parse(localStorage.getItem("strListofProductsRemoved")) || [];

// Function to update the dashboard data
toggleDashboard();

function toggleDashboard() {
    document.querySelector(".numberOfProducts-sec-bot > div > p").textContent = listOfProducts.length;
    document.querySelector(".numberOfSales-sec-bot > div > p").textContent = listofProductsSold.length;
    document.querySelector(".productsAdded-sec-bot > div > p").textContent = listofProductsAdded.length;
    document.querySelector(".numberOfCanceledOrder-sec-bot > div > p").textContent = listofCancelledOrders.length;
    document.querySelector(".productsRemoved-sec-bot > div > p").textContent = listofProductsRemoved.length;
}

// Function to add a product
function addProduct() {
    let productName = document.querySelector("#productName").value.trim();
    let productPricePerKilo = parseFloat(document.querySelector("#pricePerKilo").value);
    let productDescription = document.querySelector("#productDescription").value.trim();

    if (!productName || isNaN(productPricePerKilo) || !productDescription) {
        alert("Please fill in all product details correctly.");
        return;
    }

    let newProduct = {
        productID: listOfProducts.length + 1,
        name: productName,
        price: productPricePerKilo,
        description: productDescription,
        weight: "",
        quantity: 0
    };

    listOfProducts.push(newProduct);
    localStorage.setItem("strListOfProducts", JSON.stringify(listOfProducts));

    alert("New Product has been added.");
    toggleDashboard();
}


function addProductui(){
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    productManagementBoxSecBot.innerHTML = `<button class="addProductBtn" onclick="addProductui()">Add Product</button>
                                            <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>
                                            <button class="backBtn" onclick="back()">Back</button>`

    rightSec.innerHTML = `  <div class="addProductBox">
                                <header>
                                    <h1>Product Description</h1>
                                </header>

                                <section>
                                    <div class="addProductBox-leftSec">
                                        <label for="">Product Name:</label>
                                        <label for="">Price Per Kilo:</label>
                                        <label for="">Description:</label>
                                        <label for="">Insert Images:</label>
                                    </div>
                                    <div class="addProductBox-rightSec">
                                        <input type="text" class="" id="productName">
                                        <input type="number" class="" id="pricePerKilo">
                                        <input type="text" class="" id="productDescription">
                                        <input type="text" class="" id="productImages">
                                    </div>
                                </section>

                                <footer>
                                    <button class="footerBtn" onclick="addProduct()">Confirm Add Products</button>
                                </footer>
                            </div>`

}

function manageOrder(){
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    productManagementBoxSecBot.innerHTML = `<button class="addProductBtn" onclick="addProductui()">Add Product</button>
                                            <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>
                                            <button class="backBtn" onclick="back()">Back</button>`

    rightSec.innerHTML = `  <div class="manageOrderBox">
                                <header>
                                    <h1>Manage Client Order</h1>
                                </header>

                                <section>
                                    <div class="manageOrderBox-leftSec">
                                        <label for="clientId">Client Email:</label>
                                    </div>

                                    <div class="manageOrderBox-rightSec">
                                        <input type="text" class="clientEmail" id="clientEmail">
                                    </div>
                                </section>

                                <footer>
                                    <button class="viewPendingOrdersBtn" id="viewPendingOrdersBtn" onclick="viewPendingOrders()">View Pending Orders</button>
                                </footer>
                                <main></main>
                            </div>`
}

function viewPendingOrders(){
    let main = document.querySelector('.manageOrderBox > main');
    main.innerHTML = ''; // Clear previous content

    let pendingOrders = JSON.parse(localStorage.getItem("pendingOrders")) || [];

    if (pendingOrders.length === 0) {
        main.innerHTML = '<p>No pending orders.</p>';
        return;
    }

    pendingOrders.forEach(order => {
        let orderDiv = document.createElement('div');
        orderDiv.innerHTML = `
            <header>
                ${order.itemName}
            </header>
            <section>
                <p>Buyer: ${order.buyerEmail}</p>
                <p>Amount Due: ${order.amountDue}</p>
                <p>Quantity: ${order.quantity}</p>
                <p>Address: ${order.address}</p>
            </section>
            <button class="removePendingOrder" onclick="removePendingOrder(${order.orderId})">Remove Pending Order</button>
        `;
        main.appendChild(orderDiv);
    });
}

function removePendingOrder(orderId) {
    let pendingOrders = JSON.parse(localStorage.getItem("pendingOrders")) || [];
    let updatedOrders = pendingOrders.filter(order => order.orderId !== orderId);

    if (updatedOrders.length === pendingOrders.length) {
        alert("Order not found.");
        return;
    }

    localStorage.setItem("pendingOrders", JSON.stringify(updatedOrders));
    alert("Pending order removed.");
    viewPendingOrders(); // Refresh the list
}


function back(){
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    productManagementBoxSecBot.innerHTML = `<button class="addProductBtn" onclick="addProductui()">Add Product</button>
                                            <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>`

    rightSec.innerHTML = `  <div class="right-sec-topContent">
                                <div class="numberOfProducts-container">
                                        <div class="numberOfProducts-sec-top">
                                            <h1>Number Of Products</h1>
                                        </div>
                    
                                        <div class="numberOfProducts-sec-bot">
                                            <div class="statContainer"><h1 class="statLabel">Total:</h1><p class="stat">100</p></div>
                                        </div>
                                    </div>

                                    <div class="numberOfSales-container">
                                        <div class="numberOfSales-sec-top">
                                            <h1>Products Sold:</h1>
                                        </div>
                    
                                        <div class="numberOfSales-sec-bot">
                                            <div class="statContainer"><h1 class="statLabel">Products Sold:</h1><p class="stat">100</p></div>
                                        </div>
                                    </div>
                                </div>

                                <div class="right-sec-botContent">
                                    <div class="productsAdded-container">
                                        <div class="productsAdded-sec-top">
                                            <h1>Products Added</h1>
                                        </div>
                    
                                        <div class="productsAdded-sec-bot">
                                            <div class="statContainer"><h1 class="statLabel">Added Products:</h1><p class="stat">100</p></div>
                                        </div>
                                    </div>

                                    <div class="numberOfCanceledOrder-container">
                                        <div class="numberOfCanceledOrder-sec-top">
                                            <h1>Cancelled Orders</h1>
                                        </div>
                    
                                        <div class="numberOfCanceledOrder-sec-bot">
                                            <div class="statContainer"><h1 class="statLabel">Cancelled Orders:</h1><p class="stat">100</p></div>
                                        </div>
                                    </div>

                                    <div class="productsRemoved-container">
                                        <div class="productsRemoved-sec-top">
                                            <h1>Products Removed</h1>
                                        </div>
                    
                                        <div class="productsRemoved-sec-bot">
                                            <div class="statContainer"><h1 class="statLabel">Removed Products:</h1><p class="stat">100</p></div>
                                    </div>
                                </div>
                            </div>`

    toggleDashboard();
}


