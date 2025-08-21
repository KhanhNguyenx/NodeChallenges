import { Router } from "express";
import upload from '../../config/multer';
import * as controller from "../controllers/employee.controller";
const router: Router = Router();

router.post("/importEmployees", upload.single('excelFile'), controller.importEmployees);

router.get('/exportEmployees', controller.exportEmployees);

export default router;