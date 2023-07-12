const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs")

exports.initialize = function (app) {
    const strategy = new LocalStrategy((username, password, done) => {
        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT * FROM users WHERE name=?", [username]).then((result) => {
                conn.release();

                if (result.length < 1)
                    return done(null, false);
                
                bcrypt.compare(password, result[0].password_hash, (err, success) => {
                    if (success === true)
                        done(null, result[0]);
                    else
                        done(null, false);
                })
            }).catch((err) => {
                console.log(err);
                conn.release();
                return done(null, false);  
            });
        }).catch((err) => {
            console.log(err);
            return done(null, false);
        });
    });

    passport.serializeUser((user, done)=>{
        return done(null, user.id);
    })

    passport.deserializeUser((userId, done)=>{
        app.get("database pool").getConnection().then((conn) => {
            conn.query("SELECT * FROM users WHERE id=?", [userId]).then((result) => {
                conn.release();

                if (result.length < 1)
                    return done(null, false);
                
                done(null, result[0]);
            }).catch((err) => {
                console.log(err);
                conn.release();
                return done(null, false);  
            });
        }).catch((err) => {
            console.log(err);
            return done(null, false);
        });
    })

    passport.use("local", strategy);
}