const express = require("express");
const ensureLoggedIn = require("../middleware/ensureLoggedIn");
const passport = require("passport");
const UserDetails = require("../schema/UserDetail");
const Cart = require("../schema/Cart");
const {
  calculateOrderSummary,
  getRandomCartItem,
  updateLineItems
} = require("../utils/utils");

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
          isLoggedIn: false
        }
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
          username: req.user.username
        }
      });
    });
  })(req, res, next);
});

router.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  UserDetails.register({ username, active: false }, password)
    .then((data) => {
      // create cart
      return new Cart({
        cartId: data._id,
        lineItems: []
      }).save();
    })
    .then(() => {
      res.status(200).json({
        status: "Success",
        payload: {
          isLoggedIn: false
        }
      });
    })
    .catch((err) => {
      if (err.name === "UserExistsError") {
        return res.status(400).json({
          status: "Bad Request",
          payload: {
            isLoggedIn: false,
            errorMessage: err.message
          }
        });
      }
      res.status(500).json({
        status: "Internal Error",
        payload: {
          isLoggedIn: false,
          errorMessage: "Something went wrong, please try again later."
        }
      });
    });
});

router.get("/cart", ensureLoggedIn(), (req, res) => {
  Cart.findOne({ cartId: req.user._id })
    .then((data) => {
      res.status(200).json({
        status: "Success",
        payload: {
          cartId: data.cartId,
          lineItems: data.lineItems,
          orderSummary: calculateOrderSummary(data.lineItems)
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: "Internal Error",
        payload: {
          errorMessage: err
        }
      });
    });
});

router.get("/addLineItem", ensureLoggedIn(), (req, res) => {
  const randomLineItem = getRandomCartItem();
  Cart.findOne({ cartId: req.user._id })
    .lean()
    .then((data) => {
      const lineItems = updateLineItems(data.lineItems, randomLineItem);
      Cart.findOneAndUpdate(
        { cartId: req.user._id },
        { lineItems },
        { new: true },
        (err, data) => {
          if (err) {
            return Promise.reject(err);
          }
          res.status(200).json({
            status: "Success",
            payload: {
              cartId: data.cartId,
              lineItems: data.lineItems,
              orderSummary: calculateOrderSummary(data.lineItems)
            }
          });
        }
      );
    })
    .catch((err) => {
      res.status(500).json({
        status: "Internal Error",
        payload: {
          errorMessage: err
        }
      });
    });
});

router.post("/updateLineItem", ensureLoggedIn(), (req, res) => {
  const itemNumber = req.body.itemNumber;
  const quantity = req.body.quantity;
  Cart.findOneAndUpdate(
    { cartId: req.user._id, "lineItems.itemNumber": itemNumber },
    { $set: { "lineItems.$.quantity": quantity } },
    { new: true },
    (err, data) => {
      if (err) {
        return res.status(500).json({
          status: "Internal Error",
          payload: {
            errorMessage: err
          }
        });
      }
      res.status(200).json({
        status: "Success",
        payload: {
          cartId: data.cartId,
          lineItems: data.lineItems,
          orderSummary: calculateOrderSummary(data.lineItems)
        }
      });
    }
  );
});

router.post("/deleteLineItem", ensureLoggedIn(), (req, res) => {
  const itemNumber = req.body.itemNumber;
  Cart.findOneAndUpdate(
    { cartId: req.user._id },
    { $pull: { lineItems: { itemNumber } } },
    { new: true },
    (err, data) => {
      if (err) {
        return res.status(500).json({
          status: "Internal Error",
          payload: {
            errorMessage: err
          }
        });
      }
      res.status(200).json({
        status: "Success",
        payload: {
          cartId: data.cartId,
          lineItems: data.lineItems,
          orderSummary: calculateOrderSummary(data.lineItems)
        }
      });
    }
  );
});

router.post("/checkout", ensureLoggedIn(), (req, res) => {
  Cart.findOneAndUpdate(
    { cartId: req.user._id },
    { $set: { lineItems: [] } },
    { new: true },
    (err, data) => {
      if (err) {
        return res.status(500).json({
          status: "Internal Error",
          payload: {
            errorMessage: err
          }
        });
      }
      res.status(200).json({
        status: "Success",
        payload: {
          cartId: data.cartId,
          lineItems: data.lineItems,
          orderSummary: calculateOrderSummary(data.lineItems)
        }
      });
    }
  );
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.status(200).json({
      status: "Success",
      payload: {
        isLoggedIn: false
      }
    });
  });
});

router.all("*", (req, res) => {
  res.status(404).send("<h1>Page Not Found</h1>");
});

module.exports = router;
