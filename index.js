const express = require('express')
const app = express()
const cors = require("cors");
require('dotenv').config()
const bodyParser = require('body-parser');
const { DB_Connect } = require('./src/config/DBconnect');

const path = require('path')
// const DB_URL= process.env.DBURL;
const DB_URL= 'mongodb://0.0.0.0:27017/adviser-management';
const PORT = process.env.PORT


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));

const swaggerUI = require('swagger-ui-express');
const YAML = require("yamljs");
const swaggerDocument = YAML.load(path.join(__dirname, '/swagger.yaml'));
app.use('/sgr', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.get('/',(req,res,next)=>{
    try {
        res.status(200).send("testing")
        
    } catch (error) {
        console.log(error);
    }
})
app.use('/adviser',require('./src/Routes/adviser.route'));
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