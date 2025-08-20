const productRoutes = require("./product.route");
const userRoutes = require("./user.route");

function routeApi(app) {
  app.use("/api/product", productRoutes);
  
  app.use("/api/user", userRoutes);
}

module.exports = routeApi;
