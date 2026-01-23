import { Router } from "express";
import { UserController } from "../controllers/index.js";
import { authenticate } from "../middlewares/index.js";

function registerRoutes(c: UserController) {
  const r = Router();

  r.route("/profile").get(authenticate, c.profile);

  return r;
}

export default registerRoutes;
