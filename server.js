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
const bcrypt      = require('bcrypt');
const cookieSession = require("cookie-session");


const salt=10;

// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const tasksRoutes = require("./routes/tasks");
const classesRoutes = require("./routes/classes");
const userRegistrationRoutes=require("./routes/userRegistration");

let bayesModel=require("./public/scripts/classifier.js").bayesModel;


// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));


//Set up secret key for cookie session
app.use(cookieSession({
    secret: 'Vancouver downtown',
}))

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
app.use("/api/classes", classesRoutes(knex));
app.use("/user_registration",userRegistrationRoutes(knex));

/*
* GET request for root
* If logged in, render the page with the 4 lists
* If not logged in, render the register page
*/
app.get("/", (req, res) => {
  if (req.session.username) {
    knex('tasks').orderBy('id', 'desc').first('id', 'content').then((result) => {
      let latest = result.content;
      let templateVars = {
        latest: latest
      };
      res.render("index", templateVars);
    });
  } else {
    res.render("register");
  }
});

//User registration page
app.get("/register",(req,res)=>{
  res.render("register");
});

//User login page
//If username exists redirects to
app.get("/login",(req,res)=>{
  res.render("register.ejs");
});

// app.get("/eatcategory", (req, res) => {
// //   res.render("../")

// })

//Login page
//When user submits correct username / pass compares input to database
//If it matches - redirects to root
app.post("/user_login", (req, res) => {
  knex.select("*").from('users').where('username', req.body.username).then((result) => {
    if (bcrypt.compare(req.body.password,result[0].password,salt,null)) {
      knex.select("*").from('taskClasses').then((data)=>{
        for(var i=0;i<data.length;i++){
          let tempTask=data[i];
          bayesModel.learn(tempTask.task,tempTask.class);
        }
      })
      req.session.username = req.body.username;
      res.redirect("/");
    } else {
      res.status(403).send("The username or password incorrect");
    }
  })
});

/*
* POST request for adding a new task
* If logged in, add task to tasks table in database midterm
* If not logged in, send error to remind user to login first
*/
app.post("/new_task",(req,res)=>{
  if(req.session.username){
    knex.select('id').from('users').where('username',req.session.username).then((result)=>{
      let tempClass=bayesModel.categorize(req.body.task);
      knex('tasks').insert({category:tempClass,content:req.body.task,date:new Date(),users_id:result[0].id}).then((result)=>{
        console.log("The task "+req.body.task+" is classified as "+bayesModel.categorize(req.body.task));
        res.redirect("/");
      });
    })
  }else{
    res.status(403).send("Please login first before you can add a task");
  }
})

app.post("/logout",(req,res)=>{
  req.session=null;
  res.redirect("/");
})

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
