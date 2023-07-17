const ost = require("./../models/ost");
const show = require("./../models/show");
const relation = require("./../models/relation")
const Anilist = require("anilist-node");

const router = require("express").Router();
const anilist = new Anilist();

router.post("/ost/add", async (req, res) => {
    if ((req.user?.privilege & 1) != 1)
        return res.status(403);
    
    console.log(req.body);

    var relationData = [];

    try {
        for (var i = 0; i < req.body.show_ost?.length; ++i) {
            var data = await anilist.media.anime(parseInt(req.body.show_ost[i].show_id));
            relationData.push({
                show_id: req.body.show_ost[0].show_id,
                name: data.title.userPreferred,
                type: req.body.show_ost[0].type,
                number: req.body.show_ost[0].number
            })
        }
    } catch {
        res.status(400).send({
            message: "One of the relation contain an invalid show id."
        });
        return;
    }

    ost.add(req.app, req.body.ost).then(async (ostid) => {
        for (var i = 0; i < relationData.length; ++i) {
            var data = relationData[i];
            data.ost_id = ostid;
            await show.getOrAdd(req.app, data);
            await relation.addShowOstRelation(req.app, data);
        }

        res.send({
            ost_id: ostid,
            message: "New entry added successfuly."
        });
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    });
});

router.post("/ost/get", (req, res) => {
    const ost_id = req.body.ost_id;

    if (!ost_id)
        return res.status(400).send({ message: "OST id not provided." });

    ost.get(req.app, { ost_id: ost_id }).then((r) => {
        if (r.length > 0)
            return res.send(r[0]);
        return res.status(400).send({
            message: "Bad OST id."
        });
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    })
})

router.post("/ost/gets", (req, res) => {
    if (typeof(req.body.start) != "number")
        return res.status(400).send({ message: "Start argument not provided." });

    if (typeof(req.body.count) != "number")
        return res.status(400).send({ message: "Count argument not provided." });

    ost.gets(req.app, req.body).then((r) => {
        res.send(r);
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    });
});

router.post("/ost/relation/gets", (req, res) => {
    if (typeof(req.body.ost_id) != "number")
        return res.status(400).send({ message: "OST id not provided." });

    relation.getsShowOstRelation(req.app, req.body).then((r) => {
        res.send(r);
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    });
});

module.exports = router;