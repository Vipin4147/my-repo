const express = require("express");
const BlacklistModel = require("../Model/blacklist_model.js");

const authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  const blacklist = await BlacklistModel.find({ blacklist: token });
  if (blacklist.length > 0) {
    res.send("please login first");
  } else {
    next();
  }
};

module.exports = authenticate;
