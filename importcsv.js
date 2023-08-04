require("dotenv").config()
const ost = require("./models/ost");
const show = require("./models/show");
const relation = require("./models/relation")
const Anilist = require("anilist-node");

const anilist = new Anilist();

if (process.argv[0] < 3)
    return;

const dboption = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 8
};

const pool = require("mariadb").createPool(dboption)

require("fs").readFile(process.argv[2], "utf8", (err, data) => {
    if (err) {
        console.log(err);
        return;
    }

    var timer = 0;

    data.split("\n").forEach((row) => {
        setTimeout(() => {
            var cols = row.split(",");

            anilist.media.anime(parseInt(cols[5])).then((data) => {
                var length = cols[3].split(":");
                length = parseInt(length[0]) * 60 + parseInt(length[1]);
                var shortlength = cols[4].split(":");
                shortlength = parseInt(shortlength[0]) * 60 + parseInt(shortlength[1]);

                pool.getConnection().then((conn) => {
                    conn.query("INSERT INTO osts (name, url, length, creation_date, update_date, published_date, short_length, alternate_name) VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?) RETURNING id", [
                        cols[0],
                        cols[2],
                        length,
                        null,
                        shortlength ? shortlength : null,
                        cols[1] ? cols[1] : null
                    ]).then((result) => {
                        
                        conn.query("SELECT id FROM shows WHERE id=?", [parseInt(cols[5])]).then((ids) => {
                            if (ids.length > 0) {
                                conn.query("INSERT INTO show_ost (show_id, ost_id, type, num) VALUES (?, ?, ?, ?)", [
                                    parseInt(cols[5]),
                                    result[0].id,
                                    parseInt(cols[6]),
                                    parseInt(cols[7])
                                ]);
                                return;
                            }
            
                            conn.query("INSERT INTO shows (id, native, preferred, english, medium, large) VALUES (?, ?, ?, ?, ?, ?) RETURNING id", [
                                parseInt(cols[5]),
                                data.title.native,
                                data.title.userPreferred,
                                data.title.english,
                                data.coverImage.medium,
                                data.coverImage.large
                            ]).then((id) => {
                                conn.release();
                                conn.query("INSERT INTO show_ost (show_id, ost_id, type, num) VALUES (?, ?, ?, ?)", [
                                    parseInt(cols[5]),
                                    result[0].id,
                                    parseInt(cols[6]),
                                    parseInt(cols[7])
                                ]);
                            }).catch((err) => {
                                conn.release();
                                console.log(err);
                            });
                        }).catch((err) => {
                            conn.release();
                            console.log(err);
                        });

                        console.log(result);
                        conn.release();
                    }).catch((err) => {
                        console.log(err);
                        conn.release();
                    });
                }).catch((err) => {
                    console.log(err);
                    rej("There is a problem with the server.");
                })
            });
        }, timer += 500);

        

        /*try {
            for (var i = 0; i < req.body.show_ost?.length; ++i) {
                var data = await anilist.media.anime(parseInt(cols[5]));
                console.log(data);
                relationData.push({
                    show_id: parseInt(cols[5]),
                    name: data.title.userPreferred,
                    type: parseInt(cols[6]),
                    number: parseInt(cols[7])
                })
            }
        } catch (err) {
            console.log(err);
            return;
        }*/

        /*ost.add(req.app, req.body.ost).then(async (ostid) => {
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
        });*/
    })
});

