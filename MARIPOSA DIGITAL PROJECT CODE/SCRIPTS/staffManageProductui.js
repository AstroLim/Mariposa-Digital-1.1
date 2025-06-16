import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, push, update, remove } from "firebase/database";

// Firebase config (same as ma-manage.js)
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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// User display
const user = JSON.parse(localStorage.getItem("user"));
if (user && document.querySelector(".userName")) {
    document.querySelector(".userName").textContent = user.username || "";
}

// Sidebar navigation
const sidebarOptions = document.querySelectorAll(".sidebar-option");
const mainHeaderTitle = document.getElementById("main-header-title");
const mainContentSection = document.getElementById("main-content-section");

// Initial load
window.addEventListener("DOMContentLoaded", () => {
    loadViewProducts();
});

// Sidebar click events
sidebarOptions.forEach(btn => {
    btn.addEventListener("click", () => {
        sidebarOptions.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const option = btn.getAttribute("data-option");
        if (option === "view") {
            mainHeaderTitle.textContent = "View Products";
            loadViewProducts();
        } else if (option === "add") {
            mainHeaderTitle.textContent = "Add Product";
            loadAddProduct();
        } else if (option === "edit") {
            mainHeaderTitle.textContent = "Edit Product";
            loadEditProduct();
        } else if (option === "remove") {
            mainHeaderTitle.textContent = "Remove Product";
            loadRemoveProduct();
        }
    });
});

// View Products
function loadViewProducts() {
    mainContentSection.innerHTML = `<div id="product-list"></div>`;
    const productList = document.getElementById("product-list");
    get(ref(db, "products")).then(snapshot => {
        if (!snapshot.exists()) {
            productList.innerHTML = "<p>No products found.</p>";
            return;
        }
        let html = "";
        snapshot.forEach(child => {
            const prod = child.val();
            html += `
                <div class="product-card">
                    <img class="product-image" src="${prod.productImages || '../RESOURCES/imgFiles/Logo.png'}" alt="Product">
                    <div class="product-details">
                        <h3>${prod.productName || "No Name"}</h3>
                        <p>Price: ₱${prod.pricePerSack || "N/A"}</p>
                        <p>${prod.productDescription || ""}</p>
                        <div class="product-actions">
                            <button onclick="editProductPrompt('${child.key}')">Edit</button>
                            <button onclick="removeProductPrompt('${child.key}')">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        });
        productList.innerHTML = html;
    });
}

// Add Product
function loadAddProduct() {
    mainContentSection.innerHTML = `
        <form class="form-section" id="add-product-form">
            <h2>Add New Product</h2>
            <div class="form-group">
                <label for="add-product-name">Product Name</label>
                <input id="add-product-name" type="text" required>
            </div>
            <div class="form-group">
                <label for="add-product-price">Price Per Sack</label>
                <input id="add-product-price" type="number" min="0" required>
            </div>
            <div class="form-group">
                <label for="add-product-description">Description</label>
                <textarea id="add-product-description" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label for="add-product-image">Image URL</label>
                <input id="add-product-image" type="text" placeholder="Paste image URL or leave blank for default">
            </div>
            <div class="form-actions">
                <button type="submit">Add Product</button>
            </div>
        </form>
    `;
    document.getElementById("add-product-form").onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById("add-product-name").value.trim();
        const price = document.getElementById("add-product-price").value.trim();
        const desc = document.getElementById("add-product-description").value.trim();
        const img = document.getElementById("add-product-image").value.trim();
        if (!name || !price || !desc) {
            alert("Please fill in all required fields.");
            return;
        }
        await push(ref(db, "products"), {
            productName: name,
            pricePerSack: price,
            productDescription: desc,
            productImages: img
        });
        alert("Product added!");
        loadViewProducts();
        sidebarOptions.forEach(b => b.classList.remove("active"));
        sidebarOptions[0].classList.add("active");
        mainHeaderTitle.textContent = "View Products";
    };
}

// Edit Product
function loadEditProduct(prodId = "") {
    mainContentSection.innerHTML = `
        <form class="form-section" id="edit-product-search-form">
            <h2>Edit Product</h2>
            <div class="form-group">
                <label for="edit-product-id">Enter Product ID</label>
                <input id="edit-product-id" type="text" required value="${prodId}">
            </div>
            <div class="form-actions">
                <button type="submit">Load Product</button>
            </div>
        </form>
        <div id="edit-product-form-container"></div>
    `;

    // If prodId is provided, auto-load the product
    if (prodId) {
        loadEditProductForm(prodId);
    }

    document.getElementById("edit-product-search-form").onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById("edit-product-id").value.trim();
        loadEditProductForm(id);
    };
}

// Helper to load the edit form for a product
async function loadEditProductForm(prodId) {
    const prodRef = ref(db, `products/${prodId}`);
    const snap = await get(prodRef);
    if (!snap.exists()) {
        alert("Product not found.");
        return;
    }
    const prod = snap.val();
    document.getElementById("edit-product-form-container").innerHTML = `
        <form class="form-section" id="edit-product-form">
            <h2>Edit Product Details</h2>
            <div class="form-group">
                <label>Product Name</label>
                <input id="edit-product-name" type="text" value="${prod.productName || ""}" required>
            </div>
            <div class="form-group">
                <label>Price Per Sack</label>
                <input id="edit-product-price" type="number" min="0" value="${prod.pricePerSack || ""}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="edit-product-description" rows="3" required>${prod.productDescription || ""}</textarea>
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input id="edit-product-image" type="text" value="${prod.productImages || ""}">
            </div>
            <div class="form-actions">
                <button type="submit">Save Changes</button>
            </div>
        </form>
    `;
    document.getElementById("edit-product-form").onsubmit = async (ev) => {
        ev.preventDefault();
        const name = document.getElementById("edit-product-name").value.trim();
        const price = document.getElementById("edit-product-price").value.trim();
        const desc = document.getElementById("edit-product-description").value.trim();
        const img = document.getElementById("edit-product-image").value.trim();
        await update(prodRef, {
            productName: name,
            pricePerSack: price,
            productDescription: desc,
            productImages: img
        });
        alert("Product updated!");
        loadViewProducts();
        sidebarOptions.forEach(b => b.classList.remove("active"));
        sidebarOptions[0].classList.add("active");
        mainHeaderTitle.textContent = "View Products";
    };
}

// Remove Product
function loadRemoveProduct() {
    mainContentSection.innerHTML = `
        <form class="form-section" id="remove-product-form">
            <h2>Remove Product</h2>
            <div class="form-group">
                <label for="remove-product-id">Enter Product ID</label>
                <input id="remove-product-id" type="text" required>
            </div>
            <div class="form-actions">
                <button type="submit">Remove Product</button>
            </div>
        </form>
    `;
    document.getElementById("remove-product-form").onsubmit = async (e) => {
        e.preventDefault();
        const prodId = document.getElementById("remove-product-id").value.trim();
        const prodRef = ref(db, `products/${prodId}`);
        const snap = await get(prodRef);
        if (!snap.exists()) {
            alert("Product not found.");
            return;
        }
        await remove(prodRef);
        alert("Product removed!");
        loadViewProducts();
        sidebarOptions.forEach(b => b.classList.remove("active"));
        sidebarOptions[0].classList.add("active");
        mainHeaderTitle.textContent = "View Products";
    };
}

// Edit/Remove from product card
window.editProductPrompt = (prodId) => {
    sidebarOptions.forEach(b => b.classList.remove("active"));
    sidebarOptions[2].classList.add("active");
    mainHeaderTitle.textContent = "Edit Product";
    loadEditProduct(prodId); // Pass the ID
};
window.removeProductPrompt = async (prodId) => {
    if (confirm("Are you sure you want to remove this product?")) {
        await remove(ref(db, `products/${prodId}`));
        alert("Product removed!");
        loadViewProducts();
        sidebarOptions.forEach(b => b.classList.remove("active"));
        sidebarOptions[0].classList.add("active");
        mainHeaderTitle.textContent = "View Products";
    }
};