exports.get = function (app, data) {
    return new Promise((res, rej) => {
        if (!data.day)
            return rej("Day is needed.");
        
        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT * FROM daily_rating_history drh WHERE drh.day=?", [
                data.day
            ]).then((result) => {
                conn.release();
                res(result[0]);
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

exports.add = function (app, data) {
    return new Promise((res, rej) => {
        if (!data.day)
            return rej("Day is needed.");
        if (!data.ost_id)
            return rej("OST id needed.");

        app.get("database pool").getConnection().then((conn) => {
            conn.query("INSERT INTO daily_rating_history (day, ost_id) VALUES (?, ?) RETURNING *", [
                data.day,
                data.ost_id
            ]).then((result) => {
                conn.release();
                res(result[0]);
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