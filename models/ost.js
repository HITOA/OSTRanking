exports.add = function (app, data) {
    return new Promise((res, rej) => {
        if (!data.name)
            return rej("OST Name is needed.");
        if (!data.url)
            return rej("OST URL is needed.");
        if (!data.length)
            return rej("OST Length is needed.");

        app.get("database pool").getConnection().then((conn) => {
            conn.query("INSERT INTO osts (name, url, length, creation_date, update_date, published_date, short_length, alternate_name) VALUES (?, ?, ?, NOW(), NOW(), ?, ?, ?) RETURNING id", [
                data.name,
                data.url,
                data.length,
                data.published_date,
                data.short_length,
                data.alternate_name
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
        })
    });
}

exports.get = function (app, data) {
    return new Promise((res, rej) => {
        if (!data.ost_id)
            return rej("OST id is needed.");
    
        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT * FROM osts WHERE id=?", [
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

exports.gets = function (app, data) {
    return new Promise((res, rej) => {
        if (typeof(data.start) != "number")
            return rej("Start is needed.");
        if (typeof(data.count) != "number")
            return rej("Count is needed");
        if (!data.order)
            return rej("Order is needed");
    
        app.get("database pool").getConnection().then((conn) => {
            
            var query = "";

            switch (data.order) {
                case "New":
                    query = "SELECT * FROM osts INNER JOIN ost_scores_total ON ost_id = osts.id ORDER BY creation_date DESC LIMIT ?, ?";
                    break;
                case "Popular":
                    query = "SELECT * FROM osts INNER JOIN ost_scores_total ON ost_id = osts.id ORDER BY score_count DESC, creation_date DESC LIMIT ?, ?";
                    break;
                case "Top":
                    query = "SELECT * FROM osts INNER JOIN ost_scores_total ON ost_id = osts.id ORDER BY score_acc / NULLIF(score_count, 0) DESC, creation_date DESC LIMIT ?, ?";
                    break;
                default:
                    query = "SELECT * FROM osts INNER JOIN ost_scores_total ON ost_id = osts.id ORDER BY creation_date DESC LIMIT ?, ?";
                    break;
            }

            conn.query(query, [
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
        })
    });
}