require("dotenv").config();
const { match } = require("assert");
const ann = require("./models/ann");
const fs = require("fs");

if (process.argv.length < 5)
    return;

const dboption = {
    host: process.env.DB_HOST || "194.164.77.141",
    port: process.env.DB_PORT || 3308,
    user: "ostranking",
    password: "h8qlETTw23sUwC2yeC8VyXf",
    database: "ostranking",
    connectionLimit: 8
};

const pool = require("mariadb").createPool(dboption);

let matching_list_song_id = JSON.parse(fs.readFileSync("matching-list-song-id.json"));

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

let artist_id_match = {};

function addMembersToGroup(group_id, member_ids, conn) {
    return new Promise(async (res, rej) => {
        for (let member_id of member_ids) {
            await conn.query(`INSERT INTO artist_group_member (artist_group_id, artist_member_id, role_name) VALUES (?, ?, ?) RETURNING *`, [
                group_id,
                member_id,
                ""
            ]);
        }
        res();
    });
}

function importArtistData(data, conn) {
    return new Promise((res, rej) => {
        if (`${data.id}` in artist_id_match)
            return res(artist_id_match[`${data.id}`]);

        conn.query(`INSERT INTO artists (name) VALUES (?) RETURNING *`, [
            data.names[0]
        ]).then(async (r) => {
            if (data.members) {
                let ids = [];
                for (let member of data.members) {
                    ids.push(await importArtistData(member, conn));
                }
                
                addMembersToGroup(r[0].id, ids, conn).then(() => {
                    artist_id_match[`${data.id}`] = r[0].id;
                    res(r[0].id);
                })
            } else {
                artist_id_match[`${data.id}`] = r[0].id;
                res(r[0].id);
            }
        }).catch((err) => {
            rej(err);
        });
    })
}

function importEntry(path, conn) {
    return new Promise(async (res, rej) => {
        let data = JSON.parse(fs.readFileSync(path, "utf-8"));
        for (let song of data) {
            const ost_id = matching_list_song_id[`${song.annSongId}`];
            if (!ost_id)
                continue;

            for (artist of song.artists) {
                const artist_id = await importArtistData(artist, conn);
                await conn.query(`INSERT INTO artist_ost (artist_id, ost_id, role_name) VALUES (?, ?, ?) RETURNING *`, [
                    artist_id,
                    ost_id,
                    "Artist"
                ]);
            }

            for (artist of song.composers) {
                const artist_id = await importArtistData(artist, conn);
                await conn.query(`INSERT INTO artist_ost (artist_id, ost_id, role_name) VALUES (?, ?, ?) RETURNING *`, [
                    artist_id,
                    ost_id,
                    "Composer"
                ]);
            }

            for (artist of song.arrangers) {
                const artist_id = await importArtistData(artist, conn);
                await conn.query(`INSERT INTO artist_ost (artist_id, ost_id, role_name) VALUES (?, ?, ?) RETURNING *`, [
                    artist_id,
                    ost_id,
                    "Arranger"
                ]);
            }
        }

        res();
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

        conn.release();
    });
});