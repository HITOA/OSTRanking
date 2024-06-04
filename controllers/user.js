const router = require("express").Router();

router.get("/user/:id", (req, res) => {
    res.render("layout", {
        title: "OSTRanking",
        page: "./pages/user",
        current_user_id: req.user?.id,
        user_id: req.params.id,
        ...req.info
    });
});

module.exports = router;