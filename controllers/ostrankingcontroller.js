const router = require("express").Router();

router.get("/", (req, res) => {
    res.render("layout", {
        title: "OSTRanking",
        page: "./pages/index",
        ...req.info
    });
});

module.exports = router;