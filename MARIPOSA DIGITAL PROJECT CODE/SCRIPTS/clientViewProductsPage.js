import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, update, set } from "firebase/database";

// Your web app's Firebase configuration
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

// Set username in navbar after DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const userNameDiv = document.querySelector('.userName');
  console.log('user from localStorage:', user);
  if (user) {
    console.log('user.username:', user.username);
  }
  console.log('.userName element found:', !!userNameDiv);
  if (user && user.username && userNameDiv) {
    userNameDiv.innerHTML = `<p>${user.username}</p>`;
  }
});

if (!user || !uid) {
  document.body.innerHTML = '';
  alert('Please log in to access this page.');
  window.location.href = 'landingPage.html';
} else if (user.accessLevel.toLowerCase() !== 'user') {
  document.body.innerHTML = '';
  alert('You do not have permission to access this page.');
  window.location.href = 'landingPage.html';
}

// Fetch products and attach productId to each product object
get(ref(db, 'products/')).then((snapshot) => {
  if (snapshot.exists()) {
    const productData = snapshot.val();
    let listOfProducts = [];
    for (let key in productData) {
      listOfProducts.push({ ...productData[key], productId: key }); // Attach productId here
    }
    loadProducts(listOfProducts);
  }
}).catch((error) => {
  console.error("Error fetching products:", error);
});

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
        <div class="product-image-placeholder" style="width: 100px; height: 100px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px; margin-bottom: 10px;">
          ${
            product.productImages
              ? `<img src="${product.productImages}" alt="Product Image" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
              : `<img src="../RESOURCES/imgFiles/Logo.png" alt="Default Logo" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
          }
        </div>
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

// Calling loadProducts() function (in case you want to call it with no data)
loadProducts();

// Add to Cart Function
async function addToCart(product, weight, quantity) {
  if (!uid) {
    alert("Please log in to add items to your cart.");
    return;
  }

  // Use the real productId as the cart key
  const productId = product.productId; // Make sure your product objects have a productId property!
  if (!productId) {
    alert("Product data missing productId.");
    return;
  }

  const cartItemRef = ref(db, `cart/${uid}/${productId}`);
  const productData = {
    productId, // always store productId in the cart item
    productName: product.productName,
    pricePerSack: product.pricePerSack,
    productDescription: product.productDescription,
    weight: Number(weight),
    quantity: Number(quantity)
  };

  try {
    // Check if this product is already in the cart
    const snapshot = await get(cartItemRef);
    if (snapshot.exists()) {
      // If it exists, update the quantity
      const existing = snapshot.val();
      await update(cartItemRef, { quantity: existing.quantity + productData.quantity, weight: productData.weight });
    } else {
      // Otherwise, add as new
      await set(cartItemRef, productData);
    }

    alert(`${product.productName} (${weight}kg x ${quantity}) has been added to your cart`);
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Failed to add to cart.");
  }
}