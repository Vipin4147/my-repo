require("dotenv").config();

const connection = require("./config/db.js");

const express = require("express");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const UserModel = require("./Model/user_model.js");

const BlacklistModel = require("./Model/blacklist_model.js");

const cookie_parser = require("cookie-parser");

const authenticate = require("./middlewares/authenticate.js");

const app = express();

app.use(cookie_parser());
app.use(express.json());

const authorize = (pass_role) => {
  return (req, res, next) => {
    if (pass_role.includes("customer")) {
      next();
    } else {
      res.send("unauthorize");
    }
  };
};

const authorize2 = (pass_role) => {
  return (req, res, next) => {
    if (pass_role.includes("seller")) {
      next();
    } else {
      res.send("unauthorize");
    }
  };
};

app.get("/", authenticate, authorize(["customer"]), (req, res) => {
  res.send("this is homepage");
});

app.get("/products", authenticate, (req, res) => {
  res.send("this is homepage");
});

app.get("/addproducts", authenticate, authorize2(["seller"]), (req, res) => {
  res.send("only seller can add products");
});

app.get("/deleteproducts", authenticate, authorize2(["seller"]), (req, res) => {
  res.send("only seller can delete products");
});

app.post("/signup", async (req, res) => {
  const { username, email, password, role } = req.body;

  const user = await UserModel.find({ email });

  if (user.length > 0) {
    res.send("already registered please login");
  } else {
    bcrypt.hash(password, 5, async (err, hashed_password) => {
      if (err) {
        console.log(err);
        res.send(err);
      }
      const ruser = await new UserModel({
        username,
        email,
        password: hashed_password,
        role,
      });
      ruser.save();
      res.send("registered successfully");
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await UserModel.find({ email });
  if (user.length > 0) {
    const hash_pass = await bcrypt.compare(password, user[0].password);
    if (!hash_pass) {
      console.log("incorrect password");
    } else {
      const token = jwt.sign({ userId: user[0]._id }, process.env.JWT_SECRET, {
        expiresIn: "1m",
      });
      const ref_token = jwt.sign(
        { userId: user[0]._id },
        process.env.REF_SECRET,
        {
          expiresIn: "5m",
        }
      );
      req.user = user;
      console.log("req", req.user);
      res.cookie("token", token);
      res.cookie("reftoken", ref_token);
      res.send({ msg: "login successful", token, ref_token });
    }
  }
});

app.get("/logout", async (req, res) => {
  let token = req.cookies.token;
  const blacklist = await new BlacklistModel({ blacklist: token });
  blacklist.save();
  res.send("logout successful");
});

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("connected to db");
  } catch (error) {
    console.log(error);
  }
  console.log("running at env port");
});
