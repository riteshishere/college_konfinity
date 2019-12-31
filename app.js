const express = require("express");
const fileupload = require("express-fileupload");
const session = require("express-session");
const router = express.Router();
const app = express();
const cors = require("cors");
const compression = require("compression");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const path = require("path");
const mainRoutes = require("./task1/backend/routes/mainRoutes");
app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileupload());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(__dirname + '/task1/client'));
app.set("views", __dirname + "/task1/client/views");
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/task1/client/"));
app.use(logger("dev"));
app.use(session({
    name: "sid",
    secret: "KonfinitySecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: true
    }
}));
app.use("/",mainRoutes);
app.listen(4000, () => {
  console.log("New Application listening on port : ", 4000);
});
module.exports = app;