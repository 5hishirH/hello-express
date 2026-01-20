import { Router } from "express";
import { AuthController } from "../controllers/index.js";
import { validate } from "../middlewares/index.js";
import { loginSchema, registerSchema } from "../validators/index.js";
import { upload } from "../middlewares/index.js";

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
