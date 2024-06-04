const router = require("express").Router();

router.get("/show/:id", (req, res) => {
    res.render("layout", {
        title: "OSTRanking",
        page: "./pages/show",
        current_user_id: req.user?.id,
        show_id: req.params.id,
        ...req.info
    });
});

module.exports = router;