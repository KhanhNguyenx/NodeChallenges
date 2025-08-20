const express = require("express");
require("dotenv").config();

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

// Import routes
const routeApi = require("./api/routers/index.route");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:3000`,
      },
    ],
  },
  apis: ["./api/routers/*.route.js"],
};
const specs = swaggerJsDoc(options);

const app = express();

// Middleware parse JSON + form
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Gọi hàm định nghĩa routes
routeApi(app);

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
