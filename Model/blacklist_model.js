const mongoose = require("mongoose");

const BlacklistSchema = mongoose.Schema({
  blacklist: String,
});

const BlacklistModel = mongoose.model("blacklist", BlacklistSchema);

module.exports = BlacklistModel;
