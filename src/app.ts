import express from "express";
import expressSession from "express-session";
import createPgStore from "connect-pg-simple";
import { S3Store } from "./file-store/index.js";
import { errorHandler } from "./middlewares/index.js";
import { AuthController } from "./controllers/index.js";
import { AuthService } from "./services/index.js";
import registerAuthRoutes from "./routes/auth.routes.js";
import { StringValue } from "ms";
import "dotenv/config";
import { Pool } from "pg";
import { cfg } from "./configs/index.js";
import {
  RefreshTokenRepository,
  UserRepository,
} from "./repositories/index.js";
import { checkFileType } from "./utils/index.js";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const pgPool = new Pool({ connectionString: cfg.DATABASE_URL });

const pgStore = createPgStore(expressSession);
app.use(
  expressSession({
    store: new pgStore({
      pool: pgPool,
      tableName: "sessions",
    }),
    secret: cfg.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: cfg.SESSION_EXPIRY,
    },
  }),
);

app.get("/", (_, res) => {
  res.send("The server is running");
});

const userRepository = new UserRepository(pgPool);
const refreshTokenRepository = new RefreshTokenRepository(pgPool);
const checkImage = checkFileType(["jpg", "png", "webp"]);

const fileStore = new S3Store(
  cfg.STORAGE_ENDPOINT,
  cfg.STORAGE_ACCESS_KEY,
  cfg.STORAGE_SECRET_KEY,
  cfg.STORAGE_BUCKET,
  cfg.STORAGE_REGION,
);
const authService = new AuthService(
  userRepository,
  refreshTokenRepository,
  fileStore,
);
const authController = new AuthController(checkImage, authService, {
  name: cfg.REFRESH_COOKIE_NAME,
  expiry: cfg.REFRESH_EXPIRY,
  sameSite: cfg.NODE_ENV === "code_server" ? "none" : cfg.COOKIE_SAMESITE,
  isSecure: cfg.NODE_ENV !== "code_server",
});
const authRoutes = registerAuthRoutes(authController);
app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);

export default app;
