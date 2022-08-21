const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Cart = new Schema({
  cartId: mongoose.Types.ObjectId,
  lineItems: [{
    imageUrl: String,
    productName: String,
    itemNumber: String,
    quantity: Number,
    price: Number
  }]
});

module.exports = mongoose.model("cart", Cart, "cart");