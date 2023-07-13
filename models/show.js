exports.getOrAdd = function (app, data) {
    return new Promise((res, rej) => {
        app.get("database pool").getConnection().then((conn) => {
            if (!data.show_id)
                return rej("Show id is needed.");
            if (!data.name)
                return rej("Show name is needed.");
            
            conn.query("SELECT id FROM shows WHERE id=?", [data.show_id]).then((ids) => {
                if (ids.length > 0)
                    return res(ids[0]);

                conn.query("INSERT INTO shows (id, name) VALUES (?, ?) RETURNING id", [
                    data.show_id,
                    data.name,
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