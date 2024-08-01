const express = require('express')
const app = express()
const cors = require("cors");
require('dotenv').config()
const bodyParser = require('body-parser');
const { DB_Connect } = require('./src/config/DBconnect');

const path = require('path')
//  const DB_URL= process.env.DBURL;
const DB_URL= 'mongodb://0.0.0.0:27017/User-management';
const PORT = process.env.PORT


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

app.set("views", path.join("views"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/src'));

const swaggerUI = require('swagger-ui-express');
const YAML = require("yamljs");
const swaggerDocument = YAML.load(path.join(__dirname, '/swagger.yaml'));
app.use('/sgr', swaggerUI.serve, swaggerUI.setup(swaggerDocument));



app.use('/',require('./src/Routes/views.route'));
app.use('/user',require('./src/Routes/user.route'));
app.use('/lead', require('./src/Routes/lead.route'));
app.listen(PORT,()=>{
    try {
        DB_Connect(DB_URL)
        console.log(`Running application on  http://localhost:${PORT}`);
    }
    catch (e) {
        console.log(e);
    }
})

// PORT = 3333 
// DB_URL='mongodb+srv://patilrutvik501:patilrutvik501@smallprojects.1bzonhg.mongodb.net/'
// token="R@U#V$I%K&",
// USERS=rutvik.gainn@gmail.com
// APP_PASS=uxzc tuzs dlkq awvw
// RUTVIK=patilrutvik501@gmail.com
// RAPP_PASS=mnzt tvan wirp byum