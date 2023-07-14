const ost = require("./../models/ost");
const show = require("./../models/show");
const relation = require("./../models/relation")

const router = require("express").Router();

router.post("/ost/add", (req, res) => {
    if ((req.user?.privilege & 1) != 1)
        return res.status(403);

    show.getOrAdd(req.app, {
        show_id: req.body.show_ost[0].show_id,
        name: "Unkown"
    }).then((id) => {
        ost.add(req.app, req.body.ost).then((ostid) => {
            req.body.show_ost.forEach((data) => {
                data.ost_id = ostid;
                relation.addShowOstRelation(req.app, data).catch((err) => {
                    console.log(err);
                })
            });

            res.send({
                ost_id: ostid,
                message: "New entry added successfuly."
            });
        }).catch((msg) => {
            res.status(400).send({
                message: msg
            });
        })
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    })
});

router.post("/ost/gets", (req, res) => {
    console.log("pwp");
})

module.exports = router;