// Initializing the currently logged-in user
let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));
let registeredUsers = JSON.parse(localStorage.getItem("strRegisteredUsers")) || [];
let listOfContractSigningDates = JSON.parse(localStorage.getItem("strListOfContractSigningDates")) || [];

if (accountLogin) {
    const accountLoginName = `${accountLogin.username}`;
    document.querySelector(".userName").innerHTML = `<p>${accountLoginName}</p>`;
}

// Find the currently logged-in user's reserved lots
let clientReservedLots = [];
for (let i = 0; i < registeredUsers.length; i++) {
    if (registeredUsers[i].email === accountLogin?.email) {
        clientReservedLots = registeredUsers[i].reservedLots || [];
        break;
    }
}

// Function to load reserved lots of the logged-in client
function loadClientReservedLots() {
    let section = document.querySelector(".MainSection-mainCont");
    section.innerHTML = ""; // Clear existing content to prevent duplication

    if (clientReservedLots.length === 0) {
        section.innerHTML = `<p>You have no reserved lots.</p>`;
        return;
    }

    for (let i = 0; i < clientReservedLots.length; i++) {
        let lotName = clientReservedLots[i].name; // Get the name before checking date
        let user = registeredUsers.find(user => user.email === accountLogin.email);
        let hasContractDate = user?.lotContractSigningDates?.some(date => date.name === lotName);

        section.innerHTML += `
            <div class="lot-container">
                <div class="lot-image">
                    <img src="../RESOURCES/imgFiles/lot1.jpg" alt="Lot Image">
                </div>

                <div class="lot-details">
                    <h2>${lotName}</h2>
                    <div class="lot-info">
                        <div class="left">
                            <p><strong>Description:</strong> ${clientReservedLots[i].description}</p>
                            <p><strong>Size:</strong> ${clientReservedLots[i].size}</p>
                        </div>
                        <div class="right">
                            <p><strong>Contract Duration:</strong> ${clientReservedLots[i].contractDuration}s</p>
                            <p><strong>Price:</strong> ${clientReservedLots[i].price}</p>
                        </div>
                    </div>

                    <div class="lot-actions">
                        <button class="cancelReservation" data-index="${i}" ${hasContractDate ? "disabled" : ""}>Cancel Reservation</button>
                        <button class="setDate" data-index="${i}">Set Date</button>
                    </div>
                </div>
            </div>`;
    }

    // Add event listeners for dynamically created buttons
    document.querySelectorAll(".cancelReservation:not([disabled])").forEach((button) => {
        button.addEventListener("click", cancelReservation);
    });

    document.querySelectorAll(".setDate").forEach((button) => {
        button.addEventListener("click", setDate);
    });
}

// Function to cancel reserved lot
function cancelReservation(event) {
    let index = event.target.getAttribute("data-index");
    let lotName = clientReservedLots[index].name; // Get the name before removing

    if (!lotName) {
        alert("Error: Unable to find the reservation.");
        return;
    }

    clientReservedLots.splice(index, 1);

    // Update local storage
    for (let user of registeredUsers) {
        if (user.email === accountLogin.email) {
            user.reservedLots = clientReservedLots;
            user.lotContractSigningDates = user.lotContractSigningDates?.filter(date => date.name !== lotName);
            localStorage.setItem("strRegisteredUsers", JSON.stringify(registeredUsers));
            break;
        }
    }

    alert(`Reservation for ${lotName} has been canceled.`);
    loadClientReservedLots();
}

// Function to set contract signing date for reservation of lot
function setDate(event) {
    let index = event.target.getAttribute("data-index");
    let lotName = clientReservedLots[index].name;
    let userName = accountLogin.username;

    let listOfContractSigningDates = JSON.parse(localStorage.getItem("strListOfContractSigningDates")) || [];

    // Create modal
    let modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Set Contract Signing Date</h2>
            <p>Choose a date for ${lotName}:</p>
            <input type="date" id="contractDate" required>
            <div class="modal-actions">
                <button id="saveDate">Save</button>
                <button id="closeModal">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Add CSS styles for modal positioning
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    modal.style.padding = "20px";
    modal.style.borderRadius = "10px";
    modal.style.color = "white";
    modal.style.zIndex = "1000";

    let modalContent = modal.querySelector(".modal-content");
    modalContent.style.backgroundColor = "white";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "10px";
    modalContent.style.textAlign = "center";

    // Close modal function
    document.getElementById("closeModal").addEventListener("click", function () {
        document.body.removeChild(modal);
    });

    // Save selected date
    document.getElementById("saveDate").addEventListener("click", function () {
        let selectedDate = document.getElementById("contractDate").value;
        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }

        // Find the currently logged-in user
        for (let i = 0; i < registeredUsers.length; i++) {
            if (registeredUsers[i].email === accountLogin.email) {
                if (!registeredUsers[i].lotContractSigningDates) {
                    registeredUsers[i].lotContractSigningDates = [];
                }

                // Add contract signing date
                registeredUsers[i].lotContractSigningDates.push({
                    name: lotName,
                    scheduleDate: selectedDate
                });
                localStorage.setItem("strRegisteredUsers", JSON.stringify(registeredUsers));
                break;
            }
        }

        // Add to strListOfContractSigningDates
        listOfContractSigningDates.push({
            user: userName,
            lotName: lotName,
            scheduleDate: selectedDate
        });

        localStorage.setItem("strListOfContractSigningDates", JSON.stringify(listOfContractSigningDates));

        alert(`Contract signing date for ${lotName} has been set to ${selectedDate}.`);
        document.body.removeChild(modal);
    });
}

// Load reserved lots when the page loads
loadClientReservedLots();