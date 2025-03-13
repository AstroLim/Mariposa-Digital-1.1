  const manageLotSelectedOpt = (selected) => {
  const interfaceElement = document.querySelector('#manage-mainview-settings-editable');
  const mainviewOptions = document.querySelectorAll('.manage-mainview-settings-options-button');
  const mainviewHeader = document.querySelector('#manage-mainview-settings-header');

  mainviewHeader.textContent = selected;

  mainviewOptions.forEach(option => {
    option.classList.remove('manage-mainview-settings-options--selected');
    if (option.textContent === selected) {
      option.classList.add('manage-mainview-settings-options--selected');
    }
  })

  if (selected === 'View Lots') {
    interfaceElement.innerHTML = `
    <div class="view-lots">
      <div class="view-lots-container">
        <h2 class="view-lots-container-header">Lot 1</h2>
        <div class="view-lots-container-info">
          <div class="view-lots-container-info-left">
            <div class="view-lots-container-info-left-description">Description</div>
            <button class="view-lots-container-info-left-button">Edit Lot</button>
          </div>
          <div>
            <img src="" alt="lot1">  
          </div>
        </div>
      </div>
      <div class="view-lots-container">
        <h2 class="view-lots-container-header">Lot 2</h2>
        <div class="view-lots-container-info">
          <div class="view-lots-container-info-left">
            <div class="view-lots-container-info-left-description">Description</div>
            <button class="view-lots-container-info-left-button">Edit Lot</button>
          </div>
          <div>
            <img src="" alt="lot1">  
          </div>
        </div>
      </div>
      <div class="view-lots-container">
        <h2 class="view-lots-container-header">Lot 3</h2>
        <div class="view-lots-container-info">
          <div class="view-lots-container-info-left">
            <div class="view-lots-container-info-left-description">Description</div>
            <button class="view-lots-container-info-left-button">Edit Lot</button>
          </div>
          <div>
            <img src="" alt="lot1">  
          </div>
        </div>
      </div>
      <div class="view-lots-container">
        <h2 class="view-lots-container-header">Lot 4</h2>
        <div class="view-lots-container-info">
          <div class="view-lots-container-info-left">
            <div class="view-lots-container-info-left-description">Description</div>
            <button class="view-lots-container-info-left-button">Edit Lot</button>
          </div>
          <div>
            <img src="" alt="lot1">  
          </div>
        </div>
      </div>
    </div>`;
  } else if (selected === 'Add Lot') {
    interfaceElement.innerHTML = `
    <div class="add-lot">
      <div class="add-lot-container">
        <h2 class="add-lot-container-header">Add Lot</h2>
        <div class="add-lot-container-info">
          <div class="add-lot-container-info-left">
            <label for="lot-name">Lot Name:</label>
            <input type="text" id="lot-name" name="lot-name">
            <label for="lot-price">Lot Price:</label>
            <input type="text" id="lot-price" name="lot-price">
            <label for="lot-size">Lot Size:</label>
            <input type="text" id="lot-size" name="lot-size">
            <label for="lot-status">Lot Status:</label>
            <input type="text" id="lot-status" name="lot-status">
          </div>
          <div class="add-lot-container-info-right">
            <label for="lot-description">Lot Description:</label>
            <textarea id="lot-description" name="lot-description"></textarea>
            <label for="lot-image">Lot Image:</label>
            <input type="file" id="lot-image" name="lot-image">
            <button>Add Lot</button>
          </div>
        </div>
      </div>
    </div> 
    `
  } else if (selected === 'Remove Lot') {
    interfaceElement.innerHTML = `
    <div class="remove-lot">
      <h2>Removing Lot</h2>
      <div class="remove-lot-form-group">
        <label for="lot-number">Lot Number: </label>
        <input type="text" id="lot-number" class="remove-lot-form-control">
      </div>
      <button class="remove-lot-button">Remove Lot</button>
    </div>
    `
  } else if (selected === 'Lot Reservation') {
    interfaceElement.innerHTML = `
      <div class="lot-reservation">
        <div class="lot-reservation-container">
          <div class="lot-reservation-container-header">List of Cancel Request</div>
          <div class="lot-reservation-container-box-layout">
            <div class="lot-reservation-container-box">
              <div class="lot-reservation-container-box-img">
                <img src="" alt="lot">
              </div>
              <div>Lot Number: <span>1</span></div>
              <div>Reason: <span>N/A</span></div>
              <div>Name: <span>John Doe</span></div>
              <div>Contact: <span>123-456-7890</span></div>
              <button>Accept Cancel Request</button>
            </div>
            <div class="lot-reservation-container-box">
              <div class="lot-reservation-container-box-img">
                <img src="" alt="lot">
              </div>
              <div>Lot Number: <span>1</span></div>
              <div>Reason: <span>N/A</span></div>
              <div>Name: <span>John Doe</span></div>
              <div>Contact: <span>123-456-7890</span></div>
              <button>Accept Cancel Request</button>
            </div>
            <div class="lot-reservation-container-box">
              <div class="lot-reservation-container-box-img">
                <img src="" alt="lot">
              </div>
              <div>Lot Number: <span>1</span></div>
              <div>Reason: <span>N/A</span></div>
              <div>Name: <span>John Doe</span></div>
              <div>Contact: <span>123-456-7890</span></div>
              <button>Accept Cancel Request</button>
            </div>
            <div class="lot-reservation-container-box">
              <div class="lot-reservation-container-box-img">
                <img src="" alt="lot">
              </div>
              <div>Lot Number: <span>1</span></div>
              <div>Reason: <span>N/A</span></div>
              <div>Name: <span>John Doe</span></div>
              <div>Contact: <span>123-456-7890</span></div>
              <button>Accept Cancel Request</button>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (selected === 'Contract Schedule') {
    interfaceElement.innerHTML = `
      <div class="contract-schedule">
        <div class="contract-schedule-layout">
          <div class="contract-schedule-layout-header">Lot Contract Signing Dates</div>
          <div class="contract-schedule-layout-box-container">
            <div class="contract-schedule-layout-box">
              <h2>Lot 1</h2>
              <div class="contract-schedule-layout-box-info">
                <div class="contract-schedule-layout-box-info-left">
                  <div>Date Req: <span>1/24/2025</span></div>
                  <button>Confirm Schedule</button>
                  <button>Cancel Schedule</button>
                </div>
                <div>
                  <img src="" alt="lot">
                </div>
              </div>
            </div>
            <div class="contract-schedule-layout-box">
              <h2>Lot 1</h2>
              <div class="contract-schedule-layout-box-info">
                <div class="contract-schedule-layout-box-info-left">
                  <div>Date Req: <span>1/24/2025</span></div>
                  <button>Confirm Schedule</button>
                  <button>Cancel Schedule</button>
                </div>
                <div>
                  <img src="" alt="lot">
                </div>
              </div>
            </div>
            <div class="contract-schedule-layout-box">
              <h2>Lot 1</h2>
              <div class="contract-schedule-layout-box-info">
                <div class="contract-schedule-layout-box-info-left">
                  <div>Date Req: <span>1/24/2025</span></div>
                  <button>Confirm Schedule</button>
                  <button>Cancel Schedule</button>
                </div>
                <div>
                  <img src="" alt="lot">
                </div>
              </div>
            </div>
            <div class="contract-schedule-layout-box">
              <h2>Lot 1</h2>
              <div class="contract-schedule-layout-box-info">
                <div class="contract-schedule-layout-box-info-left">
                  <div>Date Req: <span>1/24/2025</span></div>
                  <button>Confirm Schedule</button>
                  <button>Cancel Schedule</button>
                </div>
                <div>
                  <img src="" alt="lot">
                </div>
              </div>
            </div>  
          </div>
        </div>
      </div>
    `
  }
}

const manageProductSelectedOpt = (selected) => {
  const interfaceElement = document.querySelector('#manage-mainview-settings-editable');
  const mainviewOptions = document.querySelectorAll('.manage-mainview-settings-options-button');
  const mainviewHeader = document.querySelector('#manage-mainview-settings-header');

  mainviewHeader.textContent = selected;

  mainviewOptions.forEach(option => {
    option.classList.remove('manage-mainview-settings-options--selected');
    if (option.textContent === selected) {
      option.classList.add('manage-mainview-settings-options--selected');
    }
  })

  if (selected === 'View Products') {
    interfaceElement.innerHTML = `
      <div class="view-products">
        <div class="view-products-container">
          <h2 class="view-products-container-header">Rice 1</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <button class="view-products-container-info-left-description">Edit Description</button>
              <button class="view-products-container-info-left-button">Remove Product</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Rice 2</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <button class="view-products-container-info-left-description">Edit Description</button>
              <button class="view-products-container-info-left-button">Remove Product</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Rice 3</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <button class="view-products-container-info-left-description">Edit Description</button>
              <button class="view-products-container-info-left-button">Remove Product</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
        <div class="view-products-container">
          <h2 class="view-products-container-header">Rice 4</h2>
          <div class="view-products-container-info">
            <div class="view-products-container-info-left">
              <button class="view-products-container-info-left-description">Edit Description</button>
              <button class="view-products-container-info-left-button">Remove Product</button>
            </div>
            <div>
              <img src="" alt="rice">  
            </div>
          </div>
        </div>
      </div>
    `
  } else if (selected === 'Add Products') {
    interfaceElement.innerHTML = `
      <div class="add-products">
        <div class="add-products-container">
          <label for="product-name">Product Name:</label>
          <input id="product-name" type="text">
          <label for="product-price">Price Per Sack</label>
          <input id="product-price" type="text">
          <label for="product-description">Description</label>
          <input id="product-description" type="text">
          <label for="product-img">Product IMG</label>
          <input id="product-img" type="file">
          <button>Add Product</button>
        </div>
      </div>
    `
  } else if (selected === 'Remove Products') {
    interfaceElement.innerHTML = `
      <div class="remove-product">
        <h2>Removing Product</h2>
        <div class="remove-product-form-group">
          <label for="product-number">Product Number: </label>
          <input type="text" id="product-number" class="remove-product-form-control">
        </div>
        <button class="remove-product-button">Remove Product</button>
      </div>
    `
  } else if (selected === 'Logs') {
    interfaceElement.innerHTML = `
      <section class="logs">
        <div class="logs-container">
          <h2>Number of Products</h2>
          <div>Total: <span class="logs-container-nop">N/A</span></div>
        </div>
        <div class="logs-container">
          <h2>Products Added</h2>
          <div>Total: <span class="logs-container-pa">N/A</span></div>
        </div>
        <div class="logs-container">
          <h2>Number of Sales</h2>
          <div>Total: <span class="logs-container-nos">N/A</span></div>
        </div>
        <div class="logs-container">
          <h2>Products Removed</h2>
          <div>Total: <span class="logs-container-pr">N/A</span></div>
        </div>
        <div class="logs-container">
          <h2>Number of Cancelled Order</h2>
          <div>Total: <span class="logs-container-noco">N/A</span></div>
        </div>
      </section>
    `
  }
}