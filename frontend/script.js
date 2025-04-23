let itemCount = 0;

function addItem() {
  const container = document.getElementById("items");
  const itemHTML = `
    <div class="item" id="item-${itemCount}">
      <label>Item Name:
        <input type="text" placeholder="Item Name" required name="name-${itemCount}" />
      </label>
      <label>Item Type:
        <select name="type-${itemCount}" required>
          <option value="1">Electronics</option>
          <option value="2">Furniture</option>
          <option value="3">Clothing</option>
        </select>
      </label>
      <label>
        <input type="checkbox" name="stock-${itemCount}" />
        In Stock
      </label>
      <button type="button" onclick="removeItem(${itemCount})">Remove</button>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", itemHTML);
  itemCount++;
}

function removeItem(id) {
  document.getElementById(`item-${id}`)?.remove();
}

document
  .getElementById("itemForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = new FormData(e.target);
    const purchase_date = form.get("purchase_date");
    const items = [];

    for (let i = 0; i < itemCount; i++) {
      if (form.has(`name-${i}`)) {
        items.push({
          name: form.get(`name-${i}`),
          item_type_id: parseInt(form.get(`type-${i}`)),
          stock_available: form.get(`stock-${i}`) === "on",
        });
      }
    }

    const payload = { purchase_date, items };

    const res = await fetch("http://localhost:8000/add-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    alert(result.message || result.error);
  });

// Helper function to format the date in 'YYYY-MM-DD' format
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero for months < 10
  const day = String(date.getDate()).padStart(2, "0"); // Add leading zero for days < 10

  return `${year}-${month}-${day}`;
}

// Function to fetch and display items
async function fetchItems() {
  try {
    // Fetch items from the backend
    const response = await fetch("http://localhost:8000/get-items");
    const items = await response.json();

    // Get the tbody element to insert the rows
    const tbody = document.getElementById("tableBody");

    // Clear any existing rows
    tbody.innerHTML = "";

    // Loop through the items and insert rows into the table
    items.forEach((item) => {
      const row = document.createElement("tr");
      row.setAttribute("data-id", item.id);

      row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${formatDate(
              item.purchase_date
            )}</td> <!-- Format the date here -->
            <td class="${item.stock_available ? "stock-true" : "stock-false"}">
              ${item.stock_available ? "Yes" : "No"}
            </td>
            <td>${item.item_type}</td>
            <td>
              <button class="edit-btn" onclick="editItem(${
                item.id
              })">Edit</button>
              <button class="delete-btn" onclick="deleteItem(${
                item.id
              })">Delete</button>
            </td>
          `;

      tbody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

// Call the fetchItems function immediately after the script is loaded or triggered
fetchItems();

// Function to edit an item
function editItem(itemId) {
  // Fetch the item data
  fetch(`http://localhost:8000/get-item/${itemId}`)
    .then((res) => res.json())
    .then((item) => {
      // Show the edit form
      document.getElementById("editForm").style.display = "block";

      // Populate the form with the item's current data
      document.getElementById("editItemId").value = item.id;
      document.getElementById("editName").value = item.name;
      document.getElementById("editPurchaseDate").value = item.purchase_date;
      document.getElementById("editStockAvailable").checked =
        item.stock_available;
      document.getElementById("editItemType").value = item.item_type_id;
    })
    .catch((error) => console.error("Error fetching item:", error));
}

// Function to save the edited item
document.getElementById("editItemForm").onsubmit = async function (e) {
  e.preventDefault();

  const itemId = document.getElementById("editItemId").value;
  const name = document.getElementById("editName").value;
  const purchase_date = document.getElementById("editPurchaseDate").value;
  const stock_available = document.getElementById("editStockAvailable").checked;
  const item_type_id = document.getElementById("editItemType").value;

  const payload = {
    name,
    purchase_date,
    stock_available,
    item_type_id,
  };

  // Send a PUT request to update the item
  const res = await fetch(`http://localhost:8000/update-item/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  alert(data.message || data.error);

  if (res.status === 200) {
    // Update the item in the table without reloading the page
    window.location.reload();
  }
};

// Function to delete an item
async function deleteItem(itemId) {
  try {
    const res = await fetch(`http://localhost:8000/delete-item/${itemId}`, {
      method: "DELETE",
    });

    const data = await res.json();
    alert(data.message || data.error);

    if (res.status === 200) {
      // Remove the item from the table without reloading the page
      const row = document.querySelector(`tr[data-id="${itemId}"]`);
      if (row) {
        row.remove();
      }
    }
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}
