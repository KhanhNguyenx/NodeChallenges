import { Application } from "express";
import productRoutes from "./product.route";
import userRoutes from "./user.route";
import employeeRoutes from "./employee.route";

function routeApi(app: Application): void {
  app.use("/api/product", productRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/employee", employeeRoutes);
}

export default routeApi;
