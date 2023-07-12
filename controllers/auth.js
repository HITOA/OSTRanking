const passport = require("passport");

module.exports = (app) => {
    const router = require("express").Router();
    const LocalStrategy = require("passport-local");
    const owasp = require('owasp-password-strength-test');
    const bcrypt = require("bcryptjs");

    const usernameValidationRegex = new RegExp("^(?=.{3,32}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$");
    const emailValidationRegex = new RegExp("^[\\w-\\.]+@([\\w-]+\.)+[\\w-]{2,4}$");

    owasp.config({
        allowPassphrases: true,
        maxLength: 72,
        minLength: 8,
        minPhraseLength: 20,
        minOptionalTestsToPass: 2
    });

    const strategy = new LocalStrategy(async (username, password, done) => {
        const db = await app.get("database pool").getConnection();

        var c = await db.query("SELECT * FROM users WHERE name=?", [username]);
        db.release();

        if (c.length < 1)
            return done(null, false);

        bcrypt.compare(password, c[0].password_hash, (err, success) => {
            if (success === true)
                return done(null, c[0]);
            else
                return done(null, false);
        });
    });

    passport.serializeUser((user, done)=>{
        return done(null, user.id);
    })

    passport.deserializeUser(async (userId, done)=>{
        const db = await app.get("database pool").getConnection();

        var c = await db.query("SELECT * FROM users WHERE id=?", [userId]);

        if (c.length < 1) {
            db.release();
            return done(null, false);
        } else {
            var a = await db.query("SELECT * FROM admins WHERE userid=?", [userId]);
            c[0]["isAdmin"] = a.length > 0;
            db.release();
            return done(null, c[0]);
        }
    })

    passport.use("local", strategy);

    router.get("/register", (req, res) => {
        if (req.isAuthenticated())
            return res.redirect("/");

        res.render("layout", {
            title: "OSTRanking - Register",
            page: "./pages/register",
            auth: req.isAuthenticated(),
            username: req.user?.name,
            admin: false
        });
    });

    router.post("/register", async (req, res) => {
        if (req.isAuthenticated())
            return res.redirect("/");

        const { username, email, password, confirm } = req.body;
        
        if (password !== confirm) {
            res.status(400).send({
                message: "Confirm password is not the same as password."
            });
            return;
        }

        if (!usernameValidationRegex.test(username)) {
            res.status(400).send({
                message: "Bad username."
            });
            return;
        }

        if (!emailValidationRegex.test(email)) {
            res.status(400).send({
                message: "Bad email."
            });
            return;
        }

        var passresult = owasp.test(password);
        
        if (!passresult.strong) {
            res.status(400).send({
                message: passresult.requiredTestErrors[0]
            });
            return;
        }
        
        const db = await req.app.get("database pool").getConnection();

        var c = await db.query("SELECT id FROM users WHERE (name=? OR email=?)", [username, email]);
        if (c.length > 0) {
            res.status(400).send({
                message: "An account is already created with this username or email."
            });
            db.release();
            return;
        }

        bcrypt.hash(password, 10).then(async (hash)=>{

            db.query("INSERT INTO users (name, password_hash, email, creation_date) VALUES(?, ?, ?, NOW())", [username, hash, email]);

            res.send({
                message: "Successfully registered. Redirecting to login..."
            });

            db.release();
        }).catch(()=>{
            db.release();
        });
    })

    router.get("/login", (req, res) => {
        if (req.isAuthenticated())
            return res.redirect("/");

        res.render("layout", {
            title: "OSTRanking - Login",
            page: "./pages/login",
            auth: req.isAuthenticated(),
            username: req.user?.name,
            admin: false
        });
    });

    router.post("/login", async (req, res) => {
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

    router.get("/logout", (req, res) => {
        if (!req.isAuthenticated())
            return res.redirect("/");
        
        req.logOut((err) => {
            if (err)
                return console.log(err);
            res.redirect("/");
        });
    });

    app.use("/", router);
};