const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const EventMe = mongoose.model("EventMe");
const GameEvent = mongoose.model("GameEvent");

// mongoose.set("useFindAndModify", false);
const requireLogin = require("../middleware/requireLogin");


Router.post("/create-event",requireLogin,(req, res) => {
  const { isMask, doubles,mygames } = req.body;
  const games =mygames
  if ((!doubles, !isMask,!games)) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  const code = Math.random().toString(36).slice(-10);
  EventMe.findOne({ code: code }).then((savedUser) => {
    if (savedUser) {
      code = Math.random().toString(36).slice(-10);
    }})
  var i = 0,firstGame,lastGame;
  firstGame = games[0].startGame;
  lastGame = games[0].startGame;
  const gamesEvent = [];
  while (i < games.length) {
    const {
      homeTeam,
      awayTeam,
      startAwayTeam,
      startHomeTeam,
      gameApi,
      bet,
      startGame,
    } = games[i];
    var game = new GameEvent({
      homeTeam,
      awayTeam,
      startAwayTeam,
      startHomeTeam,
      gameApi,
      bet,
      startGame,
    });
    game.save().catch((err) => {
      res.status(422).json({ error: " error hereeeeeeeeee"})
    });
    gamesEvent.push(game);
    if (firstGame > startGame) {
      firstGame = startGame;
    }
    if (lastGame < startGame) {
      lastGame = startGame;
    }
    i++;
  }
  const event = new EventMe({
    firstGame,
    lastGame,
    isMask,
    doubles,
    code,
    gamesEvent: gamesEvent,
  });
  event
    .save()
    .then((resEvent) => {
  
   res.status(200).json({event: resEvent})
});
})
Router.put("/join-event", requireLogin, (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(422).json({ error: "Please enter the code group" });
  }
  EventMe.findOne({ code: code }).then((event) => {
    if (event.myUsers.includes(req.user._id)) {
      return res.status(422).json({ error: "User already inside this group" });
    }
    EventMe.findOneAndUpdate(
      { code: code },
      {
        $push: { myUsers: req.user._id },
      },
      {
        new: true,
      }
    ).exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res
          .status(200)
          .json({
            event: result,
            message: "Mazal Tov You are in the group",
          });
      }
    });
  });
});

module.exports = Router;
