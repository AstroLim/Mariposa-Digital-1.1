/* Manage Lot Functionalities */
function addLotui(){
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="cancelLotReserBtn" onclick="cancelLotReservationui()">Cancel Lot Reservation</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
                                        <button class="back" onclick="backToDashBoard()">Back</button>`

    rightSec.innerHTML = `<div class="addLotBox">
                                <div class="addLotBox-sec-top">
                                    <h1>Add Lot</h1>
                                </div>
            
                                <div class="addLotBox-sec-bot">
                                    <div class="sec-bot-leftSec">
                                        <label for="">Lot Number:</label>
                                        <label for="">Lot Size:</label>
                                        <label for="">Lot Price:</label>
                                        <label for="">Lot Images</label>
                                    </div>

                                    <div class="sec-bot-rightSec">
                                        <input type="text" id="lotNumber" class="lotNumber">
                                        <input type="text" id="lotSize" class="lotSize">
                                        <input type="text" id="lotPrice" class=lotPrice">
                                        <input type="text" id="lotImages" class="lotImages">
                                    </div>
                                </div>
        
                                <footer class="addLotBox-sec-footer">
                                    <button>Confirm ADD LOT</button>
                                </footer>
                            </div>`

}

function removeLotui(){
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="cancelLotReserBtn" onclick="cancelLotReservationui()">Cancel Lot Reservation</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
                                        <button class="back" onclick="backToDashBoard()">Back</button>`

    rightSec.innerHTML = `<div class="removeLotBox">
                                <div class="removeLotBox-sec-top">
                                    <h1>Removing Lot</h1>
                                </div>
    
                                <div class="removeLotBox-sec-bot">
                                    <label for="">Lot Number:</label>
                                    <input type="text" id="lotNumber" class="lotNumber">
                                </div>

                                <footer class="removeLotBox-sec-footer">
                                    <button>Confirm Remove LOT</button>
                                </footer>
                        </div>`
}

function cancelLotReservationui(){
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="cancelLotReserBtn" onclick="cancelLotReservationui()">Cancel Lot Reservation</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
                                        <button class="back" onclick="backToDashBoard()">Back</button>`

    rightSec.innerHTML = `<div class="cancelLotReservationBox">
                                <div class="cancelLotReservationBox-sec-top">
                                    <h1>List of Cancel Request</h1>
                                </div>
            
                                <div class="cancelLotReservation-sec-bot">
                                    <div class="cancelLotBox">
                                        <header><img src="" class="lotImg" alt="img of Lot"></header>
                                        <main>
                                            <div><p>Lot Number</p></div>
                                            <button>Accept Cancel Request</button>
                                        </main>
                                    </div>

                                    <div class="cancelLotBox">
                                        <header><img src="" class="lotImg" alt="img of Lot"></header>
                                        <main>
                                            <div><p>Lot Number</p></div>
                                            <button>Accept Cancel Request</button>
                                        </main>
                                    </div>

                                    <div class="cancelLotBox">
                                        <header><img src="" class="lotImg" alt="img of Lot"></header>
                                        <main>
                                            <div><p>Lot Number</p></div>
                                            <button>Accept Cancel Request</button>
                                        </main>
                                    </div>

                                    <div class="cancelLotBox">
                                        <header><img src="" class="lotImg" alt="img of Lot"></header>
                                        <main>
                                            <div><p>Lot Number</p></div>
                                            <button>Accept Cancel Request</button>
                                        </main>
                                    </div>
                                </div>
                        </div>`
}

function manageContractScheduleui(){
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="cancelLotReserBtn" onclick="cancelLotReservationui()">Cancel Lot Reservation</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>
                                        <button class="back" onclick="backToDashBoard()">Back</button>`

    rightSec.innerHTML = `<div class="manageContractScheduleBox"> 
                                <div class="manageContractScheduleBox-sec-top">
                                    <h1>Lot Contract Signing Dates</h1>
                                </div>

                                <div class="manageContractScheduleBox-sec-bot">

                                    <div class="contractLotInfoBox">
                                        <header><h1>LOT 1</h1></header>
                                        <main>
                                            <div class="main-contractLotInfoBox-leftSec">
                                                <div><p>Lot Number</p></div>
                                                <button>Confirm Schedule</button>
                                                <button>Cancel Schedule</button>
                                            </div>

                                            <div class="main-contractLotInfoBox-rightSec">
                                                <img src="" class="lotImg" alt="img of Lot">
                                            </div>
                                        </main>
                                    </div>

                                    <div class="contractLotInfoBox">
                                        <header><h1>LOT 2</h1></header>
                                        <main>
                                            <div class="main-contractLotInfoBox-leftSec">
                                                <div><p>Lot Number</p></div>
                                                <button>Confirm Schedule</button>
                                                <button>Cancel Schedule</button>
                                            </div>
                                            
                                            <div class="main-contractLotInfoBox-rightSec">
                                                <img src="" class="lotImg" alt="img of Lot">
                                            </div>
                                        </main>
                                    </div>

                                    <div class="contractLotInfoBox">
                                        <header><h1>LOT 3</h1></header>
                                        <main>
                                            <div class="main-contractLotInfoBox-leftSec">
                                                <div><p>Lot Number</p></div>
                                                <button>Confirm Schedule</button>
                                                <button>Cancel Schedule</button>
                                            </div>
                                            
                                            <div class="main-contractLotInfoBox-rightSec">
                                                <img src="" class="lotImg" alt="img of Lot">
                                            </div>
                                        </main>
                                    </div>
                            </div>`
}

function backToDashBoard(){
    let lotManagementBoxSecBot = document.querySelector('.lotManagementBox-sec-bot')
    let rightSec = document.querySelector('.MainSection-Content-right-sec')

    lotManagementBoxSecBot.innerHTML = `<button class="addLotBtn" onclick="addLotui()">Add Lot</button>
                                        <button class="removeLotBtn" onclick="removeLotui()">Remove Lot</button>
                                        <button class="cancelLotReserBtn" onclick="cancelLotReservationui()">Cancel Lot Reservation</button>
                                        <button class="manageCurrentSchedBtn" onclick="manageContractScheduleui()">Manage Current Schedule</button>`

    rightSec.innerHTML = `  <div class="right-sec-topContent">
                                    <div class="availableLotsStat-container">
                                        <div class="availableLotsStat-sec-top">
                                            <h1>Available Lots</h1>
                                        </div>
            
                                        <div class="availableLotsStat-sec-bot">
                                            <div class="statContainer"><h1 class="statLabel">Number of Lots:</h1><p class="stat">100</p></div>
                                        </div>
                                    </div>

                                <div class="reservedLotsStat-container">
                                    <div class="reservedLotsStat-sec-top">
                                        <h1>Reserved Lots</h1>
                                    </div>
                
                                    <div class="reservedLotsStat-sec-bot">
                                        <div class="statContainer"><h1 class="statLabel">Number of Lots:</h1><p class="stat">100</p></div>
                                    </div>
                                </div>
                            </div>

                            <div class="right-sec-botContent">
                                <div class="rentedLotsStat-container">
                                    <div class="rentedLotsStat-sec-top">
                                        <h1>Rented Lots</h1>
                                    </div>
                
                                    <div class="rentedLotsStat-sec-bot">
                                        <div class="statContainer"><h1 class="statLabel">Number of Lots:</h1><p class="stat">100</p></div>
                                    </div>
                                </div>
                            </div>`                                   
}

/* Manage Products Functionalities */
