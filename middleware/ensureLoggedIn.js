module.exports = function ensureLoggedIn(statusCode = 401) {
  return function (req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(statusCode).json({
        status: "Unauthorized",
        payload: {
          isLoggedIn: false
        }
      });
    }
    next();
  };
};
