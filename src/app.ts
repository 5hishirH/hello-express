import express from "express";
import expressSession from "express-session";
import createPgStore from "connect-pg-simple";
import { S3Store } from "./file-store/index.js";
import { errorHandler } from "./middlewares/index.js";
import { AuthController, UserController } from "./controllers/index.js";
import { AuthService, UserService } from "./services/index.js";
import registerAuthRoutes from "./routes/auth.routes.js";
import registerUserRoutes from "./routes/user.routes.js";
import "dotenv/config";
import { Pool } from "pg";
import { cfg } from "./configs/index.js";
import {
  RefreshTokenRepository,
  UserRepository,
} from "./repositories/index.js";
import { FileTypeChecker, RequestUrlResolver } from "./utils/index.js";

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

const fileStore = new S3Store(
  cfg.STORAGE_ENDPOINT,
  cfg.STORAGE_ACCESS_KEY,
  cfg.STORAGE_SECRET_KEY,
  cfg.STORAGE_BUCKET,
  cfg.STORAGE_REGION,
);

const imageChecker = new FileTypeChecker(["jpg", "png", "webp"]);

const authService = new AuthService(
  userRepository,
  refreshTokenRepository,
  fileStore,
);

const profilePicPath = "/api/v1/user/profile/pic";
const requestUrlResolver = new RequestUrlResolver(profilePicPath);

const authController = new AuthController(imageChecker, authService, {
  name: cfg.REFRESH_COOKIE_NAME,
  expiry: cfg.REFRESH_EXPIRY,
  sameSite: cfg.NODE_ENV === "code_server" ? "none" : cfg.COOKIE_SAMESITE,
  isSecure: cfg.NODE_ENV !== "code_server",
});
const authRoutes = registerAuthRoutes(authController);
app.use("/api/v1/auth", authRoutes);

const userService = new UserService(userRepository);
const userController = new UserController(
  userService,
  fileStore,
  requestUrlResolver,
);
const userRoutes = registerUserRoutes(userController);
app.use("/api/v1/user", userRoutes);

app.use(errorHandler);

export default app;
