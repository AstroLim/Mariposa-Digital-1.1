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

// Loads the currently available rice products for sale
function loadProducts() {
    const productSection = document.querySelector(".MainSection-mainCont");
    let listOfProducts = JSON.parse(localStorage.getItem("strListOfProducts"));

    productSection.innerHTML = "";
    
    listOfProducts.forEach((product, index) => {
        productSection.innerHTML += `   <div class="lot-box">
                                            <img src="lot1.jpg" alt="Lot Image">
                                            <h3>${product.name}</h3>
                                            <p>${product.description}</p>
                                            <p>Price Per Kilo: ${product.pricePerKilo}</p>
                                            <button class="removeProduct">Remove Product</button>
                                        </div>`;
    });

// Attach event listeners after the elements are created
// // Attach event listeners after elements are created
    document.querySelectorAll(".removeProduct").forEach((button) => {
        button.addEventListener("click", function () {
            let index = parseInt(this.getAttribute("data-index"));
            removeProduct(index);
        });
    });
}

// Calling loadProducts() function
loadProducts();

function removeProduct(index){
    let storedProducts = JSON.parse(localStorage.getItem("strListOfProducts"));

    if (!storedProducts || storedProducts.length === 0) {
        alert("No products available.");
        return;
    }

    // Remove the selected product from the array
    let removedProduct = storedProducts.splice(index, 1)[0];

    // Update local storage
    localStorage.setItem("strListOfProducts", JSON.stringify(storedProducts));

    alert(`${removedProduct.name} has been removed.`);

    // Reload products to update UI
    loadProducts();
}