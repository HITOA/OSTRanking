exports.getOrAdd = function (app, data) {
    return new Promise((res, rej) => {            
        if (!data.show_id)
            return rej("Show id is needed.");
        if (!data.native)
            return rej("Show native name is needed.");
        if (!data.preferred)
            return rej("Show preferred name is needed.");
        if (!data.english)
            return rej("Show english name is needed.");
        if (!data.medium)
            return rej("Show medium image is needed.");
        if (!data.large)
            return rej("Show large image is needed.");
            
        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT id FROM shows WHERE id=?", [data.show_id]).then((ids) => {
                if (ids.length > 0) {
                    conn.release();
                    return res(ids[0]);
                }

                conn.query("INSERT INTO shows (id, native, preferred, english, medium, large) VALUES (?, ?, ?, ?, ?, ?) RETURNING id", [
                    data.show_id,
                    data.native,
                    data.preferred,
                    data.english,
                    data.medium,
                    data.large
                ]).then((id) => {
                    conn.release();
                    res(id[0].id);
                }).catch((err) => {
                    conn.release();
                    console.log(err);
                    rej("There is a problem with the server.");
                });
            }).catch((err) => {
                conn.release();
                console.log(err);
                rej("There is a problem with the server.");
            })
        }).catch((err) => {
            console.log(err);
            rej("There is a problem with the server.");
        })
    });
}

exports.get = function(app, data) {
    return new Promise((res, rej) => {    
        if (!data.show_id)
            return rej("Show id is needed.");

        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT * FROM shows WHERE id=?", [data.show_id]).then((ids) => {
                conn.release();

                if (ids.length > 0)
                    return res(ids[0]);

                rej("There is no show corresponding to this id.");
            }).catch((err) => {
                conn.release();
                console.log(err);
                rej("There is a problem with the server.");
            })
        }).catch((err) => {
            console.log(err);
            rej("There is a problem with the server.");
        });
    });
}