const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");
//const cart = [];
const addProductToCart = async (req, res) => {
  console.log(req.body);
  const { userid, productid, qty } = req.body;
  let cart = await Cart.findOne({ userid });
  if (cart) {
    const productIndex = cart.items.findIndex(
      (item) => item.productid == productid
    );
    console.log(productIndex);
    if (productIndex > -1) {
      cart.items[productIndex].qty = qty;
    } else {
      cart.items.push({
        productid,
        qty,
      });
    }
  } else {
    cart = new Cart({
      userid,
      items: [{ productid, qty }],
    });
  }

  let totalPrice = 0;

  for (let item of cart.items) {
    const product = await Product.findById({ _id: item.productid });

    if (product) {
      totalPrice = totalPrice + product.discountedPrice * qty;
      console.log(product.discountedPrice);
    }
  }

  cart.totalPrice = totalPrice;
  cart.totalItems = cart.items.reduce((acc, curr) => acc + curr.qty, 0);
  const newProduct = await cart.save();
  // const product = req.body;
  // cart.push(product);
  // console.log(cart);
  res.json({ status: 1, message: "added successfully", cart: newProduct });
};

const removeProductFromCart = async (req, res) => {
  const { userid, productid } = req.body;
  const cart = await Cart.findOne({ userid });

  if (cart) {
    cart.items = cart.items.filter((product) => product.productid != productid);
    console.log(cart.items);
    let totalPrice = 0;
    for (let item of cart.items) {
      const product = await Product.findById({ _id: item.productid });
      //console.log(product);
      if (product) {
        totalPrice = totalPrice + product.discountedPrice * item.qty;
      }
    }
    console.log(totalPrice);
    cart.totalPrice = totalPrice;
    cart.totalItems = cart.items.reduce((acc, curr) => acc + curr.qty, 0);
    const updatedCart = await cart.save();
    // const product = req.body;
    // cart.push(product);
    console.log(updatedCart);
    res.json({ status: 1, message: "deleted successfully", cart: updatedCart });
  } else {
    res.json({ status: 1, message: "User Cart is empty" });
  }

  // const product = req.body;
  // cart.push(product);
  // console.log(cart);
};

const getCartItems = async (req, res) => {
  console.log(req.body);
  const { userid } = req.params;
  const items = await Cart.find({ userid });
  res.json({ status: 1, message: "Success", cart: items });
};

module.exports = { addProductToCart, removeProductFromCart, getCartItems };
