import express, { Application } from "express";
import dotenv from "dotenv";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

// Import routes
import routeApi from "./api/routers/index.route";

dotenv.config();

const options: swaggerJsDoc.Options = {
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
  // ⚠️ Đổi sang .ts nếu bạn viết route bằng TypeScript
  apis: ["./api/routers/*.route.ts"],
};

const specs = swaggerJsDoc(options);

const app: Application = express();

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
