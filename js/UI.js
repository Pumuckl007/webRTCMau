mau.ui = {};
mau.ui.hand;
mau.ui.playdeck;
mau.ui.players;
mau.ui.handMap = {};
mau.ui.update = function(){
  window.requestAnimationFrame(mau.ui.update);
  if(!(mau.ui.hand)){
    mau.ui.hand = document.getElementById("hand");
  }
  if(!(mau.ui.playdeck)){
    mau.ui.playdeck = document.getElementById("playdeck");
  }
  if((!mau.ui.players)){
    mau.ui.players = document.getElementById("restofplayers");
  }
  var handString = "";
  for(var i = 0; i<mau.hand.length; i++){
    handString += mau.ui.handMap[mau.hand[i]] + " ";
  }
  mau.ui.hand.innerHTML = handString;
  var playdeckString = "";
  for(var i = 0; i<mau.playDeck.length; i++){
    playdeckString += mau.ui.handMap[mau.playDeck[mau.playDeck.length-i-1]] + " ";
  }
  mau.ui.playdeck.innerHTML = playdeckString;
  while(mau.ui.players.firstChild){
    mau.ui.players.removeChild(mau.ui.players.firstChild);
  }
  for(var i = 0; i<mau.players.length; i++){
    mau.ui.players.appendChild(mau.ui.generatePlayerUI(mau.players[i]));
  }
}

mau.ui.generatePlayerUI = function(player){
  var player = document.createElement("div");
  player.innerHTML = player.nick;
  return player;
}

mau.ui.generateHandMap = function(){
  var suit = ["s", "h", "d", "c"];
  var type = ["a", "2", "3", "4", "5", "6", "7", "8", "9", "0", "j", "q", "k"];
  var cards = ["🂡", "🂢", "🂣", "🂤", "🂥", "🂦", "🂧", "🂨", "🂩", "🂪", "🂫", "🂭", "🂮",
"🂱", "🂲", "🂳", "🂴", "🂵", "🂶", "🂷", "🂸", "🂹", "🂺", "🂻", "🂽", "🂾",
"🃁", "🃂", "🃃", "🃄", "🃅", "🃆", "🃇", "🃈", "🃉", "🃊", "🃋", "🃍", "🃎",
"🃑", "🃒", "🃓", "🃔", "🃕", "🃖", "🃗", "🃘", "🃙", "🃚", "🃛", "🃝", "🃞"];
  for(var suitType = 0 ; suitType<suit.length; suitType++){
    for(var cardType = 0; cardType<type.length; cardType++){
      mau.ui.handMap[type[cardType] + suit[suitType]] = cards[suitType*type.length + cardType];
    }
  }
}

mau.ui.generateHandMap();
