import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
import { getDatabase, ref, get, update, push } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeBsyXVezC_JEe0X4CWbH43rM0Vx3CtSs",
  authDomain: "mariposa-digital-fb.firebaseapp.com",
  databaseURL: "https://mariposa-digital-fb-default-rtdb.firebaseio.com",
  projectId: "mariposa-digital-fb",
  storageBucket: "mariposa-digital-fb.firebasestorage.app",
  messagingSenderId: "638381416350",
  appId: "1:638381416350:web:b8144202dea97b283a808f",
  measurementId: "G-E8S6TD7XK0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase();

const user = JSON.parse(localStorage.getItem('user'));
const uid = localStorage.getItem('uid');

if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel !== 'user') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}



// let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

// // Making Client Home Page Username Content Dynamic based on whos login
// if (accountLogin) { 
//     const accountLoginName = `${accountLogin.username}`;
//     document.querySelector(".userName").innerHTML = `<p>${accountLoginName}</p>`;
// }



get(ref(db, 'products/')).then((snapshot) => {
    if (snapshot.exists()) {
        const productData = snapshot.val();
        let listOfProducts = [];
        for (let key in productData) {
            listOfProducts.push(productData[key]);
        }

        loadProducts(listOfProducts);
    }
}).catch((error) => {
    console.error("Error fetching products:", error);
});


// if(!storedProducts){
//     alert("No Lots Available, Add new Lots")
// }

// Function to compute rice price
function computeRicePrice(pricePerKilo, weight, quantity) {
    return (pricePerKilo * weight) * quantity;
}

// Loads the currently available rice products for sale
function loadProducts(productData) {
    const productSection = document.querySelector(".MainSection-mainCont");
    let listOfProducts = productData || [];

    listOfProducts.forEach((product, index) => {
        productSection.innerHTML += `
                                        <div class="lot-box">
                                            <img src="lot1.jpg" alt="Lot Image">
                                            <h3>${product.productName}</h3>
                                            <p>${product.productDescription}</p>
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
            let totalPrice = computeRicePrice(product.pricePerSack, weight, quantity);
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
async function addToCart(product, weight, quantity) {
    if (!uid) {
        alert("Please log in to add items to your cart.");
        return;
    }

    const cartRef = ref(db, `cart/${uid}`);
    const productData = {
        productName: product.productName,
        pricePerSack: product.pricePerSack,
        productDescription: product.productDescription,
        weight: Number(weight),
        quantity: Number(quantity)
    };

    try {
        // Get current cart
        const snapshot = await get(cartRef);
        let cart = [];
        let found = false;

        if (snapshot.exists()) {
            cart = Object.entries(snapshot.val()).map(([key, value]) => ({ key, ...value }));

            // Check for same product and weight
            for (let item of cart) {
                if (item.productName === productData.productName && item.weight === productData.weight) {
                    // Update quantity
                    const itemRef = ref(db, `cart/${uid}/${item.key}`);
                    await update(itemRef, { quantity: item.quantity + productData.quantity });
                    found = true;
                    break;
                }
            }
        }

        if (!found) {
            // Add as new product
            await push(cartRef, productData);
        }

        alert(`${product.productName} (${weight}kg x ${quantity}) has been added to your cart`);
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to add to cart.");
    }
}

