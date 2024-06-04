const router = require("express").Router();

router.get("/request", (req, res) => {
    if (!req.isAuthenticated())
        return res.redirect("/");

    res.render("layout", {
        title: "OSTRanking - Request",
        page: "./pages/request",
        current_user_id: req.user?.id,
        ...req.info
    });
});

module.exports = router;