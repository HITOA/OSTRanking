const Anilist = require("anilist-node");

module.exports = {
    Action: {
        user(obj, args, context, info ) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT id, name, privilege, trust FROM users WHERE id = ?`, [
                        obj.user_id
                    ]).then((r) => {
                        conn.release();
                        res(r[0])
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        type(obj, args, context, info) {
            return ["OstAdd"][obj.action_type];
        },
        status(obj, args, context, info) {
            return ["Pending", "Accepted", "Declined"][obj.action_status];
        },
        data(obj, args, context, info) {
            return JSON.stringify(obj.info);
        }
    },
    Relation: {
        show(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM shows WHERE id = ?`, [
                        obj.show_id
                    ]).then((r) => {
                        conn.release();
                        res(r[0])
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        ost(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT id, name, alternate_name, \`length\`, short_length, top_rank, popular_rank FROM osts WHERE id = ?`, [
                        obj.ost_id
                    ]).then((r) => {
                        conn.release();
                        res(r[0])
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        type(obj, args, context, info) {
            return ["Opening", "Ending", "Insert"][obj.type];
        },
        number(obj, args, context, info) {
            return obj.num;
        }
    },
    Link: {
        type(obj, args, context, info) {
            return ["Youtube", "SoundCloud", "Spotify"][obj.type];
        }
    },
    Show: {
        relations(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT show_id, ost_id, \`type\`, num FROM show_ost WHERE show_id = ?`, [
                        obj.id
                    ]).then((r) => {
                        conn.release();
                        res(r)
                    }).catch((err) => {
                        conn.release();
                        res([]);
                    });
                }).catch((err) => {
                    res([]);
                })
            })
        }
    },
    Ost: {
        rating(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM ost_scores_total WHERE ost_id = ?`, [
                        obj.id
                    ]).then((r) => {
                        conn.release();
                        let rating = r[0].score_acc / r[0].score_count;
                        if (rating)
                            res(rating);
                        else
                            res(undefined)
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        user_rating(obj, args, context, info) {
            if (!context.req.isAuthenticated())
                return undefined;
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM scores WHERE ost_id = ? AND user_id = ?`, [
                        obj.id,
                        context.req.user?.id
                    ]).then((r) => {
                        conn.release();
                        res(r[0]?.score)
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        rating_count(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT score_count FROM ost_scores_total WHERE ost_id = ?`, [
                        obj.id
                    ]).then((r) => {
                        conn.release();
                        let rating_count = r[0].score_count;
                        res(rating_count);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        relations(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT show_id, ost_id, \`type\`, num FROM show_ost WHERE ost_id = ?`, [
                        obj.id
                    ]).then((r) => {
                        conn.release();
                        res(r)
                    }).catch((err) => {
                        conn.release();
                        res([]);
                    });
                }).catch((err) => {
                    res([]);
                })
            })
        },
        links(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT \`type\`, url FROM link_ost, links WHERE link_ost.ost_id = ? AND links.id = link_ost.link_id`, [
                        obj.id
                    ]).then((r) => {
                        conn.release();
                        res(r)
                    }).catch((err) => {
                        conn.release();
                        res([]);
                    });
                }).catch((err) => {
                    res([]);
                })
            })
        }
    },
    Query: {
        ost(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT id, name, alternate_name, sample_audio_url, \`length\`, short_length, top_rank, popular_rank FROM osts WHERE id = ?`, [
                        args.id
                    ]).then((r) => {
                        conn.release();
                        res(r[0]);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        osts(obj, args, context, info) {
            if (!args.input.start)
                args.input.start = 0;
            if (!args.input.count)
                args.input.count = 0;

            if (args.input.expression) {
                return new Promise((res, rej) => {
                    context.app.get("database pool").getConnection().then((conn) => {
                        conn.query(`SELECT id, name, alternate_name, sample_audio_url, \`length\`, short_length, top_rank, popular_rank, creation_date, MATCH(name,alternate_name) AGAINST(? IN BOOLEAN MODE) AS relevance FROM osts ORDER BY relevance DESC LIMIT ?, ?`, [
                            args.input.expression,
                            args.input.start,
                            args.input.count
                        ]).then((r) => {
                            conn.release();
                            res(r);
                        }).catch((err) => {
                            conn.release();
                            res([]);
                        });
                    }).catch((err) => {
                        res([]);
                    })
                })
            } else {
                if (!args.input.order_type)
                    args.input.order_type = "Top";
                if (!args.input.order_direction)
                    args.input.order_direction = "Ascendant";
                
                let order = args.input.order_direction === "Ascendant" ? "ASC" : "DESC";
                let query = "";

                switch (args.input.order_type) {
                    case "Popular":
                        query = `SELECT id, name, alternate_name, sample_audio_url, \`length\`, short_length, top_rank, popular_rank, creation_date FROM osts ORDER BY popular_rank ${order}, creation_date ${order} LIMIT ?, ?`;
                        break;
                    case "Top":
                        query = `SELECT id, name, alternate_name, sample_audio_url, \`length\`, short_length, top_rank, popular_rank, creation_date FROM osts ORDER BY top_rank ${order}, creation_date ${order} LIMIT ?, ?`;
                        break;
                    case "New":
                    default:
                        query = `SELECT id, name, alternate_name, sample_audio_url, \`length\`, short_length, top_rank, popular_rank, creation_date FROM osts ORDER BY creation_date ${order} LIMIT ?, ?`;
                        break;
                }

                return new Promise((res, rej) => {
                    context.app.get("database pool").getConnection().then((conn) => {
                        conn.query(query, [
                            args.input.start,
                            args.input.count
                        ]).then((r) => {
                            conn.release();
                            res(r);
                        }).catch((err) => {
                            conn.release();
                            res([]);
                        });
                    }).catch((err) => {
                        res([]);
                    })
                })
            }
        },
        show(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM shows WHERE id = ?`, [
                        args.id
                    ]).then((r) => {
                        conn.release();
                        res(r[0]);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            });
        },
        action(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM community_action WHERE id = ?`, [
                        args.id
                    ]).then((r) => {
                        conn.release();
                        res(r[0]);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            });
        }
    },
    Mutation: {
        add_ost(obj, args, context, info) {
            return new Promise((res, rej) => {
                if ((context.req.user?.privilege & 1) != 1)
                    throw new Error("Forbidden.");
                
                if (!args.input?.name)
                    throw new Error("Missing name field.");
                if (!args.input?.length)
                    throw new Error("Missing length field.");

                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`INSERT INTO osts (name, length, creation_date, update_date, published_date, short_length, alternate_name, sample_audio_url) VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?) RETURNING *`, [
                        args.input.name,
                        args.input.length,
                        null,
                        args.input.short_length,
                        args.input.alternate_name,
                        args.input.sample_audio_url
                    ]).then((r) => {
                        conn.release();
                        res(r[0]);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        add_show(obj, args, context, info) {
            return new Promise((res, rej) => {
                if ((context.req.user?.privilege & 1) != 1)
                    throw new Error("Forbidden.");
                const anilist = new Anilist()
                anilist.media.anime(parseInt(args.id)).then((data) => {
                    context.app.get("database pool").getConnection().then((conn) => {
                        conn.query(`INSERT INTO shows (id, native, preferred, english, medium, large) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id = ? RETURNING *`, [
                            args.id,
                            data.title.native,
                            data.title.userPreferred,
                            data.title.english,
                            data.coverImage.medium,
                            data.coverImage.large,
                            args.id
                        ]).then((r) => {
                            conn.release();
                            res(r[0]);
                        }).catch((err) => {
                            conn.release();
                            res(undefined);
                        });
                    }).catch((err) => {
                        res(undefined);
                    })
                })
            })
        },
        add_community_action(obj, args, context, info) {
            return new Promise((res, rej) => {
                if (!context.req.isAuthenticated())
                    throw new Error("Forbidden.");
                
                let type = ["OstAdd"].indexOf(args.input.type);

                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`INSERT INTO community_action (user_id, action_type, action_status, info, creation_date) VALUES (?, ?, ?, ?, NOW()) RETURNING *`, [
                    context.req.user?.id,
                    type,
                    0,
                    args.input.data
                    ]).then((r) => {
                        conn.release();
                        res(r[0]);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        edit_community_action(obj, args, context, info) {
            return new Promise((res, rej) => {
                if ((context.req.user?.privilege & 1) != 1)
                    throw new Error("Forbidden.");
                
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`UPDATE community_action SET info=? WHERE id=?`, [
                    args.data,
                    args.id
                    ]).then((r) => {
                        conn.release();
                        res(args.id);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    })
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        set_user_rating(obj, args, context, info) {
            return new Promise((res, rej) => {
                if (!context.req.isAuthenticated())
                    throw new Error("Forbidden.");

                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`INSERT INTO scores (user_id, ost_id, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE score = ?`, [
                    context.req.user?.id,
                    args.input.ost_id,
                    args.input.rating,
                    args.input.rating
                    ]).then((r) => {
                        conn.release();
                        res(args.input.ost_id);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        }
    }
}