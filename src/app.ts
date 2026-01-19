import express from "express";
import registerAuthRoutes from "./routes/auth.routes";
import { AuthController } from "./controllers/auth.controller";
import { errorHandler } from "./middlewares/error-handler";
import { AuthService } from "./services";
import { StringValue } from "ms";

const app = express();

app.use(express.json({ limit: "10mb" }));

app.get("/", (_, res) => {
  res.send("The server is running");
});

const authService = new AuthService();
const authController = new AuthController("7d" as StringValue, authService);
const authRoutes = registerAuthRoutes(authController);
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;
