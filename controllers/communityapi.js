const community = require("./../models/community")
const Anilist = require("anilist-node");

const router = require("express").Router();
const anilist = new Anilist();

router.post("/community/request/add", async (req, res) => {
    if (!req.isAuthenticated())
        return res.status(403);
    
    console.log(req.body);

    var relationData = [];

    try {
        for (var i = 0; i < req.body.show_ost?.length; ++i) {
            var data = await anilist.media.anime(parseInt(req.body.show_ost[i].show_id));
            relationData.push({
                show_id: req.body.show_ost[0].show_id,
                native: data.title.native,
                preferred: data.title.userPreferred,
                english: data.title.english,
                medium: data.coverImage.medium,
                large: data.coverImage.large,
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

    console.log(relationData)

    
    if (!req.body.ost.name) 
        return res.status(400).send({ message: "OST Name is needed." });
    if (!req.body.ost.url)
        return res.status(400).send({ message: "OST URL is needed." });
    if (!req.body.ost.length)
        return res.status(400).send({ message: "OST Length is needed." });

    community.add(req.app, {
        "user_id": req.user.id,
        "info": {
            "type": "request",
            "content": {
                "ost": req.body.ost,
                "relations": relationData
            }
        }
    }).then(async (action_id) => {
        res.send({
            action_id: action_id,
            message: "Request sent successfuly."
        });
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    });
});

router.post("/community/edit", async (req, res) => {
    if ((req.user?.privilege & 1) != 1)
        return res.status(403).send({ message: "Forbidden" });

    if (typeof(req.body.action_id) != "number")
        return res.status(400).send({ message: "Action ID argument not provided." });

    if (!req.body.info)
        return res.status(400).send({ message: "Info argument not provided." });

    community.edit(req.app, req.body).then(() => {
        res.send({ message: "Success." });
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    });
});

router.post("/community/gets", async (req, res) => {
    if (typeof(req.body.start) != "number")
        return res.status(400).send({ message: "Start argument not provided." });

    if (typeof(req.body.count) != "number")
        return res.status(400).send({ message: "Count argument not provided." });

    community.gets(req.app, req.body).then((r) => {
        res.send(r);
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    });
});


module.exports = router;