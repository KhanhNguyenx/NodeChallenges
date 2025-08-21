import { Router } from "express";
import * as controller from "../controllers/product.controller";
import * as authMiddleware from "../middlewares/auth.middleware";
import productDto from "../dto/product.dto";
import validate from "../middlewares/validate.middleware";
import upload from '../../config/multer';
import '../../swagger/productEndpoints'; // Import Swagger từ productEndpoints.ts

const router: Router = Router();

router.get("/", controller.getAllProducts);

router.get("/getById/:id", controller.getById);

router.get("/getByCategoryId/:id", controller.getByCategoryId);

router.get("/slug/:slug", controller.getBySlug);

router.post("/create", productDto, validate, authMiddleware.requireAuth, controller.create);

router.patch("/edit/:id", productDto, validate, authMiddleware.requireAuth, controller.edit);

router.delete("/delete/:id", authMiddleware.requireAuth, controller.deleteProduct);

router.post("/importProducts", upload.single('excelFile'), controller.importProducts);

export default router;