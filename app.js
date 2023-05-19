//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

// Create a object from Mongoose Schema Class
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// Secret string instead of 2 keys from mongoose-encryption
// Add plugin before the User collection.
// Use encryptedFields: ['field'] to encrypt only certain fields rather than entire database
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

// save the user login details on the Register page
app.post("/register", function (req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });

  //   Only can view the Secrets page when is resgistered.
  //   During save, documents are encrypted
  newUser.save().then(function (success) {
    res
      .render("secrets")

      .catch(function (err) {
        console.log(err);
      });
  });
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  //   Check if the login username and password have been registered, if so users can access to Secret page.
  //    During find, documents are authenticated and then decrypted
  User.findOne({ email: username })
    .then(function (foundUser) {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    })
    .catch(function (err) {
      console.log("Username does not match");
    });
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
