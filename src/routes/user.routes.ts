import { Router } from "express";
import { UserController } from "../controllers/index.js";
import { authenticate, uploadSingle } from "../middlewares/index.js";

function registerRoutes(c: UserController) {
  const r = Router();

  r.use(authenticate);

  r.route("/profile").get(c.getProfile).patch(c.updateProfile);

  r.route("/profile/pic")
    .get(c.streamProfilePic)
    .patch(uploadSingle("profilePic"), c.udpateProfilePic);

  return r;
}

export default registerRoutes;
