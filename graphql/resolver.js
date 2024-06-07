const ann = require("../models/ann");

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

module.exports = {
    Rating: {
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
        }
    },
    User: {
        ratings(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT ost_id, score FROM scores WHERE user_id = ? ORDER BY score DESC`, [
                        obj.id
                    ]).then((r) => {
                        conn.release();
                        res(r)
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        }
    },
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
            return ["OstAdd", "EditSongInformation", "EditRelations", "EditExternalLinks"][obj.action_type];
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
    Work: {
        name(obj, args, context, info) {
            return obj.role_name;
        },
        artist(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM artists WHERE id = ?`, [
                        obj.artist_id
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
    Artist: {
        works(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM artist_ost WHERE artist_id=?`, [
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
                    conn.query(`SELECT type, url FROM link_ost WHERE ost_id=?`, [
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
        works(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM artist_ost WHERE ost_id=?`, [
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
                args.input.count = 1;

            if (args.input.expression) {
                return new Promise((res, rej) => {
                    context.app.get("database pool").getConnection().then((conn) => {
                        conn.query(`SELECT osts.id, osts.name, osts.alternate_name, osts.sample_audio_url, osts.length, osts.short_length, osts.top_rank, osts.popular_rank, 
                        GREATEST(MATCH(osts.name, osts.alternate_name) AGAINST(?), MATCH(shows.main_title, shows.alternative_title) AGAINST(?)) AS relevance 
                        FROM show_ost, shows, osts WHERE shows.id = show_ost.show_id AND osts.id = show_ost.ost_id
                        ORDER BY relevance DESC
                        LIMIT ?, ?`, [
                            args.input.expression,
                            args.input.expression,
                            args.input.start,
                            args.input.count
                        ]).then((r) => {
                            conn.release();
                            res(r);
                        }).catch((err) => {
                            conn.release();
                            rej(err);
                        });
                    }).catch((err) => {
                        rej(err);
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
        },
        actions(obj, args, context, info) {
            return new Promise((res, rej) => {
                if (!args.input.start)
                    args.input.start = 0;
                if (!args.input.count)
                    args.input.count = 1;

                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM community_action WHERE action_type ${args.input.editOnly ? "!" : ""}= 0 ORDER BY creation_date DESC LIMIT ?, ?`, [
                        args.input.start,
                        args.input.count
                    ]).then((r) => {
                        conn.release();
                        res(r);
                    }).catch((err) => {
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            });
        },
        user(obj, args, context, info) {
            return new Promise((res, rej) => {
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT id, name, privilege, trust, creation_date FROM users WHERE id = ?`, [
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
        add_community_action(obj, args, context, info) {
            return new Promise((res, rej) => {
                if (!context.req.isAuthenticated())
                    throw new Error("Forbidden.");
                
                let type = ["OstAdd", "EditSongInformation", "EditRelations", "EditExternalLinks"].indexOf(args.input.type);

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
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM community_action WHERE id = ?`, [
                        args.id
                    ]).then((r) => {
                        if ((context.req.user?.privilege & 1) != 1 && r[0].user_id !== context.req.user.id)
                            throw new Error("Forbidden.");
            
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
                        conn.release();
                        res(undefined);
                    });
                }).catch((err) => {
                    res(undefined);
                })
            })
        },
        accept_community_action(obj, args, context, info) {
            return new Promise((res, rej) => {
                if ((context.req.user?.privilege & 1) != 1)
                    throw new Error("Forbidden.");
                
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`SELECT * FROM community_action WHERE id = ?`, [
                        args.id
                    ]).then((action) => {
                        switch (action[0].action_type) {
                            case 0: { //OstAdd
                                let action_data = action[0].info;
                                addOst(action_data.name, action_data.length, action_data.alternate_name, action_data.short_length, 
                                    action_data.sample_audio_url, action_data.published_date, conn).then(async (ost_data) => {
                                    action_data.ost_id = ost_data.id;
                                    for (let relation of action_data.relations) {
                                        let type = ["Opening", "Ending", "Insert"].indexOf(relation.type);
                                        await addShow(relation.show.id, conn).then((show_data) => {
                                            addRelation(ost_data.id, show_data.id, type, relation.number, conn);
                                        }).catch((err) => {
                                            conn.release();
                                            return rej(err);
                                        });
                                    }
                                    if (action_data.links !== undefined && action_data.links !== null) {
                                        for (let link of action_data.links) {
                                            let type = ["Youtube", "Spotify", "SoundCloud"].indexOf(link.type);
                                            await addLink(ost_data.id, type, link.url, conn);
                                        }
                                    }

                                    conn.query(`UPDATE community_action SET action_status=?, info=? WHERE id=?`, [
                                        1,
                                        action_data,
                                        args.id
                                    ]).then((r) => {
                                        conn.release();
                                        res(ost_data.id);
                                    }).catch((err) => {
                                        conn.release();
                                        rej(err);
                                    })
                                });
                                break;
                            }
                            case 1: { //EditSongInformation
                                let action_data = action[0].info;
                                conn.query(`SELECT name, alternate_name, length, short_length FROM osts WHERE id = ?`, [
                                    action_data.ost_id
                                ]).then((r) => {
                                    let new_data = r[0];
                                    for (const [key, value] of Object.entries(action_data.edit))
                                        new_data[key] = value;
                                    conn.query(`UPDATE osts SET name=?, alternate_name=?, length=?, short_length=? WHERE id=?`, [
                                        new_data.name,
                                        new_data.alternate_name,
                                        new_data.length,
                                        new_data.short_length,
                                        action_data.ost_id
                                    ]).then(() => {
                                        conn.query(`UPDATE community_action SET action_status=? WHERE id=?`, [
                                            1,
                                            args.id
                                        ]).then((r) => {
                                            conn.release();
                                            res(action_data.ost_id);
                                        }).catch((err) => {
                                            conn.release();
                                            rej(err);
                                        })
                                    }).catch((err) => {
                                        conn.release();
                                        rej(err);
                                    })
                                }).catch((err) => {
                                    conn.release();
                                    rej(err);
                                })
                                break;
                            }
                            case 2: { //EditRelations
                                let action_data = action[0].info;
                                conn.query(`DELETE FROM show_ost WHERE ost_id = ?`, [
                                    action_data.ost_id
                                ]).then(async () => {
                                    for (let relation of action_data.edit) {
                                        let type = ["Opening", "Ending", "Insert"].indexOf(relation.type);
                                        await addShow(relation.show.id, conn).then((show_data) => {
                                            addRelation(action_data.ost_id, show_data.id, type, relation.number, conn);
                                        }).catch((err) => {
                                            conn.release();
                                            return rej(err);
                                        });
                                    }

                                    conn.query(`UPDATE community_action SET action_status=? WHERE id=?`, [
                                        1,
                                        args.id
                                    ]).then((r) => {
                                        conn.release();
                                        res(action_data.ost_id);
                                    }).catch((err) => {
                                        conn.release();
                                        rej(err);
                                    })
                                }).catch((err) => {
                                    conn.release();
                                    rej(err);
                                });
                                break;
                            }
                            case 3: { //EditExternalLinks
                                let action_data = action[0].info;
                                conn.query(`DELETE FROM link_ost WHERE ost_id = ?`, [
                                    action_data.ost_id
                                ]).then(async () => {
                                    for (let link of action_data.edit) {
                                        let type = ["Youtube", "Spotify", "SoundCloud"].indexOf(link.type);
                                        await addLink(action_data.ost_id, type, link.url, conn);
                                    }

                                    conn.query(`UPDATE community_action SET action_status=? WHERE id=?`, [
                                        1,
                                        args.id
                                    ]).then((r) => {
                                        conn.release();
                                        res(action_data.ost_id);
                                    }).catch((err) => {
                                        conn.release();
                                        rej(err);
                                    })
                                }).catch((err) => {
                                    conn.release();
                                    rej(err);
                                });
                                break;
                            }
                            default:
                                break;
                        }
                        conn.release();
                    }).catch((err) => {
                        conn.release();
                        rej(err);
                    });
                }).catch((err) => {
                    rej(err);
                })
            });
        },
        decline_community_action(obj, args, context, info) {
            return new Promise((res, rej) => {
                if ((context.req.user?.privilege & 1) != 1)
                    throw new Error("Forbidden.");
                
                context.app.get("database pool").getConnection().then((conn) => {
                    conn.query(`DELETE FROM community_action WHERE id = ?`, [
                        args.id
                    ]).then(() => {
                        conn.release();
                        res();
                    }).catch((err) => {
                        conn.release();
                        rej(err);
                    });
                }).catch((err) => {
                    rej(err);
                })
            });
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