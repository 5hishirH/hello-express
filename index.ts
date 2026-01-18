import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("The server is running");
});

const startServer = async () => {
  try {
    app.listen(8000, () => {
      console.log(`The server is running on port 8000`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
