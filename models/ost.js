exports.add = function (app, data) {
    return new Promise((res, rej) => {
        app.get("database pool").getConnection().then((conn) => {
            if (!data.name)
                return rej("OST Name is needed.");
            if (!data.url)
                return rej("OST URL is needed.");
            if (!data.length)
                return rej("OST Length is needed.");
            
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