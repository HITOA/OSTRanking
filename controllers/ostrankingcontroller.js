module.exports = (app) => {
    const router = require("express").Router();

    router.get("/", (req, res) => {
        console.log(req.user);
        res.render("layout", {
            title: "OSTRanking",
            page: "./pages/index",
            auth: req.isAuthenticated(),
            username: req.user?.name,
            admin: false
        });
    });

    app.use("/", router);
};