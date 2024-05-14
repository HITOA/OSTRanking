const router = require("express").Router();

router.get("/Faq", (req, res) => {
    res.render("layout", {
        title: "OSTRanking - FAQ",
        page: "./pages/faq",
        ...req.info
    });
});

module.exports = router;