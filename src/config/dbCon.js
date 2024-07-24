const mongoose = require("mongoose");
require("dotenv").config();
const dbCon = async () => {
  await mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("Database connected successfully"))
    .catch((error) => console.log("DB Connection Error:", error));
};

module.exports = dbCon;
