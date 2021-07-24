const express = require("express");
const passport = require("passport");
const router = express.Router();
const wrapAsync = require("../utilities/WrapAsync");
const User = require("../models/user");
const { isLoggedIn } = require("../middleware/isLoggedIn");

router.get("/register", (req, res) => {
	res.render("users/register");
});

router.post(
	"/register",
	wrapAsync(async (req, res, next) => {
		try {
			const { username, email, password } = req.body;
			const user = await new User({ email, username });
			const registeredUser = await User.register(user, password);
			req.login(registeredUser, (e) => {
				if (e) return next(e);
				req.flash("success", "Welcome to Yelp Camp!");
				res.redirect("/campgrounds");
			});
		} catch (e) {
			req.flash("error", e.message);
			res.redirect("/register");
		}
	})
);

router.get("/login", (req, res) => {
	res.render("users/login");
});

router.post(
	"/login",
	passport.authenticate("local", {
		failureFlash: true,
		failureRedirect: "/login",
	}),
	(req, res) => {
		let redirectUrl = "";
		if (req.session.returnTo) {
			redirectUrl = req.session.returnTo;
		} else {
			redirectUrl = "/campgrounds";
		}
		req.flash("success", "Welcome back!");
		delete req.session.returnTo;
		res.redirect(redirectUrl);
	}
);

router.get("/logout", (req, res) => {
	req.logout();
	req.flash("success", "Successfully logged out. See you soon!");
	res.redirect("/campgrounds");
});

module.exports = router;
