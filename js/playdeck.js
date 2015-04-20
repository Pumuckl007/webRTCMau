mau.playDeck = [];
mau.unplayedDeck = [];
mau.playDeckOffset = 0;
mau.playDeckCard = 0;
mau.unplayDeckOffset = 0;
mau.playDeckCardDecryption = [];

mau.messageRouter.registerKey("everyone-has-cards", function(message){
  mau.playDeckOffset = message.firstUnusedCard;
  mau.unplayDeckOffset = message.firstUnusedCard + 1;
  for(var i = mau.unplayDeckOffset; i<mau.deck.length; i++){
    mau.unplayedDeck[i-mau.unplayDeckOffset] = mau.deck[i];
  }
  var playdeckCardDecryption = {
    id:"play-deck-card-decryption",
    key:mau.createDeck.keyArray[mau.playDeckOffset + 1],
    sender:mau.id
  }
  mau.sendMessageToAll(playdeckCardDecryption);
});

mau.messageRouter.registerKey("play-deck-card-decryption", function(message){
  mau.playDeckCardDecryption.push(message.key);
  if(mau.playDeckCardDecryption.length >= mau.players.length){
    mau.playDeckCardDecryption.push(mau.createDeck.keyArray[mau.playDeckCard + mau.playDeckOffset + 1]);
    mau.playDeck.push(mau.createDeck.decryptCard(mau.playDeckCardDecryption, mau.unplayedDeck[0]));
    mau.unplayedDeck.shift(-1);
    mau.playDeckCardDecryption = [];
  }
});

mau.playDeck.revealTopCard = function(){
  var revealTopCard = {
    id:"reveal-top-card",
    sender:mau.id
  }
  mau.sendMessageToAll(revealTopCard);
  mau.messageRouter.message(JSON.stringify(revealTopCard));
}

mau.messageRouter.registerKey("reveal-top-card", function(message){
  mau.unplayDeckOffset ++;
  mau.playDeckCard ++;
  var playdeckCardDecryption = {
    id:"play-deck-card-decryption",
    key:mau.createDeck.keyArray[mau.playDeckOffset + 1 + mau.playDeckCard],
    sender:mau.id
  }
  mau.sendMessageToAll(playdeckCardDecryption);
});

mau.hand.playCard = function(card){
  var cayrd = mau.hand[card];
  playCard = {
    id:"play-card",
    card:cayrd,
    sender:mau.id
  }
  mau.sendMessageToAll(playCard);
  mau.hand.splice(card,1);
  mau.playDeck.push(playCard.card);
}

mau.messageRouter.registerKey("play-card", function(message){
  mau.playDeck.push(message.card);
  mau.players[mau.playerNames.indexOf(message.sender)].numberOfCards --;
});

mau.unplayedDeck.penelize = function(playerId, reason){
  playCard = {
    id:"penilize-player",
    player:playerId,
    reason:reason,
    sender:mau.id
  }
  mau.sendMessageToAll(playCard);
}

mau.messageRouter.registerKey("penilize-player", function(message){
  if(mau.id === message.player){
    console.log(mau.players[mau.playerNames.indexOf(message.sender)].nick + " is penilizeing you for " + message.reason)
    console.log("exicute mau.accept(), or mau.reject() to accept or reject the penalty");
  } else {
    console.log(mau.players[mau.playerNames.indexOf(message.sender)].nick + " is penilizeing " + mau.players[mau.playerNames.indexOf(message.player)].nick + " because of " + message.reason);
  }
});
