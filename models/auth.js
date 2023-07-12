const bcrypt = require("bcryptjs");

exports.register = function (app, username, email, password) {
    return new Promise((res, rej) => {
        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT id FROM users WHERE (name=? OR email=?)", [username, email]).then((result)=>{
                if (result.length > 0) {
                    conn.release();
                    rej("An account is already created with this username or email");
                    return;
                }

                bcrypt.hash(password, 10).then((hash) => {
                    conn.query("INSERT INTO users (name, password_hash, email, creation_date) VALUES(?, ?, ?, NOW())", [username, hash, email]).then(()=>{
                        res("Successfully registered. Redirecting to login...");
                        conn.release();
                    }).catch((err) => {
                        rej("There is a problem with the server.");
                    })
                });
            })
        }).catch((err) => {
            rej("There is a problem with the server.");
        })
    });
}