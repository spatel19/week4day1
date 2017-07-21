window.game = {};

window.addEventListener("load", getData, false);

function getData(){
  $.ajax({
    type: "GET",
    url: $(location).attr('href') + "/json",
    dataType: 'json',
    cache: false,
    success: function(game){
      if (game.status==="Not Started"){
        //alert("please set bet");
        $("#betForm").show();
        $(".dealer-area").hide();
        $(".user-area").hide();
      }else{
        play(game);
      }
    }
  });
}

$("#betForm").submit(function(e){
  e.preventDefault();
  $.ajax({
    type: "POST",
    url: $(location).attr('href'),
    data: { bet: $("#bet").val() },
    cache: false,
    success: function(game){
      play(game);
    }
  });
  return false;
});

function play(newGame){
  game = newGame;
  $("#betForm").hide();
  $(".dealer-area").show();
  $(".user-area").show();
  var hitButton = $("#hit");
  var standButton = $("#stand");
  hitButton.on("click", hit);
  standButton.on("click", stand);
  var userHand = $("#user-hand");
  var dealerHand = $("#dealer-hand");
  var userScore = $("#user-score");
  var dealerScore = $("#dealer-score");
  var status = $("#game-status");
  status.html("");

  dealerHand.html("<h2>Dealer Hand</h2>");
  userHand.html("<h2>User Hand</h2>");

  for(var i = 0; i < game.currentPlayerHand.length; i++){
    userHand.append(showCard(game.currentPlayerHand[i]));
  }

  for(var i = 0; i < game.houseHand.length; i++){
    dealerHand.append(showCard(game.houseHand[i]));
  }

  userScore.html(game.userTotal);

  if (game.status === 'Over' ){
    dealerScore.html(game.dealerTotal);
    status.html('You ' + game.userStatus);
    if (game.userStatus === "Won" && game.userTotal > game.dealerTotal){
      status.append(" "+ parseInt(game.playerBet) * 2);
    } else if (game.userStatus === "Won"){
      status.append(" "+ parseInt(game.playerBet));
    }
    else{
      status.append(" "+ parseInt(game.playerBet));
    }
    hitButton.css("visibility", "hidden");
    standButton.css("visibility", "hidden");

  }
  else {
    dealerScore.html("??");
    var firstCard = $("#dealer-hand .card:first");
    firstCard.attr("id", "hidden-card");
  }
}

function showCard(card) {
  var html="";
  switch(card.suit) {
    case "hearts": suit_text = "&hearts;"; break;
    case "diamonds": suit_text = "&diams;"; break;
    case "spades": suit_text = "&spades;"; break;
    case "clubs": suit_text = "&clubs;"; break;
  }
  html = "<div class='card " + card.suit + "'>\
            <div class='card-value'>" + card.symbol + "</div>\
            <div class='suit'>" + suit_text + "</div>\
            <div class='main-number'>"+card.symbol +"</div>\
            <div class='invert card-value'>"+card.symbol+"</div>\
            <div class='invert suit'>"+suit_text+"</div>\
          </div>";
  return html;
}

function hit(){
  $.ajax({
    type: "POST",
    url: '/game/'+ game.id + '/hit',
    dataType: 'json',
    cache: false,
    success: function(data){
      play(data)
    }
  });
}

function stand(){
  $.ajax({
    type: "POST",
    url: '/game/'+ game.id + '/stand',
    dataType: 'json',
    cache: false,
    success: function(data){
      play(data)
    }
  });
}
