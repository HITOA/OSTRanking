const ost = require("./../models/ost");
const show = require("./../models/show");
const relation = require("./../models/relation");
const daily = require("./../models/daily");

const router = require("express").Router();

router.get("/Daily", (req, res) => {
    var currentDay = Math.round((new Date()).getTime() / 86400000);

    daily.get(req.app, { day: currentDay }).then((d) => {
        if (d)
            return res.redirect(`/ost/${d.ost_id}/rating`);

        ost.gets(req.app, {
            start: 0,
            count: 100,
            order: "Popular",
            ascendant: true
        }).then((osts) => {
            var ost_id = osts[Math.floor(Math.random() * osts.length)].id;
            daily.add(req.app, {
                day: currentDay,
                ost_id: ost_id
            }).then((d) => {
                return res.redirect(`/ost/${d.ost_id}/rating`);
            }).catch((msg) => {
                console.log(msg);
                return res.status(500);
            });
        }).catch((msg) => {
            console.log(msg);
            return res.status(500);
        });
    }).catch((msg) => {
        console.log(msg);
        return res.status(500);
    });
});

module.exports = router;