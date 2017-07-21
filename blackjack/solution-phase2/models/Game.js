var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var GameSchema = new mongoose.Schema({
  deck: [],
  status: {type: String, default: 'Waiting for players'},
  playerTotals: [{type: Number, default: 0}],
  playerStatus: [],
  playerHands: [],
  playerbets: [{type: Number, default: 0}],
  players:[{ type: ObjectId, ref: 'Account' }],
  numberOfPlayers: {type: Number, default: 2},
  turn: {type: Number, default: 1}
});

GameSchema.statics.newGame = function (item, callback){
  var game = new this(item)
  game.deck = new Deck();
  game.save(callback);
}

GameSchema.statics.deal21 = function (game) {
  game.playerHands=[];
  game.playerTotals=[]

  for(var i=0; i<game.numberOfPlayers ; i++){
    var currentPlayerHand=[]
    currentPlayerHand.push(game.deck.pop());
    currentPlayerHand.push(game.deck.pop());
    game.playerHands.push(currentPlayerHand)
    game.playerTotals.push(this.calcValue(currentPlayerHand));
  }
};

GameSchema.statics.calcValue = function (hand){
  var val = 0;
  var tempArr = hand;
  tempArr.sort(function(a,b) { return parseFloat(a.val) - parseFloat(b.val) } );
  for(var i=tempArr.length-1; i>=0; i--) {
    var temp = tempArr[i];
    if(temp.val === 1 && val <=10){temp.val = 11;}
    else if(temp.val >=10){temp.val = 10;}
    val += temp.val;
  }
  return val;
}

GameSchema.statics.hit = function (game, playerNumber){
  game.playerHands[playerNumber].push(game.deck.pop());
 game.playerTotals[playerNumber]= this.calcValue(game.playerHands[playerNumber]);
  game.turn++;
  if(game.turn>=game.numberOfPlayers){
    game.turn=1;
  }
  if(parseInt(game.playerTotals[playerNumber]) > 21){
    game.playerStatus[playerNumber] = "lost";
  }
};

GameSchema.statics.stand = function stand(game){
  game.playerStatus[playerNumber] = "standing";
//  this.gameOver(game);
}

GameSchema.statics.gameOver = function gameOver(game){
  game.status="over";
  if(game.userTotal > game.dealerTotal && game.userStatus !== "lost" || game.dealerStatus === "lost"){
    game.userStatus= "won";
    game.dealerStatus= "lost";
    //this.money+=2; // TODO += 2*bet
    // RESPONSE YOU WIN
  }
  else if(game.userTotal === game.dealerTotal && game.userStatus !== "lost"){
    console.log("HAH you tied.")
    game.dealerStatus= "tied";
    game.userStatus= "tied";
    //this.money++; // money += bet.
    //response -> TIED
  }else{
    game.userStatus= "lost";
    game.dealerStatus= "won";
  }
}

function Card(suit, val, symbol) {
  this.suit = suit;
  this.val = val;
  this.symbol = symbol;
}

function Deck(){
  this.deck = [];
  this.createDeck()
  this.shuffleDeck()
  return this.deck;
}

Deck.prototype.createDeck = function (){
  var suit, symbol;
  for(var k=1; k<=4; k++){
    switch(k){
      case 1: suit ="hearts"; break;
      case 2: suit ="diamonds"; break;
      case 3: suit ="spades"; break;
      case 4: suit ="clubs"; break;
    }
    for(var i=1; i<=13; i++){
      symbol = i;
      switch(i){
        case 1: symbol = "A"; break;
        case 11: symbol = "J"; break;
        case 12: symbol = "Q"; break;
        case 13: symbol = "K"; break;
      }
      this.deck.push(new Card(suit, i, symbol));
    }
  }
}

Deck.prototype.shuffleDeck = function () {
  var currentIndex = this.deck.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = this.deck[currentIndex];
    this.deck[currentIndex] = this.deck[randomIndex];
    this.deck[randomIndex] = temporaryValue;
  }
}

module.exports  =  mongoose.model('Game', GameSchema);
