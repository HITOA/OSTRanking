exports.add = function (app, data) {
    return new Promise((res, rej) => {
        if (!data.user_id)
            return rej("User id is needed.");
        if (!data.info)
            return rej("Info is needed.");

        app.get("database pool").getConnection().then((conn) => {
            conn.query("INSERT INTO community_action (user_id, creation_date, info) VALUES (?, NOW(), ?) RETURNING id", [
                data.user_id,
                data.info
            ]).then((result) => {
                conn.release();
                res(result[0].id);
            }).catch((err) => {
                console.log(err);
                conn.release();
                rej("There is a problem with the server.");
            });
        }).catch((err) => {
            console.log(err);
            rej("There is a problem with the server.");
        });
    });
}

exports.gets = function (app, data) {
    return new Promise((res, rej) => {
        if (typeof(data.start) != "number")
            return rej("Start is needed.");
        if (typeof(data.count) != "number")
            return rej("Count is needed");

        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT community_action.*, users.name FROM community_action INNER JOIN users ON user_id = users.id ORDER BY creation_date DESC LIMIT 0, 2", [
                data.start,
                data.count
            ]).then((r) => {
                conn.release();
                res(r);
            }).catch((err) => {
                conn.release();
                console.log(err);
                rej("There is a problem with the server.")
            });
        }).catch((err) => {
            console.log(err);
            rej("There is a problem with the server.");
        });
    });
}