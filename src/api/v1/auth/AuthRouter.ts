import { Router } from "express";
import { AuthService } from "./service/AuthService";
import { AuthController } from "./controller/AuthController";
import { body } from "express-validator";
import { authenticate } from "../../../middlewares/AuthMiddleware";
import { asyncHandler } from "../../../util/AsyncHandler";

const router = Router();
const authService: AuthService = new AuthService();
const authController: AuthController = new AuthController(authService);

router.post(
    "/signup",
    body("username").escape(),
    body("fullName").escape(),
    body("email").escape(),
    body("password").escape(),
    asyncHandler(authController.signUp)
);
router.post(
    "/login",
    body("email").escape(),
    body("password").escape(),
    asyncHandler(authController.login)
);
router.post(
    "/logout",
    asyncHandler(authenticate),
    asyncHandler(authController.logout)
);

export { router as APIV1AuthRouter };
