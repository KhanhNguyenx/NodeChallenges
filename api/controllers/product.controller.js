const pool = require("../../config/database");

// [GET] /api/product
module.exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
// [GET] /api/product/:id
module.exports.getById = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};
// [POST] /api/product
module.exports.create = async (req, res) => {
  const { name, slug, quantity } = req.body;
  
  try {
    const result = await pool.query(
      "INSERT INTO products (name, slug, quantity) VALUES ($1, $2, $3) RETURNING *",
      [name, slug, quantity || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create product" });
  }
};
// [GET] /api/product/slug/:slug
module.exports.getBySlug = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE slug = $1", [
      req.params.slug,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};
// [DELETE] /api/product/delete/:id
module.exports.delete = async (req,res)=>{
  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted", product: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete product" });
  }
}
//[PUT] /api/product/edit/:id
module.exports.edit = async (req,res)=>{
  const { name, slug, quantity } = req.body;
  try {
    const result = await pool.query(
      "UPDATE products SET name=$1, slug=$2, quantity=$3, updated_at=NOW() WHERE id=$4 RETURNING *",
      [name, slug, quantity, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product" });
  }
}