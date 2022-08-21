const express = require("express");
const ensureLoggedIn = require("../middleware/ensureLoggedIn");
const passport = require("passport");
const UserDetails = require("../schema/UserDetail");
const Cart = require("../schema/Cart");
const { calculateOrderSummary, getRandomCartItem, updateLineItems } = require("../utils/utils");

const router = express.Router();

/* Passport Registration */
passport.use(UserDetails.createStrategy());
passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).json({
        status: "Bad Request",
        payload: {
          isLoggedIn: false,
        },
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({
        status: "Success",
        payload: {
          isLoggedIn: true,
          username: req.user.username,
        },
      });
    });
  })(req, res, next);
});

router.get("/cart", ensureLoggedIn(), (req, res) => {
  Cart.findOne({ cartId: req.user._id })
    .then((data) => {
      res.status(200).json({
        status: "Success",
        payload: {
          cartId: data.cartId,
          lineItems: data.lineItems,
          orderSummary: calculateOrderSummary(data.lineItems),
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "Internal Error",
        payload: {
          errorMessage: err,
        },
      });
    });
  // new Cart({
  //   cartId: req.user._id,
  //   lineItems: [{
  //     imageUrl: "https://scene7.samsclub.com/is/image/samsclub/0007874228838_A?wid=200&hei=200",
  //     productName: "Member's Mark Ultra Soup/Salad Paper Bowls (20 oz., 150 ct.)",
  //     itemNumber: "980089707",
  //     quantity: 1,
  //     price: 12.92
  //   }]
  // }).save((err) => {
  //   console.log(err);
  // })
});

router.get("/addLineItem", ensureLoggedIn(), (req, res) => {
  const randomLineItem = getRandomCartItem();
  Cart.findOne({ cartId: req.user._id })
    .then((data) => {
      const lineItems = updateLineItems(data.lineItems, randomLineItem);
      Cart.findOneAndUpdate({ cartId: req.user._id }, { lineItems }, {new: true}, (err, data) => {
        if (err) {
          return Promise.reject(err)
        }
        res.status(200).json({
          status: "Success",
          payload: {
            cartId: data.cartId,
            lineItems: data.lineItems,
            orderSummary: calculateOrderSummary(data.lineItems),
          },
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "Internal Error",
        payload: {
          errorMessage: err,
        },
      });
    });
});

router.get("/", ensureLoggedIn(), (req, res) => {});

router.get("/private", ensureLoggedIn(), (req, res) => {});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({
      status: "Success",
      payload: {
        isLoggedIn: false,
      },
    });
  });
});

router.all("*", (req, res) => {
  res.status(404).send("<h1>Page Not Found</h1>");
});

module.exports = router;
