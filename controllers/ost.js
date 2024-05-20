const router = require("express").Router();

router.get("/ost/:id", (req, res) => {
    res.render("layout", {
        title: "OSTRanking",
        page: "./pages/ost",
        ost_id: req.params.id,
        is_auth: req.isAuthenticated(),
        ...req.info
    });
});

router.get("/ost/:id/rating", (req, res) => {
    if (!req.isAuthenticated())
        return res.redirect("/");

    res.render("layout", {
        title: "OSTRanking - Rating",
        page: "./pages/rating",
        ost_id: req.params.id,
        ...req.info
    });
});

module.exports = router;