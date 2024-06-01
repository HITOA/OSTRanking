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
    if (!req.isAuthenticated())
        return res.redirect("/");

        //if ((context.req.user?.privilege & 1) != 1)
    
    req.app.get("database pool").getConnection().then((conn) => {
        conn.query(`SELECT * FROM community_action WHERE id = ?`, [
            req.params.id
        ]).then((r) => {
            conn.release();
            if ((req.user?.privilege & 1) != 1 && r[0].user_id !== req.user.id)
                return res.redirect("/");

            if (r[0].action_status === 1)
                return res.redirect(`/ost/${r[0].info.ost_id}`);

            res.render("layout", {
                title: "OSTRanking",
                page: "./pages/ost",
                ost_id: -1,
                action_id: req.params.id,
                is_auth: req.isAuthenticated(),
                privilege: req.user?.privilege ? req.user?.privilege : 0,
                ...req.info
            });
        }).catch((err) => {
            conn.release();
            res.redirect("/");
        });
    }).catch((err) => {
        res.redirect("/");
    })

    /*res.render("layout", {
        title: "OSTRanking",
        page: "./pages/ost",
        ost_id: -1,
        action_id: req.params.id,
        is_auth: req.isAuthenticated(),
        ...req.info
    });*/
});

module.exports = router;