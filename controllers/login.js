const router = require("express").Router();
const passport = require("passport")

router.get("/login", (req, res) => {
    if (req.isAuthenticated())
        return res.redirect("/");

    res.render("layout", {
        title: "OSTRanking - Login",
        page: "./pages/login",
        current_user_id: req.user?.id,
        ...req.info
    });
});

router.post("/login", (req, res) => {
    if (req.isAuthenticated())
        return res.redirect("/");
    
    const { username, password } = req.body;
    
    if (!username || !password)
    {
        res.status(400).send({
            message: "Both field required"
        });
        return;
    }
    
    passport.authenticate("local", (err, user)=>{
        if (!user) {
            res.status(400).send({
                message: "No account found with this username / password."
            });
            return err;
        } else {
            req.logIn(user, { session: true }, (err) => {
                return res.send({
                    message: "Successfully logged in. Redirecting to home..."
                });
            });
            return user;
        }
    })(req, res);
});

router.all("/logout", (req, res) => {
    if (!req.isAuthenticated())
        return res.redirect("/");
    
    req.logOut((err) => {
        if (err)
            console.log(err);
        res.redirect("/");
    });
});

module.exports = router;