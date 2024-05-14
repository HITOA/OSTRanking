const router = require("express").Router();

router.get("/community", (req, res) => {
    res.render("layout", {
        title: "OSTRanking - Community",
        page: "./pages/community",
        ...req.info
    });
});

module.exports = router;