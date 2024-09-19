const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");
dotenv.config({ path: "./config.env" });
const database = process.env.MONGODB_URL.replace(
  "<db_password>",
  process.env.MONGODB_PASS
);
const port = process.env.PORT || 3000;

// write what happens on uncaught exception and promise rejection

mongoose
  .connect(database)
  .then(() => {
    console.log("DB connection successful!");
    app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });
