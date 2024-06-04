const router = require("express").Router();

router.get("/ost/:id", (req, res) => {
    res.render("layout", {
        title: "OSTRanking",
        page: "./pages/ost",
        current_user_id: req.user?.id,
        ost_id: req.params.id,
        action_id: -1,
        is_auth: req.isAuthenticated(),
        privilege: req.user?.privilege ? req.user?.privilege : 0,
        ...req.info
    });
});

module.exports = router;