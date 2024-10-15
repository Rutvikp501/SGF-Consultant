const express = require("express");
const app = express();
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const path = require('path');
const cors = require("cors");
const homeRoutes = require("./routes/home.js");
const authRoutes = require("./routes/auth.js");
const adminRoutes = require("./routes/admin.js");
const consultantRoutes = require("./routes/consultant.js");
require("dotenv").config();
require("./config/dbConnection.js")();
require("./config/passport.js")(passport);

// Use CORS middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests from any origin
        callback(null, origin); 
    },
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, // Enable credentials (cookies, authorization headers, etc.)
}));

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use("/assets", express.static(__dirname + "/assets"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(methodOverride("_method"));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    next();
});
app.use('/uploads', express.static('uploads'));
const swaggerUI = require('swagger-ui-express');
const YAML = require("yamljs");
const swaggerDocument = YAML.load(path.join(__dirname, '/swagger.yaml'));
app.use('/sgr', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Routes
app.use(homeRoutes);
app.use(authRoutes);
app.use(adminRoutes);
app.use(consultantRoutes);
app.use('/api/user',require('./routes/user.route.js'));
app.use('/api/lead', require('./routes/lead.route.js'));
app.use('/api', require('./routes/index.routes.js'));

// 404 page
// app.use((req,res) => {
//     res.status(404).render("404page", { title: "Page not found" });
// });

const port = process.env.PORT;
app.listen(port, console.log(`Server is running at http://localhost:${port}`));


	