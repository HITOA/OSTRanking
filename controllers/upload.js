const router = require("express").Router();
const multer = require("multer");
const streamifier = require("streamifier");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const upload = multer({});

router.get("/upload/ost/:id", (req, res) => {
    if ((req.user?.privilege & 1) != 1) {
        res.redirect(`/ost/${req.params.id}`);
        return;
    }

    res.render("layout", {
        title: "OSTRanking - FAQ",
        page: "./pages/upload",
        current_user_id: req.user?.id,
        id: req.params.id,
        ...req.info
    });
});

router.post("/upload/ost/:id", (req, res, next) => {
    if ((req.user?.privilege & 1) != 1) {     
        res.redirect(`/ost/${req.params.id}`);
        return;
    }

    next();
}, upload.single("audio"), (req, res, next) => {
    if (!req.file.mimetype.startsWith("audio/")) {
        res.status(403).send("Wrong format.");
        return;
    }
    if (req.file.size > 10000000) { //10MB MAX
        res.status(403).send("File is too large.");
        return;
    }

    console.log(req.body);

    let filename = `${crypto.randomUUID()}.opus`;
    const command = ffmpeg(streamifier.createReadStream(req.file.buffer));
    command.on("end", (out, err) => {
        req.app.get("database pool").getConnection().then((conn) => {
            conn.query(`UPDATE osts SET sample_audio_url=? WHERE id=?`, [
                filename,
                req.params.id
            ]).then((r) => {
                conn.release();
                res.redirect(`/ost/${req.params.id}`);
            }).catch((err) => {
                conn.release();
                rej.status(405).send(err);
            });
        }).catch((err) => {
            rej.status(405).send(err);
        })
    })
    command.audioCodec("libopus").noVideo().audioBitrate("48k").output(`audios/${filename}`).run();
});

module.exports = router;