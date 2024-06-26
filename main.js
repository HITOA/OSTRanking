require("dotenv").config()

const express = require("express");
const session = require("express-session")
const passport = require("passport")
const MySQLStore = require("express-mysql-session")(session)
const { ruruHTML } = require("ruru/server")

const dboption = {
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 8
};

const pool = require("mariadb").createPool(dboption)

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
app.use(require("./controllers/index"));
app.use(require("./controllers/register"));
app.use(require("./controllers/login"));
app.use(require("./controllers/request"));
app.use(require("./controllers/ost"));
app.use(require("./controllers/show"));
app.use(require("./controllers/user"));
app.use(require("./controllers/faq"));
app.use(require("./controllers/community"));
app.use(require("./controllers/upload"));

app.all("/api", require("./controllers/api")(app));

app.use(express.static("public"));
app.use("/audio", (req, res, next) => {
    if (!req.isAuthenticated())
        return res.status(403).send();
    next();
}, express.static("audios"));

app.get("/ruru", (req, res) => {
    res.type("html");
    res.end(ruruHTML({ endpoint: "/api" }));
});

require("./auth/passport").initialize(app);

app.listen(process.env.PORT || 8080);