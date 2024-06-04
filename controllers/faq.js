const router = require("express").Router();

router.get("/faq", (req, res) => {
    res.render("layout", {
        title: "OSTRanking - FAQ",
        page: "./pages/faq",
        current_user_id: req.user?.id,
        ...req.info
    });
});

module.exports = router;