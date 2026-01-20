import express from "express";
import { S3Store } from "./file-store/index.js";
import { errorHandler } from "./middlewares/index.js";
import { AuthController } from "./controllers/index.js";
import { AuthService } from "./services/index.js";
import registerAuthRoutes from "./routes/auth.routes.js";
import { StringValue } from "ms";
import "dotenv/config";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_, res) => {
  res.send("The server is running");
});

const fileStore = new S3Store(
  process.env.SUPABASE_ENDPOINT!,
  process.env.SUPABASE_ACCESS_KEY!,
  process.env.SUPABASE_SECRET_KEY!,
  process.env.SUPABASE_BUCKET!,
  process.env.SUPABASE_REGION!,
);
const authService = new AuthService(fileStore);
const authController = new AuthController("7d" as StringValue, authService);
const authRoutes = registerAuthRoutes(authController);
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;
