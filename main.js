require("dotenv").config()

const express = require("express");
const session = require("express-session")
const passport = require("passport")
const MySQLStore = require("express-mysql-session")(session)

const dboption = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 8
};

const pool = require("mariadb").createPool(dboption)

require("./models/dbinit")(pool).then(() => {
    console.log("Server starting...");

    const app = express();

    app.set("view engine", "ejs");
    app.set("database pool", pool);

    app.use(session({
        secret: process.env.SESSION_SECRET.split(' '),
        store: new MySQLStore(dboption),
        resave: false,
        saveUninitialized: false,
        cookie:{
            maxAge: 1000 * 60 * 60 * 24
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use("/api", express.json());
    app.use(express.urlencoded({extended: true}));

    app.use(require("./controllers/layout"));
    app.use(require("./controllers/ostrankingcontroller"));
    app.use(require("./controllers/register"));
    app.use(require("./controllers/login"));
    app.use(require("./controllers/request"));
    app.use(require("./controllers/ost"));
    app.use(require("./controllers/daily"));
    app.use(require("./controllers/faq"));
    app.use(require("./controllers/community"));

    app.use("/api", require("./controllers/ostapi"));
    app.use("/api", require("./controllers/showapi"));
    app.use("/api", require("./controllers/userapi"));
    app.use("/api", require("./controllers/communityapi"));

    app.use(express.static("public"));

    require("./auth/passport").initialize(app);

    app.listen(process.env.PORT || 8080);
}, (err) => {
    console.log(`Could not initialize DB : ${err}`);
})