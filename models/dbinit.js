const fs = require("fs");

module.exports = (pool) => {
    return new Promise((res, rej) => {
        pool.getConnection().then((conn) => {
            fs.readFile("./sql/dbinit.sql", "utf-8", (err, data) => {
                if (err)
                    rej(err);

                data.split(';').forEach((q)=>{
                    if (q)
                        conn.execute(q);
                });
                res();
            });
        }).catch((err) => {
            rej(err);
        });
    });
}