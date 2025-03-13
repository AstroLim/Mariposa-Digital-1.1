/* Manage Product Functionalities */
function addProductui(){
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    productManagementBoxSecBot.innerHTML = `<button class="addProductBtn" onclick="addProductui()">Add Product</button>
                                            <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>
                                            <button class="viewPaymentHistoryBtn">View Payment History</button>
                                            <button class="backBtn" onclick="back()">Back</button>`

    rightSec.innerHTML = `  <div class="addProductBox">
                                <header>
                                    <h1>Product Description</h1>
                                </header>

                                <section>
                                    <div class="addProductBox-leftSec">
                                        <label for="">Product Name:</label>
                                        <label for="">Price:</label>
                                        <label for="">Description:</label>
                                        <label for="">Insert Images:</label>
                                    </div>
                                    <div class="addProductBox-rightSec">
                                        <input type="text" class="" id="productName">
                                        <input type="text" class="" id="pricePerSack">
                                        <input type="text" class="" id="productDescription">
                                        <input type="text" class="" id="productImages">
                                    </div>
                                </section>

                                <footer>
                                    <button class="footerBtn">Confirm Add Products</button>
                                </footer>
                            </div>`

}


function manageOrder(){
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    productManagementBoxSecBot.innerHTML = `<button class="addProductBtn" onclick="addProductui()">Add Product</button>
                                            <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>
                                            <button class="viewPaymentHistoryBtn">View Payment History</button>
                                            <button class="backBtn" onclick="back()">Back</button>`

    rightSec.innerHTML = `  <div class="manageOrderBox">
                                <header>
                                    <h1>Manage Client Order</h1>
                                </header>

                                <section>
                                    <div class="manageOrderBox-leftSec">
                                        <label for="clientId">Client ID:</label>
                                    </div>

                                    <div class="manageOrderBox-rightSec">
                                        <input type="text" class="clientId" id="clientId">
                                    </div>
                                </section>

                                <footer>
                                    <button class="viewPendingOrdersBtn" id="viewPendingOrdersBtn">View Pending Orders</button>
                                </footer>
                                <main></main>
                            </div>`
}


function back(){
    let productManagementBoxSecBot = document.querySelector('.productManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    productManagementBoxSecBot.innerHTML = `<button class="addProductBtn" onclick="addProductui()">Add Product</button>
                                            <button class="manageOrderBtn" onclick="manageOrder()">Manage Order</button>
                                            <button class="viewPaymentHistoryBtn">View Payment History</button>`

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
}

