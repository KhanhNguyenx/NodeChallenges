import { Request, Response } from "express";
import pool from "../../config/database";
import { JwtPayload } from "jsonwebtoken";
interface AuthRequest extends Request {
  user?: string | JwtPayload;
}
// [GET] /api/product?page=1&limit=10&search=""&minQuantity=&maxQuantity=
export const getAllProducts = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const { page = "1", limit = "10", search = "", minQuantity, maxQuantity } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // chỉ định cột cần lấy
    let query = `SELECT id, name, slug, quantity FROM products WHERE 1=1`;
    let countQuery = `SELECT COUNT(*) FROM products WHERE 1=1`;

    const values: any[] = [];
    let index = 1;

    // search theo tên hoặc slug
    if (search) {
      query += ` AND (name ILIKE $${index} OR slug ILIKE $${index})`;
      countQuery += ` AND (name ILIKE $${index} OR slug ILIKE $${index})`;
      values.push(`%${search}%`);
      index++;
    }

    // lọc theo số lượng
    if (minQuantity) {
      query += ` AND quantity >= $${index}`;
      countQuery += ` AND quantity >= $${index}`;
      values.push(minQuantity);
      index++;
    }
    if (maxQuantity) {
      query += ` AND quantity <= $${index}`;
      countQuery += ` AND quantity <= $${index}`;
      values.push(maxQuantity);
      index++;
    }

    // sắp xếp mới nhất
    query += ` ORDER BY id DESC LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limitNum, offset);

    // query db
    const result = await pool.query(query, values);
    const totalResult = await pool.query(countQuery, values.slice(0, index - 1));

    return res.json({
      data: result.rows,
      pagination: {
        total: parseInt(totalResult.rows[0].count, 10),
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};
// [GET] /api/product/:id
export const getById = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
};
// [POST] /api/product
export const create = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  const { name, slug, quantity } = req.body;

  try {
    // Lấy userId từ token (auth.middleware đã decode)
    const decodedUser = req.user as JwtPayload;
    const userId = decodedUser?.id; 

    if (!userId) {
      return res.status(401).json({ error: "Invalid user" });
    }

    const result = await pool.query(
      `INSERT INTO products (name, slug, quantity, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, slug, quantity, created_by, created_at`,
      [name, slug, quantity || 0, userId]
    );

    return res.status(201).json({
      message: "Product created successfully",
      product: result.rows[0],
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to create product" });
  }
};
// [GET] /api/product/slug/:slug
export const getBySlug = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const query = `
      SELECT id, name, slug, quantity
      FROM products
      WHERE slug = $1
    `;
    const result = await pool.query(query, [req.params.slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch product" });
  }
};
// [DELETE] /api/product/delete/:id
export const deleteProduct = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.json({ message: "Product deleted", product: result.rows[0] });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to delete product" });
  }
};
// [PATCH] /api/product/edit/:id
export const edit = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  const { name, slug, quantity } = req.body;

  try {
    // Lấy userId từ token
    const decodedUser = req.user as JwtPayload;
    const userId = decodedUser?.id;

    const result = await pool.query(
      `UPDATE products 
       SET name=$1, slug=$2, quantity=$3, updated_at=NOW(), updated_by=$4
       WHERE id=$5 
       RETURNING id, name, slug, quantity, updated_at, updated_by`,
      [name, slug, quantity, userId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    return res.json({
      message: "Product updated successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update product" });
  }
};