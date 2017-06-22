"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
const bcrypt = require('bcrypt');

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const tasksRoutes = require("./routes/tasks");


// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));
app.use("/api/tasks", tasksRoutes(knex));


// Home page
app.get("/", (req, res) => {
  res.render("index");
});

//User registration page
app.get("/register",(req,res)=>{
  res.render("../public/pages/register.ejs");
});

//User login page
app.get("/login",(req,res)=>{
  res.render("../public/pages/register.ejs");
});

app.post("/user_login",(req,res)=>{

});

app.post("/user_registration",(req,res)=>{
  knex('users').count("*").where('username',req.body.username).orWhere('email',req.body.email).then((result)=>{
    if(Number(result[0].count)>0){
      res.status(403).send('Error: User email or username already exists! Please select a new one!');
    }else{
      knex('users').insert({username:req.body.username,email:req.body.email, password:bcrypt.hashSync(req.body.password,10)}).then((result)=>{
        res.redirect("/");
      });
    }
  });
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
