const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "customer",
    enum: ["customer", "seller"],
  },
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
