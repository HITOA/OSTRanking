exports.set = function (app, data) {
    return new Promise((res, rej) => {
        if (!data.user_id)
            return rej("User id is needed.");
        if (!data.ost_id)
            return rej("Ost id is needed.");
        if (!data.score)
            return rej("Score is needed.");
        
        app.get("database pool").getConnection().then((conn) => {
            conn.query("INSERT INTO scores (user_id, ost_id, score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE score = ?", [
                data.user_id, 
                data.ost_id,
                data.score,
                data.score
            ]).then((r) => {
                conn.release();
                res("Score set successfully.");
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

exports.get = function (app, data) {
    return new Promise((res, rej) => {
        if (!data.user_id)
            return rej("User id is needed.");
        if (!data.ost_id)
            return rej("Ost id is needed.");
        
        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT (score) FROM scores WHERE ost_id=? AND user_id=?", [
                data.ost_id, 
                data.user_id
            ]).then((score) => {
                conn.release();
                res(score);
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