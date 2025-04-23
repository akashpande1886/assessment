const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.post("/add-item", (req, res) => {
  const { purchase_date, items } = req.body;

  if (!purchase_date || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: "Purchase date and at least one item are required." });
  }

  const query = `
    INSERT INTO items (name, purchase_date, stock_available, item_type_id)
    VALUES ?
  `;

  const values = items.map((item) => {
    if (!item.name || !item.item_type_id) {
      return res
        .status(400)
        .json({ error: "Each item must have a name and item_type_id." });
    }
    return [
      item.name,
      purchase_date,
      item.stock_available ? 1 : 0,
      item.item_type_id,
    ];
  });

  db.query(query, [values], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res
        .status(500)
        .json({ error: err.sqlMessage || "Failed to insert items." });
    }

    res.status(200).json({
      message: `${result.affectedRows} items added successfully.`,
      insertedCount: result.affectedRows,
    });
  });
});
router.get("/get-items", (req, res) => {
  const query = `
      SELECT 
        i.id, 
        i.name, 
        i.purchase_date, 
        i.stock_available, 
        t.type_name AS item_type
      FROM 
        items i
      JOIN 
        item_types t 
      ON 
        i.item_type_id = t.id
      ORDER BY 
        i.purchase_date DESC
    `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching items:", err);
      return res.status(500).json({ error: "Failed to fetch items" });
    }

    res.status(200).json(results);
  });
});
router.delete("/delete-item/:id", (req, res) => {
  const itemId = req.params.id;

  // Query to delete the item from the 'items' table
  const query = "DELETE FROM items WHERE id = ?";

  db.query(query, [itemId], (err, result) => {
    if (err) {
      console.error("Error deleting item:", err);
      return res.status(500).json({ error: "Failed to delete item" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  });
});

// Update an item by ID
router.put("/update-item/:id", (req, res) => {
  const itemId = req.params.id;
  const { name, purchase_date, stock_available, item_type_id } = req.body;

  // Query to update the item in the 'items' table
  const query = `
      UPDATE items 
      SET name = ?, purchase_date = ?, stock_available = ?, item_type_id = ? 
      WHERE id = ?
    `;

  db.query(
    query,
    [name, purchase_date, stock_available, item_type_id, itemId],
    (err, result) => {
      if (err) {
        console.error("Error updating item:", err);
        return res.status(500).json({ error: "Failed to update item" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.status(200).json({ message: "Item updated successfully" });
    }
  );
});
// Backend code: Get a single item by ID
router.get("/get-item/:id", (req, res) => {
  const itemId = req.params.id;

  const query = "SELECT * FROM items WHERE id = ?";
  db.query(query, [itemId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching item details" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Return the item data as JSON
    res.status(200).json(result[0]);
  });
});

module.exports = router;
