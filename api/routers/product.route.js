const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const productDto = require("../dto/product.dto");
const validate = require("../middlewares/validate.middleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - slug
 *         - quantity
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the product
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           description: The name of the product
 *           example: "Laptop XYZ"
 *         slug:
 *           type: string
 *           description: The URL-friendly slug of the product
 *           example: "laptop-xyz"
 *         quantity:
 *           type: integer
 *           description: The available quantity of the product
 *           example: 100
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *         - quantity
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the product
 *           example: "Laptop XYZ"
 *         slug:
 *           type: string
 *           description: The URL-friendly slug of the product
 *           example: "laptop-xyz"
 *         quantity:
 *           type: integer
 *           description: The available quantity of the product
 *           example: 100
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/product:
 *   get:
 *     summary: Retrieve a list of all products
 *     description: Returns a list of all products sorted by creation date in descending order.
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *             example:
 *               - id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Laptop XYZ"
 *                 slug: "laptop-xyz"
 *                 quantity: 100
 *               - id: "987e6543-e21b-12d3-a456-426614174000"
 *                 name: "Mouse ABC"
 *                 slug: "mouse-abc"
 *                 quantity: 50
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to fetch products"
 *
 * /api/product/getById/{id}:
 *   get:
 *     summary: Retrieve a product by ID
 *     description: Returns a single product based on its unique identifier.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Laptop XYZ"
 *               slug: "laptop-xyz"
 *               quantity: 100
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to fetch product"
 *
 * /api/product/slug/{slug}:
 *   get:
 *     summary: Retrieve a product by slug
 *     description: Returns a single product based on its URL-friendly slug.
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL-friendly slug of the product
 *         example: "laptop-xyz"
 *     responses:
 *       200:
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Laptop XYZ"
 *               slug: "laptop-xyz"
 *               quantity: 100
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to fetch product"
 *
 * /api/product/create:
 *   post:
 *     summary: Create a new product
 *     description: Creates a new product with the provided details. Requires authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: "Laptop XYZ"
 *             slug: "laptop-xyz"
 *             quantity: 100
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Laptop XYZ"
 *               slug: "laptop-xyz"
 *               quantity: 100
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid input data"
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Authentication required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to create product"
 *
 * /api/product/edit/{id}:
 *   patch:
 *     summary: Update a product
 *     description: Updates an existing product by its ID. Requires authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *           example:
 *             name: "Laptop XYZ Updated"
 *             slug: "laptop-xyz-updated"
 *             quantity: 150
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               id: "123e4567-e89b-12d3-a456-426614174000"
 *               name: "Laptop XYZ Updated"
 *               slug: "laptop-xyz-updated"
 *               quantity: 150
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Invalid input data"
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Authentication required"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to update product"
 *
 * /api/product/delete/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Deletes a product by its ID. Requires authentication.
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the product
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Authentication required"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *                   example: "Failed to delete product"
 */

router.get("/", controller.getAllProducts);

router.get("/getById/:id", controller.getById);

router.get("/slug/:slug", controller.getBySlug);

router.post(
  "/create",
  productDto,
  validate,
  authMiddleware.requireAuth,
  controller.create
);

router.patch(
  "/edit/:id",
  productDto,
  validate,
  authMiddleware.requireAuth,
  controller.edit
);

router.delete(
  "/delete/:id",
  authMiddleware.requireAuth,
  controller.delete
);

module.exports = router;
