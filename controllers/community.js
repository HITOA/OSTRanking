const router = require("express").Router();

router.get("/community", (req, res) => {
    res.render("layout", {
        title: "OSTRanking - Community",
        page: "./pages/community",
        privilege: req.user?.privilege ? req.user?.privilege : 0,
        ...req.info
    });
});

router.get("/community/preview/:id", (req, res) => {
    if ((req.user?.privilege & 1) != 1)
        return res.status(403).send({ message: "Forbidden" });
    
    res.render("layout", {
        title: "OSTRanking",
        page: "./pages/ost",
        ost_id: -1,
        action_id: req.params.id,
        is_auth: req.isAuthenticated(),
        ...req.info
    });
});

module.exports = router;