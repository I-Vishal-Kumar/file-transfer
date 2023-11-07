let mongoose = require("mongoose");
let mongooseSchema = mongoose.Schema;
let history_schema = new mongooseSchema({
  file_name: {
    type: String,
    default: "0",
  },
  time: {
    type: String,
  },
  user_id: {
    type: String,
  },
  type: {
    type: String,
  },
  item_id: {
    type: Number,
  },
  date: {
    type: String,
  },
  size: {
    type: String,
  },
});

let user_schema = new mongooseSchema({
  user_id: {
    type: String,
  },
  name: {
    type: String,
  },
  password: {
    type: String,
  },
});

let History = new mongoose.model("History", history_schema);
let User = new mongoose.model("User", user_schema);

module.exports = { History, User };
