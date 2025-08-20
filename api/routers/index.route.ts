import { Application } from "express";
import productRoutes from "./product.route";
import userRoutes from "./user.route";

function routeApi(app: Application): void {
  app.use("/api/product", productRoutes);
  app.use("/api/user", userRoutes);
}

export default routeApi;
