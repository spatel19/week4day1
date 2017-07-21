"use strict";
var express = require('express');
var router = express.Router({ mergeParams: true });
var jsonfile = require('jsonfile');
var file = 'data.json';
var GameModel = require('../models/Game.js');
var passport = require('passport');
var Account = require('../models/account');

var gameRepresentation = function(game, userId, isUserInGame) {
  return {
    id: game.id,
    status: game.status,
    players: game.players,
    playerTotals : game.playerTotals,
    playerStatus : game.playerStatus,
    playerHands : game.playerHands,
    playerbets : game.playerbets,
    numberOfPlayers : game.numberOfPlayers,
    userId: userId,
    isUserInGame: isUserInGame || false,
    turn: game.turn
  }
}


// Write the function for the / route in the game. It should display the list of
// all the games. You should be able to click from the page and navigate to any
// single game. Games can be filtered by "over" or "in-progress"
router.get('/games', function (req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }else{
    GameModel.find(function (err, games) {
      if (err) return next(err);
      var filteredGames = [];
      for (var i=0; i< games.length; i++){
        var game ={
          id: games[i].id,
          status: games[i].status === "over"? "over" : "progress"
        }
        if (!req.query.status || req.query.status === game.status){
          filteredGames.push(game)
        }
      }
      res.render('games', { title: "Games", filteredGames: filteredGames, user : req.user });
    });
  }
});

// Write a route that creates a new game and redirects to the game page with the
// id. It should redirect to -> `/game/:id`
router.post('/game', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }else{
    GameModel.newGame({}, function (err, game) {
      if (err) return next(err);

      game.numberOfPlayers=req.body.number;
      game.playerTotals.push(0)
      game.playerStatus.push("waiting")
      game.playerHands.push({})
      game.playerbets.push(0);
      game.players.push(null);

      game.save();
      console.log('New game id:'+game.id);
      res.redirect('/game/'+game.id);
    });
  }
});

//Gets the current game
router.get('/game/:id', function(req, res, next) {
  if(!req.user){
    res.redirect('/login');
  }else{
    GameModel.findById(req.params.id, function (err, game) {
      if (err) {return next(err);}
        var isUserInGame = false;
        for (var i = 1; i < game.players.length; i++){
          if ((game.players[i]+"")===(req.user.id+"")){
            isUserInGame = true;
          }
        }
      res.format({
        html: function(){
          res.render('viewgame', { title: 'View Game', game: gameRepresentation(game, req.user.id)});
        },
        json: function(){
          res.json(gameRepresentation(game, req.user.id, isUserInGame));
        }
      });
    });
  }
});

// TODO edit this.
// Write a function that posts to the game id with the bet amount the user is making
// the bet should be received from the body. It should start the game after the bet,
// give the first cards to every player and set the game status to started.
// It should return an error if the bet is already set or the game is already started.
// Remember to bring the game from the mongo database by :id and to respond with
// the JSON representation to the client. Also remember to save the game status on
// the database.

// This functions joins players to the game
router.post('/game/:id', function(req, res, next) {

  if(!req.user){
    res.redirect('/login');
  }else{
    GameModel.findById(req.params.id, function (err, game) {
      if (err) return next(err);
      // TODO CHeck bets????  if (game.status==="started") return next(new Error("Bet already set"))
      // var bet = req.body.bet|| 10;

      if(game.players.length===game.numberOfPlayers){
        res.json({error: "Game has enough players"});
      }
      game.players.push(req.user);
      game.playerTotals.push(0)
      game.playerStatus.push("waiting")
      game.playerHands.push({})
      game.playerbets.push(req.body.bet);

      //console.log(gameRepresentation(game, game, req.user.id))

      if(game.players.length===parseInt(game.numberOfPlayers)){
        GameModel.deal21(game);
        game.status="started";
      }
      game.save();
      res.json(gameRepresentation(game, req.user.id));
    });
  }
});

// This function should add a card to the player. If the bet is not already set,
// it should return an error. If not, a card must be added and the new results
// calculated. Check if the user has gotten over 21 to end the game.
// Respond with the game representation and save to the database.
router.post('/game/:id/hit', function(req, res, next) {
  GameModel.findById(req.params.id, function (err, game) {
    if (err) return next(game);
  //  if (game.status!=="started" || game.player1bet === 0) return next(new Error("Start game and set bet"))
    GameModel.hit(game, req.body.userInGamePosition)
    console.log(game)
    game.save();
    res.json(gameRepresentation(game, req.user.id));
    console.log(gameRepresentation(game, req.user.id));

  });
});

// Function for when the player has stopped dwaring cards. Dealer draws until they
// have more than 17. Then calculate winner -> Game over.
// This function can only be called if the game is already set.
// Save the json object and respond with the game representation.
router.post('/game/:id/stand', function(req, res, next) {
  GameModel.findById(req.params.id, function (err, game) {
    if (err) return next(game);
    //if (game.status!=="started" || game.player1bet === 0) return next(new Error("Start game and set bet"))
    GameModel.stand(game)
    game.save();
    res.json(gameRepresentation(game, req.user.id));
    // Renders JSON of Game State Representation
  });
});

/* Code to delete all games on db.
GameModel.remove({}, function (err, user) {
if (err) console.log(err);
});
*/

router.get('/', function (req, res) {
  if (req.user) res.redirect('/games')
  else res.redirect('login')
});

router.get('/register', function(req, res) {
  res.render('register', { });
});

router.post('/register', function(req, res) {
  Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
    if (err) { return res.render('register', { account : account }); }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/games');
    });
  });
});

router.get('/login', function(req, res) {
  res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/games');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
