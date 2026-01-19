import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import validate from "../middlewares/validate";
import { loginSchema } from "../dtos";

function registerRoutes(c: AuthController) {
  const r = Router();

  r.route("/login").post(validate(loginSchema), c.login);

  return r;
}

export default registerRoutes;
