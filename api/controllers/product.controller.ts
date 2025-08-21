import { Request, Response } from "express";
import pool from "../../config/database";
import { JwtPayload } from "jsonwebtoken";
import ExcelJS from 'exceljs';
import fs from 'fs/promises';
import { RowError } from '../types/excelRowError';
import { uploadProduct} from '../types/uploadProducts';
import removeAccents from 'remove-accents';

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
      const keyword = (search as string).replace(/\s+/g, '-'); // thay khoảng trắng bằng dấu -

      query += ` AND (slug ILIKE $${index} OR name ILIKE $${index})`;
      countQuery += ` AND (slug ILIKE $${index} OR name ILIKE $${index})`;
      values.push(`%${keyword}%`);
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
// [GET] /api/product/getByCategoryId/:id
export const getByCategoryId = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    const categoryId = req.params.id;

    // Lấy sản phẩm theo category_id
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = $1`,
      [categoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No products found for this category" });
    }

    return res.json(result.rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to fetch products by category" });
  }
};
// [POST] /api/product
export const create = async (req: AuthRequest, res: Response): Promise<Response | void> => {
  const { name, slug, quantity, category_id } = req.body;

  try {
    const decodedUser = req.user as JwtPayload;
    const userId = decodedUser?.id;

    if (!userId) {
      return res.status(401).json({ error: "Invalid user" });
    }

    // Kiểm tra category_id
    if (category_id) {
      const categoryCheck = await pool.query(
        `SELECT id FROM categories WHERE id = $1`,
        [category_id]
      );
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ error: "Invalid category_id" });
      }
    }

    const result = await pool.query(
      `INSERT INTO products (name, slug, quantity, category_id, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, slug, quantity, category_id, created_by, created_at`,
      [name, slug, quantity || 0, category_id || null, userId]
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
  const { name, slug, quantity, category_id } = req.body;

  try {
    // Lấy userId từ token
    const decodedUser = req.user as JwtPayload;
    const userId = decodedUser?.id;

    // Nếu có category_id gửi lên, kiểm tra tồn tại trong bảng categories
    if (category_id) {
      const categoryCheck = await pool.query(
        `SELECT id FROM categories WHERE id = $1`,
        [category_id]
      );
      if (categoryCheck.rows.length === 0) {
        return res.status(400).json({ error: "Invalid category_id" });
      }
    }

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, slug = $2, quantity = $3, category_id = $4, updated_at = NOW(), updated_by = $5
       WHERE id = $6
       RETURNING id, name, slug, quantity, category_id, updated_at, updated_by`,
      [name, slug, quantity, category_id || null, userId, req.params.id]
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
// [POST] /api/products/import
export const importProducts = async (req: Request, res: Response): Promise<Response | void> => {
  try {
    // Check for file
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng tải lên file Excel!' });
    }

    const filePath: string = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet: ExcelJS.Worksheet | undefined = workbook.getWorksheet(1);

    // Check if worksheet exists
    if (!worksheet) {
      await fs.unlink(filePath);
      return res.status(400).json({ error: 'Không tìm thấy worksheet trong file Excel!' });
    }

    // Array to store formatted data and errors
    const formattedData: uploadProduct[] = [];
    const rowErrors: RowError[] = [];

    // Collect all rows first
    const rows: { row: ExcelJS.Row; rowNumber: number }[] = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row
      rows.push({ row, rowNumber });
    });

    // Process rows sequentially
    for (const { row, rowNumber } of rows) {
      const name = row.getCell(1).value;
      const slug = row.getCell(2).value;
      const quantity = row.getCell(3).value;
      const category = row.getCell(4).value;

      // Validate name (must be a non-empty string)
      let nameValue: string = '';
      const nameErrors: string[] = [];
      if (typeof name === 'string' && name.trim() !== '') {
        nameValue = name.trim();
      } else {
        nameErrors.push('Name must be a non-empty string');
      }
      if (nameErrors.length > 0) {
        rowErrors.push({ rowNumber, errors: nameErrors });
      }

      // Validate slug (must be a non-empty string)
      let slugValue: string = '';
      const slugErrors: string[] = [];
      if (typeof slug === 'string' && slug.trim() !== '') {
        slugValue = slug.trim();
      } else {
        slugErrors.push('Slug must be a non-empty string');
      }
      if (slugErrors.length > 0) {
        rowErrors.push({ rowNumber, errors: slugErrors });
      }

      // Validate quantity (must be a non-negative integer)
      let quantityValue: number = 0;
      const quantityErrors: string[] = [];
      if (typeof quantity === 'number' && !isNaN(quantity) && Number.isInteger(quantity) && quantity >= 0) {
        quantityValue = quantity;
      } else if (typeof quantity === 'string') {
        const parsedQuantity = parseInt(quantity, 10);
        if (!isNaN(parsedQuantity) && Number.isInteger(parsedQuantity) && parsedQuantity >= 0) {
          quantityValue = parsedQuantity;
        } else {
          quantityErrors.push('Quantity must be a valid non-negative integer');
        }
      } else {
        quantityErrors.push('Quantity must be a valid integer');
      }
      if (quantityErrors.length > 0) {
        rowErrors.push({ rowNumber, errors: quantityErrors });
      }

      // Validate category and find category_id
      let categoryId: number | null = null;
      const categoryErrors: string[] = [];
      if (typeof category === 'string' && category.trim() !== '') {
        // Process category: remove diacritics, lowercase, replace spaces with hyphens
        const categorySlug = removeAccents(category.trim())
          .toLowerCase()
          .replace(/\s+/g, '-');
        // Query categories table to find category_id
        const categoryResult = await pool.query(
          'SELECT id FROM categories WHERE slug = $1',
          [categorySlug],
        );
        
        if (categoryResult.rows.length > 0) {
          categoryId = categoryResult.rows[0].id;
        } else {
          categoryErrors.push(`Category "${category}" not found in categories table`);
        }
      } else {
        categoryErrors.push('Category must be a non-empty string');
      }
      if (categoryErrors.length > 0) {
        rowErrors.push({ rowNumber, errors: categoryErrors });
      }

      // If no errors for this row, add to formattedData
      if (nameErrors.length === 0 && slugErrors.length === 0 && quantityErrors.length === 0 && categoryErrors.length === 0) {
        formattedData.push({
          name: nameValue,
          slug: slugValue,
          quantity: quantityValue,
          category_id: categoryId!,
        });
      }
    }

    // If there are errors, return them and stop processing
    if (rowErrors.length > 0) {
      await fs.unlink(filePath);
      return res.status(400).json({
        error: 'Invalid data in Excel file',
        details: rowErrors,
      });
    }

    // Save to PostgreSQL
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const data of formattedData) {
        await client.query(
          `INSERT INTO products (name, slug, quantity, category_id)
           VALUES ($1, $2, $3, $4)`,
          [data.name, data.slug, data.quantity, data.category_id],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    // Delete temporary file
    await fs.unlink(filePath);

    return res.json({
      message: 'Dữ liệu đã được lưu vào bảng products thành công!',
      data: formattedData,
    });
  } catch (e) {
    console.error(e);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    return res.status(500).json({ error: 'Failed to import products' });
  }
};