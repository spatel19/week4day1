var globalGame;
window.addEventListener("load", getData, false);
var status = document.getElementById("game-status");
var userInGamePosition;

function getData(){
  $.ajax({
    type: "GET",
    url: $(location).attr('href'),
    dataType: 'json',
    cache: false,
    success: function(game){
      console.log(game)
      //TODO check if playerAlreadyInGame
      if (game.isUserInGame){
        if (game.players.length<game.numberOfPlayers){
          $("#game-status").text("Waiting for more players");
          setTimeout(function(){
            console.log("BAM")
            getData();
          }, 2000);
        } else{
          play(game)
        }
      }else{
        $("#game-status").text("Bet to get in the game");
        $("#betForm").show();
        $(".dealer-area").hide();
        $(".user-area").hide();
      }
    }
  });
}

// Setting a new bet
$(document).on("submit", "form", function(e){
  e.preventDefault();
  $.ajax({
    type: "POST",
    dataType: 'json',
    url: $(location).attr('href'),
    data: { bet: $("#bet-amount").val() || 10 },
    cache: false,
    success: function(game){
      getData();
    }
  });
  return  false;
});


function play(game){
  globalGame=game;
  var userHand = document.getElementById("user-hand");
  var dealerHand = document.getElementById("dealer-hand");
  var userScore = document.getElementById("user-score");
  var dealerScore = document.getElementById("dealer-score");
  var hitButton = document.getElementById("hit")
  var standButton = document.getElementById("stand");
  $("#betForm").hide();
  $(".dealer-area").show();
  $(".user-area").show();
  hitButton.addEventListener("click", function(){ hit() },false);
  standButton.addEventListener("click", function(){ stand() },false);
  $("#game-status").text(" ");

  for (var i = 1; i < game.players.length; i++){
    if ((game.players[i]+"")===(game.userId+"")){
      userInGamePosition = i;
    }
  }

  /*
  if (game.status === 'over' ){
  status.innerHTML='You '+game.userStatus;
  if (game.userStatus === "won"){
  status.innerHTML+= " "+ parseInt(game.player1bet)*2;
} else if (game.userStatus === "won"){
status.innerHTML+= " "+ parseInt(game.player1bet);
}
hitButton.style.visibility = "hidden";
standButton.style.visibility = "hidden";
}
*/

dealerHand.innerHTML="<h2>Other people's Hands</h2>";
userHand.innerHTML="<h2>User Hand</h2>";
//hit.setAttribute("style", "");
//stand.setAttribute("style", "");

for(var i=0; i<game.playerHands[userInGamePosition].length; i++){
  userHand.innerHTML+=showCard(game.playerHands[userInGamePosition][i]);
}
userScore.innerHTML=game.userTotal;

var opponents = game.playerHands.slice();
opponents.splice(userInGamePosition,1);

for(var j=0; j<opponents.length; j++){
  for(var i=0; i<opponents[j].length; i++){
    dealerHand.innerHTML+=showCard(opponents[j][i], i);
  }
}


}

this.showCard =function showCard(card, cardNumber){
  var html="";
  switch(card.suit){
    case "hearts": suit_text = "&hearts;"; break;
    case "diamonds": suit_text = "&diams;"; break;
    case "spades": suit_text = "&spades;"; break;
    case "clubs": suit_text = "&clubs;"; break;
  }
  var hiddenCard = cardNumber===0 ? " id='hidden-card'" : "";
  html="<div class='card " + card.suit + "'"+ hiddenCard + "><div class='card-value'>" + card.symbol + "</div><div class='suit'>" + suit_text + "</div><div class='main-number'>"+card.symbol +"</div><div class='invert card-value'>"+card.symbol+"</div><div class='invert suit'>"+suit_text+"</div></div>";
  return html;
}

function hit(){
  $.ajax({
    type: "POST",
    url: '/game/'+globalGame.id+'/hit',
    dataType: 'json',
    data: { userInGamePosition: userInGamePosition },
    cache: false,
    success: function(data){
      getData();
    }
  });
}

function stand(){
  $.ajax({
    type: "POST",
    url: '/game/'+globalGame.id+'/stand',
    dataType: 'json',
    cache: false,
    success: function(data){
      getData();
    }
  });
}
