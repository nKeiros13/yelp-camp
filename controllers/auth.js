const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
	res.render("users/register");
};

module.exports.registerUser = async (req, res, next) => {
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
};

module.exports.renderLoginForm = (req, res) => {
	res.render("users/login");
};

module.exports.loginUser = (req, res) => {
	let redirectUrl = "";
	if (req.session.returnTo) {
		redirectUrl = req.session.returnTo;
	} else {
		redirectUrl = "/campgrounds";
	}
	req.flash("success", "Welcome back!");
	delete req.session.returnTo;
	res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
	req.logout();
	req.flash("success", "Successfully logged out. See you soon!");
	res.redirect("/campgrounds");
};
