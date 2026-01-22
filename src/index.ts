import expressApp from "./app.js";
import { cfg } from "./configs/index.js";

const port = cfg.PORT ?? 8000;

const startServer = async () => {
  try {
    expressApp.listen(port, () => {
      console.log(`The server is running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
