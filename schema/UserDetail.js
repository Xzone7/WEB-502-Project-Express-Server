const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserDetail = new Schema({
  memebershipId: String,
  username: String,
  password: String,
});

UserDetail.plugin(passportLocalMongoose);

module.exports = mongoose.model("userInfo", UserDetail, "userInfo");