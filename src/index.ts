import expressApp from "./app";
import "dotenv/config";

const startServer = async () => {
  try {
    expressApp.listen(8000, () => {
      console.log(`The server is running on port 8000`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
