/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/product:
 *   get:
 *     summary: Retrieve a list of products with pagination and filtering
 *     description: Returns a paginated list of products, optionally filtered by search term (name or slug) and quantity range, sorted by ID in descending order.
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of products per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           default: ""
 *         description: Search term to filter products by name or slug (case-insensitive)
 *         example: "laptop"
 *       - in: query
 *         name: minQuantity
 *         schema:
 *           type: integer
 *         description: Minimum quantity to filter products
 *         example: 10
 *       - in: query
 *         name: maxQuantity
 *         schema:
 *           type: integer
 *         description: Maximum quantity to filter products
 *         example: 100
 *     responses:
 *       200:
 *         description: A paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *             example:
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "Laptop XYZ"
 *                   slug: "laptop-xyz"
 *                   quantity: 100
 *                 - id: "987e6543-e21b-12d3-a456-426614174000"
 *                   name: "Mouse ABC"
 *                   slug: "mouse-abc"
 *                   quantity: 50
 *               pagination:
 *                 total: 50
 *                 page: 1
 *                 limit: 10
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type: { type: 'string' }
 *                       msg: { type: 'string' }
 *                       path: { type: 'string' }
 *                       location: { type: 'string' }
 *                   example:
 *                     - type: "field"
 *                       msg: "Name is required"
 *                       path: "name"
 *                       location: "body"
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type: { type: 'string' }
 *                       msg: { type: 'string' }
 *                       path: { type: 'string' }
 *                       location: { type: 'string' }
 *                   example:
 *                     - type: "field"
 *                       msg: "Name is required"
 *                       path: "name"
 *                       location: "body"
 *       401:
 *         description: Unauthorized, authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
 *                   example: "Failed to delete product"
 */