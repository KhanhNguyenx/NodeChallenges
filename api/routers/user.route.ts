import { Router } from "express";
import * as controller from "../controllers/user.controller";
import '../../swagger/userEndpoints'; // Import Swagger từ userEndpoints.ts
const router: Router = Router();

router.post("/register", controller.register);

router.post("/login", controller.login);

router.post("/verifyOtp", controller.verifyOtp);


export default router;