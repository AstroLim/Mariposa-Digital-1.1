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
    let storedLots = JSON.parse(localStorage.getItem("strListOfLots")) || [];

    // Filter out reserved lots
    let availableLots = storedLots.filter(lot => lot.status === "Available");

    section.innerHTML = availableLots.length === 0 
        ? `<p>No available lots at the moment.</p>` 
        : ""; // Clear section before loading lots

    availableLots.forEach((lot) => {
        section.innerHTML += `
            <div class="lot-card">
                <h2>${lot.name}</h2>
                <p>${lot.description}</p>
                <p>Size: ${lot.size}</p>
                <p>Price: ${lot.price}</p>
                <p>Owner: ${lot.lotOwner || "None"}</p>
                <p>Contract Duration: ${lot.contractDuration || "N/A"}</p>
                <p>Status: ${lot.status}</p>
                <button onclick="removeLot(${lot.lotNumber})">Remove Lot</button>
                <img src="images/lot${lot.lotNumber}.png" alt="${lot.name} Pic" class="lot-image">
            </div>`;
    });
}

function removeLot(lotNumber) {
    let storedLots = JSON.parse(localStorage.getItem("strListOfLots"));

    // Remove the selected lot from the array
    let updatedLots = storedLots.filter(lot => lot.lotNumber !== lotNumber);

    // Update localStorage
    localStorage.setItem("strListOfLots", JSON.stringify(updatedLots));

    // Reload the available lots
    loadLots();
}

// Calling the loadLots function on page load
loadLots();
