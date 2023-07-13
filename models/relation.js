exports.addShowOstRelation = function (app, data) {
    return new Promise((res, rej) => {
        app.get("database pool").getConnection().then((conn) => {
            if (!data.show_id)
                return rej("Show id is needed.");
            if (!data.ost_id)
                return rej("OST id is needed.");
            if (typeof(data.type) !== "number")
                return rej("Type is needed.");
            if (!data.number)
                return rej("Number is needed.");
            
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