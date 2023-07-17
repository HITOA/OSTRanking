exports.addShowOstRelation = function (app, data) {
    return new Promise((res, rej) => {
        if (!data.show_id)
            return rej("Show id is needed.");
        if (!data.ost_id)
            return rej("OST id is needed.");
        if (typeof(data.type) !== "number")
            return rej("Type is needed.");
        if (!data.number)
            return rej("Number is needed.");

        app.get("database pool").getConnection().then((conn) => {
            conn.query("INSERT INTO show_ost (show_id, ost_id, type, num) VALUES (?, ?, ?, ?)", [
                data.show_id,
                data.ost_id,
                data.type,
                data.number
            ]).then(() => {
                conn.release();
                res();
            }).catch((err) => {
                conn.release();
                console.log(err);
                rej("There is a problem with the server.");
            });
        }).catch((err) => {
            console.log(err);
            rej("There is a problem with the server.");
        })
    });
}

exports.getsShowOstRelation = function (app, data) {
    return new Promise((res, rej) => {
        if (typeof(data.ost_id) != "number")
            return rej("OST id is needed.");
    
        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT * FROM show_ost WHERE ost_id = ?", [
                data.ost_id
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
        })
    });
}