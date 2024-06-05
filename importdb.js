require("dotenv").config();
const ann = require("./models/ann");
const fs = require("fs");

if (process.argv.length < 5)
    return;

const dboption = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3308,
    user: "ostranking",
    password: "secret",
    database: "ostranking",
    connectionLimit: 8
};

const pool = require("mariadb").createPool(dboption);

const matching_list = JSON.parse(fs.readFileSync("matching_list.json"));
const matching_list_song_id = {};

function addOst(name, length, alternate_name, short_length, sample_audio_url, published_date, conn) {
    return new Promise((res, rej) => {
        conn.query(`INSERT INTO osts (name, length, creation_date, update_date, published_date, short_length, alternate_name, sample_audio_url) VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?) RETURNING *`, [
            name,
            length,
            published_date,
            short_length,
            alternate_name,
            sample_audio_url
        ]).then(async (ost_data) => {
            res(ost_data[0]);
        }).catch((err) => {
            rej(err);
        })
    })
}

function addShow(show_id, conn) {
    return new Promise((res, rej) => {
        conn.query(`SELECT * FROM shows WHERE id=?`, [
            show_id
        ]).then((r) => {
            if (r.length > 0)
                return res(r[0]);

            ann.getAnimeData(show_id).then((data) => {
                conn.query(`INSERT INTO shows (id, main_title, alternative_title, medium, large, vintage, episode_count) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = ? RETURNING *`, [
                    show_id,
                    data.main_title,
                    data.alternative_title,
                    data.medium,
                    data.large,
                    data.vintage,
                    data.episode_count,
                    show_id
                ]).then((r) => {
                    res(r[0]);
                }).catch((err) => {
                    rej(err);
                });
            }).catch((msg) => {
                rej(msg);
            })
        }).catch((err) => {
            rej(err);
        });
    })
}

function addRelation(ost_id, show_id, type, number, conn) {
    return new Promise((res, rej) => {
        conn.query(`INSERT INTO show_ost (ost_id, show_id, type, num) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ost_id = ? RETURNING *`, [
            ost_id,
            show_id,
            type,
            number,
            ost_id
        ]).then((r) => {
            res(r[0]);
        }).catch((err) => {
            rej(err);
        });
    })
}

function addLink(ost_id, type, url, conn) {
    return new Promise((res, rej) => {
        conn.query(`INSERT INTO link_ost (ost_id, type, url) VALUES (?, ?, ?) RETURNING *`, [
            ost_id,
            type,
            url
        ]).then((r) => {
            res(r[0]);
        }).catch((err) => {
            rej(err);
        });
    })
}

let songIdMatch = {};

function importEntry(path, conn) {
    return new Promise((res, rej) => {
        let data = JSON.parse(fs.readFileSync(path, "utf-8"));
        addShow(data[0].annId, conn).then((r) => {
            for (let song of data) {
                let p = song.audio.split('/');
                let n = p[p.length - 1];
                n = `${n.split('.')[0]}.opus`;
                let type = 2;
                let number = 1;
                if (song.songType.startsWith("Opening")) {
                    type = 0;
                    number = parseInt(song.songType.split(" ")[1]);
                } else if (song.songType.startsWith("Ending")) {
                    type = 1;
                    number = parseInt(song.songType.split(" ")[1]);
                }

                if (`${song.annSongId}` in songIdMatch) {
                    addRelation(songIdMatch[`${song.annSongId}`], r.id, type, number, conn).then(() => {
                        res();
                    })
                } else {
                    addOst(song.songName, song.songDuration ? song.songDuration : 0, undefined, undefined, matching_list[n], undefined, conn).then((o) => {
                        songIdMatch[`${song.annSongId}`] = o.id;
                        addRelation(o.id, r.id, type, number, conn).then(() => {
                            res();
                        })
                    })
                }
            }
        }).catch(() => {
            res();
        })
    })
}

fs.readdir(process.argv[2], async (err, files) => {
    files = files.filter((v) => {
        return v.endsWith(".json");
    });

    let i = 0;

    pool.getConnection().then(async (conn) => {
        for (let file of files) {
            ++i;
            if (i <= parseInt(process.argv[3]))
                continue;
            if (i >= parseInt(process.argv[4]))
                break;

            console.log(`Entry: ${i}`);
            await importEntry(`${process.argv[2]}${file}`, conn);
        }

        fs.writeFileSync("./matching-list-song-id.json", JSON.stringify(songIdMatch));
        conn.release();
    });
});