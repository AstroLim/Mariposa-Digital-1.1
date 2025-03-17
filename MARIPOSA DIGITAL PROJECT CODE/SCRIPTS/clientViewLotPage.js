let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

// Making Client Home Page Username Content Dynamic based on who's logged in
if (accountLogin) { 
    const accountLoginName = `${accountLogin.username}`;
    document.querySelector(".userName").innerHTML = `<p>${accountLoginName}</p>`;
}

let storedLots = JSON.parse(localStorage.getItem("strListOfLots"))

if(!storedLots){
    alert("No Lots Available, Add new Lots")
}

// Function that loads currently available lots
function loadLots() {
    let section = document.querySelector(".MainSection-mainCont");
    let storedLots = JSON.parse(localStorage.getItem("strListOfLots"));

    // Filter out reserved lots
    let availableLots = storedLots.filter(lot => lot.status === "Available");

    if (availableLots.length === 0) {
        section.innerHTML = `<p>No available lots at the moment.</p>`;
        return;
    }

    section.innerHTML = ""; // Clear section before loading lots
    availableLots.forEach((lot) => {
        section.innerHTML += `
            <div class="lot-card">
                <h2>${lot.name}</h2>
                <p>${lot.description}</p>
                <p>Size: ${lot.size}</p>
                <p>Price: ${lot.price}</p>
                <label>
                    <select id="lot${lot.lotNumber}-duration" onchange="updateSelection('lot${lot.lotNumber}')">
                        <option value="1 Year">1 Year</option>
                        <option value="3 Years">3 Years</option>
                        <option value="5 Years">5 Years</option>
                    </select>
                </label>
                <p id="lot${lot.lotNumber}-selection">Selected: 1 Year</p>
                <button onclick="reserveLot(${lot.lotNumber})" class="reserveLotBTN">Reserve Lot</button>
                <img src="images/lot${lot.lotNumber}.png" alt="${lot.name} Pic" class="lot-image">
            </div>`;
    });
}

// Function to update the selection text when a user selects a contract duration
function updateSelection(lot) {
    let duration = document.getElementById(`${lot}-duration`).value;
    document.getElementById(`${lot}-selection`).textContent = `Selected: ${duration}`;
}

// Function to reserve a lot and remove it from the available list
function reserveLot(lotNumber) {
    let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));
    let registeredUsers = JSON.parse(localStorage.getItem("strRegisteredUsers"));
    let listOfLots = JSON.parse(localStorage.getItem("strListOfLots"));

    if (!accountLogin) {
        alert("Please log in to be able to reserve a lot.");
        return;
    }

    let selectedLot = listOfLots.find(lot => lot.lotNumber === lotNumber);
    if (!selectedLot) {
        alert("Lot not found.");
        return;
    }
    
    // Get the selected duration using the lotNumber in the element's id
    let duration = document.getElementById(`lot${selectedLot.lotNumber}-duration`).value;

    // Update lot details
    selectedLot.contractDuration = duration;
    selectedLot.status = "Reserved";
    selectedLot.lotOwner = `${accountLogin.firstname} ${accountLogin.lastname}`;

    // Find the logged-in user and add the reserved lot
    let user = registeredUsers.find(user => user.email === accountLogin.email);
    if (user) {
        if (!user.reservedLots) {
            user.reservedLots = [];
        }
        user.reservedLots.push(selectedLot);
    }

    // Update local storage
    localStorage.setItem("strListOfLots", JSON.stringify(listOfLots));
    localStorage.setItem("strRegisteredUsers", JSON.stringify(registeredUsers));

    alert(`${selectedLot.name} has been reserved for ${duration}.`);

    // Reload the available lots
    loadLots();
}

// Calling the loadLots function on page load
loadLots();
