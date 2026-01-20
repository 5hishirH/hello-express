import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import validate from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validators";
import { upload } from "../middlewares";

function registerRoutes(c: AuthController) {
  const r = Router();

  r.route("/register").post(
    upload.single("profilePicture"),
    validate(registerSchema),
    c.register,
  );

  r.route("/login").post(validate(loginSchema), c.login);

  return r;
}

export default registerRoutes;
