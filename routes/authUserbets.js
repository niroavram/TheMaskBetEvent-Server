const express = require("express");
const Router = express.Router();
const mongoose = require("mongoose");
const GameEvent = mongoose.model("GameEvent");
const UserBets = mongoose.model("UserBets");
const TotoGame = mongoose.model("TotoGame");
const Event = mongoose.model("Event");

// mongoose.set("useFindAndModify", false);
const requireLogin = require("../middleware/requireLogin");

Router.put("/create-userbets", requireLogin, (req, res) => {
  const { mask, triangles, doubles, eventId,gameEvents } = req.body
  const bets = []  
  if (!mask) {
    return res.status(422).json({ error: "Please add all the fields" });
  }
  var countDoubles = 0;
  var countTriangles = 0;
  for (i = 0; i < gameEvents.length; i++) { 
    const {
        homeTeam,
        awayTeam,
        startAwayTeam,
        startHomeTeam,
        gameApi,
        bet,
        startGame,
      } = gameEvents[i];
    var gameEvent =  new GameEvent({
        homeTeam,
        awayTeam,
        startAwayTeam,
        startHomeTeam,
        gameApi,
        bet,
        startGame,
    })
    gameEvent.save().catch((err) => {
    console.log(err);
  });
    bets.push(gameEvent)
    var sumBet =
      gameEvents[i].bet[0] + gameEvents[i].bet[1] + gameEvents[i].bet[2];
    if (sumBet < 1) {
      return res.status(422).json({ error: "Please add all the fields" });
    }
    if (sumBet == 2) {
      countDoubles++;
    }
    if (sumBet == 3) {
      countTriangles++;
    }
  }
  if (doubles != countDoubles || triangles != countTriangles) {
    return res.status(422).json({ error: "Please stand in rules" });
  }
  else{
  console.log(req.user,bets);
  const userbet = new UserBets({
    created_by: req.user,
    mask,
    gameEvents: bets,
  });
  userbet.save()
  .then((result) => {
    Event.findByIdAndUpdate(
        eventId,
        {
          $push: { userBets: result },
        },
        {
          new: true,
        }
      ).exec((err, result) => {
        if (err) {
          return res.status(422).json({ error: err });
        } 
      });
    res.json({ event: result });
  })
  .catch((err) => {
    console.log(err);
  });
}
});

Router.get("/get-userbets/:eventId", requireLogin, (req, res) => {
  const { eventId } = req.params;
  Event.find({ _id: eventId }).then((event) => {
    UserBets.find({ _id: { $in: event[0].userBets } })
      .then((userGamesbet) => {
        res.json({ event, userGamesbet });
      })

      .catch((err) => {
        res.json(err);
      });
  });
});
module.exports = Router;
