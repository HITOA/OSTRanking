const show = require("./../models/show");

const router = require("express").Router();

router.post("/show/get", (req, res) => {
    const show_id = req.body.show_id;

    if (!show_id)
        return res.status(400).send({ message: "Show id not provided." });

    show.get(req.app, { show_id: show_id }).then((r) => {
        res.send(r);
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    })
})

module.exports = router;