// Retrieving the currently logged-in user from localStorage
let accountLogin = JSON.parse(localStorage.getItem("strLoginAccount"));

// Displaying the username dynamically
if (accountLogin) {
    document.querySelector(".userName").innerHTML = `<p>${accountLogin.username}</p>`;
}

// Retrieving product lists from localStorage or initializing them
let listOfLots = JSON.parse(localStorage.getItem("strListOfLots")) || [];
let listOfReservedLots = listOfLots.filter(lot => lot.status === "Reserved");
let listOfRentedLots;

// Function to update the dashboard data
toggleDashboard();

function toggleDashboard() {
    document.querySelector(".availableLotsStat-sec-bot > div > p").textContent = listOfLots.length;
    document.querySelector(".reservedLotsStat-sec-bot > div > p").textContent = listOfReservedLots.length;
    document.querySelector(".rentedLotsStat-sec-bot > div > p").textContent = "No Content Yet";
}

// Function to add a Lot
function addLot() {
    let lotName = document.querySelector(".lotNumber").value.trim();
    let lotDescription = document.querySelector(".lotDescription").value.trim();
    let lotSize = parseFloat(document.querySelector(".lotSize").value);
    let lotMonthlyRent = document.querySelector(".lotPrice").value.trim();

    if (!lotName || !lotDescription || isNaN(lotMonthlyRent) || !lotSize) {
        alert("Please fill in all product details correctly.");
        return;
    }

    let newLot = {
        lotNumber: listOfLots.length + 1,
        name: (`Lot ${lotName}`),
        price: (`₱${lotMonthlyRent}/month`),
        description: lotDescription,
        size: lotSize,
        status: "Available",
        lotOwner: "",
        contractDuration: ""
    };

    listOfLots.push(newLot);
    localStorage.setItem("strListOfLots", JSON.stringify(listOfLots));

    alert("New Lot has been added.");
    toggleDashboard();
}

// Function to Remove Lot
function removeLot() {
    let lotNumberInput = document.querySelector(".lotnumber").value.trim();

    if (!lotNumberInput) {
        alert("Please enter a valid lot number.");
        return;
    }

    let lotIndex = listOfLots.findIndex(lot => lot.lotNumber == lotNumberInput);

    if (lotIndex === -1) {
        alert("Lot not found. Please enter a valid lot number.");
        return;
    }

    listOfLots.splice(lotIndex, 1);
    localStorage.setItem("strListOfLots", JSON.stringify(listOfLots));

    alert(`Lot ${lotNumberInput} has been removed.`);
    toggleDashboard();
}


function cancelSchedule(event) {
    const index = parseInt(event.target.dataset.index);
    let listOfContractSigningDates = JSON.parse(localStorage.getItem('strListOfContractSigningDates')) || [];

    // Remove the schedule from the array
    listOfContractSigningDates.splice(index, 1);

    // Update localStorage
    localStorage.setItem('strListOfContractSigningDates', JSON.stringify(listOfContractSigningDates));

    // Re-render the schedule UI
    manageContractScheduleui();
}

function confirmSchedule(event) {
    const index = parseInt(event.target.dataset.index);
    let listOfContractSigningDates = JSON.parse(localStorage.getItem('strListOfContractSigningDates')) || [];

    // Assuming you want to mark the schedule as confirmed (you can add a 'confirmed' property)
    listOfContractSigningDates[index].confirmed = true;

    // Update localStorage
    localStorage.setItem('strListOfContractSigningDates', JSON.stringify(listOfContractSigningDates));

    // Re-render the schedule UI
    manageContractScheduleui();
}


/* Functionalities for Dynamic UI */
function addLotui() {
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
                                        <button class="back" onclick="backToDashBoard()">Back</button>`;

    rightSec.innerHTML = `<div class="addLotBox">
                                <div class="addLotBox-sec-top">
                                    <h1>Add Lot</h1>
                                </div>
                
                                <div class="addLotBox-sec-bot">
                                    <div class="sec-bot-leftSec">
                                        <label for="">Lot Number:</label>
                                        <label for="">Description:</label>
                                        <label for="">Lot Size:</label>
                                        <label for="">Lot Price:</label>
                                        <label for="">Lot Images</label>
                                    </div>

                                    <div class="sec-bot-rightSec">
                                        <input type="text" id="lotNumber" class="lotNumber">
                                        <input type="text" id="lotDescription" class="lotDescription">
                                        <input type="text" id="lotSize" class="lotSize">
                                        <input type="number" id="lotPrice" class="lotPrice">
                                        <input type="text" id="lotImages" class="lotImages">
                                    </div>
                                </div>
                
                                <footer class="addLotBox-sec-footer">
                                    <button  onclick="addLot()">Confirm ADD LOT</button>
                                </footer>
                            </div>`;

}

function removeLotui() {
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
                                        <button class="back" onclick="backToDashBoard()">Back</button>`;

    rightSec.innerHTML = `<div class="removeLotBox">
                                <div class="removeLotBox-sec-top">
                                    <h1>Removing Lot</h1>
                                </div>
            
                                <div class="removeLotBox-sec-bot">
                                    <label for="">Lot Number:</label>
                                    <input type="text" id="lotnumber" class="lotnumber">
                                </div>

                                <footer class="removeLotBox-sec-footer">
                                    <button onclick="removeLot()">Confirm Remove LOT</button>
                                </footer>
                            </div>`;
}

function manageContractScheduleui() {
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot');
    let rightSec = document.querySelector('.MainSection-Content-right-sec');
    let listOfContractSigningDates = JSON.parse(localStorage.getItem('strListOfContractSigningDates')) || [];

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
                                        <button class="back" onclick="backToDashBoard()">Back</button>`;

    let contractScheduleHtml = `<div class="manageContractScheduleBox"> 
                                    <div class="manageContractScheduleBox-sec-top">
                                        <h1>Lot Contract Signing Dates</h1>
                                    </div>

                                    <div class="manageContractScheduleBox-sec-bot">`;

    listOfContractSigningDates.forEach((contract, index) => {
        contractScheduleHtml += `
                                        <div class="contractLotInfoBox">
                                            <header><h1>${contract.lotName}</h1></header>
                                            <main>
                                                <div class="main-contractLotInfoBox-leftSec">
                                                    <div><p>Lot Number: ${contract.lotName}</p></div>
                                                    <div><p>User: ${contract.user}</p></div>
                                                    <div><p>Date: ${contract.scheduleDate}</p></div>
                                                    <button class="confirmSchedule" data-index="${index}">Confirm Schedule</button>
                                                    <button class="cancelSchedule" data-index="${index}">Cancel Schedule</button>
                                                </div>

                                                <div class="main-contractLotInfoBox-rightSec">
                                                    <img src="" class="lotImg" alt="img of Lot">
                                                </div>
                                            </main>
                                        </div>`;
    });

    contractScheduleHtml += `</div></div>`;
    rightSec.innerHTML = contractScheduleHtml;

    // Add event listeners for confirm and cancel schedule buttons
    document.querySelectorAll(".cancelSchedule").forEach(button => {
        button.addEventListener("click", cancelSchedule);
    });
    
    document.querySelectorAll(".confirmSchedule").forEach(button => {
        button.addEventListener("click", confirmSchedule);
    });
}

function backToDashBoard() {
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>`;

    rightSec.innerHTML = ` <div class="right-sec-topContent">
                                        <div class="availableLotsStat-container">
                                            <div class="availableLotsStat-sec-top">
                                                <h1>Available Lots</h1>
                                            </div>
                        
                                            <div class="availableLotsStat-sec-bot">
                                                <div class="statContainer"><h1 class="statLabel">Number of Lots:</h1><p class="stat">100</p></div>
                                            </div>`
}