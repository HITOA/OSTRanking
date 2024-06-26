const router = require("express").Router();

router.get("/", (req, res) => {
    res.render("layout", {
        title: "OSTRanking",
        page: "./pages/index",
        current_user_id: req.user?.id,
        ...req.info
    });
});

module.exports = router;