const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { MONGOURI } = require("./key");
const PORT = process.env.PORT || 5000;
const cors = require("cors");
app.use(cors("http://localhost:3000/"||"https://www.beenyan.com/"));

mongoose.connect(MONGOURI,{
  useNewUrlParser:true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Successfully connect to MongoDB.");
})
.catch(err => {
  console.error("Connection error", err);
  process.exit();
});

require("./models/Event");
require("./models/Game");
require("./models/League");
require("./models/GameEvent");

require("./models/User");
require("./models/UserBets");
const {updateGames,collectGamesApi,finishGames,Testing} = require("./football-api/apiConroller")

// require('./models/post')
var authUser = require("./routes/authUser")
var authGame = require("./routes/authGame")
var authLeague = require("./routes/authLeagues")
var authEvent = require("./routes/authEvent")
var authUserbets = require("./routes/authUserbets")

app.use(express.json());
app.use(authUser,authGame);
app.use(authEvent,authLeague,authUserbets);

setInterval(function() {
  collectGamesApi();
  }, 1000*60*60*12,);
  setInterval(function() {
    updateGames();
    }, 1000*90,);
  setInterval(function() {
    finishGames();
    }, 1000*60*6,);


app.listen(PORT,()=>{
    console.log("server running on PORT",PORT)
})

