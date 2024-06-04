const router = require("express").Router();
const owasp = require('owasp-password-strength-test');
const auth = require("./../models/auth");

const usernameValidationRegex = new RegExp("^(?=.{3,32}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$");
const emailValidationRegex = new RegExp("^[\\w-\\.]+@([\\w-]+\.)+[\\w-]{2,4}$");

owasp.config({
    allowPassphrases: true,
    maxLength: 72,
    minLength: 8,
    minPhraseLength: 20,
    minOptionalTestsToPass: 2
});

router.get("/register", (req, res) => {
    if (req.isAuthenticated())
        return res.redirect("/");

    res.render("layout", {
        title: "OSTRanking - Register",
        page: "./pages/register",
        current_user_id: req.user?.id,
        ...req.info
    });
});

router.post("/register", (req, res) => {
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
    
    auth.register(req.app, username, email, password).then((msg) => {
        res.send({
            message: msg
        });
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    });
})

module.exports = router;