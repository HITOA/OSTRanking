const scores = require("./../models/scores")

const router = require("express").Router();

router.post("/user/score/set", async (req, res) => {
    if (!req.isAuthenticated())
        return res.status(403);
    
    if (!req.body.ost_id)
        return res.status(400).send({
            message: "No ost id provided."
        });

    var score = parseInt(req.body.score);

    if (!score)
        return res.status(400).send({
            message: "No score provided."
        });

    score = score > 100 ? 100 : score < 0 ? 0 : score;

    scores.set(req.app, {
        user_id: req.user.id,
        ost_id: req.body.ost_id,
        score: score
    }).then((msg) => {
        res.send({
            message: msg
        });
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    })
});

router.post("/user/score/get", async (req, res) => {
    if (!req.isAuthenticated())
        return res.status(403);
    
    if (!req.body.ost_id)
        return res.status(400).send({
            message: "No ost id provided."
        });

    scores.get(req.app, {
        user_id: req.user.id,
        ost_id: req.body.ost_id
    }).then((score) => {
        if (score.length > 0)
            return res.send(score[0]);
        res.send(score);
    }).catch((msg) => {
        res.status(400).send({
            message: msg
        });
    })
});

module.exports = router;