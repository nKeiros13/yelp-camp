const express = require("express");
const passport = require("passport");
const router = express.Router();
const wrapAsync = require("../utilities/WrapAsync");
const { isLoggedIn } = require("../middleware/middleware");
const auth = require("../controllers/auth");

//-----------------------------------------------------------------------------------//
//ROUTES TO REGISTER

router
	.route("/register")
	.get(auth.renderRegisterForm)
	.post(wrapAsync(auth.registerUser));

//ROUTES TO LOGIN
router
	.route("/login")
	.get(auth.renderLoginForm)
	.post(
		passport.authenticate("local", {
			failureFlash: true,
			failureRedirect: "/login",
		}),
		auth.loginUser
	);

router.get("/logout", isLoggedIn, auth.logoutUser);

module.exports = router;
